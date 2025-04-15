import { ReactNode } from 'react';
import { auth } from '@/app/firebase/firebaseConfig'; // Adjust the path to your Firebase config
import { useAuthState } from 'react-firebase-hooks/auth'; // For checking authentication state
import Navbar from '@/app/components/Navbar'; // Custom Navbar component
import Footer from '@/app/components/Footer'; // Custom Footer component
import { useRouter } from 'next/router'; // For handling redirects
import { useEffect } from 'react';
import Head from 'next/head'; // For managing document head

export default function RootLayout({ children }: { children: ReactNode }) {
  const [user, loading] = useAuthState(auth); // Get current user and loading state
  const router = useRouter();

  // Redirect to login if not authenticated and accessing protected routes
  useEffect(() => {
    if (!loading && !user && !router.pathname.startsWith('/auth')) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <html lang="en">
      <Head>
        <title>Pocket Agency</title>
        <meta name="description" content="Unlimited Design & Development for Your Business" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="flex flex-col min-h-screen bg-gray-50">
        <Navbar user={user} /> {/* Pass user for role-based navigation */}
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}