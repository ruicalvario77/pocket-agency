import AuthWrapper from '@/app/components/AuthWrapper';

export default function CustomerRevisionsPage() {
  return (
    <AuthWrapper requiredRole="admin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Customer Revisions</h1>
        <p>Manage customer revision requests here.</p>
      </div>
    </AuthWrapper>
  );
}