
'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { useAuth, type AuthProfile } from "@/context/AuthProvider";

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
  const { user, profile, loading } = useAuth();
  
  useEffect(() => {
      if (loading) {
          return; // Wait for authentication and profile to load
      }

      if (!user) {
          router.replace('/sign-in');
          return;
      }
      
      // If user exists but profile doesn't, or status is not 'active'
      if (profile) {
        if(profile.status === 'pending_approval'){
            router.replace('/approval-pending');
        } else if (profile.status !== 'active') {
            router.replace('/plans');
        }
      } else {
        // No profile found, probably means they haven't chosen a plan
        router.replace('/plans');
      }

  }, [user, profile, loading, router]);


  // While loading or redirecting, show a loader
  if (loading || !profile || profile.status !== 'active') {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <p>Loading...</p>
          </div>
      );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Logo />
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
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
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            <Logo className="md:hidden" />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 bg-muted/20">
            {children}
        </main>
        {/* Mobile Bottom Nav */}
        <footer className="md:hidden sticky bottom-0 border-t bg-background">
            <nav className="flex justify-around items-center h-16">
                 {navItems.map(item => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-all"
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
