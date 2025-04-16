import AuthWrapper from '@/app/components/AuthWrapper';

export default function ContractorApplicationsPage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Contractor Applications Dashboard</h1>
        <p>Manage contractor applications here.</p>
      </div>
    </AuthWrapper>
  );
}