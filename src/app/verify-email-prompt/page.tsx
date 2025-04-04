// src/app/verify-email-prompt/page.tsx
export default function VerifyEmailPrompt() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
        <p className="text-gray-600">
          We’ve sent a verification email to your inbox. Please click the link in the email to verify your account, then log in.
        </p>
      </div>
    </div>
  );
}