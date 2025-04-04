"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export default function CheckoutPage() {
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

  const handlePayment = async () => {
    if (!user || !plan) return;

    setError("");
    setSubmitting(true);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/payfast-subscribe", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan, email: user.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment initiation failed");
      }

      const { paymentData, signature } = await response.json();

      // Simulate payment success (replace with actual Payfast redirect and callback handling)
      const subscriptionRef = doc(db, "subscriptions", user.uid);
      await updateDoc(subscriptionRef, {
        status: "active",
        updatedAt: new Date().toISOString(),
      });

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        onboardingCompleted: true,
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      let errorMessage = "Payment failed. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Payment error:", err);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center text-gray-500 mt-10">Loading...</div>;
  if (!user || !plan) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Checkout</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-blue-600">
            {plan === "basic" ? "Basic Plan" : "Pro Plan"}
          </h2>
          <p className="text-xl text-gray-800">
            {plan === "basic" ? "R3000/month" : "R8000/month"}
          </p>
        </div>
        <button
          onClick={handlePayment}
          className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition ${
            submitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
          disabled={submitting}
        >
          {submitting ? "Processing..." : "Pay with Payfast"}
        </button>
      </div>
    </div>
  );
}