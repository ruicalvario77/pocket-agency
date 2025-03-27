// src/app/components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { auth } from "@/app/firebase/firebaseConfig";
import { signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link for navigation

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth/login");
  };

  return (
    <nav className="bg-white shadow-md py-4 fixed top-0 left-0 w-full z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold text-blue-600">Pocket Agency</h1>
        <div>
          <Link href="/#home" className="text-gray-700 hover:text-blue-600 mx-2">
            Home
          </Link>
          <Link href="/#services" className="text-gray-700 hover:text-blue-600 mx-2">
            Services
          </Link>
          <Link href="/#contact" className="text-gray-700 hover:text-blue-600 mx-2">
            Contact
          </Link>
          <Link href="/pricing" className="text-gray-700 hover:text-blue-600 mx-2">
            Pricing
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 mx-2">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-blue-600 mx-2"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 mx-2">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}