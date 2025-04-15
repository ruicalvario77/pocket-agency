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

  // Fetch the user's role from Firestore when the user is authenticated
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

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  // Dynamically set the dashboard link based on the user's role
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
              {role === 'admin' && (
                <Link href="/admin/manage-users">
                  <p className="mr-4">Manage Users</p>
                </Link>
              )}
              {role === 'superadmin' && (
                <>
                  <Link href="/superadmin/manage-admins">
                    <p className="mr-4">Manage Admins</p>
                  </Link>
                  <Link href="/superadmin/analytics">
                    <p className="mr-4">Analytics</p>
                  </Link>
                </>
              )}
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