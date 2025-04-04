// src/app/onboarding/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("No user found, redirecting to /auth/login");
        router.push("/auth/login");
        return;
      }

      // Fetch user role and email verification status
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        console.log("User document not found, redirecting to /auth/login");
        router.push("/auth/login");
        return;
      }

      const role = userDoc.data()?.role;
      const isEmailVerified = userDoc.data()?.emailVerified || false;
      setUserRole(role);
      setEmailVerified(isEmailVerified);

      // Redirect non-customers to their appropriate dashboards
      if (role !== "customer") {
        if (role === "superadmin") {
          router.push("/superadmin");
        } else if (role === "admin") {
          router.push("/admin");
        } else if (role === "contractor") {
          router.push("/dashboard");
        }
        return;
      }

      // Check email verification
      if (!isEmailVerified) {
        setError("Please verify your email before completing onboarding.");
        await signOut(auth);
        router.push("/auth/login");
        return;
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Mark onboarding as complete
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          onboardingCompleted: true,
        }, { merge: true });
      }
      router.push("/dashboard");
    }
  };

  if (authLoading) return <div className="text-center text-gray-500 mt-10">Loading...</div>;
  if (!userRole || userRole !== "customer" || !emailVerified) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold mb-4">Welcome to Pocket Agency!</h1>
            <p className="text-gray-600 mb-6">
              We’re thrilled to have you! This quick guide will help you get started.
            </p>
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="text-2xl font-bold mb-4">Your Dashboard</h1>
            <p className="text-gray-600 mb-6">
              On your dashboard, you can submit projects, track their status, and manage your subscription.
            </p>
          </>
        )}
        {step === 3 && (
          <>
            <h1 className="text-2xl font-bold mb-4">Get Started</h1>
            <p className="text-gray-600 mb-6">
              Submit your first project now and let our team bring your vision to life!
            </p>
          </>
        )}
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Step {step} of 3</span>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            {step === 3 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}