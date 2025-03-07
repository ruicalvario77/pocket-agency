// src/app/pricing/page.tsx
"use client";

import { useState } from "react";
import { getAuth } from "firebase/auth";

const PricingPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (plan: string) => {
    setLoading(true);
    const auth = getAuth();
    const user = auth.currentUser;
    let idToken: string | null = null;

    if (user) {
      idToken = await user.getIdToken();
    }

    try {
      const response = await fetch("/api/payfast-subscribe", {
        method: "POST",
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) throw new Error("Failed to initiate subscription");

      const { redirectUrl } = await response.json();
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Subscription error:", error);
      alert("An error occurred while initiating your subscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pricing-container">
      <h1>Choose Your Plan</h1>
      <div className="plans">
        <div className="plan">
          <h2>Basic Plan</h2>
          <p>$10/month</p>
          <button onClick={() => handleSubscribe("basic")} disabled={loading}>
            {loading ? "Processing..." : "Subscribe"}
          </button>
        </div>
        <div className="plan">
          <h2>Pro Plan</h2>
          <p>$20/month</p>
          <button onClick={() => handleSubscribe("pro")} disabled={loading}>
            {loading ? "Processing..." : "Subscribe"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;