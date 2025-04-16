import AuthWrapper from '@/app/components/AuthWrapper';

export default function EscalationStatusPage() {
  return (
    <AuthWrapper requiredRole="contractor">
      <div>
        <h1 className="text-3xl font-bold mb-4">Escalation Status</h1>
        <p>Track the status of your reported issues and escalations here.</p>
      </div>
    </AuthWrapper>
  );
}