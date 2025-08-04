
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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (loading) {
      return; // Wait for the auth state to be determined
    }

    if (user && profile) {
      if (profile.status === 'active') {
        router.replace('/dashboard');
      } else if (profile.status === 'pending_approval') {
        router.replace('/approval-pending');
      } else {
        setIsReady(true);
      }
    } else {
        setIsReady(true);
    }
  }, [user, profile, loading, router]);


  // While loading auth state or redirecting, show a loader
  if (!isReady) {
     return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

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
