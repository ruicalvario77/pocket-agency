import AuthWrapper from '@/app/components/AuthWrapper';

export default function CustomerTasksPerformancePage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Customer Tasks & Performance Dashboard</h1>
        <p>View customer tasks and performance metrics here.</p>
      </div>
    </AuthWrapper>
  );
}