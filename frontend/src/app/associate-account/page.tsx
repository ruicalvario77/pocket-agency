// src/app/associate-account/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

export default function AssociateAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        userId = userCredential.user.uid;
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        userId = userCredential.user.uid;
      }

      console.log("Token from URL:", token);
      const q = query(
        collection(db, "subscriptions"),
        where("associationToken", "==", token), // Changed to associationToken
        where("temp", "==", true)
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
        associationToken: null, // Clear token after use
        tokenExpiresAt: null,
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError("Failed to " + (isNewUser ? "sign up" : "log in") + ": " + err.message);
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