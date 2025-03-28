// src/app/superadmin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Placeholder components for each section
const AnalyticsSection = () => (
  <div className="p-4">
    <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
    <p>Financial Overview, Marketing Dashboard, Team Performance, and AI-Driven Insights will be displayed here.</p>
  </div>
);

const CustomersSection = () => (
  <div className="p-4">
    <h2 className="text-2xl font-semibold mb-4">Customers</h2>
    <p>Customer subscriptions, tasks, satisfaction tracking, and messaging oversight will be displayed here.</p>
  </div>
);

const ContractorsSection = () => (
  <div className="p-4">
    <h2 className="text-2xl font-semibold mb-4">Contractors</h2>
    <p>Contractor applications, schedules, work oversight, and performance metrics will be displayed here.</p>
  </div>
);

const AdminsSection = () => (
  <div className="p-4">
    <h2 className="text-2xl font-semibold mb-4">Admins</h2>
    <p>Admin invitation, allocation to customers, and performance oversight will be displayed here.</p>
  </div>
);

export default function SuperadminDashboard() {
  const [user, loading] = useAuthState(auth);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("analytics");
  const [showWelcome, setShowWelcome] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user && !loading) {
        router.push("/auth/login");
      } else if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const role = userDoc.data()?.role;
        setUserRole(role);
        if (role !== "superadmin") {
          if (role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
          return;
        }

        // Check if this is the first login
        if (!userDoc.data()?.hasSeenWelcome) {
          setShowWelcome(true);
          // Update Firestore to mark welcome as seen
          await setDoc(userDocRef, { hasSeenWelcome: true }, { merge: true });
        }
      }
    };
    checkUserRole();
  }, [user, loading, router]);

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Loading...</div>;
  }

  if (!user || userRole !== "superadmin") {
    return null; // Prevent rendering until redirect occurs
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Superadmin Dashboard</h1>

        {/* Welcome Message and Guide */}
        {showWelcome && (
          <div className="bg-blue-100 p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">Welcome, {user.displayName || "Superadmin"}!</h2>
            <p className="text-gray-700 mb-4">
              Thank you for joining Pocket Agency as a Superadmin. This portal allows you to manage all aspects of the platform, including analytics, customers, contractors, and admins.
            </p>
            <p className="text-gray-700 mb-4">
              To get started, explore the sections below. For a detailed guide, download our Superadmin Guide PDF:
            </p>
            <a
              href="/superadmin-guide.pdf"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Guide
            </a>
            <button
              onClick={() => setShowWelcome(false)}
              className="ml-4 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        )}

        {/* Tabbed Navigation */}
        <div className="flex border-b border-gray-300 mb-6">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "analytics" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "customers" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab("contractors")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "contractors" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
            }`}
          >
            Contractors
          </button>
          <button
            onClick={() => setActiveTab("admins")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "admins" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
            }`}
          >
            Admins
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "analytics" && <AnalyticsSection />}
        {activeTab === "customers" && <CustomersSection />}
        {activeTab === "contractors" && <ContractorsSection />}
        {activeTab === "admins" && <AdminsSection />}
      </div>
    </div>
  );
}