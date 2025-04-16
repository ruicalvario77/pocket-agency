import AuthWrapper from '@/app/components/AuthWrapper';

export default function ContractorWorkApprovalsPage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Contractor Work & Approvals Oversight</h1>
        <p>Oversee contractor work and approvals here.</p>
      </div>
    </AuthWrapper>
  );
}