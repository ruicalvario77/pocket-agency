// src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, AuthError } from "firebase/auth";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

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

      if (role !== "superadmin" && !emailVerified) {
        setError("Please verify your email before logging in.");
        await auth.signOut();
        setLoading(false);
        return;
      }

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
      if (authError.code === "auth/network-request-failed") {
        setError("Network error: Please check your internet connection and try again.");
      } else {
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
      }
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendLoading) return; // Prevent multiple clicks
    setResendMessage("");
    setResendLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

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

      if (role === "superadmin" || emailVerified) {
        setResendMessage("Email is already verified or verification is not required.");
        await auth.signOut();
        setResendLoading(false);
        return;
      }

      console.log("Sending resend verification email to:", email, "for user:", user.uid);
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
      if (authError.code === "auth/network-request-failed") {
        setError("Network error: Please check your internet connection and try again.");
      } else {
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
      }
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {resendMessage && <p className="text-green-500 text-center mb-4">{resendMessage}</p>}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || resendLoading}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || resendLoading}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            disabled={loading || resendLoading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {error === "Please verify your email before logging in." && (
          <button
            onClick={handleResendVerification}
            className="mt-4 w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
            disabled={resendLoading || loading}
          >
            {resendLoading ? "Resending..." : "Resend Verification Email"}
          </button>
        )}
      </div>
    </div>
  );
}