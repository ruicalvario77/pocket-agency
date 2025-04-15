import AuthWrapper from '@/app/components/AuthWrapper';

export default function SuperAdminDashboard() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div className="p-6">
        <h1>Super Admin Dashboard</h1>
        <p>Welcome, Super Admin! Here you can manage everything.</p>
      </div>
    </AuthWrapper>
  );
}