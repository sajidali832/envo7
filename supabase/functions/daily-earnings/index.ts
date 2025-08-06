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

    const profileUpdates: any[] = [];
    const earningsHistoryInserts: any[] = [];
    const today = new Date().toISOString();

    // 2. Prepare updates for each user
    for (const profile of profiles) {
      const plan = planDetails[profile.selected_plan];
      if (!plan) {
        console.warn(`No plan details found for plan ID ${profile.selected_plan} on user ${profile.id}. Skipping.`);
        continue;
      }
      
      const dailyReturn = plan.dailyReturn;
      const newBalance = (profile.balance || 0) + dailyReturn;
      const newDailyEarnings = (profile.daily_earnings || 0) + dailyReturn;

      profileUpdates.push({
        id: profile.id,
        balance: newBalance,
        daily_earnings: newDailyEarnings,
      });

      earningsHistoryInserts.push({
        user_id: profile.id,
        amount: dailyReturn,
        type: 'daily_earning',
        created_at: today,
      });
    }

    if (profileUpdates.length === 0) {
      return new Response('No valid user plans to update.', { status: 200 });
    }

    // 3. Bulk update the profiles table
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileUpdates, { onConflict: 'id' });

    if (updateError) {
      throw updateError;
    }

    // 4. Bulk insert into earnings history
    const { error: historyError } = await supabaseAdmin
        .from('earnings_history')
        .insert(earningsHistoryInserts);

    if (historyError) {
        // Log the error, but don't fail the entire job as profiles are already updated.
        console.error('Failed to insert into earnings history:', historyError);
    }


    console.log(`Successfully processed daily earnings for ${profileUpdates.length} users.`);
    return new Response(JSON.stringify({ message: `Processed daily earnings for ${profileUpdates.length} users.` }), {
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
