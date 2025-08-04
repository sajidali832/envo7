
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
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // We only want to redirect if the user is logged in and their status is determined.
    if (!loading) {
      if (user) {
        // If the user is logged in, they should be on the dashboard.
        // The dashboard layout will handle the logic for different statuses.
        router.replace('/dashboard');
      } else {
        // If there's no user, we're on the landing page, so stop redirecting.
        setIsRedirecting(false);
      }
    }
  }, [user, loading, router]);


  // If there's no user and we're not loading, show the landing page.
  if (!loading && !user) {
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

  // Otherwise, show a loading screen while we determine the user's state and redirect.
  return (
    <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
    </div>
  );
}
