
'use client';

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Home,
  Wallet,
  Users,
  Settings,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard/withdrawals", icon: Wallet, label: "Withdrawals" },
    { href: "/dashboard/referrals", icon: Users, label: "Referrals" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();
  
  useEffect(() => {
      if (loading) {
          return;
      }

      if (!user) {
          router.replace('/sign-in');
          return;
      }
      
      if (!profile) {
        return;
      }

      if (profile.status !== 'active') {
        if (profile.status === 'pending_approval' || profile.status === 'pending_investment') {
            router.replace('/approval-pending');
        } else {
            router.replace('/plans');
        }
      }
  }, [user, profile, loading, router]);


  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <p>Loading Dashboard...</p>
          </div>
      );
  }

  if (!user || !profile || profile.status !== 'active') {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Checking status...</p>
        </div>
    );
  }

  const getNavItemClass = (href: string) => {
    const isActive = pathname === href;
    return `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive ? 'bg-primary/10 text-primary' : ''}`;
  }

  const getMobileNavItemClass = (href: string) => {
    const isActive = pathname === href;
    return `flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-all ${isActive ? 'text-primary' : ''}`;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:px-6">
            <Logo />
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={getNavItemClass(item.href)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  Contact our support team for any questions or issues.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Mobile and Main Content */}
      <div className="flex flex-col">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:left-[220px] lg:left-[280px]">
          <div className="w-full flex-1">
            <Logo className="md:hidden" />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 bg-muted/20 overflow-y-auto pt-16 pb-16 md:pb-0">
            {children}
        </main>
        
        {/* Mobile Bottom Nav */}
        <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-background">
            <nav className="flex justify-around items-center h-16">
                 {navItems.map(item => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={getMobileNavItemClass(item.href)}
                    >
                        <item.icon className="h-6 w-6" />
                        <span className="text-xs">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </footer>
      </div>
    </div>
  );
}
