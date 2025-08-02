
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, CheckCircle } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from "react";
import { getPendingWithdrawals, updateWithdrawalStatus, type WithdrawalRequest } from './_actions';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function AdminWithdrawalsPage() {
    const [pendingWithdrawals, setPendingWithdrawals] = useState<WithdrawalRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchWithdrawals = async () => {
        setIsLoading(true);
        const { data, error } = await getPendingWithdrawals();

        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: typeof error === 'string' ? error : error.message });
        } else {
            setPendingWithdrawals(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchWithdrawals();

        const channel = supabase.channel('realtime-withdrawals')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, (payload) => {
                console.log('Withdrawal change received!', payload);
                fetchWithdrawals(); 
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleAction = async (withdrawalId: number, status: 'approved' | 'rejected') => {
        const { success, error } = await updateWithdrawalStatus(withdrawalId, status);
        
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: error });
            return;
        }
        
        toast({ title: 'Success', description: `Withdrawal has been ${status}.` });
        setPendingWithdrawals(prev => prev.filter(item => item.id !== withdrawalId));
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold">Withdrawal Requests</h1>
                    <p className="text-muted-foreground">Review and process user withdrawal requests.</p>
                </div>
                 <Badge variant="outline">
                    {pendingWithdrawals.length} Pending
                </Badge>
            </div>

            {isLoading && <p>Loading withdrawal requests...</p>}

            {!isLoading && pendingWithdrawals.length === 0 && (
                <Card className="flex items-center justify-center h-64">
                    <CardContent className="text-center text-muted-foreground pt-6">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                        <h3 className="mt-4 text-lg font-medium">All Clear!</h3>
                        <p>There are no pending withdrawal requests.</p>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-6">
                {pendingWithdrawals.map((request) => (
                    <Card key={request.id}>
                        <CardHeader>
                            <div className="flex flex-wrap gap-4 justify-between items-center">
                                <div>
                                    <CardTitle>{request.profiles?.username || 'Unknown User'}</CardTitle>
                                    <CardDescription>{request.email}</CardDescription>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-primary">{request.amount} PKR</p>
                                    <p className="text-sm text-muted-foreground">
                                        Requested on {new Date(request.requested_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2">Payment Details</h4>
                                {request.withdrawal_method ? (
                                    <div className="space-y-2 text-sm border p-4 rounded-md bg-secondary/50">
                                        <p><strong>Method:</strong> {request.withdrawal_method.method}</p>
                                        <p><strong>Holder:</strong> {request.withdrawal_method.holder_name}</p>
                                        <p><strong>Account #:</strong> {request.withdrawal_method.account_number}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 text-sm border p-4 rounded-md bg-destructive/10 text-destructive">
                                        <p><strong>User has not provided withdrawal details.</strong></p>
                                    </div>
                                )}
                            </div>
                             <div className="flex flex-col justify-center">
                                 <h4 className="font-semibold mb-4">Action Required</h4>
                                <p className="text-muted-foreground mb-4">
                                    Verify the user's details and process the payment. If rejecting, the funds will be returned to the user's balance.
                                </p>
                                <div className="flex gap-4">
                                    <Button className="flex-1 glow-primary" size="lg" onClick={() => handleAction(request.id, 'approved')} disabled={!request.withdrawal_method}>
                                        <Check className="mr-2" /> Approve
                                    </Button>
                                    <Button variant="destructive" className="flex-1" size="lg" onClick={() => handleAction(request.id, 'rejected')}>
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
