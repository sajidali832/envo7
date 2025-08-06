
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GlowingCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/glowing-card';
import { CheckCircle, ArrowRight, Banknote, Copy, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { submitInvestment } from './_actions';

const plans = [
  { id: '1', name: 'Starter Plan', price: 6000 },
  { id: '2', name: 'Advanced Plan', price: 12000 },
  { id: '3', name: 'Pro Plan', price: 28000 },
];

export function InvestForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const planId = searchParams.get('plan');
  const selectedPlan = plans.find(p => p.id === planId);

  const [holderName, setHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const easypaisaNumber = '03130306344';
  const easypaisaHolderName = 'Zulekhan';

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(easypaisaNumber);
    toast({
      title: 'Copied!',
      description: 'Easypaisa number copied to clipboard.',
    });
  };

  const handleSubmitForApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotFile || !selectedPlan || !user) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please ensure you are logged in and have uploaded a screenshot.',
        });
        return;
    }
    setIsLoading(true);

    const formData = new FormData();
    formData.append('userId', user.id);
    formData.append('planId', selectedPlan.id);
    formData.append('price', selectedPlan.price.toString());
    formData.append('holderName', holderName);
    formData.append('accountNumber', accountNumber);
    formData.append('screenshotFile', screenshotFile);

    // Don't await the result. Redirect immediately for a better UX.
    // The server action will run in the background.
    // The /approval-pending page will reflect the status via its real-time listener.
    submitInvestment(formData).catch(err => {
        // We can log the error, but the user is already on the next page.
        // A more advanced implementation might use a global state to show a toast on the next page if an error occurs.
        console.error("Background submission failed:", err);
    });

    // Redirect immediately.
    router.push('/approval-pending');
  };

  if (!selectedPlan) {
    return (
        <div className="flex-grow flex items-center justify-center py-12 px-4">
            <p>No plan selected. Please go back and select a plan.</p>
        </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4">
        <GlowingCard className="w-full max-w-lg" glowColor="accent">
         <form onSubmit={handleSubmitForApproval}>
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 text-green-700 rounded-full h-12 w-12 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Complete Your Investment</CardTitle>
            <CardDescription>You're one step away from activating your plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary p-4 rounded-lg">
              <p className="font-semibold text-center">You have selected:</p>
              <p className="text-xl font-bold text-accent text-center">{selectedPlan.name}</p>
              <p className="text-3xl font-bold text-foreground mt-1 text-center">{selectedPlan.price.toLocaleString()} PKR</p>
            </div>
            
            <div className="space-y-4">
                <h3 className="font-semibold text-center text-lg">Payment Instructions</h3>
                <div className="text-sm p-4 border rounded-lg bg-background space-y-3">
                    <p className="flex items-start gap-3"><Banknote className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" /> <span>Transfer the plan amount to the following Easypaisa account.</span></p>
                    <div className="bg-secondary/50 p-3 rounded-md">
                        <div className='flex justify-between items-center'>
                            <div>
                                <p className="font-mono text-lg">{easypaisaNumber}</p>
                                <p className='text-muted-foreground'>Holder: {easypaisaHolderName}</p>
                            </div>
                            <Button type="button" size="icon" variant="ghost" onClick={handleCopyToClipboard}>
                                <Copy className="h-5 w-5"/>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-center text-lg">Submit for Approval</h3>
                 <div className="space-y-2">
                    <Label htmlFor="holderName">Your Account Holder Name</Label>
                    <Input id="holderName" type="text" placeholder="e.g. John Doe" required value={holderName} onChange={(e) => setHolderName(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="accountNumber">Your Number</Label>
                    <Input id="accountNumber" type="text" placeholder="e.g. 03xxxxxxxxx" required value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="screenshot">Upload Screenshot (Proof)</Label>
                    <div className="flex items-center gap-2 p-2 border rounded-md border-dashed">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <Input id="screenshot" type="file" required accept="image/*" onChange={(e) => setScreenshotFile(e.target.files ? e.target.files[0] : null)} className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto" />
                    </div>
                </div>
            </div>

          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full glow-accent" size="lg" isLoading={isLoading}>
              Submit for Approval <ArrowRight className="ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground text-center">
             Your account will be activated upon payment confirmation. This may take up to 10 minutes.
            </p>
          </CardFooter>
          </form>
        </GlowingCard>
      </div>
  );
}
