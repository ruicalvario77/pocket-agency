import AuthWrapper from '@/app/components/AuthWrapper';

export default function CustomerPage() {
  return (
    <AuthWrapper requiredRole="customer">
      <div className="p-6">
        <h1>Customer Dashboard</h1>
        <p>Welcome, Customer! Here you can manage your tasks and subscriptions.</p>
      </div>
    </AuthWrapper>
  );
}