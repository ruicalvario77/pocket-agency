// src/app/auth/customer-details/page.tsx
import { Suspense } from "react";
import CustomerDetailsForm from "./CustomerDetailsForm";

// Main page component (Server Component)
export default function CustomerDetails() {
  return (
    <Suspense fallback={<div className="text-center text-gray-500 mt-10">Loading...</div>}>
      <CustomerDetailsForm />
    </Suspense>
  );
}