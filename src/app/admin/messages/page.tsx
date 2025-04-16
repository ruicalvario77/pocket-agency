import AuthWrapper from '@/app/components/AuthWrapper';

export default function MessagesPage() {
  return (
    <AuthWrapper requiredRole="admin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Messages</h1>
        <p>View and manage your messages here.</p>
      </div>
    </AuthWrapper>
  );
}