import AuthWrapper from '@/app/components/AuthWrapper';

export default function CustomerDashboard() {
  return (
    <AuthWrapper requiredRole="customer">
      <div className="min-h-screen bg-gray-100">
        {/* Navbar is included via layout.tsx, no need to add it here */}
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Customer Dashboard</h1>
          <p>Welcome, Customer! Here you can manage your requests.</p>
          {/* Add more customer-specific content here */}
        </div>
      </div>
    </AuthWrapper>
  );
}