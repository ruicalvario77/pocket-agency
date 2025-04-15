// src/app/components/Navbar.tsx
"use client";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/firebaseConfig'; // Adjust path as needed

export default function Navbar() {
  const [user] = useAuthState(auth);

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between">
        <a href="/">Pocket Agency</a>
        <div>
          {user ? (
            <>
              <a href="/dashboard" className="mr-4">Dashboard</a>
              <a href="/logout">Logout</a>
            </>
          ) : (
            <a href="/auth/login">Login</a>
          )}
        </div>
      </div>
    </nav>
  );
}