
'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GlowingCard, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/glowing-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const plans = [
  { id: '0', name: 'Free Plan' },
  { id: '1', name: 'Starter Plan' },
  { id: '2', name: 'Advanced Plan' },
  { id: '3', name: 'Pro Plan' },
]

export function RegisterForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get('plan');
  const refId = searchParams.get('ref');
  const selectedPlan = plans.find(p => p.id === planId);
  const isFreePlan = planId === '0';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!planId || !selectedPlan) {
      router.push('/plans');
    }
  }, [planId, selectedPlan, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
            username: username,
        }
      }
    });
    
    if (signUpError) {
       if (signUpError.message.includes("User already registered")) {
            setError('This email address is already registered. Please sign in.');
       }
       else {
           setError(signUpError.message);
       }
      setIsLoading(false);
      return;
    }
    
    const user = signUpData.user;
    if (!user) {
        setError("Could not create user account. Please check your email for a confirmation link or try again.");
        setIsLoading(false);
        return;
    }

    // Determine initial status based on plan
    const initialStatus = isFreePlan ? 'active' : 'pending_investment';
    const totalInvestment = isFreePlan ? 0 : null; // Free plan has no investment amount

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username: username,
        selected_plan: selectedPlan?.id,
        referred_by: refId || null,
        status: initialStatus,
        total_investment: totalInvestment
      });
      
    if (profileError) {
        setError(`Failed to create your profile: ${profileError.message}. Please contact support.`);
        await supabase.auth.signOut(); 
        console.error("CRITICAL: Auth user created but profile insertion failed.", user.id);
        setIsLoading(false);
        return;
    }
    
    if (isFreePlan) {
        toast({
            title: 'Account Created Successfully!',
            description: "Your Free Plan is active. Welcome to the dashboard!",
        });
        router.push('/dashboard');
    } else {
        toast({
            title: 'Account Created Successfully!',
            description: "You're now being redirected to complete your investment.",
        });
        const investmentUrl = `/invest?plan=${planId}`;
        router.push(investmentUrl);
    }
  };
  
  if (!selectedPlan) {
    return null; 
  }

  return (
    <GlowingCard className="w-full max-w-md" glowColor="accent">
      <form onSubmit={handleRegister}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Join Envo-Pro and start your journey.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedPlan && (
            <div className="bg-secondary p-3 rounded-lg text-center">
              <p className="font-semibold flex items-center justify-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> You've selected:</p>
              <p className="text-lg font-bold text-accent">{selectedPlan.name}</p>
            </div>
          )}
          {error && (
            <div className="bg-destructive/10 p-3 rounded-lg text-center text-sm text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <p>{error}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" placeholder="your_username" required value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full glow-accent" isLoading={isLoading}>{isFreePlan ? 'Start Now' : 'Create Account'}</Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/sign-in" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </GlowingCard>
  );
}
