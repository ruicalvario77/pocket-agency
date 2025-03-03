"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // Redirect to Dashboard after signup
    } catch (err) {
      setError("Error creating account. Try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Sign Up</h1>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <form onSubmit={handleSignup} className="mt-4 flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-64"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-64"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="px-6 py-3 bg-green-600 text-white rounded">
          Sign Up
        </button>
      </form>
      <p className="mt-4">
        Already have an account? <a href="/auth/login" className="text-blue-500">Login</a>
      </p>
    </div>
  );
}
