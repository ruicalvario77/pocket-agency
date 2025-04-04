// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
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
import { User } from "firebase/auth";

interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  satisfactionRating?: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
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

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          setError("User data not found.");
          router.push("/auth/login");
          return;
        }

        const role = userDoc.data()?.role;
        setEmailVerified(userDoc.data()?.emailVerified || false);

        if (role === "admin") {
          router.push("/admin");
          return;
        } else if (role === "superadmin") {
          router.push("/superadmin");
        } else if (role === "customer") {
          const subQuery = query(
            collection(db, "subscriptions"),
            where("userId", "==", currentUser.uid),
            where("status", "in", ["active", "pending"]) // Allow both active and pending subscriptions
          );
          const subSnapshot = await getDocs(subQuery);

          if (subSnapshot.empty) {
            router.push("/pricing");
            return;
          }

          if (!userDoc.data()?.onboardingCompleted) {
            router.push("/onboarding");
            return;
          }
        }

        setLoading(false);
      } catch (err: unknown) {
        setError("Network error: Please check your internet connection and try again.");
        console.error("Error fetching user data:", err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, db]);

  useEffect(() => {
    if (!user || loading) return;

    const q = query(collection(db, "projects"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const projectList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : new Date(data.createdAt);
          return {
            id: doc.id,
            userId: data.userId,
            title: data.title,
            description: data.description,
            status: data.status,
            createdAt,
            satisfactionRating: data.satisfactionRating,
          };
        }) as Project[];
        setProjects(projectList);
      },
      (err) => {
        setError("Network error: Please check your internet connection and try again.");
        console.error("Error fetching projects:", err);
      }
    );

    return () => unsubscribe();
  }, [user, loading, db]);

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle || !projectDescription || !user) return;

    if (!emailVerified) {
      setError("Please verify your email before submitting a project.");
      return;
    }

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
      setError("Network error: Please check your internet connection and try again.");
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
      setError("Network error: Please check your internet connection and try again.");
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
      setError("Network error: Please check your internet connection and try again.");
      console.error("Error updating project:", error);
    }
  };

  const handleRateProject = async (projectId: string, rating: number) => {
    setRatingError("");

    if (rating < 1 || rating > 5) {
      setRatingError("Rating must be between 1 and 5");
      return;
    }

    try {
      const projectDocRef = doc(db, "projects", projectId);
      await updateDoc(projectDocRef, {
        satisfactionRating: rating,
      });
    } catch (err: unknown) {
      setRatingError("Network error: Please check your internet connection and try again.");
      console.error("Error submitting rating:", err);
    }
  };

  const handleResendVerification = async () => {
    setResendMessage("");
    setResendLoading(true);

    try {
      if (!user) throw new Error("User not authenticated");

      const emailResponse = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, userId: user.uid }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(errorData.error || "Failed to resend verification email");
      }

      setResendMessage("Verification email resent successfully! Please check your inbox.");
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Error resending verification email:", err);
    } finally {
      setResendLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-xl">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-xl text-red-500">
        {error}
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {!emailVerified && (
        <div className="bg-yellow-100 p-4 text-center text-yellow-800">
          <p className="inline-block">
            You have not verified your account yet. Please check your email to verify your account.
          </p>
          <button
            onClick={handleResendVerification}
            className="ml-2 px-4 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 transition"
            disabled={resendLoading}
          >
            {resendLoading ? "Resending..." : "Resend Verification Email"}
          </button>
          {resendMessage && <p className="mt-2 text-green-600">{resendMessage}</p>}
        </div>
      )}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Customer Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your projects ({projects.length} total)</p>
          </div>
          <button
            onClick={() => auth.signOut().then(() => router.push("/auth/login"))}
            className="px-6 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-200"
          >
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Submit a New Project</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmitProject} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Project Title"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="border p-2 rounded w-full"
              required
              disabled={!emailVerified}
            />
            <textarea
              placeholder="Project Description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="border p-2 rounded w-full h-24"
              required
              disabled={!emailVerified}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              disabled={!emailVerified}
            >
              Submit Project
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Projects</h2>
          {ratingError && <p className="text-red-500 mb-4">{ratingError}</p>}
          {projects.length === 0 ? (
            <p className="text-gray-500">No projects found.</p>
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
                        {project.status === "completed" && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">Satisfaction Rating:</p>
                            {project.satisfactionRating ? (
                              <span className="text-yellow-500">
                                {project.satisfactionRating} / 5
                              </span>
                            ) : (
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(rating => (
                                  <button
                                    key={rating}
                                    onClick={() => handleRateProject(project.id, rating)}
                                    className={`text-2xl ${
                                      rating <= (project.satisfactionRating || 0)
                                        ? "text-yellow-500"
                                        : "text-gray-300"
                                    } hover:text-yellow-400 transition`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
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