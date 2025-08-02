
import { Suspense } from 'react';
import { InvestForm } from './invest-form';
import { GlowingCard, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/glowing-card';
import { Hourglass } from 'lucide-react';

// This is a server component that wraps the client component in Suspense
export default function InvestPageWrapper() {
  return (
    <Suspense fallback={<LoadingState />}>
      <InvestForm />
    </Suspense>
  );
}

function LoadingState() {
    return (
        <div className="flex-grow flex items-center justify-center py-12 px-4">
            <GlowingCard className="w-full max-w-lg" glowColor="accent">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-secondary rounded-full h-12 w-12 flex items-center justify-center mb-4">
                        <Hourglass className="h-8 w-8 animate-spin" />
                    </div>
                    <CardTitle className="text-2xl">Loading Investment Form...</CardTitle>
                    <CardDescription>Please wait a moment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="h-24 bg-muted/50 rounded-lg animate-pulse"></div>
                    <div className="h-48 bg-muted/50 rounded-lg animate-pulse"></div>
                </CardContent>
            </GlowingCard>
        </div>
    )
}
