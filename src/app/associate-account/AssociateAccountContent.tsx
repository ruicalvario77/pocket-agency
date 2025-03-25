// src/app/associate-account/AssociateAccountContent.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";

export default function AssociateAccountContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
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
      let userId: string;
      if (isNewUser) {
        if (!fullName) throw new Error("Full name is required for new users.");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        userId = userCredential.user.uid;
        await setDoc(doc(db, "users", userId), {
          email,
          fullName,
          onboardingCompleted: false,
        }, { merge: true });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        userId = userCredential.user.uid;
      }

      console.log("Token from URL:", token);
      const q = query(
        collection(db, "subscriptions"),
        where("associationToken", "==", token)
        // Removed: where("temp", "==", true)
      );
      const querySnapshot = await getDocs(q);

      console.log("Query results:", querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      if (querySnapshot.empty) {
        throw new Error("No matching subscription found");
      }

      const subscriptionDoc = querySnapshot.docs[0];
      console.log("Found subscription:", subscriptionDoc.data());
      const subscriptionRef = doc(db, "subscriptions", subscriptionDoc.id);
      await updateDoc(subscriptionRef, {
        userId,
        temp: false,
        associationToken: null,
        tokenExpiresAt: null,
      });

      router.push("/onboarding");
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred";
      // Check if the error is a Firebase Auth error by looking for the 'code' and 'message' properties
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof (err as { code: unknown }).code === "string" &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string"
      ) {
        // Firebase Auth errors have both 'code' and 'message' properties
        errorMessage = (err as { message: string }).message;
      } else if (err instanceof Error) {
        // Handle standard JavaScript errors
        errorMessage = err.message;
      }
      setError("Failed to " + (isNewUser ? "sign up" : "log in") + ": " + errorMessage);
      console.error("Association error:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Associate Your Subscription</h1>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <form onSubmit={handleAssociate} className="mt-4 flex flex-col gap-3 w-64">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />
        {isNewUser && (
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="border p-2 rounded"
            required
          />
        )}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isNewUser}
            onChange={(e) => setIsNewUser(e.target.checked)}
            id="newUser"
          />
          <label htmlFor="newUser" className="text-sm">New user? Sign up instead</label>
        </div>
        <button type="submit" className="px-6 py-3 bg-green-600 text-white rounded">
          {isNewUser ? "Sign Up & Associate" : "Log In & Associate"}
        </button>
      </form>
    </div>
  );
}