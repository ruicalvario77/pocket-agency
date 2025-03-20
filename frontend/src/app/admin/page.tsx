// src/app/admin/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { collection, onSnapshot, updateDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React from "react";
import { FaClock, FaHourglassHalf, FaCheckCircle, FaGripVertical, FaSearch } from "react-icons/fa";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
}

const SortableProject = ({ project }: { project: Project }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: project.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const statusStyles: { [key: string]: string } = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-start"
    >
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab mr-3 text-gray-400 hover:text-gray-600"
      >
        <FaGripVertical />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-gray-800">{project.title}</h4>
          <span
            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
              statusStyles[project.status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {project.status === "pending" ? "Pending" : project.status === "in_progress" ? "In Progress" : "Completed"}
          </span>
        </div>
        <p className="text-gray-600 mt-1 line-clamp-2">{project.description}</p>
        <p className="text-sm text-gray-500 mt-2">User ID: {project.userId}</p>
        <p className="text-sm text-gray-500">
          Created: {project.createdAt instanceof Date && !isNaN(project.createdAt.getTime())
            ? project.createdAt.toLocaleDateString()
            : "Unknown Date"}
        </p>
      </div>
    </div>
  );
};

const DroppableColumn = ({
  status,
  title,
  items,
}: {
  status: string;
  title: string;
  items: Project[];
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div ref={setNodeRef} className={`flex-1 min-w-[300px] ${isOver ? "bg-gray-200" : "bg-gray-100"} rounded-lg p-4 min-h-[200px]`}>
      <h3
        className={`text-lg font-semibold mb-4 ${
          status === "pending" ? "text-yellow-600" : status === "in_progress" ? "text-blue-600" : "text-green-600"
        }`}
      >
        {title} ({items.length})
      </h3>
      <SortableContext
        id={status}
        items={items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {items.length === 0 ? (
          <p className="text-gray-500 text-center">No projects in this status.</p>
        ) : (
          items.map((project) => (
            <SortableProject key={project.id} project={project} />
          ))
        )}
      </SortableContext>
    </div>
  );
};

export default function AdminDashboard() {
  const [user, loadingAuth] = useAuthState(auth);
  const [projects, setProjects] = useState<Project[]>([]);
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
            console.log("onSnapshot triggered with", snap.docs.length, "documents");
            const projectList = snap.docs.map((doc) => {
              const data = doc.data();
              let createdAt: Date;
              if (data.createdAt instanceof Timestamp) {
                createdAt = data.createdAt.toDate();
              } else if (typeof data.createdAt === "string") {
                createdAt = new Date(data.createdAt);
              } else {
                createdAt = new Date();
              }
              return {
                id: doc.id,
                ...data,
                createdAt,
              };
            }) as Project[];
            console.log("Updated projects state:", projectList);
            setProjects(projectList);
            setLoading(false);
          }, (error) => {
            console.error("onSnapshot error:", error);
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

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) => {
      // Status filter
      if (filterStatus !== "all" && project.status !== filterStatus) {
        return false;
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          project.title.toLowerCase().includes(query) ||
          project.userId.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by createdAt
      if (sortOrder === "newest") {
        return b.createdAt.getTime() - a.createdAt.getTime();
      } else {
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
    });

  const columns = {
    pending: {
      title: "Pending",
      items: filteredProjects.filter(p => p.status === "pending"),
    },
    in_progress: {
      title: "In Progress",
      items: filteredProjects.filter(p => p.status === "in_progress"),
    },
    completed: {
      title: "Completed",
      items: filteredProjects.filter(p => p.status === "completed"),
    },
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    console.log("handleDragEnd triggered:", event);
    const { active, over } = event;
    if (!over) {
      console.log("Drag cancelled: No drop target.");
      return;
    }

    const projectId = active.id as string;
    const sourceColumnId = active.data.current?.sortable.containerId as keyof typeof columns;
    console.log("Source column:", sourceColumnId);

    let destColumnId: keyof typeof columns | undefined;
    if (over.id in columns) {
      destColumnId = over.id as keyof typeof columns;
    } else {
      destColumnId = over.data.current?.sortable.containerId as keyof typeof columns;
    }

    console.log("Destination column:", destColumnId);

    if (!sourceColumnId || !destColumnId) {
      console.log("Invalid source or destination column:", { sourceColumnId, destColumnId });
      return;
    }

    if (sourceColumnId === destColumnId) {
      console.log("No status change: Source and destination columns are the same.");
      return;
    }

    console.log(`Dragging project ${projectId} from ${sourceColumnId} to ${destColumnId}`);

    try {
      const projectRef = doc(db, "projects", projectId);
      console.log("Updating Firestore with new status:", destColumnId);
      await updateDoc(projectRef, { status: destColumnId });
      console.log("Firestore update successful for project:", projectId);

      const projectSnap = await getDoc(projectRef);
      const projectData = projectSnap.data() as Project;

      const userDocRef = doc(db, "users", projectData.userId);
      const userSnap = await getDoc(userDocRef);
      const userEmail = userSnap.data()?.email;

      if (userEmail) {
        console.log("Sending email notification to:", userEmail);
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: userEmail,
            projectTitle: projectData.title,
            status: destColumnId,
          }),
        });

        if (!response.ok) {
          console.error("Failed to send email:", await response.text());
        } else {
          console.log("Email notification sent successfully.");
        }
      } else {
        console.log("No email found for user:", projectData.userId);
      }
    } catch (error) {
      console.error("Error during drag-and-drop:", error);
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
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">All Projects</h2>
          {/* Filter, Sort, and Search Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            {/* Sort Order */}
            <div className="flex-1">
              <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">
                Sort by Date
              </label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            {/* Search Input */}
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search by Title or User ID
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {Object.entries(columns).map(([status, column]) => (
                <DroppableColumn
                  key={status}
                  status={status}
                  title={column.title}
                  items={column.items}
                />
              ))}
            </div>
          </DndContext>
        </div>
      </main>
    </div>
  );
}