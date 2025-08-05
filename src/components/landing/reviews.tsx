import Image from 'next/image';
import { GlowingCard, CardContent, CardHeader } from '@/components/glowing-card';
import { Star } from 'lucide-react';

const reviews = [
  { name: 'Ayesha Khan', city: 'Karachi', review: 'Amazing platform! I doubled my investment in just a few weeks. Highly recommended!', avatar: 'https://placehold.co/64x64.png' },
  { name: 'Bilal Ahmed', city: 'Lahore', review: 'The referral bonuses are a great way to earn extra income. The system is transparent and easy to use.', avatar: 'https://placehold.co/64x64.png' },
  { name: 'Fatima Ali', city: 'Islamabad', review: 'I was hesitant at first, but Envo-Pro proved to be a trustworthy platform. Withdrawals are processed quickly.', avatar: 'https://placehold.co/64x64.png' },
  { name: 'Saad Malik', city: 'Rawalpindi', review: 'Excellent customer support and a very professional interface. Feels like a premium service.', avatar: 'https://placehold.co/64x64.png' },
  { name: 'Hina Iqbal', city: 'Faisalabad', review: 'The daily earnings are credited on time every day. It\'s a reliable way to grow your savings.', avatar: 'https://placehold.co/64x64.png' },
  { name: 'Usman Butt', city: 'Multan', review: 'I have referred many friends and the bonuses are fantastic. Best investment app in Pakistan!', avatar: 'https://placehold.co/64x64.png' },
];

const StarRating = ({ rating = 5 }) => (
  <div className="flex gap-0.5 text-yellow-400">
    {Array.from({ length: rating }).map((_, i) => (
      <Star key={i} className="h-4 w-4 fill-current" />
    ))}
  </div>
);

export function ReviewsSection() {
  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-base md:text-lg text-muted-foreground mb-10">
            Real stories from our community of successful investors across Pakistan.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {reviews.map((item) => (
            <GlowingCard key={item.name} glowColor="accent">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Image src={item.avatar} alt={item.name} width={56} height={56} data-ai-hint="person portrait" className="rounded-full h-14 w-14 object-cover" />
                  <div>
                    <h4 className="font-bold">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.city}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <StarRating />
                <p className="mt-4 text-muted-foreground italic text-sm">"{item.review}"</p>
              </CardContent>
            </GlowingCard>
          ))}
        </div>
      </div>
    </section>
  );
}
