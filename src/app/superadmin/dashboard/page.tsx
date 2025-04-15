// app/superadmin/dashboard/page.tsx
"use client";
import AuthWrapper from '@/app/components/AuthWrapper';

export default function Dashboard() {
  return (
    <AuthWrapper>
      <div className="p-6">
        <h1>Super Admin Dashboard</h1>
        <p>Welcome to the dashboard!</p>
      </div>
    </AuthWrapper>
  );
}