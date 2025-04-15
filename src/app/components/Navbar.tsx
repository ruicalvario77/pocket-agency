// src/app/components/Navbar.tsx
"use client";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      }
    };
    fetchRole();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const dashboardLink = role ? `/${role}/dashboard` : '/';

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between">
        <Link href="/">
          <p>Pocket Agency</p>
        </Link>
        <div>
          {user ? (
            <>
              <Link href={dashboardLink}>
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