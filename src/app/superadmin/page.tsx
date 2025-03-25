"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function SuperadminDashboard() {
  const [user, loading] = useAuthState(auth);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user && !loading) {
        router.push("/auth/login");
      } else if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const role = userDoc.data()?.role;
        setUserRole(role);
        if (role !== "superadmin") {
          if (role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        }
      }
    };
    checkUserRole();
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || userRole !== "superadmin") {
    return null; // Prevent rendering until redirect occurs
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Superadmin Dashboard
        </h1>
        <p className="mt-4 text-gray-600">
          Welcome to the superadmin dashboard! This is a placeholder.
        </p>
      </div>
    </div>
  );
}