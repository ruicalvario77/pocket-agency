// src/app/associate-account/page.tsx
import { Suspense } from "react";
import AssociateAccountContent from "./AssociateAccountContent"; // Add .tsx extension

export default function AssociateAccountPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20 text-xl">Loading...</div>}>
      <AssociateAccountContent />
    </Suspense>
  );
}