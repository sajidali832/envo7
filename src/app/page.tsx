
'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    // If auth state is loaded and a user exists, redirect to dashboard.
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // While loading auth state, or if redirecting, don't render the page to avoid flicker.
  if (loading || user) {
    return null; // Or a loading spinner
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
