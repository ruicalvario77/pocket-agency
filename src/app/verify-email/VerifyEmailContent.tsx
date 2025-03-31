// src/app/verify-email/VerifyEmailContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/app/firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

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
        // Fetch the user document from Firestore
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          setError("User not found");
          return;
        }

        const userData = userDoc.data();
        const expectedToken = Buffer.from(`${userId}:${userData.email}`).toString("base64");

        if (token !== expectedToken) {
          setError("Invalid verification token");
          return;
        }

        // Mark the email as verified in Firestore
        await updateDoc(userDocRef, { emailVerified: true });

        setMessage("Email verified successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
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