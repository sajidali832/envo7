
'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const { user, loading } = useAuth();

  const renderAuthButton = () => {
    if (loading) {
      return null; // Don't show anything while loading to prevent flicker
    }
    if (user) {
      return null; // Don't show dashboard button here
    }
    return (
      <Button asChild size="sm">
        <Link href="/sign-in">Sign In</Link>
      </Button>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <Logo />
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {renderAuthButton()}
          </nav>
        </div>
      </div>
    </header>
  );
}
