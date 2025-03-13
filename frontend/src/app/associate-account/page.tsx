// src/app/associate-account/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function AssociateAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing token");
    }
  }, [token]);

  const handleAssociate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Query Firestore for the subscription with the token
      const q = query(
        collection(db, "subscriptions"), // Client-side collection access
        where("associationToken", "==", token),
        where("status", "==", "active")
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("No matching subscription found");
      }

      // Update the subscription with userId
      const subscriptionDoc = querySnapshot.docs[0];
      const subscriptionRef = doc(db, "subscriptions", subscriptionDoc.id); // Client-side doc reference
      await updateDoc(subscriptionRef, {
        userId,
        associationToken: null,
        tokenExpiresAt: null,
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError("Failed to associate account. Please check your credentials or token.");
      console.error("Association error:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Associate Your Subscription</h1>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <form onSubmit={handleAssociate} className="mt-4 flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-64"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-64"
          required
        />
        <button type="submit" className="px-6 py-3 bg-green-600 text-white rounded">
          Associate Account
        </button>
      </form>
    </div>
  );
}