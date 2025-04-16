import AuthWrapper from '@/app/components/AuthWrapper';

export default function ReportIssuePage() {
  return (
    <AuthWrapper requiredRole="contractor">
      <div>
        <h1 className="text-3xl font-bold mb-4">Report Issue</h1>
        <p>Submit issues like unclear briefs here.</p>
      </div>
    </AuthWrapper>
  );
}