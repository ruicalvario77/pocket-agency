import AuthWrapper from '@/app/components/AuthWrapper';

export default function BillingPage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Billing</h1>
        <p>Manage billing information here.</p>
      </div>
    </AuthWrapper>
  );
}