// src/app/auth/signup/page.tsx
import { Suspense } from "react";
import SignupForm from "./SignupForm";

// Main page component (Server Component)
export default function Signup() {
  return (
    <Suspense fallback={<div className="text-center text-gray-500 mt-10">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}