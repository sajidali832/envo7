import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="py-16 md:py-28">
      <div className="container text-center px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent pb-4">
          Welcome to Envo-Pro
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-muted-foreground mb-8">
          Your premium gateway to smart investments and rewarding referrals. Experience a VIP journey to financial growth.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" className="glow-primary md:w-auto w-full" asChild>
            <Link href="/plans">View Our Plans</Link>
          </Button>
          <Button size="lg" variant="outline" className="md:w-auto w-full" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
