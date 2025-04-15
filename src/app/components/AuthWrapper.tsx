// app/components/AuthWrapper.tsx
"use client";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation'; // Use next/navigation instead of next/router
import { useEffect } from 'react';
import { auth } from '@/app/firebase/firebaseConfig';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/superadmin/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting will happen via useEffect
  }

  return <>{children}</>;
}