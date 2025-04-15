import AuthWrapper from '@/app/components/AuthWrapper';
import Link from 'next/link';

export default function TeamPage() {
  return (
    <AuthWrapper requiredRole="customer">
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-6">Team</h1>
        <p>Here you can manage your team. (This is dummy content for now.)</p>
        <Link href="/customer/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    </AuthWrapper>
  );
}