import AuthWrapper from '@/app/components/AuthWrapper';

export default function MessagesPage() {
  return (
    <AuthWrapper requiredRole="contractor">
      <div>
        <h1 className="text-3xl font-bold mb-4">Messages</h1>
        <p>Communicate with admins and collaborators here.</p>
      </div>
    </AuthWrapper>
  );
}