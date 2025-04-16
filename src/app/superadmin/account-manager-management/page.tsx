import AuthWrapper from '@/app/components/AuthWrapper';

export default function AccountManagerManagementPage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Account Manager Management Dashboard</h1>
        <p>Manage account managers here.</p>
      </div>
    </AuthWrapper>
  );
}