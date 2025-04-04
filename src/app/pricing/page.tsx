// src/app/pricing/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/firebaseConfig";

const PricingPage = () => {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSelectPlan = (plan: "basic" | "pro") => {
    router.push(`/auth/signup?plan=${plan}`);
  };

  if (loading) return <div className="text-center text-gray-500 mt-10">Loading...</div>;
  if (user) return null;

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <section className="max-w-6xl mx-auto py-16 px-6">
        <h1 className="text-4xl font-bold text-blue-600 text-center mb-8">Choose Your Plan</h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          Affordable subscriptions for top-tier design and development services.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">Basic Plan</h2>
            <p className="text-3xl font-bold text-gray-800 mb-2">R3000</p>
            <p className="text-gray-600 mb-6">per month</p>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>✓ Custom Website Design</li>
              <li>✓ Basic Support</li>
              <li>✓ 1 Project Slot</li>
            </ul>
            <button
              onClick={() => handleSelectPlan("basic")}
              className="w-full py-3 px-6 rounded-lg text-white font-semibold bg-green-600 hover:bg-green-700 transition"
            >
              Select Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">Pro Plan</h2>
            <p className="text-3xl font-bold text-gray-800 mb-2">R8000</p>
            <p className="text-gray-600 mb-6">per month</p>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>✓ Advanced Website Design</li>
              <li>✓ Web Development</li>
              <li>✓ Priority Support</li>
              <li>✓ 3 Project Slots</li>
            </ul>
            <button
              onClick={() => handleSelectPlan("pro")}
              className="w-full py-3 px-6 rounded-lg text-white font-semibold bg-green-600 hover:bg-green-700 transition"
            >
              Select Plan
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;