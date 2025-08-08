
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GlowingCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/glowing-card';
import { CheckCircle, Zap, Gift, Star } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/landing/footer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Plan = {
    id: number;
    title: string;
    price: string;
    priceVal: number;
    dailyReturn: number;
    validity: number;
    bonus: string;
    glowColor: string;
    isPopular?: boolean;
}

type PlansClientPageProps = {
    plans: Plan[];
    referrerName: string | null;
    refId?: string;
}

export function PlansClientPage({ plans, referrerName, refId }: PlansClientPageProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section id="plans" className="py-16 md:py-24">
          <div className="container px-4">
             {referrerName && (
                <Alert className="mb-10 bg-green-50 border-green-200 text-green-800">
                  <Gift className="h-5 w-5 !text-green-600" />
                  <AlertTitle>Referral Bonus!</AlertTitle>
                  <AlertDescription>
                    You were referred by <span className="font-bold">{referrerName}</span>. A bonus of 600 PKR will be awarded to them when you invest!
                  </AlertDescription>
                </Alert>
            )}
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Find Your Perfect Plan</h1>
              <p className="text-base md:text-lg text-muted-foreground mb-10">
                We offer a range of investment plans to match your ambitions. Each plan is a step towards achieving your financial goals with consistent returns.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch">
              {plans.map((plan) => (
                <GlowingCard key={plan.id} className="flex flex-col" glowColor={plan.glowColor as any}>
                  <CardHeader className="text-center">
                    {plan.id === 0 && (
                       <div className="mx-auto bg-green-600 text-white rounded-full px-4 py-1 text-sm font-semibold mb-2 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <span>Free Tier</span>
                      </div>
                    )}
                    {plan.isPopular && (
                       <div className="mx-auto bg-accent text-accent-foreground rounded-full px-4 py-1 text-sm font-semibold mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>Most Popular</span>
                      </div>
                    )}
                    <CardTitle className="text-2xl">{plan.title}</CardTitle>
                    <CardDescription>
                      <span className="text-3xl sm:text-4xl font-bold text-foreground">{plan.price}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="text-center mb-6">
                      <p className="text-lg">
                        <span className={`font-bold text-2xl ${plan.glowColor === 'primary' ? 'text-primary' : 'text-accent'}`}>{plan.dailyReturn.toLocaleString()} PKR</span> / Day
                      </p>
                    </div>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>{plan.validity} Days Validity</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>{plan.bonus}</span>
                      </li>
                       <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Daily Withdrawals</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>24/7 Support</span>
                      </li>
                       {plan.id === 0 && (
                         <li className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span>No Investment Required</span>
                        </li>
                       )}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" size="lg" asChild>
                       <Link href={`/register?plan=${plan.id}${refId ? `&ref=${refId}`: ''}`}>Select Plan</Link>
                    </Button>
                  </CardFooter>
                </GlowingCard>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
