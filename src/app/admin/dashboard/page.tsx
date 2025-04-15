import AuthWrapper from '@/app/components/AuthWrapper';

export default function AdminPage() {
  return (
    <AuthWrapper requiredRole="admin">
      <div className="p-6">
        <h1>Admin Dashboard</h1>
        <p>Welcome, Admin! Here you can manage users and tasks.</p>
      </div>
    </AuthWrapper>
  );
}