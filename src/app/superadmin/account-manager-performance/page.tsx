import AuthWrapper from '@/app/components/AuthWrapper';

export default function AccountManagerPerformancePage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Account Manager Performance</h1>
        <p>View account manager performance metrics here.</p>
      </div>
    </AuthWrapper>
  );
}