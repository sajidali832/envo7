
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

type DashboardStats = {
    total_earnings: number; // This is the user's balance
    total_investment: number;
    total_referral_earnings: number;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (user) {
                setIsLoading(true);
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('balance, total_investment, referral_earnings')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.error('Error fetching profile:', profileError);
                } else {
                    setStats({
                        total_investment: profileData?.total_investment || 0,
                        total_earnings: profileData?.balance || 0,
                        total_referral_earnings: profileData?.referral_earnings || 0,
                    });
                }
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const statCards = [
        { title: "Total Earnings", value: `${stats?.total_earnings.toLocaleString() || '0'} PKR`, icon: <DollarSign />, glow: "primary" },
        { title: "Total Investment", value: `${stats?.total_investment.toLocaleString() || '0'} PKR`, icon: <Landmark />, glow: "accent" },
        { title: "Total Referral Earnings", value: `${stats?.total_referral_earnings.toLocaleString() || '0'} PKR`, icon: <Users />, glow: "primary" },
    ];
    
    // Earnings history will be implemented later
    const earningsHistory: any[] = [];

  return (
    <div className="p-4 md:p-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? Array.from({length: 3}).map((_, i) => (
                <GlowingCard key={i} glowColor="primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-8 w-1/2 bg-muted/50 rounded animate-pulse" />
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
                <CardTitle className="flex items-center gap-2"><List /> Earnings History</CardTitle>
                <CardDescription>A log of your daily earnings and bonuses.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {earningsHistory.length > 0 ? earningsHistory.map((item, index) => (
                        <div key={index} className="flex items-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{item.description}</p>
                                <p className="text-sm text-muted-foreground">{item.date}</p>
                            </div>
                            <div className="ml-auto font-medium text-green-600">+{item.amount}</div>
                        </div>
                    )) : (
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
