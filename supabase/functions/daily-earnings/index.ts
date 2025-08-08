
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const planDetails: { [key: string]: { dailyReturn: number } } = {
  '0': { dailyReturn: 20 },   // Free Plan
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

    // 1. Fetch all active user profiles with their plan
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, balance, daily_earnings, selected_plan')
      .eq('status', 'active');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: 'No active users to process.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
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
      return new Response(JSON.stringify({ message: 'No valid user plans to update.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    // 3. Bulk update the profiles table
    // Using upsert is a safe way to update multiple rows.
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileUpdates, { onConflict: 'id' });

    if (updateError) {
      console.error('Error updating profiles:', updateError);
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


    const successMessage = `Successfully processed daily earnings for ${profileUpdates.length} users.`;
    console.log(successMessage);
    return new Response(JSON.stringify({ message: successMessage }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('Error in daily earnings function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
