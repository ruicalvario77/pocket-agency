// src/app/admin/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { collection, onSnapshot, updateDoc, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date | string;
}

export default function AdminDashboard() {
  const [user, loadingAuth] = useAuthState(auth);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Status color mapping
  const statusColors: { [key: string]: string } = {
    pending: "text-yellow-600 bg-yellow-100",
    in_progress: "text-blue-600 bg-blue-100",
    completed: "text-green-600 bg-green-100",
  };

  useEffect(() => {
    if (loadingAuth) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const checkAdminRole = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        const userData = docSnap.data();

        if (!docSnap.exists() || userData?.role !== "admin") {
          setIsAdmin(false);
          router.push("/dashboard");
        } else {
          setIsAdmin(true);

          const projectsRef = collection(db, "projects");
          const unsubscribe = onSnapshot(projectsRef, (snap) => {
            const projectList = snap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Project[];
            setProjects(projectList);
            setLoading(false);
          });
          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        router.push("/dashboard");
      }
    };

    checkAdminRole();
  }, [user, loadingAuth, router]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const projectRef = doc(db, "projects", id);
      const projectSnap = await getDoc(projectRef);
      const projectData = projectSnap.data() as Project;

      await updateDoc(projectRef, { status });

      const userDocRef = doc(db, "users", projectData.userId);
      const userSnap = await getDoc(userDocRef);
      const userEmail = userSnap.data()?.email;

      if (userEmail) {
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: userEmail,
            projectTitle: projectData.title,
            status,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send email");
        }
      }
    } catch (error) {
      console.error("Error updating status or sending email:", error);
    }
  };

  if (loading || loadingAuth) return <div className="text-center mt-20 text-xl">Loading...</div>;
  if (isAdmin === false) return null;

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Managing all projects</p>

        <div className="mt-10 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">All Projects</h2>
          {projects.length === 0 ? (
            <p className="text-gray-600">No projects submitted yet.</p>
          ) : (
            <ul className="space-y-4">
              {projects.map((project) => (
                <li key={project.id} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition">
                  <h3 className="font-semibold text-gray-800">{project.title}</h3>
                  <p className="text-gray-600">{project.description}</p>
                  <p className="text-sm text-gray-500">User ID: {project.userId}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${
                        statusColors[project.status] || "text-gray-500 bg-gray-200"
                      }`}
                    >
                      {project.status || "pending"}
                    </span>
                    <select
                      value={project.status || "pending"}
                      onChange={(e) => updateStatus(project.id, e.target.value)}
                      className="border rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={() => auth.signOut().then(() => router.push("/auth/login"))}
          className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition"
        >
          Logout
        </button>
      </main>
    </div>
  );
}