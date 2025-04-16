import AuthWrapper from '@/app/components/AuthWrapper';

export default function TrackingProgressPage() {
  return (
    <AuthWrapper requiredRole="admin">
      <div>
        <h1 className="text-3xl font-bold mb-4">Tracking Progress</h1>
        <p>Monitor task progress here.</p>
      </div>
    </AuthWrapper>
  );
}