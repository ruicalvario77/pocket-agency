import AuthWrapper from '@/app/components/AuthWrapper';

export default function AdditionalMetricsPage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Additional Metrics Dashboard</h1>
        <p>View additional platform metrics here.</p>
      </div>
    </AuthWrapper>
  );
}