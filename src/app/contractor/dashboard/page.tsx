import AuthWrapper from '@/app/components/AuthWrapper';

export default function ContractorPage() {
  return (
    <AuthWrapper requiredRole="contractor">
      <div className="p-6">
        <h1>Contractor Dashboard</h1>
        <p>Welcome, Contractor! Here you can view your assigned tasks.</p>
      </div>
    </AuthWrapper>
  );
}