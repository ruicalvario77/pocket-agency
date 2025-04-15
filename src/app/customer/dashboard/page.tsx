"use client";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/firebaseConfig';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import AuthWrapper from '@/app/components/AuthWrapper';

export default function CustomerDashboard() {
  const [user] = useAuthState(auth);
  const [fullName, setFullName] = useState('Customer');

  // Fetch the user's fullName from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFullName(data.fullName || 'Customer');
        }
      }
    };
    fetchUserData();
  }, [user]);

  return (
    <AuthWrapper requiredRole="customer">
      <div className="min-h-screen bg-gray-100">
        {/* Navbar is included via layout.tsx, no need to add it here */}
        <div className="p-4 sm:p-6 md:p-8 lg:p-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Customer Dashboard</h1>
          <p className="text-sm sm:text-base">Welcome, {fullName}! Here you can manage your requests.</p>
          {/* Add more customer-specific content here */}
        </div>
      </div>
    </AuthWrapper>
  );
}