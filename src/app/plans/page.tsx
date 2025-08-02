
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
    { id: 1, title: 'Starter Plan', price: 6000, dailyReturn: 120, validity: 80, bonus: 'Standard', glowColor: 'primary' },
    { id: 2, title: 'Advanced Plan', price: 12000, dailyReturn: 260, validity: 75, bonus: 'Higher', glowColor: 'accent' },
    { id: 3, title: 'Pro Plan', price: 28000, dailyReturn: 560, validity: 75, bonus: 'Pro Program', glowColor: 'primary' },
  ];

  return (
    <PlansClientPage plans={plans} referrerName={referrerName} refId={refId} />
  );
}
