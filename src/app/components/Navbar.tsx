// src/app/components/Navbar.tsx
"use client";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/firebaseConfig'; // Adjust path as needed
import Link from 'next/link'; // Import Link for internal navigation

export default function Navbar() {
  const [user] = useAuthState(auth);

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between">
        <Link href="/">
          <a>Pocket Agency</a>
        </Link>
        <div>
          {user ? (
            <>
              <Link href="/dashboard">
                <a className="mr-4">Dashboard</a>
              </Link>
              <Link href="/logout">
                <a>Logout</a>
              </Link>
            </>
          ) : (
            <Link href="/auth/login">
              <a>Login</a>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}