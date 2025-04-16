import AuthWrapper from '@/app/components/AuthWrapper';

export default function AssignedTasksPage() {
  return (
    <AuthWrapper requiredRole="contractor">
      <div>
        <h1 className="text-3xl font-bold mb-4">Assigned Tasks</h1>
        <p>View and manage your assigned tasks here.</p>
      </div>
    </AuthWrapper>
  );
}