"use client";

import { auth } from "../firebase/firebaseConfig";

const subscribeToPayfast = async () => {
  const user = auth.currentUser;

  if (!user) {
    alert("You need to be logged in to subscribe.");
    return;
  }

  try {
    // ✅ Get Firebase Authentication token
    const idToken = await user.getIdToken();

    // ✅ Send request to backend with token
    const response = await fetch("/api/payfast-subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`, // ✅ Send Firebase token
      },
    });

    const data = await response.json();

    if (response.ok && data.redirectUrl) {
      window.location.href = data.redirectUrl; // ✅ Redirect user to PayFast payment page
    } else {
      console.error("❌ Subscription Error:", data.error);
      alert("Subscription failed: " + data.error);
    }
  } catch (error) {
    console.error("🔥 Error subscribing:", error);
    alert("An error occurred. Please try again.");
  }
};

export default function Pricing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Choose Your Plan</h1>
      <p className="mt-2 text-gray-700">Unlock unlimited project submissions with a simple subscription.</p>

      <div className="mt-10 w-80 border p-6 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold">Pocket Agency Subscription</h2>
        <p className="mt-2 text-gray-600">R199/month - Unlimited project requests</p>
        <button
          onClick={subscribeToPayfast}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Subscribe Now
        </button>
      </div>
    </div>
  );
}
