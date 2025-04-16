import AuthWrapper from '@/app/components/AuthWrapper';

export default function SettingsPage() {
  return (
    <AuthWrapper requiredRole="admin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Settings</h1>
        <p>Manage your account settings here.</p>
      </div>
    </AuthWrapper>
  );
}