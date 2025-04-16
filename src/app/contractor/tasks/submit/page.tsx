import AuthWrapper from '@/app/components/AuthWrapper';

export default function SubmitWorkPage() {
  return (
    <AuthWrapper requiredRole="contractor">
      <div>
        <h1 className="text-3xl font-bold mb-4">Submit Work</h1>
        <p>Upload your deliverables and add notes for your submissions here.</p>
      </div>
    </AuthWrapper>
  );
}