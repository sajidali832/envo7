
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
  { id: '1', name: 'Starter Plan' },
  { id: '2', name: 'Advanced Plan' },
  { id: '3', name: 'Pro Plan' },
]

export default function RegisterPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get('plan');
  const refId = searchParams.get('ref');
  const selectedPlan = plans.find(p => p.id === planId);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If no plan is selected in the URL, redirect to the plans page.
    if (!planId || !selectedPlan) {
      router.push('/plans');
    }
  }, [planId, selectedPlan, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Step 1: Sign up the user with email and password only.
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    const user = signUpData.user;
    if (!user) {
        setError("Could not create user account. Please try again.");
        setIsLoading(false);
        return;
    }

    // Step 2: Manually insert the user's profile into the 'profiles' table.
    const profileData: {
        id: string;
        username: string;
        selected_plan: string | undefined;
        referred_by?: string;
    } = {
        id: user.id,
        username: username,
        selected_plan: selectedPlan?.id,
    };
    if (refId) {
        profileData.referred_by = refId;
    }

    const { error: profileError } = await supabase.from('profiles').insert(profileData);

    if (profileError) {
        // This is the CRITICAL FIX: Check for the specific duplicate username error.
        if (profileError.code === '23505' && profileError.message.includes('profiles_username_key')) {
             setError('This username is already taken. Please choose another one.');
        } else {
            setError(`Your account was created, but we failed to set up your profile: ${profileError.message}. Please contact support.`);
        }
        
        // Clean up the created auth user if profile creation fails
        // This is an advanced step, for now we will just show the error.
        // In a real production app, you'd call an admin function to delete the orphaned auth user.
        setIsLoading(false);
        return;
    }

    // Step 3: Sign in the user to create a session, then redirect.
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError) {
         setError(`Registration successful, but login failed: ${signInError.message}`);
         setIsLoading(false);
    } else {
        toast({
            title: 'Account Created Successfully!',
            description: "You're now being redirected to complete your investment.",
        });
        const investmentUrl = refId ? `/invest?plan=${planId}&ref=${refId}` : `/invest?plan=${planId}`;
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
          <CardDescription>Join Envo-Lite and start your investment journey.</CardDescription>
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
          <Button type="submit" className="w-full glow-accent" isLoading={isLoading}>Create Account</Button>
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
