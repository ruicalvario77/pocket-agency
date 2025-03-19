// src/app/admin/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { collection, onSnapshot, updateDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React from "react";
import { FaClock, FaHourglassHalf, FaCheckCircle } from "react-icons/fa";

interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date | string | Timestamp;
}

export default function AdminDashboard() {
  const [user, loadingAuth] = useAuthState(auth);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const statusColors: { [key: string]: string } = {
    pending: "text-yellow-600 bg-yellow-100",
    in_progress: "text-blue-600 bg-blue-100",
    completed: "text-green-600 bg-green-100",
  };

  const statusIcons: { [key: string]: React.ReactNode } = {
    pending: <FaClock className="inline-block mr-1" />,
    in_progress: <FaHourglassHalf className="inline-block mr-1" />,
    completed: <FaCheckCircle className="inline-block mr-1" />,
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
            const projectList = snap.docs.map((doc) => {
              const data = doc.data();
              // Convert createdAt to Date
              let createdAt: Date;
              if (data.createdAt instanceof Timestamp) {
                createdAt = data.createdAt.toDate();
              } else if (typeof data.createdAt === "string") {
                createdAt = new Date(data.createdAt);
              } else {
                createdAt = new Date(); // Fallback to current date if invalid
              }
              return {
                id: doc.id,
                ...data,
                createdAt,
              };
            }) as Project[];
            setProjects(projectList);
            setFilteredProjects(projectList);
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

  useEffect(() => {
    let updatedProjects = [...projects];

    if (filterStatus !== "all") {
      updatedProjects = updatedProjects.filter(project => project.status === filterStatus);
    }

    if (searchQuery) {
      updatedProjects = updatedProjects.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.userId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    updatedProjects.sort((a, b) => {
      // Ensure createdAt is a Date before sorting
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date();
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date();
      return sortOrder === "newest"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

    setFilteredProjects(updatedProjects);
  }, [filterStatus, sortOrder, searchQuery, projects]);

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

  const statusSummary = {
    pending: projects.filter(p => p.status === "pending").length,
    in_progress: projects.filter(p => p.status === "in_progress").length,
    completed: projects.filter(p => p.status === "completed").length,
  };

  if (loading || loadingAuth) return <div className="text-center mt-20 text-xl text-gray-500">Loading...</div>;
  if (isAdmin === false) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Managing all projects ({projects.length} total)</p>
          </div>
          <button
            onClick={() => auth.signOut().then(() => router.push("/auth/login"))}
            className="px-6 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-200"
          >
            Logout
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-yellow-600">Pending</h3>
            <p className="text-2xl font-bold">{statusSummary.pending}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-blue-600">In Progress</h3>
            <p className="text-2xl font-bold">{statusSummary.in_progress}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-green-600">Completed</h3>
            <p className="text-2xl font-bold">{statusSummary.completed}</p>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center">
            <label className="mr-2 text-gray-700 font-medium">Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex items-center">
            <label className="mr-2 text-gray-700 font-medium">Sort by:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          <div className="flex items-center flex-1">
            <label className="mr-2 text-gray-700 font-medium">Search:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or user ID..."
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">All Projects</h2>
          {filteredProjects.length === 0 ? (
            <p className="text-gray-600">No projects found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-800">{project.title}</h3>
                  <p className="text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                  <p className="text-sm text-gray-500 mt-2">User ID: {project.userId}</p>
                  <p className="text-sm text-gray-500">
                    Created: {project.createdAt instanceof Date && !isNaN(project.createdAt.getTime())
                      ? project.createdAt.toLocaleDateString()
                      : "Unknown Date"}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={`text-sm px-2 py-1 rounded-full flex items-center ${
                        statusColors[project.status] || "text-gray-500 bg-gray-200"
                      }`}
                    >
                      {statusIcons[project.status] || null}
                      {project.status.replace("_", " ")}
                    </span>
                    <select
                      value={project.status || "pending"}
                      onChange={(e) => updateStatus(project.id, e.target.value)}
                      className="border rounded-lg p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}