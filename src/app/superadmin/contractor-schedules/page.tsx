import AuthWrapper from '@/app/components/AuthWrapper';

export default function ContractorSchedulesPage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Contractor Schedules Dashboard</h1>
        <p>View and manage contractor schedules here.</p>
      </div>
    </AuthWrapper>
  );
}