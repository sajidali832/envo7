
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { HeroSection } from '@/components/landing/hero';
import { AboutSection } from '@/components/landing/about';
import { ReviewsSection } from '@/components/landing/reviews';
import { Footer } from '@/components/landing/footer';
import { PlansSection } from '@/components/landing/plans-preview';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // Wait until the authentication status is determined
    if (loading) {
      return; 
    }

    if (user && profile) {
      // If user is logged in, decide where to redirect
      if (profile.status === 'active') {
        router.replace('/dashboard');
      } else if (profile.status === 'pending_approval' || profile.status === 'pending_investment') {
        router.replace('/approval-pending');
      } else {
        // If status is something else (e.g. inactive), let them stay or redirect to plans
        setIsRedirecting(false);
      }
    } else {
      // If no user is logged in, stop the loading state and show the landing page
      setIsRedirecting(false);
    }
  }, [user, profile, loading, router]);


  // Show a loading screen only while we are determining auth status or redirecting.
  if (loading || isRedirecting) {
     return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  // If we are not redirecting, it means no user is logged in, so show the landing page.
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <AboutSection />
        <Separator className="my-12" />
        <PlansSection />
        <ReviewsSection />
      </main>      
      <Footer />
    </div>
  );
}
