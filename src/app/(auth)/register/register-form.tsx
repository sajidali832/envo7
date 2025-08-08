
'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { GlowingCard, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/glowing-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertTriangle, WandSparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { debounce } from 'lodash';

const plans = [
  { id: '0', name: 'Free Plan' },
  { id: '1', name: 'Starter Plan' },
  { id: '2', name: 'Advanced Plan' },
  { id: '3', name: 'Pro Plan' },
];

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
  const [isGenerating, setIsGenerating] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [emailError, setEmailError] = useState<string | null>(null);


  const checkUsername = useCallback(
    debounce(async (uname: string) => {
      if (uname.length < 3) {
        setUsernameStatus('idle');
        return;
      }
      setUsernameStatus('checking');
      const { data, error } = await supabase.from('profiles').select('id').eq('username', uname).single();
      if (data) {
        setUsernameStatus('taken');
        setUsernameError('This username is already taken. Please try another.');
      } else {
        setUsernameStatus('available');
        setUsernameError(null);
      }
    }, 500),
    []
  );

  const checkEmail = useCallback(
    debounce(async (mail: string) => {
      if (!/^\S+@\S+\.\S+$/.test(mail)) {
        setEmailStatus('idle');
        return;
      }
      setEmailStatus('checking');
      const { data, error } = await supabase.from('users_public').select('id').eq('email', mail).single();
      if (data) {
        setEmailStatus('taken');
        setEmailError('This email is already registered. Please sign in.');
      } else {
        setEmailStatus('available');
        setEmailError(null);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (username) checkUsername(username);
  }, [username, checkUsername]);

  useEffect(() => {
    if (email) checkEmail(email);
  }, [email, checkEmail]);

  const handleGenerateUsername = async () => {
    setIsGenerating(true);
    let newUsername = '';
    let isUnique = false;
    let attempts = 0;

    const adjectives = ['swift', 'clever', 'lucky', 'brave', 'sharp', 'bright', 'happy'];
    const nouns = ['fox', 'lion', 'tiger', 'eagle', 'wolf', 'panther', 'star'];

    while (!isUnique && attempts < 10) {
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const num = Math.floor(100 + Math.random() * 900);
        newUsername = `${adj}${noun}${num}`;
        
        const { data, error } = await supabase.from('profiles').select('id').eq('username', newUsername).single();
        if (!data) {
            isUnique = true;
        }
        attempts++;
    }

    if(isUnique) {
        setUsername(newUsername);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not generate a unique username. Please try again.'});
    }

    setIsGenerating(false);
  }

  useEffect(() => {
    if (!planId || !selectedPlan) {
      router.push('/plans');
    }
  }, [planId, selectedPlan, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (usernameStatus === 'taken' || emailStatus === 'taken') {
        toast({ variant: 'destructive', title: 'Registration Failed', description: 'Please fix the errors before submitting.'});
        return;
    }
    
    setIsLoading(true);

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
        setError(signUpError.message);
        setIsLoading(false);
        return;
    }
    
    const user = signUpData.user;
    if (!user) {
        setError("Could not create user account. Please check your email for a confirmation link or try again.");
        setIsLoading(false);
        return;
    }

    const initialStatus = isFreePlan ? 'active' : 'pending_investment';
    const totalInvestment = isFreePlan ? 0 : null;

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

  const renderStatusIcon = (status: 'idle' | 'checking' | 'available' | 'taken') => {
    if(status === 'checking') return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if(status === 'available') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if(status === 'taken') return <AlertTriangle className="h-4 w-4 text-destructive" />;
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
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
                <Input 
                    id="username" 
                    type="text" 
                    placeholder="your_username" 
                    required 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className={cn(
                        usernameStatus === 'taken' && 'border-destructive focus-visible:ring-destructive',
                        usernameStatus === 'available' && 'border-green-500'
                    )}
                 />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                     {usernameStatus !== 'idle' ? renderStatusIcon(usernameStatus) : (
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7" 
                            onClick={handleGenerateUsername} 
                            disabled={isGenerating}
                            aria-label="Generate Username"
                        >
                            <WandSparkles className={cn("h-4 w-4 text-muted-foreground", isGenerating && "animate-spin")} />
                        </Button>
                     )}
                </div>
            </div>
            {usernameError && <p className="text-xs text-destructive">{usernameError}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
             <div className="relative">
                <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                        emailStatus === 'taken' && 'border-destructive focus-visible:ring-destructive',
                        emailStatus === 'available' && 'border-green-500'
                    )}
                />
                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {renderStatusIcon(emailStatus)}
                 </div>
            </div>
             {emailError && <p className="text-xs text-destructive">{emailError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full glow-accent" isLoading={isLoading} disabled={usernameStatus === 'taken' || emailStatus === 'taken' || usernameStatus === 'checking' || emailStatus === 'checking'}>{isFreePlan ? 'Start Now' : 'Create Account'}</Button>
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
