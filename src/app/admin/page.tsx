
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GlowingCard, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/glowing-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (password === 'Admin092#d') {
        toast({
          title: 'Login Successful',
          description: 'Redirecting to dashboard...',
        });
        try {
            localStorage.setItem('adminAuthenticated', 'true');
        } catch (e) {
            // handle error if localStorage is not available
        }
        router.push('/admin/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Incorrect password. Please try again.',
        });
        setIsLoading(false); 
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary/30">
        <GlowingCard className="w-full max-w-sm" glowColor="primary">
        <form onSubmit={handleLogin}>
            <CardHeader className="text-center">
                 <div className="mx-auto bg-primary/10 text-primary rounded-full h-12 w-12 flex items-center justify-center mb-4">
                    <Shield className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">Admin Panel</CardTitle>
                <CardDescription>Please enter the password to access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" className="w-full glow-primary" isLoading={isLoading}>Login</Button>
            </CardFooter>
        </form>
        </GlowingCard>
    </div>
  );
}
