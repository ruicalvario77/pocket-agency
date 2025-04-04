"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function CartForm() {
  const [user, loading] = useAuthState(auth);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
    if (!plan) {
      router.push("/pricing");
    }
  }, [user, loading, router, plan]);

  const handleCheckout = async () => {
    if (!user) return;

    setError("");
    setSubmitting(true);

    try {
      const subscriptionRef = doc(db, "subscriptions", user.uid);
      await setDoc(subscriptionRef, {
        userId: user.uid,
        email_address: user.email,
        plan,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      router.push(`/checkout?plan=${plan}`);
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Checkout error:", err);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center text-gray-500 mt-10">Loading...</div>;
  if (!user || !plan) return null;

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <section className="max-w-6xl mx-auto py-16 px-6">
        <h1 className="text-4xl font-bold text-blue-600 text-center mb-8">Cart</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">
            {plan === "basic" ? "Basic Plan" : "Pro Plan"}
          </h2>
          <p className="text-3xl font-bold text-gray-800 mb-2">
            {plan === "basic" ? "R3000" : "R8000"}
          </p>
          <p className="text-gray-600 mb-6">per month</p>
          <ul className="text-gray-600 mb-6 space-y-2">
            {plan === "basic" ? (
              <>
                <li>✓ Custom Website Design</li>
                <li>✓ Basic Support</li>
                <li>✓ 1 Project Slot</li>
              </>
            ) : (
              <>
                <li>✓ Advanced Website Design</li>
                <li>✓ Web Development</li>
                <li>✓ Priority Support</li>
                <li>✓ 3 Project Slots</li>
              </>
            )}
          </ul>
          <button
            onClick={handleCheckout}
            className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition ${
              submitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
            disabled={submitting}
          >
            {submitting ? "Processing..." : "Continue to Checkout"}
          </button>
        </div>
      </section>
    </div>
  );
}