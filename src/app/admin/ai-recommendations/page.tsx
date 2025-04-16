import AuthWrapper from '@/app/components/AuthWrapper';

export default function AIRecommendationsPage() {
  return (
    <AuthWrapper requiredRole="admin">
      <div>
        <h1 className="text-3xl font-bold mb-4">AI Recommendations</h1>
        <p>View AI-driven contractor suggestions here.</p>
      </div>
    </AuthWrapper>
  );
}