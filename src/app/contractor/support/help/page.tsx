import AuthWrapper from '@/app/components/AuthWrapper';

export default function HelpCenterPage() {
  return (
    <AuthWrapper requiredRole="contractor">
      <div>
        <h1 className="text-3xl font-bold mb-4">Help Center</h1>
        <p>Access FAQs and self-help resources here.</p>
      </div>
    </AuthWrapper>
  );
}