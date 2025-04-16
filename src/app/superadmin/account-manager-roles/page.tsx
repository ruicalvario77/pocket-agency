import AuthWrapper from '@/app/components/AuthWrapper';

export default function AccountManagerRolesPage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Account Manager Roles</h1>
        <p>Manage account manager roles here.</p>
      </div>
    </AuthWrapper>
  );
}