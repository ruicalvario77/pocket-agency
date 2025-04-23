"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import AuthWrapper from "@/app/components/AuthWrapper";
import Link from "next/link";

// Define the Subscription interface
interface Subscription {
  plan: string;
  status: string;
  startDate: Date;
  nextBillingDate: Date;
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
  // Use the Subscription type with null as a possible value
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  // Use the Task array type
  const [tasks, setTasks] = useState<Task[]>([]);

  // Fetch user data, subscription, and tasks from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        // Fetch user's full name
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFullName(data.fullName || "Customer");
        }

        // Fetch subscription
        const subQuery = query(
          collection(db, "subscriptions"),
          where("userId", "==", user.uid)
        );
        const subSnapshot = await getDocs(subQuery);
        if (!subSnapshot.empty) {
          const subData = subSnapshot.docs[0].data();
          // Convert Firestore Timestamps to Dates and set subscription
          setSubscription({
            plan: subData.plan as string,
            status: subData.status as string,
            startDate: (subData.startDate as any).toDate(), // Firestore Timestamp to Date
            nextBillingDate: (subData.nextBillingDate as any).toDate(), // Firestore Timestamp to Date
          });
        }

        // Fetch active tasks
        const tasksQuery = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid),
          where("status", "==", "Submitted") // Adjust status as needed
        );
        const tasksSnapshot = await getDocs(tasksQuery);
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
      }
    };
    fetchUserData();
  }, [user]);

  return (
    <AuthWrapper requiredRole="customer">
      <div className="min-h-screen bg-gray-100">
        <div className="p-4 sm:p-6 md:p-8 lg:p-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Customer Dashboard</h1>
          <p className="text-sm sm:text-base mb-6">Welcome, {fullName}! Here you can manage your requests.</p>

          {/* Subscription Section */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="text-xl font-semibold mb-2">Subscription Status</h2>
            {subscription ? (
              <div>
                <p>Plan: {subscription.plan}</p>
                <p>Status: {subscription.status}</p>
                <p>Start Date: {subscription.startDate.toLocaleDateString()}</p>
                <p>Next Billing Date: {subscription.nextBillingDate.toLocaleDateString()}</p>
              </div>
            ) : (
              <p>No active subscription found.</p>
            )}
          </div>

          {/* Active Tasks Section */}
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

          {/* Submit New Task Button */}
          <Link href="/tasks/submit">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Submit New Task
            </button>
          </Link>
        </div>
      </div>
    </AuthWrapper>
  );
}