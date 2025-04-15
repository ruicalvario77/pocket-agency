"use client";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';

export default function Navbar() {
  const [user, loading] = useAuthState(auth);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  // Fetch the user's role from Firestore when the user is authenticated
  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      } else {
        setRole(null); // Clear role when user is logged out
      }
    };
    fetchRole();
  }, [user]);

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  // Dynamically set the dashboard link based on the user's role
  const dashboardLink = role ? `/${role}/dashboard` : '/';

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <img src="/logo.svg" alt="Pocket Agency" className="h-10" />
        </Link>
        {/* Customer Navigation - Only shown if user is authenticated and role is 'customer' */}
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