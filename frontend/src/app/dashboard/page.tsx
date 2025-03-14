// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date | string;
}

interface Subscription {
  plan: string;
  status: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }

      setUser(currentUser);

      const subQuery = query(
        collection(db, "subscriptions"),
        where("userId", "==", currentUser.uid),
        where("status", "==", "active")
      );
      const subSnapshot = await getDocs(subQuery);

      if (subSnapshot.empty) {
        router.push("/pricing");
        return;
      }

      const subDoc = subSnapshot.docs[0];
      setSubscription({
        plan: subDoc.data().plan,
        status: subDoc.data().status,
      });

      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists() || !userDoc.data()?.onboardingCompleted) {
        router.push("/onboarding");
        return;
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user || loading) return;

    const q = query(collection(db, "projects"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
      setProjects(projectList);
    });

    return () => unsubscribe();
  }, [user, loading]);

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle || !projectDescription || !user) return;

    try {
      await addDoc(collection(db, "projects"), {
        userId: user.uid,
        title: projectTitle,
        description: projectDescription,
        status: "pending",
        createdAt: new Date(),
      });
      setProjectTitle("");
      setProjectDescription("");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, "projects", id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditedTitle(project.title);
    setEditedDescription(project.description);
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;

    try {
      await updateDoc(doc(db, "projects", editingProject.id), {
        title: editedTitle,
        description: editedDescription,
      });
      setEditingProject(null);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Welcome, {user.email}!</h2>
          {subscription && (
            <p className="mt-2 text-gray-600">
              Subscription: <span className="font-medium capitalize">{subscription.plan}</span> (
              <span className="text-green-600">{subscription.status}</span>)
            </p>
          )}
        </div>

        {/* Project Submission */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Submit a New Project</h3>
          <form onSubmit={handleSubmitProject} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Project Title"
              className="border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Project Description"
              className="border rounded-lg p-2 w-full h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition self-start"
            >
              Submit Project
            </button>
          </form>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Projects</h3>
          {projects.length === 0 ? (
            <p className="text-gray-600">No projects submitted yet.</p>
          ) : (
            <ul className="space-y-4">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <h4 className="font-medium text-gray-800">{project.title}</h4>
                  <p className="text-gray-600 mt-1">{project.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Status: <span className="capitalize">{project.status || "pending"}</span>
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingProject && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Project</h2>
            <input
              type="text"
              className="border rounded-lg p-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
            <textarea
              className="border rounded-lg p-2 w-full h-24 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProject}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 animate-fade-in">
          <span>✅ Project submitted successfully!</span>
          <button
            onClick={() => setShowToast(false)}
            className="text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}