
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, CreditCard, Clock, CheckCircle, XCircle, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


type WithdrawalMethod = {
    id: number;
    method: string;
    holder_name: string;
    account_number: string;
}

type WithdrawalHistory = {
    id: number;
    amount: number;
    status: string;
    requested_at: string;
}

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'approved':
            return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
        case 'processing':
            return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Processing</Badge>;
        case 'rejected':
            return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

export default function WithdrawalsPage() {
    const { toast } = useToast();
    const { user, loading: authLoading } = useAuth();
    const [userBalance, setUserBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [withdrawalMethod, setWithdrawalMethod] = useState<WithdrawalMethod | null>(null);
    const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalHistory[]>([]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [method, setMethod] = useState('easypaisa');
    const [holderName, setHolderName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');

    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            // Fetch all data in parallel
            const [profileRes, methodRes, historyRes] = await Promise.all([
                supabase.from('profiles').select('balance').eq('id', user.id).single(),
                supabase.from('withdrawal_methods').select('*').eq('user_id', user.id).limit(1).maybeSingle(),
                supabase.from('withdrawals').select('id, amount, status, requested_at').eq('user_id', user.id).order('requested_at', { ascending: false })
            ]);

            if (profileRes.data) setUserBalance(profileRes.data.balance);
            
            if (methodRes.data) {
                setWithdrawalMethod(methodRes.data);
                setMethod(methodRes.data.method);
                setHolderName(methodRes.data.holder_name);
                setAccountNumber(methodRes.data.account_number);
            } else {
                setWithdrawalMethod(null);
            }

            if (historyRes.data) setWithdrawalHistory(historyRes.data);

            if (profileRes.error || methodRes.error || historyRes.error) {
                 // We don't toast here as minor errors are not critical.
                 // The UI will show loading or empty states.
                 console.error("Error fetching withdrawal data:", profileRes.error || methodRes.error || historyRes.error);
            }
        } catch (error) {
            console.error("Catastrophic error fetching withdrawal data:", error);
            toast({ variant: 'destructive', title: "Error", description: "Failed to fetch withdrawal data." });
        } finally {
            setIsLoading(false);
        }
    }, [user, toast]);
    
    useEffect(() => {
        if (authLoading || !user) {
            setIsLoading(false);
            return;
        }

        fetchData();
        
        // Consolidated real-time subscription
        const channel = supabase.channel(`user-dashboard-${user.id}`)
            .on('postgres_changes', 
                { event: '*', schema: 'public', filter: `user_id=eq.${user.id}` }, 
                (payload) => {
                    console.log('Change received on user channel, refetching data', payload);
                    fetchData();
                }
            )
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, 
                (payload) => {
                    console.log('Profile change received, refetching data', payload);
                    fetchData();
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Realtime channel subscribed!');
                }
                if (status === 'CHANNEL_ERROR') {
                    console.error('Realtime channel error:', err);
                }
            });
        
        return () => {
            supabase.removeChannel(channel);
        }
    }, [user, authLoading, fetchData])

    const handleSaveMethod = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);

        const methodDetails = {
            user_id: user.id,
            method: method,
            holder_name: holderName,
            account_number: accountNumber
        };

        const { error } = await supabase
            .from('withdrawal_methods')
            .upsert(methodDetails, { onConflict: 'user_id' });
        
        if (error) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        } else {
            toast({
              title: "Information Saved Successfully",
              description: "Your withdrawal method has been saved.",
              className: "bg-green-100 text-green-800 border-green-300"
            });
            setIsFormOpen(false);
        }
        setIsSubmitting(false);
    }

    const handleWithdrawalRequest = async () => {
        const amount = parseFloat(withdrawalAmount);
        if (isNaN(amount) || amount <= 0) {
            toast({ variant: 'destructive', title: "Invalid Amount", description: "Please enter a valid amount."});
            return;
        }
        if (amount > userBalance) {
            toast({ variant: 'destructive', title: "Insufficient Balance", description: "You cannot withdraw more than your available balance."});
            return;
        }

        if(!user || !withdrawalMethod) return;

        setIsSubmitting(true);
        const newBalance = userBalance - amount;

        // 1. Deduct from balance
        const { error: balanceError } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);
        if (balanceError) {
             toast({ variant: 'destructive', title: "Request Failed", description: balanceError.message });
             setIsSubmitting(false);
             return;
        }

        // 2. Create withdrawal record
        const { error: withdrawalError } = await supabase.from('withdrawals').insert({
            user_id: user.id,
            amount: amount,
            status: 'processing',
            withdrawal_method_id: withdrawalMethod.id,
        });

        if (withdrawalError) {
            // Rollback balance deduction
            await supabase.from('profiles').update({ balance: userBalance }).eq('id', user.id);
            toast({ variant: 'destructive', title: "Request Failed", description: withdrawalError.message });
            setIsSubmitting(false);
            return;
        }

        toast({ title: "Request Submitted", description: `Your withdrawal request for ${amount} PKR is being processed.`});
        setWithdrawalAmount('');
        setIsSubmitting(false);
    }

    const openEditForm = () => {
        if(withdrawalMethod) {
            setMethod(withdrawalMethod.method);
            setHolderName(withdrawalMethod.holder_name);
            setAccountNumber(withdrawalMethod.account_number);
        }
        setIsFormOpen(true);
    }

    if (authLoading) {
        return <p className="p-8">Loading dashboard...</p>;
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold">Withdrawals</h1>
                    <p className="text-muted-foreground">Manage your funds and view your transaction history.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2"><CreditCard /> Withdrawal Method</span>
                            {withdrawalMethod && (
                                <Button variant="ghost" size="icon" onClick={openEditForm}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            )}
                        </CardTitle>
                        <CardDescription>Add and manage your payment accounts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? <p>Loading...</p> : withdrawalMethod ? (
                           <div className="space-y-2 text-sm border p-4 rounded-md bg-secondary/50">
                               <p><strong>Method:</strong> {withdrawalMethod.method}</p>
                               <p><strong>Holder:</strong> {withdrawalMethod.holder_name}</p>
                               <p><strong>Account #:</strong> {withdrawalMethod.account_number}</p>
                           </div>
                        ) : (
                           <div className="text-center text-muted-foreground py-4">
                                <p>You have no withdrawal methods saved.</p>
                           </div>
                        )}
                        
                        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                            <DialogTrigger asChild>
                                {!withdrawalMethod && (
                                    <Button className="w-full" variant="outline" disabled={isLoading}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Method
                                    </Button>
                                )}
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>{withdrawalMethod ? 'Edit' : 'Add'} Withdrawal Method</DialogTitle>
                                    <DialogDescription>
                                        Add or update your payment account for withdrawals.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSaveMethod}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="method" className="text-right">
                                                Method
                                            </Label>
                                            <Select value={method} onValueChange={setMethod}>
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder="Select a method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="easypaisa">Easypaisa</SelectItem>
                                                    <SelectItem value="jazzcash">Jazzcash</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="holderName" className="text-right">
                                                Holder Name
                                            </Label>
                                            <Input id="holderName" value={holderName} onChange={e => setHolderName(e.target.value)} className="col-span-3" required/>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="accountNumber" className="text-right">
                                                Account No.
                                            </Label>
                                            <Input id="accountNumber" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="col-span-3" required/>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" isLoading={isSubmitting}>Save Information</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Submit a Request</CardTitle>
                        <CardDescription>Enter the amount you wish to withdraw.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {withdrawalMethod ? (
                            <>
                                <p className="text-sm text-muted-foreground">Available Balance: <span className="font-bold text-primary">{userBalance.toLocaleString()} PKR</span></p>
                                <div className="flex gap-2">
                                    <Input 
                                        type="number" 
                                        placeholder="Amount in PKR"
                                        value={withdrawalAmount}
                                        onChange={e => setWithdrawalAmount(e.target.value)}
                                        disabled={isSubmitting || isLoading}
                                    />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button disabled={!withdrawalAmount || isSubmitting || isLoading}>Request</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will submit a withdrawal request for {withdrawalAmount} PKR. The amount will be deducted from your balance for processing.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleWithdrawalRequest}>Confirm</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </>
                         ) : (
                             <p className="text-sm text-muted-foreground text-center pt-8">Please add a withdrawal method first to submit a request.</p>
                         )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Withdrawal History</CardTitle>
                    <CardDescription>A complete record of your withdrawal requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">Loading history...</TableCell>
                                    </TableRow>
                                ) : withdrawalHistory.length > 0 ? withdrawalHistory.map((item) => (
                                    <TableRow key={item.id}>
                                    <TableCell>{new Date(item.requested_at).toLocaleDateString()}</TableCell>
                                    <TableCell>{item.amount.toLocaleString()} PKR</TableCell>
                                    <TableCell className="text-right">
                                        <StatusBadge status={item.status} />
                                    </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">
                                            You have no withdrawal history.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
