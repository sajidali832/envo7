import { Logo } from '@/components/logo';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Envo-Pro. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
