// src/app/components/Navbar.tsx
"use client";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/firebaseConfig'; // Adjust path to your Firebase config
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth); // Sign out from Firebase
    router.push('/'); // Redirect to home page
  };

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between">
        <Link href="/">
          <p>Pocket Agency</p>
        </Link>
        <div>
          {user ? (
            <>
              <Link href="/dashboard">
                <p className="mr-4">Dashboard</p>
              </Link>
              <button onClick={handleLogout} className="text-white">
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth/login">
              <p>Login</p>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}