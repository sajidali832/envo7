
'use client';

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Download } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
// We will create an action to fetch data using the admin client securely.
import { getPendingApprovals, updateInvestmentStatus } from './_actions';

type Investment = {
    id: number;
    user_id: string;
    amount: number;
    status: string;
    proof_screenshot_url: string;
    submitted_at: string;
    plan_id: number;
    profiles: {
        username: string;
    } | null;
    email?: string;
};

const planNames: {[key: number]: string} = {
    1: 'Starter Plan',
    2: 'Advanced Plan',
    3: 'Pro Plan',
}

export default function ApprovalsPage() {
    const [pendingApprovals, setPendingApprovals] = useState<Investment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchApprovals = async () => {
        setIsLoading(true);
        const {data, error} = await getPendingApprovals();

        if (error) {
            console.error('Error fetching approvals:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch pending approvals.' });
            setIsLoading(false);
            return;
        }

        if (data) {
            setPendingApprovals(data as Investment[]);
        }
        
        setIsLoading(false);
    };

    useEffect(() => {
        fetchApprovals();

        const channel = supabase.channel('realtime-investments')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'investments' }, (payload) => {
                console.log('Change received!', payload);
                fetchApprovals(); 
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'investments', filter: `status=eq.pending` }, (payload) => {
                 console.log('Change received!', payload);
                 fetchApprovals();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleApproval = async (investment: Investment, newStatus: 'approved' | 'rejected') => {
        const { success, error } = await updateInvestmentStatus(investment, newStatus);
        
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: error});
            return;
        }
        
        toast({ title: 'Success', description: `Investment has been ${newStatus}.`});
        setPendingApprovals(prev => prev.filter(item => item.id !== investment.id));
    };


    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold">Investment Approvals</h1>
                    <p className="text-muted-foreground">Review and process new investment requests.</p>
                </div>
                <Badge variant="outline">
                    {pendingApprovals.length} Pending
                </Badge>
            </div>

            {isLoading && <p>Loading pending approvals...</p>}

            {!isLoading && pendingApprovals.length === 0 && (
                <Card className="flex items-center justify-center h-64">
                    <CardContent className="text-center text-muted-foreground pt-6">
                        <Check className="mx-auto h-12 w-12 text-green-500" />
                        <h3 className="mt-4 text-lg font-medium">All Clear!</h3>
                        <p>There are no pending approvals at the moment.</p>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-6">
                {pendingApprovals.map((approval) => (
                    <Card key={approval.id}>
                        <CardHeader>
                            <div className="flex flex-wrap gap-4 justify-between items-center">
                                <div>
                                    <CardTitle>{approval.profiles?.username || 'Unknown User'}</CardTitle>
                                    <CardDescription>{approval.email}</CardDescription>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-primary">{approval.amount} PKR</p>
                                    <p className="text-sm text-muted-foreground">{planNames[approval.plan_id] || 'Unknown Plan'} on {new Date(approval.submitted_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <h4 className="font-semibold mb-2">Payment Proof</h4>
                                {approval.proof_screenshot_url ? (
                                    <>
                                        <div className="relative aspect-[9/16] w-full max-w-xs mx-auto md:mx-0 border rounded-lg overflow-hidden">
                                            <a href={approval.proof_screenshot_url} target="_blank" rel="noopener noreferrer">
                                                <Image src={approval.proof_screenshot_url} alt="Payment Screenshot" layout="fill" objectFit="cover" data-ai-hint="payment receipt screenshot" />
                                            </a>
                                        </div>
                                        <Button variant="outline" className="w-full mt-2" asChild>
                                            <a href={approval.proof_screenshot_url} target="_blank" rel="noopener noreferrer" download>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </a>
                                        </Button>
                                    </>
                                ) : (
                                    <div className="aspect-[9/16] w-full max-w-xs mx-auto md:mx-0 border rounded-lg flex items-center justify-center bg-muted text-muted-foreground">
                                        No proof uploaded
                                    </div>
                                )}
                            </div>
                            <div className="md:col-span-2 flex flex-col justify-center">
                                 <h4 className="font-semibold mb-4">Action Required</h4>
                                <p className="text-muted-foreground mb-4">
                                    Verify the payment screenshot and the amount. Once approved, the user's dashboard will be activated and their investment will be recorded.
                                </p>
                                <div className="flex gap-4">
                                    <Button className="flex-1 glow-primary" size="lg" onClick={() => handleApproval(approval, 'approved')}>
                                        <Check className="mr-2" /> Approve
                                    </Button>
                                    <Button variant="destructive" className="flex-1" size="lg" onClick={() => handleApproval(approval, 'rejected')}>
                                        <X className="mr-2" /> Reject
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
