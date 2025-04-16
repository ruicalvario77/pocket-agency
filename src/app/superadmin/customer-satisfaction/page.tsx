import AuthWrapper from '@/app/components/AuthWrapper';

export default function CustomerSatisfactionPage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Customer Satisfaction Survey Dashboard</h1>
        <p>Review customer satisfaction survey results here.</p>
      </div>
    </AuthWrapper>
  );
}