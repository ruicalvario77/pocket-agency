// src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, AuthError } from "firebase/auth";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        setError("User data not found.");
        await auth.signOut();
        setLoading(false);
        return;
      }

      const role = userDoc.data()?.role;
      const onboardingCompleted = userDoc.data()?.onboardingCompleted;
      const emailVerified = userDoc.data()?.emailVerified;

      // Check email verification for admins, contractors, and customers (but not superadmins)
      if (role !== "superadmin" && !emailVerified) {
        setError("Please verify your email before logging in.");
        await auth.signOut();
        setLoading(false);
        return;
      }

      // Redirect based on role and onboarding status
      if (role === "superadmin") {
        router.push("/superadmin");
      } else if (role === "admin") {
        router.push("/admin");
      } else if (!onboardingCompleted) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
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
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendMessage("");
    setResendLoading(true);

    try {
      // Attempt to sign in to get the user (this will fail if email is not verified)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        setError("User data not found.");
        await auth.signOut();
        setResendLoading(false);
        return;
      }

      const role = userDoc.data()?.role;
      const emailVerified = userDoc.data()?.emailVerified;

      // Skip resend for superadmins or if already verified
      if (role === "superadmin" || emailVerified) {
        setResendMessage("Email is already verified or verification is not required.");
        await auth.signOut();
        setResendLoading(false);
        return;
      }

      // Resend verification email
      const emailResponse = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userId: user.uid }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(errorData.error || "Failed to resend verification email");
      }

      setResendMessage("Verification email resent successfully! Please check your inbox.");
      await auth.signOut();
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
          setError("Failed to resend verification email. Please try again.");
      }
      setResendLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Login</h1>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {resendMessage && <p className="text-green-500 mt-2">{resendMessage}</p>}
      <form onSubmit={handleLogin} className="mt-4 flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-64"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading || resendLoading}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-64"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading || resendLoading}
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded disabled:bg-gray-400"
          disabled={loading || resendLoading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {error === "Please verify your email before logging in." && (
        <button
          onClick={handleResendVerification}
          className="mt-2 px-6 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
          disabled={resendLoading || loading}
        >
          {resendLoading ? "Resending..." : "Resend Verification Email"}
        </button>
      )}
      <p className="mt-4">
        Don't have an account?{" "}
        <Link href="/auth/signup" className="text-blue-500">
          Sign Up
        </Link>
      </p>
    </div>
  );
}