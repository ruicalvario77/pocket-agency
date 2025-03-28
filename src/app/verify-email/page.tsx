// src/app/verify-email/page.tsx
import { Suspense } from "react";
import VerifyEmailContent from "./VerifyEmailContent";

// The page component itself can remain a Server Component (no "use client")
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20 text-xl">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}