// src/app/verify-email/VerifyEmailContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/app/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";

export default function VerifyEmailContent() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !userId) {
        setError("Invalid or missing token/userId");
        return;
      }

      try {
        // Check if the user is logged in
        const user = auth.currentUser;
        if (user && user.uid === userId) {
          // Get the user's custom claims
          const customClaims = (await user.getIdTokenResult()).claims;
          if (customClaims.verificationToken === token) {
            // Clear the verification token
            await fetch("/api/clear-verification-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId }),
            });
            setMessage("Email verified successfully! Redirecting to onboarding...");
            // Redirect to onboarding if not completed, otherwise to dashboard
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            const onboardingCompleted = userDoc.data()?.onboardingCompleted;
            setTimeout(() => {
              router.push(onboardingCompleted ? "/dashboard" : "/onboarding");
            }, 3000);
          } else {
            setError("Invalid verification token");
          }
        } else {
          setError("Please log in to verify your email");
          router.push("/auth/login");
        }
      } catch (err: unknown) {
        let errorMessage = "An unexpected error occurred";
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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Verify Your Email</h1>
      {message && <p className="text-green-500 mt-2">{message}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}