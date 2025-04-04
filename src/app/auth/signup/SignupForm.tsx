"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function SignupForm() {
  const [user, loading] = useAuthState(auth);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasSignedUp, setHasSignedUp] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  useEffect(() => {
    if (!loading && user && !hasSignedUp) {
      router.push("/dashboard");
    }
    if (!plan) {
      router.push("/pricing");
    }
  }, [user, loading, router, plan, hasSignedUp]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        email,
        fullName,
        role: "customer",
        plan,
        onboardingCompleted: false,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      });

      setHasSignedUp(true);
      router.push(`/auth/customer-details?plan=${plan}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("Signup error:", err);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center text-gray-500 mt-10">Loading...</div>;
  if (user || !plan) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>
        <p className="text-gray-600 text-center mb-4">
          Selected Plan: {plan === "basic" ? "Basic (R3000/month)" : "Pro (R8000/month)"}
        </p>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={submitting}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={submitting}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={submitting}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            disabled={submitting}
          >
            {submitting ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}