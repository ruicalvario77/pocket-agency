import AuthWrapper from '@/app/components/AuthWrapper';

export default function ContractorAssignmentPage() {
  return (
    <AuthWrapper requiredRole="admin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Contractor Assignment</h1>
        <p>Assign contractors to tasks here.</p>
      </div>
    </AuthWrapper>
  );
}