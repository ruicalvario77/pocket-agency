// src/app/billing/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { PLANS, PlanType } from "../config/plans";

export default function Billing() {
  const [currentPlan, setCurrentPlan] = useState<PlanType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchSubscription = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      const q = query(collection(db, "subscriptions"), where("userId", "==", user.uid));
      const subscriptionSnap = await getDocs(q);
      if (!subscriptionSnap.empty) {
        const data = subscriptionSnap.docs[0].data();
        setCurrentPlan(data.plan || "basic");
      } else {
        setError("No subscription found");
      }
      setLoading(false);
    };
    fetchSubscription();
  }, [router]);

  const handlePlanChange = async (newPlan: PlanType) => {
    if (newPlan === currentPlan) return;

    const user = auth.currentUser;
    if (!user) {
      router.push("/login");
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Billing</h1>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <p>Current Plan: {currentPlan ? PLANS[currentPlan].name : "None"}</p>
      <div className="mt-4">
        {Object.entries(PLANS).map(([planKey, plan]) => (
          <button
            key={planKey}
            onClick={() => handlePlanChange(planKey as PlanType)}
            className={`px-4 py-2 m-2 rounded text-white ${
              currentPlan === planKey ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500"
            }`}
            disabled={currentPlan === planKey}
          >
            {plan.name} (${plan.price}/month)
          </button>
        ))}
      </div>
    </div>
  );
}