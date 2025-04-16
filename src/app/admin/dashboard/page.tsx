import AuthWrapper from '@/app/components/AuthWrapper';

export default function DashboardPage() {
  return (
    <AuthWrapper requiredRole="admin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Account Manager Dashboard</h1>
        <p>Welcome to the Account Manager Dashboard! This is your overview page.</p>
      </div>
    </AuthWrapper>
  );
}