import AuthWrapper from '@/app/components/AuthWrapper';

export default function ContractorDashboard() {
  return (
    <AuthWrapper requiredRole="contractor">
      <div className="min-h-screen bg-gray-100">
        {/* Navbar is included via layout.tsx, no need to add it here */}
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Contractor Dashboard</h1>
          <p>Welcome, Contractor! Here you can manage your tasks.</p>
          {/* Add more contractor-specific content here */}
        </div>
      </div>
    </AuthWrapper>
  );
}