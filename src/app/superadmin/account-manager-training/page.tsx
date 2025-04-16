import AuthWrapper from '@/app/components/AuthWrapper';

export default function AccountManagerTrainingPage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Account Manager Training Resources</h1>
        <p>Access training resources for account managers here.</p>
      </div>
    </AuthWrapper>
  );
}