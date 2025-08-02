
'use client'

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthProvider';

const FullPageLoader = () => (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[999]">
      <div className="loader"></div>
    </div>
);


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleStart = (url:string) => {
            if (url !== pathname) {
                setLoading(true);
            }
        };
        const handleComplete = () => setLoading(false);
        
        // This is a mock since we can't directly tap into Next.js's router events here easily
        // We'll use a trick with the pathname
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 500); // simulate loading

        return () => clearTimeout(timer);

    }, [pathname]);

  return (
    <html lang="en">
      <head>
        <title>Envo-Lite – Investment & Referral Platform</title>
        <meta name="description" content="A premium investment and referral platform for discerning users in Pakistan." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
            {loading && <FullPageLoader />}
            {children}
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
