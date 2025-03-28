// src/app/admin-signup/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Suspense } from "react";

const AdminSignupContent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Invalid or missing invitation token");
        return;
      }

      try {
        const invitationDocRef = doc(db, "admin_invitations", token);
        const invitationDoc = await getDoc(invitationDocRef);

        if (!invitationDoc.exists()) {
          setError("Invalid invitation token");
          return;
        }

        const invitation = invitationDoc.data();
        if (invitation.used) {
          setError("This invitation has already been used");
          return;
        }

        const now = new Date();
        const expiresAt = new Date(invitation.expiresAt);
        if (now > expiresAt) {
          setError("This invitation has expired");
          return;
        }

        setEmail(invitation.email);
        setTokenValid(true);
      } catch (err: unknown) {
        let errorMessage = "An unexpected error occurred";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        console.error("Token validation error:", err);
      }
    };

    validateToken();
  }, [token]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!tokenValid || !token) {
        throw new Error("Invalid invitation token");
      }

      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore with admin role
      await setDoc(doc(db, "users", user.uid), {
        email,
        fullName,
        role: "admin",
        onboardingCompleted: false,
        hasSeenWelcome: false,
      });

      // Mark the invitation as used
      await setDoc(doc(db, "admin_invitations", token), { used: true }, { merge: true });

      router.push("/admin");
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error("Admin signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold">Admin Signup</h1>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Admin Signup</h1>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <form onSubmit={handleSignup} className="mt-4 flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-64"
          required
          disabled
        />
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
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-64"
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
    </div>
  );
};

export default function AdminSignup() {
  return (
    <Suspense fallback={<div className="text-center text-gray-500 mt-10">Loading...</div>}>
      <AdminSignupContent />
    </Suspense>
  );
}