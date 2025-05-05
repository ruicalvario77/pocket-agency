"use client";
import { Timestamp, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { useEffect, useState } from "react";
import AuthWrapper from "@/app/components/AuthWrapper";

interface Subscription {
  plan: string;
  status: string;
  startDate: Timestamp;
  nextBillingDate: Timestamp;
}

export default function SubscriptionManagement() {
  const [user] = useAuthState(auth);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user) {
        const subQuery = query(
          collection(db, "subscriptions"),
          where("userId", "==", user.uid)
        );
        try {
          const subSnapshot = await getDocs(subQuery);
          if (!subSnapshot.empty) {
            const data = subSnapshot.docs[0].data();
            setSubscription({
              plan: data.plan,
              status: data.status,
              startDate: data.startDate,
              nextBillingDate: data.nextBillingDate,
            });
          }
        } catch (error) {
          console.error("Error fetching subscription:", error);
        }
      }
      setLoading(false);
    };
    fetchSubscription();
  }, [user]);

  const handleAction = async (action: string) => {
    if (!user || !subscription) return;
    const subRef = doc(db, "subscriptions", user.uid);
    let updates = {};

    switch (action) {
      case "upgrade":
        if (subscription.plan !== "Pro") updates = { plan: "Pro" };
        break;
      case "downgrade":
        if (subscription.plan !== "Basic") updates = { plan: "Basic" };
        break;
      case "pause":
        if (subscription.status !== "paused") updates = { status: "paused" };
        break;
      case "cancel":
        if (subscription.status !== "canceled") updates = { status: "canceled" };
        break;
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(subRef, updates);
      const subSnapshot = await getDocs(query(collection(db, "subscriptions"), where("userId", "==", user.uid)));
      if (!subSnapshot.empty) {
        const data = subSnapshot.docs[0].data();
        setSubscription({
          plan: data.plan,
          status: data.status,
          startDate: data.startDate,
          nextBillingDate: data.nextBillingDate,
        });
      }
    }
  };

  if (loading) {
    return (
      <AuthWrapper requiredRole="customer">
        <div className="container mx-auto p-6">
          <p>Loading...</p>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper requiredRole="customer">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Manage Your Subscription</h1>
        {subscription ? (
          <div className="bg-gray-100 p-4 rounded-lg">
            <p><strong>Plan:</strong> {subscription.plan}</p>
            <p><strong>Status:</strong> {subscription.status}</p>
            <p><strong>Start Date:</strong> {subscription.startDate.toDate().toLocaleDateString()}</p>
            <p><strong>Next Billing Date:</strong> {subscription.nextBillingDate.toDate().toLocaleDateString()}</p>
            <div className="mt-4 space-x-2">
              <button
                onClick={() => handleAction("upgrade")}
                disabled={subscription.plan === "Pro"}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                Upgrade to Pro
              </button>
              <button
                onClick={() => handleAction("downgrade")}
                disabled={subscription.plan === "Basic"}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                Downgrade to Basic
              </button>
              <button
                onClick={() => handleAction("pause")}
                disabled={subscription.status === "paused"}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-gray-400"
              >
                Pause Subscription
              </button>
              <button
                onClick={() => handleAction("cancel")}
                disabled={subscription.status === "canceled"}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400"
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