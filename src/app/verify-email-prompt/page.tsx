// src/app/verify-email-prompt/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/firebaseConfig";
import Link from "next/link";

export default function VerifyEmailPrompt() {
  const [user, loading] = useAuthState(auth);
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      setEmail(user.email || "");
      // Sign out the user to prevent access until email is verified
      auth.signOut().then(() => {
        console.log("User signed out after signup to enforce email verification");
      });
    } else if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Verify Your Email</h1>
      <p className="text-gray-600 mb-4">
        A verification email has been sent to {email}. Please check your inbox (and spam/junk folder) and click the verification link to continue.
      </p>
      <p className="text-gray-600 mb-4">
        Once verified, you can <Link href="/auth/login" className="text-blue-600 hover:underline">log in</Link>.
      </p>
    </div>
  );
}