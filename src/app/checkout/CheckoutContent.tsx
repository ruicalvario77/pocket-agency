// src/app/checkout/CheckoutContent.tsx
"use client";

import { useSearchParams } from 'next/navigation';

export default function CheckoutContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  if (!plan) {
    return <div className="text-center text-red-500">No plan selected. Please choose a plan.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Checkout</h1>
        <h2 className="text-2xl font-semibold text-blue-600">
          {plan === 'basic' ? 'Basic Plan' : 'Pro Plan'}
        </h2>
        <p className="text-xl text-gray-800">
          {plan === 'basic' ? 'R3000/month' : 'R8000/month'}
        </p>
        {/* Add your payment button or additional logic here */}
      </div>
    </div>
  );
}