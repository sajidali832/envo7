
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
import { Hourglass } from 'lucide-react';

function FullPageLoader() {
  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
          <div className="flex items-center justify-center p-4 rounded-full border shadow-md bg-secondary mb-4">
               <Hourglass className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-lg font-semibold">Loading Application...</p>
          <p className="text-sm text-muted-foreground">Please wait a moment.</p>
      </div>
  )
}

export default function Home() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // Only perform actions once the initial auth check is complete.
    if (!loading) {
      if (user && profile) {
        // User is logged in, check their status for redirection.
        if (profile.status === 'active') {
          router.replace('/dashboard');
        } else if (profile.status === 'pending_approval' || profile.status === 'pending_investment') {
          router.replace('/approval-pending');
        } else {
          // Handles other statuses like 'rejected', 'inactive'.
          // They can stay on the landing page to sign in again or choose a new plan.
          setIsRedirecting(false);
        }
      } else {
        // No user is logged in, so we are not redirecting. Show the landing page.
        setIsRedirecting(false);
      }
    }
  }, [user, profile, loading, router]);

  // While loading or redirecting, show a blank screen or a minimal loader.
  if (isRedirecting) {
    return <FullPageLoader />;
  }

  // If not redirecting, it means no user is logged in, so show the landing page.
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
