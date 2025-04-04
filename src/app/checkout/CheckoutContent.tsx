// src/app/checkout/CheckoutContent.tsx
"use client";

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/app/firebase/firebaseConfig';

export default function CheckoutContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [user] = useAuthState(auth);
  const router = useRouter();

  // If no plan is selected, show an error message
  if (!plan) {
    return <div className="text-center text-red-500">No plan selected. Please choose a plan.</div>;
  }

  // Handle payment simulation and Firestore updates
  const handlePayment = async () => {
    // Check if the user is authenticated
    if (!user) {
      setError('You must be logged in to complete checkout.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Update the subscription document to mark it as active
      const subscriptionRef = doc(db, 'subscriptions', user.uid);
      await updateDoc(subscriptionRef, {
        status: 'active',
        updatedAt: new Date().toISOString(),
      });

      // Update the user document to mark onboarding as completed
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        onboardingCompleted: true,
      });

      // Redirect to the dashboard on success
      router.push('/dashboard');
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to complete checkout. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Checkout</h1>
        {/* Display any errors */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <h2 className="text-2xl font-semibold text-blue-600">
          {plan === 'basic' ? 'Basic Plan' : 'Pro Plan'}
        </h2>
        <p className="text-xl text-gray-800">
          {plan === 'basic' ? 'R3000/month' : 'R8000/month'}
        </p>
        <button
          onClick={handlePayment}
          className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition ${
            submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
          disabled={submitting}
        >
          {submitting ? 'Processing...' : 'Pay with Payfast'}
        </button>
      </div>
    </div>
  );
}