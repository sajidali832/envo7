
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlowingCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/glowing-card';
import { Hourglass, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export default function ApprovalPendingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<ApprovalStatus>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        router.push('/sign-in');
        return;
    }

    let channel: any;
    let timeoutId: NodeJS.Timeout;

    const checkStatus = async () => {
        if (!user) return;
        
        const { data: investment, error } = await supabase
            .from('investments')
            .select('status')
            .eq('user_id', user.id)
            .order('submitted_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            // This can happen if no investment record is found, which is okay.
            // It means the user might not belong here. Redirect them.
            if (error.code !== 'PGRST116') { // PGRST116 = "exact one row not returned"
                 console.error('Error fetching investment status:', error);
            }
            router.push('/dashboard');
            return;
        }
        
        const currentStatus = investment.status as ApprovalStatus;
        setStatus(currentStatus);
        setLoading(false);

        if (currentStatus === 'approved') {
            timeoutId = setTimeout(() => router.push('/dashboard'), 3000);
        }
    };
    
    checkStatus();

    // Set up a realtime subscription
    channel = supabase.channel(`public:investments:user_id=eq.${user.id}`)
        .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'investments', filter: `user_id=eq.${user.id}` }, 
        (payload) => {
            const newStatus = payload.new.status as ApprovalStatus;
            setStatus(newStatus);
            if (newStatus === 'approved') {
                timeoutId = setTimeout(() => router.push('/dashboard'), 3000);
            }
        }
    ).subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user, authLoading, router]);

  const renderContent = () => {
    if (loading || authLoading) {
      return {
          icon: <Hourglass className="h-8 w-8 animate-spin" />,
          bgColor: 'bg-secondary/10 text-secondary-foreground',
          title: "Checking Status...",
          description: "Please wait while we fetch your application details.",
          content: <div className="h-8 w-1/2 bg-muted rounded animate-pulse mx-auto" />,
          footer: <p className="text-xs text-muted-foreground text-center">Loading...</p>
        };
    }

    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle className="h-8 w-8" />,
          bgColor: 'bg-green-100 text-green-700',
          title: "Approval Complete!",
          description: "Your account has been successfully activated. Welcome aboard!",
          content: <p className='text-sm text-muted-foreground'>Redirecting you to the dashboard...</p>,
          footer: (
            <Button className="w-full glow-primary" size="lg" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          )
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-8 w-8" />,
          bgColor: 'bg-destructive/10 text-destructive',
          title: "Application Rejected",
          description: "We couldn't approve your investment at this time.",
          content: <p className='text-sm text-muted-foreground'>There might have been an issue with the provided payment proof. Please contact support for assistance.</p>,
          footer: (
            <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
              Back to Homepage
            </Button>
          )
        };
      case 'pending':
      default:
        return {
          icon: <Hourglass className="h-8 w-8 animate-spin" />,
          bgColor: 'bg-accent/10 text-accent',
          title: "Approval in Progress",
          description: "Your investment is pending approval. This can take up to 10 minutes. Please wait while we confirm your payment.",
          content: (
            <div className='space-y-3'>
               <p className='text-sm text-muted-foreground'>You can safely leave this page and come back later. Your account will be activated upon confirmation.</p>
            </div>
          ),
          footer: (
             <Button variant="outline" className="w-full" onClick={async () => {
                 await supabase.auth.signOut();
                 router.push('/');
             }}>
              Logout
            </Button>
          )
        };
    }
  };

  const { icon, bgColor, title, description, content, footer } = renderContent();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-secondary/30">
        <GlowingCard className="w-full max-w-md" glowColor="primary">
          <CardHeader className="text-center">
            <div className={`mx-auto rounded-full h-12 w-12 flex items-center justify-center mb-4 ${bgColor}`}>
              {icon}
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center min-h-[8rem] flex items-center justify-center">
            {content}
          </CardContent>
          <CardFooter>
            {footer}
          </CardFooter>
        </GlowingCard>
    </div>
  );
}
