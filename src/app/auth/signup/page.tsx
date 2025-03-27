// src/app/auth/signup/page.tsx
"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [plan, setPlan] = useState<"basic" | "pro" | "">(""); // Add plan selection
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate plan selection
      if (!plan) {
        throw new Error("Please select a plan");
      }

      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email,
        fullName,
        role: "customer",
        onboardingCompleted: false,
      });

      // Send verification email
      await fetch("/api/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userId: user.uid }),
      });

      // Create a pending subscription
      const subscriptionRef = doc(db, "subscriptions", user.uid);
      await setDoc(subscriptionRef, {
        userId: user.uid,
        email_address: email,
        plan,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      // Redirect to PayFast for payment
      const response = await fetch("/api/payfast-subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({ plan, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initiate subscription");
      }

      const { paymentData, signature } = await response.json();
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://sandbox.payfast.co.za/eng/process";
      paymentData.forEach(([key, value]: [string, string]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      const signatureInput = document.createElement("input");
      signatureInput.type = "hidden";
      signatureInput.name = "signature";
      signatureInput.value = signature;
      form.appendChild(signatureInput);
      document.body.appendChild(form);
      form.submit();
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Sign Up</h1>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <form onSubmit={handleSignup} className="mt-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border p-2 w-64"
          required
          disabled={loading}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-64"
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-64"
          required
          disabled={loading}
        />
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value as "basic" | "pro")}
          className="border p-2 w-64"
          required
          disabled={loading}
        >
          <option value="">Select a Plan</option>
          <option value="basic">Basic Plan (R3000/month)</option>
          <option value="pro">Pro Plan (R8000/month)</option>
        </select>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Processing..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}