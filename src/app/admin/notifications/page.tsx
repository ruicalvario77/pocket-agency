import AuthWrapper from '@/app/components/AuthWrapper';

export default function NotificationsPage() {
  return (
    <AuthWrapper requiredRole="admin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Notifications</h1>
        <p>View your notifications here.</p>
      </div>
    </AuthWrapper>
  );
}