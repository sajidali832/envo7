
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GlowingCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/glowing-card';
import { CheckCircle, Star } from 'lucide-react';

const plans = [
  { id: 0, title: 'Free Plan', price: '0 PKR', daily: '20 PKR', features: ['90 Days Validity', 'Standard Referral Bonus'], glowColor: 'primary' },
  { id: 1, title: 'Starter Plan', price: '6,000 PKR', daily: '120 PKR', features: ['80 Days Validity', 'Standard Referral Bonus'], glowColor: 'primary' },
  { id: 2, title: 'Advanced Plan', price: '12,000 PKR', daily: '260 PKR', features: ['75 Days Validity', 'Higher Referral Bonus'], glowColor: 'accent' },
  { id: 3, title: 'Pro Plan', price: '28,000 PKR', daily: '560 PKR', features: ['75 Days Validity', 'Pro Referral Program'], glowColor: 'primary' },
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {plans.map((plan, index) => (
            <GlowingCard key={plan.title} className="flex flex-col" glowColor={plan.glowColor as any}>
              <CardHeader className="text-center">
                 {plan.id === 0 && (
                       <div className="mx-auto bg-green-600 text-white rounded-full px-4 py-1 text-sm font-semibold mb-2 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <span>Free Tier</span>
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
                    <span className={`font-bold text-2xl ${plan.glowColor === 'primary' ? 'text-primary' : 'text-accent'}`}>{plan.daily}</span> / Day
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
                  <Link href={`/register?plan=${plan.id}`}>Select Plan</Link>
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
