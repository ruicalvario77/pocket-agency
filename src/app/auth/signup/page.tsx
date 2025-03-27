// src/app/auth/signup/page.tsx
"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, AuthError } from "firebase/auth";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); // Add fullName state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        fullName, // Include fullName in the Firestore document
        role: "customer",
        createdAt: new Date().toISOString(),
        onboardingCompleted: false,
      });

      router.push("/onboarding");
    } catch (err) {
      const authError = err as AuthError;
      switch (authError.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists.");
          break;
        case "auth/invalid-email":
          setError("Invalid email format.");
          break;
        case "auth/weak-password":
          setError("Password must be at least 6 characters long.");
          break;
        default:
          setError("Signup failed. Please try again.");
      }
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
          className="border p-2 w-64"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-64"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-64"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      <p className="mt-4">
        Already have an account?{" "}
        <a href="/auth/login" className="text-blue-500">
          Login
        </a>
      </p>
    </div>
  );
}