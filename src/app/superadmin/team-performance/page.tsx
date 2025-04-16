import AuthWrapper from '@/app/components/AuthWrapper';

export default function TeamPerformancePage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Team Performance Dashboard</h1>
        <p>Monitor team performance metrics here.</p>
      </div>
    </AuthWrapper>
  );
}