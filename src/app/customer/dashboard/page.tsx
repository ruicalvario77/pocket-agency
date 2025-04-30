"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import AuthWrapper from "@/app/components/AuthWrapper";
import Link from "next/link";

// Define the Subscription interface with Timestamp
interface Subscription {
  plan: string;
  status: string;
  startDate: Timestamp;
  nextBillingDate: Timestamp;
}

// Define the Task interface
interface Task {
  taskId: string;
  title: string;
  status: string;
}

export default function CustomerDashboard() {
  const [user] = useAuthState(auth);
  const [fullName, setFullName] = useState("Customer");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state to handle async data fetching

  // Log user state outside of useEffect to confirm authentication
  console.log("User state outside useEffect:", user ? user.uid : "No user");

  useEffect(() => {
    console.log("useEffect triggered. User:", user ? user.uid : "No user");
    const fetchUserData = async () => {
      if (user) {
        console.log("Fetching data for user:", user.uid);

        // Fetch user's full name
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFullName(data.fullName || "Customer");
          console.log("User fullName:", data.fullName);
        } else {
          console.log("User document not found for UID:", user.uid);
        }

        // Fetch subscription
        const subQuery = query(
          collection(db, "subscriptions"),
          where("userId", "==", user.uid)
        );
        const subSnapshot = await getDocs(subQuery);
        console.log("Subscription snapshot size:", subSnapshot.size);
        console.log("Subscription data:", subSnapshot.docs.map(doc => doc.data()));
        if (!subSnapshot.empty) {
          const subData = subSnapshot.docs[0].data();
          setSubscription({
            plan: subData.plan as string,
            status: subData.status as string,
            startDate: subData.startDate as Timestamp,
            nextBillingDate: subData.nextBillingDate as Timestamp,
          });
        } else {
          console.log("No subscription found for user:", user.uid);
        }

        // Fetch active tasks
        const tasksQuery = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid),
          where("status", "==", "Submitted")
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        console.log("Tasks snapshot size:", tasksSnapshot.size);
        console.log("Tasks data:", tasksSnapshot.docs.map(doc => doc.data()));
        setTasks(
          tasksSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              taskId: data.taskId as string,
              title: data.title as string,
              status: data.status as string,
            };
          })
        );
      } else {
        console.log("No user is logged in.");
      }
      setIsLoading(false); // Set loading to false after fetching
    };
    fetchUserData();
  }, [user]);

  // Log the current state before rendering
  console.log("Rendering component. isLoading:", isLoading);
  console.log("Current subscription state:", subscription);
  console.log("Current tasks state:", tasks);

  if (isLoading) {
    return (
      <AuthWrapper requiredRole="customer">
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </AuthWrapper>
    );
  }

  // Main dashboard rendering
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 sm:p-6 md:p-8 lg:p-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Customer Dashboard</h1>
        <p className="text-sm sm:text-base mb-6">Welcome, {fullName}! Here you can manage your requests.</p>

        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-2">Subscription Status</h2>
          {subscription ? (
            <div>
              <p>Plan: {subscription.plan}</p>
              <p>Status: {subscription.status}</p>
              <p>Start Date: {subscription.startDate.toDate().toLocaleDateString()}</p>
              <p>Next Billing Date: {subscription.nextBillingDate.toDate().toLocaleDateString()}</p>
            </div>
          ) : (
            <p>No active subscription found.</p>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-2">Active Tasks</h2>
          {tasks.length > 0 ? (
            <ul>
              {tasks.map((task) => (
                <li key={task.taskId} className="border-b py-2">
                  <p>Task: {task.title}</p>
                  <p>Status: {task.status}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No active tasks found.</p>
          )}
        </div>

        <Link href="/tasks/submit">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Submit New Task
          </button>
        </Link>
      </div>
    </div>
  );
}