import AuthWrapper from '@/app/components/AuthWrapper';

export default function SuperAdminDashboard() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div className="min-h-screen bg-gray-100">
        {/* Navbar is included via layout.tsx, no need to add it here */}
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>
          <p>Welcome, Super Admin! Here you can manage users, admins, contractors & tasks.</p>
          {/* Add more superadmin-specific content here */}
        </div>
      </div>
    </AuthWrapper>
  );
}