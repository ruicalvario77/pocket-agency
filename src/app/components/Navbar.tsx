"use client";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image'; // Added import for Image

export default function Navbar() {
  const [user, loading] = useAuthState(auth); // Keep loading and use it
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  // Fetch user's role from Firestore when authenticated
  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      } else {
        setRole(null); // Clear role when logged out
      }
    };
    fetchRole();
  }, [user]);

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  // Set dashboard link based on role
  const dashboardLink = role ? `/${role}/dashboard` : '/';

  // Show loading state while auth is being checked
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <Image src="/logo.svg" alt="Pocket Agency" width={40} height={40} />
        </Link>
        {/* Customer Navigation - Shown only for authenticated customers */}
        {user && role === 'customer' && (
          <div className="flex space-x-6">
            <Link href="/customer/requests" className="hover:underline">
              Requests
            </Link>
            <Link href="/customer/brands" className="hover:underline">
              Brands
            </Link>
            <Link href="/customer/team" className="hover:underline">
              Team
            </Link>
          </div>
        )}
        <div className="flex items-center space-x-4">
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