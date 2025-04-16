import AuthWrapper from '@/app/components/AuthWrapper';

export default function AIInsightsPage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">AI Insights Dashboard</h1>
        <p>Explore AI-driven insights and analytics here.</p>
      </div>
    </AuthWrapper>
  );
}