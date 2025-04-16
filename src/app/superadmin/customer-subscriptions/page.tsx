import AuthWrapper from '@/app/components/AuthWrapper';

export default function CustomerSubscriptionsPage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Customer Subscriptions Dashboard</h1>
        <p>Manage customer subscriptions here.</p>
      </div>
    </AuthWrapper>
  );
}