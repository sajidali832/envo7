import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

type GlowingCardProps = React.HTMLAttributes<HTMLDivElement> & {
  glowColor?: 'primary' | 'accent';
};

const GlowingCard = ({ className, glowColor = 'primary', ...props }: GlowingCardProps) => (
  <Card
    className={cn(
      'transition-all duration-300',
      {
        'shadow-primary/20 hover:shadow-primary/40 focus-within:shadow-primary/40': glowColor === 'primary',
        'shadow-accent/20 hover:shadow-accent/40 focus-within:shadow-accent/40': glowColor === 'accent',
      },
      'shadow-2xl',
      className
    )}
    {...props}
  />
);

export { GlowingCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
