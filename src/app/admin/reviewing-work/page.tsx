import AuthWrapper from '@/app/components/AuthWrapper';

export default function ReviewingWorkPage() {
  return (
    <AuthWrapper requiredRole="admin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Reviewing Work</h1>
        <p>Review contractor submissions here.</p>
      </div>
    </AuthWrapper>
  );
}