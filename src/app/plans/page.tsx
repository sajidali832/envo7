
import { PlansClientPage } from './client-page';
import { supabase } from '@/lib/supabase';

// This is a server component to fetch data
export const dynamic = 'force-dynamic'; // Ensures searchParams are handled dynamically

export default async function PlansPage({ searchParams }: { searchParams: { ref?: string }}) {
  const refId = searchParams.ref;
  let referrerName: string | null = null;

  if (refId) {
    // Fetch the referrer's username
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', refId)
      .single();

    if (!error && data) {
      referrerName = data.username;
    }
  }

  const plans = [
    { id: 0, title: 'Free Plan', price: '0 PKR', priceVal: 0, dailyReturn: 20, validity: 90, bonus: '600 PKR Referral Bonus', glowColor: 'primary' },
    { id: 1, title: 'Starter Plan', price: '6,000 PKR', priceVal: 6000, dailyReturn: 120, validity: 80, bonus: 'Standard Referral Bonus', glowColor: 'primary' },
    { id: 2, title: 'Advanced Plan', price: '12,000 PKR', priceVal: 12000, dailyReturn: 260, validity: 75, bonus: 'Higher Referral Bonus', glowColor: 'accent', isPopular: true },
    { id: 3, title: 'Pro Plan', price: '28,000 PKR', priceVal: 28000, dailyReturn: 560, validity: 75, bonus: 'Pro Program Referral Bonus', glowColor: 'primary' },
  ];

  return (
    <PlansClientPage plans={plans} referrerName={referrerName} refId={refId} />
  );
}
