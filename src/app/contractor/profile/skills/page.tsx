import AuthWrapper from '@/app/components/AuthWrapper';

export default function SkillProfilePage() {
  return (
    <AuthWrapper requiredRole="contractor">
      <div>
        <h1 className="text-3xl font-bold mb-4">Skill Profile</h1>
        <p>Update your expertise, rates, and take skill assessments here.</p>
      </div>
    </AuthWrapper>
  );
}