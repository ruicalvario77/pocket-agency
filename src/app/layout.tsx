// src/app/layout.tsx
import { ReactNode } from 'react';
import Navbar from '@/app/components/Navbar'; // Adjust path as needed
import Footer from '@/app/components/Footer'; // Adjust path as needed

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Pocket Agency</title>
        <meta name="description" content="Unlimited Design & Development for Your Business" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50">
        <Navbar /> {/* No props needed */}
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}