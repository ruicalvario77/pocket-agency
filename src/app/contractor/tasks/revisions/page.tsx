import AuthWrapper from '@/app/components/AuthWrapper';

export default function RevisionHistoryPage() {
  return (
    <AuthWrapper requiredRole="contractor">
      <div>
        <h1 className="text-3xl font-bold mb-4">Revision History</h1>
        <p>View the revision history and feedback for your tasks here.</p>
      </div>
    </AuthWrapper>
  );
}