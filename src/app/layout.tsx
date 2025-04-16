import { ReactNode } from 'react';
import Navbar from '@/app/components/Navbar';
import './globals.css'; // Import global CSS
import Footer from '@/app/components/Footer'; // Optional

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Pocket Agency</title>
        <meta name="description" content="Unlimited Design & Development for Your Business" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer /> {/* Optional */}
      </body>
    </html>
  );
}