import { GlowingCard, CardHeader, CardTitle, CardContent } from '@/components/glowing-card';
import { BarChart, ShieldCheck, Users } from 'lucide-react';

const features = [
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: 'Profit-Driven Plans',
    description: 'Our investment plans are carefully crafted to maximize your returns, offering competitive daily profits and clear validity periods.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Lucrative Referrals',
    description: 'We believe in shared success. Our referral program rewards you generously for bringing new members into our community.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: 'Secure & Transparent',
    description: 'Your trust is our priority. We ensure a secure platform with transparent processes for investments and withdrawals.',
  },
];

export function AboutSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Envo-Pro?</h2>
          <p className="text-base md:text-lg text-muted-foreground mb-10">
            We are dedicated to providing a premium investment experience, combining profitability with a user-friendly platform designed for the ambitious individual.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature) => (
            <GlowingCard key={feature.title}>
              <CardHeader className="items-center">
                {feature.icon}
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                {feature.description}
              </CardContent>
            </GlowingCard>
          ))}
        </div>
      </div>
    </section>
  );
}
