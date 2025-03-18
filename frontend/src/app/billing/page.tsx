"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { PLANS, PlanType } from "../config/plans";

export default function Billing() {
  const [currentPlan, setCurrentPlan] = useState<PlanType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSubscription = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      const subscriptionRef = doc(db, "subscriptions", user.uid);
      const subscriptionSnap = await getDoc(subscriptionRef);
      if (subscriptionSnap.exists()) {
        const data = subscriptionSnap.data();
        setCurrentPlan(data.plan || "basic");
      }
      setLoading(false);
    };
    fetchSubscription();
  }, [router]);

  const handlePlanChange = async (newPlan: PlanType) => {
    // Placeholder for API call
    console.log(`Changing plan from ${currentPlan} to ${newPlan}`);
    // TODO: Call /api/payfast-update-subscription
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Billing</h1>
      <p>Current Plan: {currentPlan ? PLANS[currentPlan].name : "None"}</p>
      <div className="mt-4">
        {Object.entries(PLANS).map(([planKey, plan]) => (
          <button
            key={planKey}
            onClick={() => handlePlanChange(planKey as PlanType)}
            className="px-4 py-2 m-2 bg-blue-500 text-white rounded"
            disabled={currentPlan === planKey}
          >
            {plan.name} (${plan.price}/month)
          </button>
        ))}
      </div>
    </div>
  );
}