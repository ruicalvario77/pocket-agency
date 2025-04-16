import AuthWrapper from '@/app/components/AuthWrapper';

export default function DashboardPage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Super Admin Dashboard</h1>
        <p>Welcome to the Super Admin Dashboard! This is your overview page.</p>
      </div>
    </AuthWrapper>
  );
}