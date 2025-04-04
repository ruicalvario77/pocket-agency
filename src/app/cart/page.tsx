// src/app/cart/page.tsx
import { Suspense } from "react";
import CartForm from "./CartForm";

// Main page component (Server Component)
export default function Cart() {
  return (
    <Suspense fallback={<div className="text-center text-gray-500 mt-10">Loading...</div>}>
      <CartForm />
    </Suspense>
  );
}