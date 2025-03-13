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

  useEffect(() => {
    console.log("Auth state:", { user, loadingAuth });

    if (loadingAuth) return;

    if (!user) {
      console.log("No user, redirecting to login");
      router.push("/auth/login");
      return;
    }

    const checkAdminRole = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        const userData = docSnap.data();
        console.log("User data:", userData);

        if (!docSnap.exists() || userData?.role !== "admin") {
          console.log("Not an admin, redirecting to dashboard");
          setIsAdmin(false);
          router.push("/dashboard");
        } else {
          console.log("User is admin, loading projects");
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
      console.log(`Project ${id} status updated to ${status}`);

      // Fetch user email
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
        console.log("Email sent via API to:", userEmail);
      } else {
        console.warn("No email found for user:", projectData.userId);
      }
    } catch (error) {
      console.error("Error updating status or sending email:", error);
    }
  };

  if (loading || loadingAuth) return <div className="text-center mt-20 text-xl">Loading...</div>;
  if (isAdmin === false) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-gray-700">Managing all projects</p>

      <div className="mt-10 w-full max-w-4xl">
        <h2 className="text-xl font-bold">All Projects</h2>
        {projects.length === 0 ? (
          <p className="text-gray-600 mt-2">No projects submitted yet.</p>
        ) : (
          <ul className="mt-2 space-y-4">
            {projects.map((project) => (
              <li key={project.id} className="border p-4 rounded shadow-md">
                <h3 className="font-semibold">{project.title}</h3>
                <p className="text-gray-600">{project.description}</p>
                <p className="text-sm text-gray-500">User ID: {project.userId}</p>
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-sm font-medium">Status:</label>
                  <select
                    value={project.status || "pending"}
                    onChange={(e) => updateStatus(project.id, e.target.value)}
                    className="border p-1 rounded"
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
    </div>
  );
}