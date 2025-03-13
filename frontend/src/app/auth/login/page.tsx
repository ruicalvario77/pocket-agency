// src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, AuthError } from "firebase/auth";
import { auth } from "@/app/firebase/firebaseConfig"; // Updated import
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // Redirect to Dashboard after login
    } catch (err) {
      const authError = err as AuthError;
      switch (authError.code) {
        case "auth/wrong-password":
          setError("Incorrect password.");
          break;
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        case "auth/invalid-email":
          setError("Invalid email format.");
          break;
        default:
          setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Login</h1>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <form onSubmit={handleLogin} className="mt-4 flex flex-col gap-3">
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
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="mt-4">
        Don&apos;t have an account?{" "}
        <a href="/auth/signup" className="text-blue-500">
          Sign Up
        </a>
      </p>
    </div>
  );
}