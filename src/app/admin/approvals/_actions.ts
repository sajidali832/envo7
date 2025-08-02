
'use server';
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { PostgrestError } from "@supabase/supabase-js";

type Investment = {
    id: number;
    user_id: string;
    amount: number;
    status: string;
    proof_screenshot_url: string;
    submitted_at: string;
    plan_id: number;
    profiles: {
        username: string;
        referred_by?: string | null;
    } | null;
    email?: string;
};

// This function runs on the server and uses the admin client to fetch data.
export async function getPendingApprovals(): Promise<{data: any[] | null, error: PostgrestError | string | null}> {
    const { data: investmentData, error: investmentError } = await supabaseAdmin
        .from('investments')
        .select(`
            id,
            user_id,
            amount,
            status,
            proof_screenshot_url,
            submitted_at,
            plan_id,
            profiles (
                username,
                referred_by
            )
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true });

    if (investmentError) {
        console.error('Error fetching investments:', investmentError);
        return { data: null, error: investmentError };
    }

    if (!investmentData) {
        return { data: [], error: null };
    }

    // Now fetch the user emails using the admin client
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
        console.error('Could not fetch user emails:', authError);
        return { data: null, error: 'Could not fetch user emails.' };
    }
    
    const emailMap = new Map(authUsers.users.map(u => [u.id, u.email]));
    const approvalsWithEmails = investmentData.map(approval => ({
        ...approval,
        email: emailMap.get(approval.user_id),
    }));

    return { data: approvalsWithEmails, error: null };
}


export async function updateInvestmentStatus(investment: Investment, newStatus: 'approved' | 'rejected'): Promise<{success: boolean, error: string | null}> {
    
    // Update investment status
    const { error: investmentError } = await supabaseAdmin
        .from('investments')
        .update({ status: newStatus })
        .eq('id', investment.id);

    if (investmentError) {
        return { success: false, error: `Failed to update investment: ${investmentError.message}` };
    }

    // If approved, update user's balance and status
    if (newStatus === 'approved') {
        const { data: profile, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('balance, referred_by')
            .eq('id', investment.user_id)
            .single();
        
        if(fetchError || !profile){
            return { success: false, error: `Failed to fetch user profile: ${fetchError?.message}` };
        }

        const newBalance = (profile.balance || 0) + investment.amount;

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ status: 'active', balance: newBalance })
            .eq('id', investment.user_id);
        
        if (profileError) {
            // Optionally, revert investment status here if this fails
            await supabaseAdmin.from('investments').update({ status: 'pending' }).eq('id', investment.id);
            return { success: false, error: `Failed to update user profile: ${profileError.message}` };
        }

        // Handle referral bonus if applicable
        if (profile.referred_by) {
            const referralBonus = 200;

            // Fetch referrer's profile
            const { data: referrerProfile, error: referrerFetchError } = await supabaseAdmin
                .from('profiles')
                .select('balance, referral_earnings')
                .eq('id', profile.referred_by)
                .single();
            
            if (referrerFetchError || !referrerProfile) {
                 // Log error but don't block the approval process
                console.error(`Referral bonus failed: Could not fetch referrer profile for user ${profile.referred_by}. Error: ${referrerFetchError?.message}`);
            } else {
                 const newReferrerBalance = (referrerProfile.balance || 0) + referralBonus;
                 const newReferralEarnings = (referrerProfile.referral_earnings || 0) + referralBonus;

                 // Update referrer's balances
                 const { error: referrerUpdateError } = await supabaseAdmin
                    .from('profiles')
                    .update({ balance: newReferrerBalance, referral_earnings: newReferralEarnings })
                    .eq('id', profile.referred_by);
                
                if (referrerUpdateError) {
                    console.error(`Referral bonus failed: Could not update referrer profile for user ${profile.referred_by}. Error: ${referrerUpdateError.message}`);
                } else {
                    // Log the referral transaction
                    const { error: referralLogError } = await supabaseAdmin
                        .from('referrals')
                        .insert({
                            referrer_id: profile.referred_by,
                            referred_id: investment.user_id,
                            bonus_amount: referralBonus,
                        });
                    
                    if(referralLogError) {
                         console.error(`Referral bonus failed: Could not log referral for referrer ${profile.referred_by} and new user ${investment.user_id}. Error: ${referralLogError.message}`);
                    }
                }
            }
        }
    }
    
    return { success: true, error: null };
}
