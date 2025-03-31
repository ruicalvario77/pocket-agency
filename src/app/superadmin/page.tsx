// src/app/superadmin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

// Define the UserData interface
interface UserData {
  id: string; // Add id field
  email: string;
  fullName: string;
  role: string;
  onboardingCompleted: boolean;
  hasSeenWelcome?: boolean;
  assignedAdmin?: string;
}

// Analytics Section
const AnalyticsSection = () => (
  <div className="p-4">
    <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
    <p>Financial Overview, Marketing Dashboard, Team Performance, and AI-Driven Insights will be displayed here.</p>
  </div>
);

// Customers Section
const CustomersSection = () => {
  const [customers, setCustomers] = useState<UserData[]>([]);
  const [admins, setAdmins] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customers
        const customersSnapshot = await getDocs(collection(db, "users"));
        const customersData = customersSnapshot.docs
          .map(doc => {
            const data = doc.data();
            // Validate required fields
            if (
              typeof data.email !== "string" ||
              typeof data.fullName !== "string" ||
              typeof data.role !== "string" ||
              typeof data.onboardingCompleted !== "boolean"
            ) {
              return null; // Skip invalid documents
            }
            return {
              id: doc.id,
              email: data.email,
              fullName: data.fullName,
              role: data.role,
              onboardingCompleted: data.onboardingCompleted,
              hasSeenWelcome: data.hasSeenWelcome,
              assignedAdmin: data.assignedAdmin,
            } as UserData;
          })
          .filter((user): user is UserData => user !== null && user.role === "customer");
        setCustomers(customersData);

        // Fetch admins
        const adminsSnapshot = await getDocs(collection(db, "users"));
        const adminsData = adminsSnapshot.docs
          .map(doc => {
            const data = doc.data();
            // Validate required fields
            if (
              typeof data.email !== "string" ||
              typeof data.fullName !== "string" ||
              typeof data.role !== "string" ||
              typeof data.onboardingCompleted !== "boolean"
            ) {
              return null; // Skip invalid documents
            }
            return {
              id: doc.id,
              email: data.email,
              fullName: data.fullName,
              role: data.role,
              onboardingCompleted: data.onboardingCompleted,
              hasSeenWelcome: data.hasSeenWelcome,
              assignedAdmin: data.assignedAdmin,
            } as UserData;
          })
          .filter((user): user is UserData => user !== null && user.role === "admin");
        setAdmins(adminsData);

        setLoading(false);
      } catch (err: unknown) {
        let errorMessage = "An unexpected error occurred";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssignAdmin = async (customerId: string, adminId: string) => {
    try {
      const customerDocRef = doc(db, "users", customerId);
      await setDoc(customerDocRef, { assignedAdmin: adminId }, { merge: true });
      setCustomers(customers.map(customer =>
        customer.id === customerId ? { ...customer, assignedAdmin: adminId } : customer
      ));
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Error assigning admin:", err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Customers</h2>
      <p className="text-gray-600 mb-4">Manage customer assignments to admins.</p>
      {customers.length === 0 ? (
        <p className="text-gray-500">No customers found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Email</th>
              <th className="border border-gray-300 p-2">Full Name</th>
              <th className="border border-gray-300 p-2">Assigned Admin</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td className="border border-gray-300 p-2">{customer.email}</td>
                <td className="border border-gray-300 p-2">{customer.fullName}</td>
                <td className="border border-gray-300 p-2">
                  {customer.assignedAdmin
                    ? admins.find(admin => admin.id === customer.assignedAdmin)?.fullName || "Unknown"
                    : "None"}
                </td>
                <td className="border border-gray-300 p-2">
                  <select
                    value={customer.assignedAdmin || ""}
                    onChange={(e) => handleAssignAdmin(customer.id, e.target.value)}
                    className="border p-1 rounded"
                  >
                    <option value="">None</option>
                    {admins.map(admin => (
                      <option key={admin.id} value={admin.id}>
                        {admin.fullName}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Contractors Section
const ContractorsSection = () => (
  <div className="p-4">
    <h2 className="text-2xl font-semibold mb-4">Contractors</h2>
    <p>Contractor applications, schedules, work oversight, and performance metrics will be displayed here.</p>
  </div>
);

// Admins Section
const AdminsSection = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/invite-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send invitation");
      }

      setSuccess("Invitation sent successfully!");
      setEmail("");
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Invite admin error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Admins</h2>
      <p className="text-gray-600 mb-4">Invite new admins to join the platform.</p>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleInviteAdmin} className="flex flex-col gap-3 max-w-md">
        <input
          type="email"
          placeholder="Enter admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded w-full"
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Invitation"}
        </button>
      </form>
    </div>
  );
};

export default function SuperadminDashboard() {
  const [user, loading] = useAuthState(auth);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("analytics");
  const [showWelcome, setShowWelcome] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user && !loading) {
        console.log("No user, redirecting to login");
        router.push("/auth/login");
      } else if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          console.log("User document not found, redirecting to login");
          router.push("/auth/login");
          return;
        }

        const role = userDoc.data()?.role;
        console.log("User role:", role);
        setUserRole(role);
        setUserData(userDoc.data() as UserData);

        if (role !== "superadmin") {
          if (role === "admin") {
            console.log("User is admin, redirecting to /admin");
            router.push("/admin");
          } else {
            console.log("User is not superadmin, redirecting to /dashboard");
            router.push("/dashboard");
          }
          return;
        }
      }
    };
    checkUserRole();
  }, [user, loading, router]);

  useEffect(() => {
    const checkWelcomeMessage = async () => {
      if (user && userRole === "superadmin") {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const hasSeenWelcome = userDoc.data()?.hasSeenWelcome;
        console.log("hasSeenWelcome:", hasSeenWelcome);
        console.log("hasSeenWelcome type:", typeof hasSeenWelcome);

        if (hasSeenWelcome === undefined || !hasSeenWelcome) {
          console.log("Showing welcome message");
          setShowWelcome(true);
          // Update Firestore to mark welcome as seen
          await setDoc(userDocRef, { hasSeenWelcome: true }, { merge: true });
        } else {
          console.log("Welcome message already seen");
        }
      }
    };
    checkWelcomeMessage();
  }, [user, userRole]);

  const handleCloseWelcome = async () => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      // Update both hasSeenWelcome and onboardingCompleted to true
      await setDoc(userDocRef, { hasSeenWelcome: true, onboardingCompleted: true }, { merge: true });
      setShowWelcome(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Loading...</div>;
  }

  if (!user || userRole !== "superadmin") {
    return null; // Prevent rendering until redirect occurs
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Superadmin Dashboard</h1>

        {/* Welcome Message and Guide */}
        {showWelcome && (
          <div className="bg-blue-100 p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">Welcome, {userData?.fullName || "Superadmin"}!</h2>
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
              onClick={handleCloseWelcome}
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