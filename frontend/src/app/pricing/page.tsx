// src/app/pricing/page.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { auth } from "@/app/firebase/firebaseConfig";

const PricingPage = () => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<[string, string][] | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubscribe = async (plan: "basic" | "pro") => {
    if (!email) {
      alert("Please enter an email address to subscribe.");
      return;
    }

    setLoading(true);
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
        body: JSON.stringify({ plan, email: email || user?.email }),
      });
      console.log("Fetch response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initiate subscription");
      }

      const { paymentData, signature } = await response.json();
      console.log("Payment data received:", paymentData, "Signature:", signature);
      setPaymentData(paymentData);
      setSignature(signature);
    } catch (error: any) {
      console.error("Subscription error:", error);
      alert(error.message || "An error occurred while initiating your subscription.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paymentData && signature && formRef.current) {
      console.log("Submitting PayFast form with data:", paymentData, "Signature:", signature);
      formRef.current.submit();
    }
  }, [paymentData, signature]);

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <section className="max-w-6xl mx-auto py-16 px-6">
        <h1 className="text-4xl font-bold text-blue-600 text-center mb-8">Choose Your Plan</h1>
        <p className="text-lg text-gray-600 text-center mb-12">
          Affordable subscriptions for top-tier design and development services.
        </p>

        <div className="text-center mb-8">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-64"
            required
            disabled={!!auth.currentUser} // Disable if logged in
          />
          {auth.currentUser && (
            <p className="text-sm text-gray-600 mt-2">Using {auth.currentUser.email}</p>
          )}
        </div>

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
              onClick={() => handleSubscribe("basic")}
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Processing..." : "Confirm Plan"}
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
              onClick={() => handleSubscribe("pro")}
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Processing..." : "Confirm Plan"}
            </button>
          </div>
        </div>
      </section>

      {paymentData && signature && (
        <form
          ref={formRef}
          action="https://sandbox.payfast.co.za/eng/process"
          method="POST"
          className="hidden"
        >
          {paymentData.map(([key, value], index) => (
            <input key={`${key}-${index}`} type="hidden" name={key} value={value} />
          ))}
          <input type="hidden" name="signature" value={signature} />
        </form>
      )}
    </div>
  );
};

export default PricingPage;