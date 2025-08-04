
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Link as LinkIcon, DollarSign, Award } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getReferralData } from "./_actions";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

type ReferralHistory = {
    id: number;
    referrerName: string | null;
    referredName: string | null;
    bonus_amount: number;
    created_at: string;
}

type ReferralStats = {
    totalReferrals: number;
    totalBonusesPaid: number;
    topReferrer: string;
}

export default function AdminReferralsPage() {
    const [stats, setStats] = useState<ReferralStats>({ totalReferrals: 0, totalBonusesPaid: 0, topReferrer: 'N/A' });
    const [history, setHistory] = useState<ReferralHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const { data, error } = await getReferralData();

            if (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch referral data.' });
            } else if (data) {
                setStats(data.stats);
                setHistory(data.history);
            }
            setIsLoading(false);
        }
        fetchData();
    }, [toast]);

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Referrals Overview</h1>
                <p className="text-muted-foreground">Track all referral activities and bonuses.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalReferrals}</div>
                         <p className="text-xs text-muted-foreground">Successful new investors</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bonuses Paid</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? '...' : stats.totalBonusesPaid.toLocaleString()} PKR</div>
                        <p className="text-xs text-muted-foreground">Paid to referrers</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Referrer</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? '...' : stats.topReferrer}</div>
                        <p className="text-xs text-muted-foreground">By number of referrals</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LinkIcon /> Referral History</CardTitle>
                    <CardDescription>A log of all successful referral connections.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading referral history...</div>
                    ) : history.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Referrer</TableHead>
                                    <TableHead>Referred User</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Bonus Paid</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.referrerName || 'N/A'}</TableCell>
                                    <TableCell>{item.referredName || 'N/A'}</TableCell>
                                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">{item.bonus_amount.toLocaleString()} PKR</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            No referral history found.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
