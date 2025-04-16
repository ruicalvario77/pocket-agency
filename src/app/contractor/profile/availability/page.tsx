import AuthWrapper from '@/app/components/AuthWrapper';

export default function AvailabilityPage() {
  return (
    <AuthWrapper requiredRole="contractor">
      <div>
        <h1 className="text-3xl font-bold mb-4">Availability</h1>
        <p>Set your working hours and availability here.</p>
      </div>
    </AuthWrapper>
  );
}