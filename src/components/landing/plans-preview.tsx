import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GlowingCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/glowing-card';
import { CheckCircle } from 'lucide-react';

const plans = [
  { title: 'Starter Plan', price: '6,000 PKR', daily: '120 PKR', features: ['80 Days Validity', 'Standard Referral Bonus'] },
  { title: 'Advanced Plan', price: '12,000 PKR', daily: '260 PKR', features: ['75 Days Validity', 'Higher Referral Bonus'] },
  { title: 'Pro Plan', price: '28,000 PKR', daily: '560 PKR', features: ['75 Days Validity', 'Pro Referral Program'] },
];

export function PlansSection() {
  return (
    <section id="plans" className="py-16 md:py-24">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Investment Plans</h2>
          <p className="text-base md:text-lg text-muted-foreground mb-10">
            Choose a plan that suits your financial goals. Each plan is designed to provide you with consistent daily returns and rewarding bonuses.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {plans.map((plan, index) => (
            <GlowingCard key={plan.title} className="flex flex-col" glowColor={index === 1 ? 'accent' : 'primary'}>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.title}</CardTitle>
                <CardDescription>
                  <span className="text-3xl sm:text-4xl font-bold text-foreground">{plan.price}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-center mb-6">
                  <p className="text-lg">
                    <span className="font-bold text-primary text-2xl">{plan.daily}</span> / Day
                  </p>
                </div>
                <ul className="space-y-3">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg" asChild>
                  <Link href={`/register?plan=${index + 1}`}>Select Plan</Link>
                </Button>
              </CardFooter>
            </GlowingCard>
          ))}
        </div>
         <div className="text-center mt-12">
            <Button variant="link" asChild>
                <Link href="/plans">View All Plan Details &rarr;</Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
