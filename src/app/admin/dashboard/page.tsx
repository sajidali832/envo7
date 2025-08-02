'use client';

import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, DollarSign, Wallet, BarChart3 } from "lucide-react"
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Stats = {
    total_users: number;
    total_investments: number;
    total_withdrawals: number;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);

            // In a real app, you would probably want to create database functions (RPC) for these aggregations
            // For simplicity, we'll do separate queries here.

            const { count: userCount, error: userError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            const { data: investmentData, error: investmentError } = await supabase
                .from('investments')
                .select('amount')
                .eq('status', 'approved');

            // Assuming a 'withdrawals' table exists
            const totalWithdrawals = 0; // Placeholder

            if(userError || investmentError) {
                console.error("Error fetching stats:", userError || investmentError);
            } else {
                const totalInvestments = investmentData.reduce((sum, current) => sum + current.amount, 0);
                setStats({
                    total_users: userCount || 0,
                    total_investments: totalInvestments,
                    total_withdrawals: totalWithdrawals,
                });
            }
            setIsLoading(false);
        };

        fetchStats();
    }, []);

    const statCards = [
        { title: "Total Users", value: stats?.total_users.toLocaleString() || '0', icon: <Users /> },
        { title: "Total Investments", value: `${stats?.total_investments.toLocaleString() || '0'} PKR`, icon: <DollarSign /> },
        { title: "Total Withdrawals", value: `${stats?.total_withdrawals.toLocaleString() || '0'} PKR`, icon: <Wallet /> },
    ];

  return (
    <div className="p-4 md:p-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? Array.from({length: 3}).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-8 w-1/2 bg-muted rounded animate-pulse" />
                    </CardContent>
                </Card>
            )) : statCards.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <div className="text-muted-foreground">{stat.icon}</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        {/* <p className="text-xs text-muted-foreground">+5.2% from last week</p> */}
                    </CardContent>
                </Card>
            ))}
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 /> Weekly Progress</CardTitle>
                <CardDescription>An overview of user and investment growth.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-64 bg-secondary/50 rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Weekly progress graphs will be shown here.</p>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
