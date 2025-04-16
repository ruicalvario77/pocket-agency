import AuthWrapper from '@/app/components/AuthWrapper';

export default function FinancialDashboardPage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Financial Dashboard</h1>
        <p>View financial metrics and reports here.</p>
      </div>
    </AuthWrapper>
  );
}