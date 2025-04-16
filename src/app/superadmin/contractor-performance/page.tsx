import AuthWrapper from '@/app/components/AuthWrapper';

export default function ContractorPerformancePage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Contractor Performance Dashboard</h1>
        <p>Monitor contractor performance metrics here.</p>
      </div>
    </AuthWrapper>
  );
}