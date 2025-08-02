
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Gift, Link as LinkIcon, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

type ReferralHistoryItem = {
    id: number;
    bonus_amount: number;
    created_at: string;
    referred_id: string;
    profiles: {
        username: string | null;
    } | null;
}

export default function ReferralsPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [referralLink, setReferralLink] = useState('');
    const [referralHistory, setReferralHistory] = useState<ReferralHistoryItem[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    useEffect(() => {
        if (user) {
            setReferralLink(`${window.location.origin}/plans?ref=${user.id}`);
            
            const fetchHistory = async () => {
                setIsLoadingHistory(true);
                const { data, error } = await supabase
                    .from('referrals')
                    .select(`
                        id,
                        bonus_amount,
                        created_at,
                        referred_id,
                        profiles:referred_id (
                            username
                        )
                    `)
                    .eq('referrer_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Error fetching referral history:", error);
                    toast({ variant: "destructive", title: "Error", description: "Could not fetch referral history." });
                } else if (data) {
                    setReferralHistory(data as ReferralHistoryItem[]);
                }
                setIsLoadingHistory(false);
            }
            fetchHistory();
        }
    }, [user, toast]);

    const copyToClipboard = (text: string, type: string) => {
        if(!text) return;
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: `Your ${type} has been copied to the clipboard.`,
        });
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Referral Program</h1>
                <p className="text-muted-foreground">Share your link and earn rewards for every new investor.</p>
            </div>

            <Card className="bg-gradient-to-br from-primary/80 to-accent/80 text-primary-foreground">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Gift /> Earn Big with Referrals!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">200 PKR</p>
                    <p className="text-primary-foreground/80">For every friend who registers and invests with your link.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LinkIcon /> Your Referral Link</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input value={referralLink || 'Loading...'} readOnly />
                        <Button size="icon" onClick={() => copyToClipboard(referralLink, 'referral link')} disabled={!referralLink}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserPlus /> Referral History</CardTitle>
                    <CardDescription>Track your earnings from the referral program.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Date Joined</TableHead>
                            <TableHead className="text-right">Bonus</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingHistory ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                        Loading history...
                                    </TableCell>
                                </TableRow>
                            ) : referralHistory.length > 0 ? referralHistory.map((item) => (
                                <TableRow key={item.id}>
                                <TableCell>{item.profiles?.username || 'Unnamed User'}</TableCell>
                                <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right text-green-600 font-medium">+{item.bonus_amount} PKR</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                        You have no referral history yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
