
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GlowingCard, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/glowing-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function SignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if user is already logged in and auth is no longer loading.
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);


  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      toast({
        variant: 'destructive',
        title: 'Sign In Failed',
        description: error.message,
      });
      return;
    }

    toast({
      title: 'Sign In Successful!',
      description: 'Welcome back.',
    });
    router.push('/dashboard');
    // router.refresh() is not needed here as the AuthProvider will trigger a re-render.
  };

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
      </div>
    );
  }

  return (
    <GlowingCard className="w-full max-w-md" glowColor="primary">
       <form onSubmit={handleSignIn}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Sign in to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 p-3 rounded-lg text-center text-sm text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <p>{error}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full glow-primary" isLoading={isLoading}>Sign In</Button>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/plans" className="font-semibold text-primary hover:underline">
              Select a plan first
            </Link>
          </p>
        </CardFooter>
      </form>
    </GlowingCard>
  );
}
