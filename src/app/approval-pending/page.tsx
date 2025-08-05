
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlowingCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/glowing-card';
import { Hourglass, CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

type ApprovalStatus = 'pending_approval' | 'active' | 'rejected' | 'pending_investment';
type RealtimeStatus = 'SUBSCRIBED' | 'TIMED_OUT' | 'CHANNEL_ERROR' | 'CLOSED' | 'CONNECTING';

export default function ApprovalPendingPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<ApprovalStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('CONNECTING');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        router.push('/sign-in');
        return;
    }
    
    // Set initial status from AuthProvider to avoid flashes of content
    if (profile) {
        const currentStatus = profile.status as ApprovalStatus;
        setStatus(currentStatus);
        setLoading(false);
        if (currentStatus === 'active') {
            router.replace('/dashboard');
            return;
        }
    } else {
        setLoading(true);
    }
    
    const channel = supabase
      .channel(`profile-status:${user.id}`)
      .on<any>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const newStatus = payload.new.status as ApprovalStatus;
          setStatus(newStatus);
          if (newStatus === 'active') {
            // Give a moment for the user to see the "Approved!" message
            setTimeout(() => router.replace('/dashboard'), 1500);
          }
        }
      )
      .subscribe((status, err) => {
        setRealtimeStatus(status);
        if (err) {
            console.error('Realtime subscription error:', err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile, authLoading, router]);

  const renderStatusIcon = () => {
    switch (status) {
        case 'active': return <CheckCircle className="h-8 w-8 text-green-500" />;
        case 'rejected': return <XCircle className="h-8 w-8 text-destructive" />;
        default: return <Hourglass className="h-8 w-8 animate-spin text-accent" />;
    }
  }

  const renderStatusTitle = () => {
     switch (status) {
        case 'active': return "Approval Complete!";
        case 'rejected': return "Application Rejected";
        default: return "Approval in Progress";
    }
  }

  const renderStatusDescription = () => {
      switch (status) {
        case 'active': return "Your account is now active. Welcome aboard!";
        case 'rejected': return "There might have been an issue with the provided payment proof.";
        default: return "We are confirming your payment. This usually takes a few minutes.";
      }
  }

  const renderStatusContent = () => {
      switch (status) {
        case 'active': return <p className='text-sm text-muted-foreground'>Redirecting you to the dashboard...</p>;
        case 'rejected': return <p className='text-sm text-muted-foreground'>Please contact support for assistance or try again.</p>;
        default: return <p className='text-sm text-muted-foreground'>You can safely leave this page. We'll update your status automatically.</p>
      }
  }

  const renderFooter = () => {
      if (status === 'rejected') {
          return (
             <Button variant="outline" className="w-full" onClick={() => router.push('/plans')}>
                Choose a Plan Again
            </Button>
          )
      }
      if (status === 'active') {
          return (
            <Button className="w-full glow-primary" size="lg" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          )
      }
      return (
            <Button variant="outline" className="w-full" onClick={async () => {
                 await supabase.auth.signOut();
                 router.push('/');
             }}>
              Logout
            </Button>
      );
  }

  const renderRealtimeIndicator = () => {
    if (status === 'active' || status === 'rejected') return null;

    if (realtimeStatus === 'SUBSCRIBED') {
        return <div className="flex items-center gap-2 text-xs text-green-600"><Wifi className="h-4 w-4" /> Real-time connection active</div>;
    }
    if (realtimeStatus === 'CHANNEL_ERROR' || realtimeStatus === 'TIMED_OUT' || realtimeStatus === 'CLOSED') {
        return <div className="flex items-center gap-2 text-xs text-destructive"><WifiOff className="h-4 w-4" /> Connection lost. Please refresh.</div>;
    }
    return <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse"><Wifi className="h-4 w-4" /> Connecting...</div>;
  }
  
  if (loading || authLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary/30">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary/30">
        <GlowingCard className="w-full max-w-md" glowColor="primary">
          <CardHeader className="text-center">
            <div className="mx-auto bg-background rounded-full h-12 w-12 flex items-center justify-center mb-4 border shadow-inner">
              {renderStatusIcon()}
            </div>
            <CardTitle className="text-2xl">{renderStatusTitle()}</CardTitle>
            <CardDescription>{renderStatusDescription()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center min-h-[6rem] flex flex-col items-center justify-center">
            {renderStatusContent()}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {renderFooter()}
            <div className="h-5 mt-2">
              {renderRealtimeIndicator()}
            </div>
          </CardFooter>
        </GlowingCard>
    </div>
  );
}
