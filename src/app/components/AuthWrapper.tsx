"use client";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, db } from '@/app/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function AuthWrapper({ children, requiredRole }: { children: React.ReactNode, requiredRole: string }) {
  const [user, loading] = useAuthState(auth);
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

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (role && role !== requiredRole) {
      router.push('/unauthorized');
    }
  }, [user, loading, role, router, requiredRole]);

  if (loading || role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || role !== requiredRole) {
    return null; // Redirecting happens via useEffect
  }

  return <>{children}</>;
}