// src/app/verify-email/VerifyEmailContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/app/firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function VerifyEmailContent() {
  const [message, setMessage] = useState("Verifying your email...");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !userId) {
        setError("Invalid or missing token/userId. Please try again or request a new verification email.");
        return;
      }

      try {
        // Fetch the user document from Firestore
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          setError("User not found. Please sign up again.");
          return;
        }

        const userData = userDoc.data();
        const storedToken = userData.verificationToken;

        if (!storedToken || token !== storedToken) {
          setError("Invalid or expired verification token. Please request a new verification email.");
          return;
        }

        // Mark the email as verified and clear the verification token
        await updateDoc(userDocRef, {
          emailVerified: true,
          verificationToken: null,
          token: token, // Include the token in the update for verification in the security rule
        });

        setMessage("Email verified successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } catch (err: unknown) {
        let errorMessage = "An unexpected error occurred. Please try again later.";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        console.error("Verification error:", err);
      }
    };

    verifyEmail();
  }, [token, userId, router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Verify Your Email</h1>
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      </div>
    </div>
  );
}