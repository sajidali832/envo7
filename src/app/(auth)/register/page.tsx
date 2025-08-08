
import { Suspense } from 'react';
import { RegisterForm } from './register-form';
import { GlowingCard, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/glowing-card';
import { Hourglass } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function LoadingState() {
    return (
        <GlowingCard className="w-full max-w-md" glowColor="accent">
            <CardHeader className="text-center">
                 <div className="mx-auto bg-secondary rounded-full h-12 w-12 flex items-center justify-center mb-4">
                    <Hourglass className="h-8 w-8 animate-spin" />
                </div>
                <CardTitle>Loading Form</CardTitle>
                <CardDescription>Preparing your registration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-16 bg-secondary rounded-lg animate-pulse"></div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-11 w-full mt-4" />
            </CardContent>
        </GlowingCard>
    )
}

export default function RegisterPageWrapper() {
  return (
    <Suspense fallback={<LoadingState />}>
      <RegisterForm />
    </Suspense>
  );
}
