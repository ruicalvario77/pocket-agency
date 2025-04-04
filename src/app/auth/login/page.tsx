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

      const userData = userDoc.data();
      const role = userData.role;
      const onboardingCompleted = userData.onboardingCompleted;

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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}