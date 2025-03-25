// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/firebaseConfig";
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
  Timestamp,
} from "firebase/firestore";
import { User } from "firebase/auth"; // Import User type

interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
}

interface Subscription {
  plan: string;
  status: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null); // Use User type instead of any
  const [userRole, setUserRole] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();
  const db = getFirestore();

  const columns = {
    pending: { title: "Pending", items: projects.filter(p => p.status === "pending") },
    in_progress: { title: "In Progress", items: projects.filter(p => p.status === "in_progress") },
    completed: { title: "Completed", items: projects.filter(p => p.status === "completed") },
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }

      setUser(currentUser);

      // Fetch user role
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        router.push("/auth/login");
        return;
      }

      const role = userDoc.data()?.role;
      setUserRole(role);

      // Redirect admins and superadmins to their respective dashboards
      if (role === "admin") {
        router.push("/admin");
        return;
      } else if (role === "superadmin") {
        router.push("/superadmin");
        return;
      }

      // For customers: Check subscription and onboarding
      if (role === "customer") {
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

        if (!userDoc.data()?.onboardingCompleted) {
          router.push("/onboarding");
          return;
        }
      }

      // For contractors: No subscription or onboarding check (for now)
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, db]); // Add db to dependency array

  useEffect(() => {
    if (!user || loading) return;

    const q = query(collection(db, "projects"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(data.createdAt);
        return {
          id: doc.id,
          ...data,
          createdAt,
        };
      }) as Project[];
      setProjects(projectList);
    });

    return () => unsubscribe();
  }, [user, loading, db]); // Add db to dependency array

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle || !projectDescription || !user) return;

    try {
      await addDoc(collection(db, "projects"), {
        userId: user.uid,
        title: projectTitle,
        description: projectDescription,
        status: "pending",
        createdAt: Timestamp.now(),
      });
      setProjectTitle("");
      setProjectDescription("");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const handleDeleteProject = (project: Project) => {
    console.log("Opening delete modal for project:", project);
    setDeletingProject(project);
  };

  const confirmDeleteProject = async () => {
    if (!deletingProject) return;
    try {
      await deleteDoc(doc(db, "projects", deletingProject.id));
      setDeletingProject(null);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleEditProject = (project: Project) => {
    console.log("Opening edit modal for project:", project);
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
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome, {user?.email ?? "User"}!
          </h2>
          {userRole === "customer" && subscription && (
            <p className="mt-2 text-gray-600">
              Subscription: <span className="font-medium capitalize">{subscription.plan}</span> (
              <span className="text-green-600">{subscription.status}</span>)
            </p>
          )}
          {userRole === "contractor" && (
            <p className="mt-2 text-gray-600">
              This is your contractor dashboard. Task management will be available soon.
            </p>
          )}
        </div>

        {userRole === "customer" && (
          <>
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

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Projects</h3>
              {projects.length === 0 ? (
                <p className="text-gray-600">No projects submitted yet.</p>
              ) : (
                <div className="flex space-x-4 overflow-x-auto pb-4">
                  {Object.entries(columns).map(([status, column]) => (
                    <div key={status} className="flex-1 min-w-[300px]">
                      <h4
                        className={`text-lg font-semibold mb-4 ${
                          status === "pending"
                            ? "text-yellow-600"
                            : status === "in_progress"
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      >
                        {column.title} ({column.items.length})
                      </h4>
                      <div className="bg-gray-100 rounded-lg p-4 min-h-[200px]">
                        {column.items.map((project) => (
                          <div
                            key={project.id}
                            className="bg-white rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                          >
                            <h4 className="text-md font-semibold text-gray-800">{project.title}</h4>
                            <p className="text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              Created: {project.createdAt.toLocaleDateString()}
                            </p>
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => handleEditProject(project)}
                                className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project)}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {userRole === "contractor" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Tasks</h3>
            <p className="text-gray-600">
              Task management for contractors will be implemented in a future phase.
            </p>
          </div>
        )}
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

      {/* Deletion Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>&quot;{deletingProject.title}&quot;</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingProject(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
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