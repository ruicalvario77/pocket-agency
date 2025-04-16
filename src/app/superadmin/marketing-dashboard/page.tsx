import AuthWrapper from '@/app/components/AuthWrapper';

export default function MarketingDashboardPage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Marketing Dashboard</h1>
        <p>View marketing metrics and campaigns here.</p>
      </div>
    </AuthWrapper>
  );
}