import AuthWrapper from '@/app/components/AuthWrapper';

export default function DashboardPage() {
  return (
    <AuthWrapper requiredRole="contractor">
      <div>
        <h1 className="text-3xl font-bold mb-4">Contractor Dashboard</h1>
        <p>Welcome to the Contractor Dashboard! Here you can view your assigned tasks, manage your availability, and more.</p>
      </div>
    </AuthWrapper>
  );
}