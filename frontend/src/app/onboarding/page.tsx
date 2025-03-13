// src/app/onboarding/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const router = useRouter();

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
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