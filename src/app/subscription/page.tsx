"use client";

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import AuthWrapper from '@/app/components/AuthWrapper';

// Define the Subscription interface
interface Subscription {
  plan: string;
  status: string;
  startDate: Date;
  nextBillingDate: Date;
}

export default function SubscriptionPage() {
  const [user] = useAuthState(auth);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch subscription data when the user is authenticated
  useEffect(() => {
    const fetchSubscription = async () => {
      if (user) {
        const subRef = doc(db, 'subscriptions', user.uid);
        const subSnap = await getDoc(subRef);
        if (subSnap.exists()) {
          const data = subSnap.data();
          setSubscription({
            plan: data.plan,
            status: data.status,
            startDate: data.startDate.toDate(),
            nextBillingDate: data.nextBillingDate.toDate(),
          });
        }
      }
      setLoading(false);
    };
    fetchSubscription();
  }, [user]);

  // Handle subscription actions (upgrade, downgrade, cancel)
  const handleAction = async (action: 'upgrade' | 'downgrade' | 'cancel') => {
    if (!user) return;
    const subRef = doc(db, 'subscriptions', user.uid);

    if (action === 'upgrade') {
      await updateDoc(subRef, { plan: 'Pro' });
    } else if (action === 'downgrade') {
      await updateDoc(subRef, { plan: 'Basic' });
    } else if (action === 'cancel') {
      await updateDoc(subRef, { status: 'canceled' });
    }

    // Refresh subscription data after the action
    const subSnap = await getDoc(subRef);
    if (subSnap.exists()) {
      const data = subSnap.data();
      setSubscription({
        plan: data.plan,
        status: data.status,
        startDate: data.startDate.toDate(),
        nextBillingDate: data.nextBillingDate.toDate(),
      });
    } else {
      setSubscription(null);
    }
  };

  // Display loading state while fetching data
  if (loading) {
    return (
      <AuthWrapper requiredRole="customer">
        <div className="container mx-auto p-6">Loading...</div>
      </AuthWrapper>
    );
  }

  // Render the subscription management UI
  return (
    <AuthWrapper requiredRole="customer">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Manage Your Subscription</h1>
        {subscription ? (
          <div className="bg-gray-100 p-4 rounded-lg">
            <p><strong>Plan:</strong> {subscription.plan}</p>
            <p><strong>Status:</strong> {subscription.status}</p>
            <p><strong>Start Date:</strong> {subscription.startDate.toLocaleDateString()}</p>
            <p><strong>Next Billing Date:</strong> {subscription.nextBillingDate.toLocaleDateString()}</p>
            <div className="mt-4 space-x-2">
              <button
                onClick={() => handleAction('upgrade')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={subscription.plan === 'Pro'}
              >
                Upgrade to Pro
              </button>
              <button
                onClick={() => handleAction('downgrade')}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                disabled={subscription.plan === 'Basic'}
              >
                Downgrade to Basic
              </button>
              <button
                onClick={() => handleAction('cancel')}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                disabled={subscription.status === 'canceled'}
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        ) : (
          <p>No subscription found.</p>
        )}
      </div>
    </AuthWrapper>
  );
}