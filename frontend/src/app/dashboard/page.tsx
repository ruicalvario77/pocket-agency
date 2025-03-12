// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/firebaseConfig"; // Updated import
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
} from "firebase/firestore";

interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: Date | string;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null); // Will refine type later
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const db = getFirestore(); // Client-side Firestore

  // Check authentication and subscription
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }

      setUser(currentUser);

      // Check for active subscription
      const q = query(
        collection(db, "subscriptions"),
        where("userId", "==", currentUser.uid),
        where("status", "==", "active")
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        router.push("/pricing"); // Redirect if no active subscription
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch user's projects in real-time
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "projects"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
      setProjects(projectList);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle Logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth/login");
  };

  // Handle Project Submission
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectTitle || !projectDescription || !user) return;

    try {
      await addDoc(collection(db, "projects"), {
        userId: user.uid,
        title: projectTitle,
        description: projectDescription,
        createdAt: new Date(),
      });

      setProjectTitle("");
      setProjectDescription("");
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  // Handle Project Deletion
  const handleDeleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, "projects", id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  // Open Edit Modal
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditedTitle(project.title);
    setEditedDescription(project.description);
  };

  // Handle Project Update
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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-700">Welcome, {user.email}!</p>

      {/* Project Submission Form */}
      <form onSubmit={handleSubmitProject} className="mt-6 flex flex-col gap-3 w-80">
        <input
          type="text"
          placeholder="Project Title"
          className="border p-2"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Project Description"
          className="border p-2"
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          required
        />
        <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded">
          Submit Project
        </button>
      </form>

      {/* Display Submitted Projects */}
      <div className="mt-10 w-80">
        <h2 className="text-xl font-bold">Your Projects</h2>
        {projects.length === 0 ? (
          <p className="text-gray-600 mt-2">No projects submitted yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {projects.map((project) => (
              <li key={project.id} className="border p-3 rounded shadow-md">
                <h3 className="font-semibold">{project.title}</h3>
                <p className="text-gray-600">{project.description}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleEditProject(project)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-xl font-bold">Edit Project</h2>
            <input
              type="text"
              className="border p-2 w-full mt-3"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
            <textarea
              className="border p-2 w-full mt-3"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProject}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
}