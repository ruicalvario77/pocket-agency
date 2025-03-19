// src/app/billing/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { PLANS, PlanType } from "../config/plans";
import { onAuthStateChanged } from "firebase/auth";

export default function Billing() {
  const [currentPlan, setCurrentPlan] = useState<PlanType | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("ACTIVE"); // Added to track status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    console.log("Billing page mounted, initial auth.currentUser:", auth.currentUser);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("onAuthStateChanged user:", user);
      if (!user) {
        console.log("No user found, redirecting to /auth/login");
        router.push("/auth/login");
        return;
      }
      console.log("Fetching subscription for user:", user.uid);

      try {
        const q = query(collection(db, "subscriptions"), where("userId", "==", user.uid));
        const subscriptionSnap = await getDocs(q);
        if (!subscriptionSnap.empty) {
          const data = subscriptionSnap.docs[0].data();
          console.log("Subscription data:", data);
          setCurrentPlan(data.plan || "basic");
          setSubscriptionStatus(data.status || "ACTIVE"); // Set the subscription status
        } else {
          console.log("No subscription found for user:", user.uid);
          setError("No subscription found");
        }
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setError("Error loading subscription data");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handlePlanChange = async (newPlan: PlanType) => {
    if (newPlan === currentPlan) return;

    const user = auth.currentUser;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/payfast-update-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ newPlan }),
      });

      const result = await response.json();
      if (response.ok) {
        setCurrentPlan(newPlan);
        alert(`Plan updated to ${PLANS[newPlan].name}`);
      } else {
        setError(result.error || "Failed to update plan");
      }
    } catch (err) {
      setError("Error updating plan");
      console.error("Plan update error:", err);
    }
  };

  const handleCancel = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/payfast-cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setSubscriptionStatus("CANCELLED");
        alert("Subscription cancelled successfully");
      } else {
        setError(result.error || "Failed to cancel subscription");
      }
    } catch (err) {
      setError("Error cancelling subscription");
      console.error("Cancel subscription error:", err);
    }
  };

  if (loading) return <div className="text-center text-gray-500 mt-10">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Billing</h1>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <p>Current Plan: {currentPlan ? PLANS[currentPlan].name : "None"}</p>
      {subscriptionStatus !== "CANCELLED" && (
        <div className="mt-4 space-y-2">
          {Object.entries(PLANS).map(([planKey, plan]) => (
            <button
              key={planKey}
              onClick={() => handlePlanChange(planKey as PlanType)}
              className={`px-4 py-2 m-2 rounded text-white ${
                currentPlan === planKey ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500"
              }`}
              disabled={currentPlan === planKey}
            >
              {plan.name} (R{plan.price}/month)
            </button>
          ))}
          <button
            onClick={handleCancel}
            className="px-4 py-2 m-2 rounded text-white bg-red-500"
          >
            Cancel Subscription
          </button>
        </div>
      )}
      {subscriptionStatus === "CANCELLED" && (
        <p className="text-gray-600 mt-4">Your subscription has been cancelled.</p>
      )}
    </div>
  );
}