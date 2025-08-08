
'use client';

import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GlowingCard } from "@/components/glowing-card"
import { DollarSign, Landmark, Users, List, ArrowUpRight } from "lucide-react"
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardStats = {
    total_earnings: number; // This is the user's balance
    total_investment: number;
    total_referral_earnings: number;
    plan_id: string;
}

export default function DashboardPage() {
    const { user, profile } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (user) {
                setIsLoading(true);
                
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('balance, total_investment, referral_earnings, selected_plan')
                    .eq('id', user.id)
                    .single();


                if (profileError) {
                    console.error('Error fetching profile for dashboard:', profileError);
                } else {
                    setStats({
                        total_investment: profileData?.total_investment || 0,
                        total_earnings: profileData?.balance || 0,
                        total_referral_earnings: profileData?.referral_earnings || 0,
                        plan_id: profileData?.selected_plan || '0',
                    });
                }
                
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const statCards = [
        { title: "Total Earnings", value: `${stats?.total_earnings.toLocaleString() || '0'} PKR`, icon: <DollarSign />, glow: "primary" },
        { title: "Total Investment", value: stats?.plan_id === '0' ? 'Free Tier' : `${stats?.total_investment.toLocaleString() || '0'} PKR`, icon: <Landmark />, glow: "accent" },
        { title: "Total Referral Earnings", value: `${stats?.total_referral_earnings.toLocaleString() || '0'} PKR`, icon: <Users />, glow: "primary" },
    ];

  return (
    <div className="p-4 md:p-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? Array.from({length: 3}).map((_, i) => (
                <GlowingCard key={i} glowColor="primary" className="h-[108px]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/2" />
                    </CardContent>
                </GlowingCard>
            )) : stats && statCards.map((stat) => (
                <GlowingCard key={stat.title} glowColor={stat.glow as any}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <div className="text-muted-foreground">{stat.icon}</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </GlowingCard>
            ))}
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><List /> Recent Transactions</CardTitle>
                <CardDescription>A log of your daily earnings and bonuses.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isLoading ? <p>Loading history...</p> : (
                        <div className="text-center text-muted-foreground py-8">
                            Your earnings history will appear here.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
