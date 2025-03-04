"use client";

export default function Pricing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Choose Your Plan</h1>
      <p className="mt-2 text-gray-700">Unlock unlimited project submissions with a simple subscription.</p>

      <div className="mt-10 w-80 border p-6 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold">Pocket Agency Subscription</h2>
        <p className="mt-2 text-gray-600">R199/month - Unlimited project requests</p>
        <form action="/api/payfast-subscribe" method="POST">
          <button
            type="submit"
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            Subscribe Now
          </button>
        </form>
      </div>
    </div>
  );
}
