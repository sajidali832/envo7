import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const planDetails: { [key: string]: { dailyReturn: number } } = {
  '1': { dailyReturn: 120 },  // Starter Plan
  '2': { dailyReturn: 260 },  // Advanced Plan
  '3': { dailyReturn: 560 },  // Pro Plan
};

// This function is triggered by a cron schedule.
Deno.serve(async (req) => {
  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Fetch all active user profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, balance, daily_earnings, selected_plan')
      .eq('status', 'active');

    if (profilesError) {
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      return new Response('No active users to process.', { status: 200 });
    }

    // 2. Prepare updates for each user
    const updates = profiles.map(profile => {
      const plan = planDetails[profile.selected_plan];
      if (!plan) {
        console.warn(`No plan details found for plan ID ${profile.selected_plan} on user ${profile.id}. Skipping.`);
        return null;
      }
      
      const dailyReturn = plan.dailyReturn;
      const newBalance = (profile.balance || 0) + dailyReturn;
      const newDailyEarnings = (profile.daily_earnings || 0) + dailyReturn;

      return {
        id: profile.id,
        balance: newBalance,
        daily_earnings: newDailyEarnings,
      };
    }).filter(update => update !== null); // Filter out any skipped users

    if (updates.length === 0) {
      return new Response('No valid user plans to update.', { status: 200 });
    }

    // 3. Bulk update the profiles table
    // Note: Supabase upsert is used here as a way to perform a bulk update based on the primary key `id`.
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .upsert(updates as any, { onConflict: 'id' });

    if (updateError) {
      throw updateError;
    }

    console.log(`Successfully processed daily earnings for ${updates.length} users.`);
    return new Response(JSON.stringify({ message: `Processed daily earnings for ${updates.length} users.` }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing daily earnings:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
