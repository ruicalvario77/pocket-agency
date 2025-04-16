import AuthWrapper from '@/app/components/AuthWrapper';

export default function CustomerMessagingPage() {
  return (
    <AuthWrapper requiredRole="superadmin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Customer Messaging Oversight</h1>
        <p>Oversee customer messaging here.</p>
      </div>
    </AuthWrapper>
  );
}