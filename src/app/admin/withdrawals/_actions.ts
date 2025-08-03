
'use server';
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { PostgrestError } from "@supabase/supabase-js";

export type WithdrawalRequest = {
    id: number;
    user_id: string;
    amount: number;
    status: 'processing' | 'approved' | 'rejected';
    requested_at: string;
    withdrawal_method: {
        method: string;
        account_number: string;
        holder_name: string;
    } | null;
    profiles: {
        username: string | null;
    } | null;
    email?: string;
};

export async function getPendingWithdrawals(): Promise<{data: WithdrawalRequest[] | null, error: PostgrestError | string | null}> {
    // Step 1: Fetch all pending withdrawals
    const { data: withdrawalData, error: withdrawalError } = await supabaseAdmin
        .from('withdrawals')
        .select(`
            id,
            user_id,
            amount,
            status,
            requested_at,
            withdrawal_method_id
        `)
        .eq('status', 'processing')
        .order('requested_at', { ascending: true });

    if (withdrawalError) {
        console.error('Error fetching withdrawals:', withdrawalError);
        return { data: null, error: withdrawalError };
    }

    if (!withdrawalData) {
        return { data: [], error: null };
    }

    // Step 2: Fetch all withdrawal methods
    const { data: methodsData, error: methodsError } = await supabaseAdmin
        .from('withdrawal_methods')
        .select('*');

    if (methodsError) {
        console.error('Error fetching withdrawal methods:', methodsError);
        return { data: null, error: 'Could not fetch withdrawal methods.' };
    }

    const methodsMap = new Map(methodsData.map(m => [m.id, m]));

    // Step 3: Fetch all profiles
    const { data: profilesData, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, username');

    if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return { data: null, error: 'Could not fetch profiles.' };
    }
    
    const profilesMap = new Map(profilesData.map(p => [p.id, p]));

    // Step 4: Combine withdrawals with their methods and profiles
    const withdrawalsWithDetails = withdrawalData.map(withdrawal => ({
        ...withdrawal,
        withdrawal_method: methodsMap.get(withdrawal.withdrawal_method_id) || null,
        profiles: profilesMap.get(withdrawal.user_id) || null,
    }));

    // Step 5: Fetch user emails
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
        console.error('Could not fetch user emails:', authError);
        return { data: null, error: 'Could not fetch user emails.' };
    }
    
    const emailMap = new Map(authUsers.users.map(u => [u.id, u.email]));
    const finalWithdrawals = withdrawalsWithDetails.map(withdrawal => ({
        ...withdrawal,
        email: emailMap.get(withdrawal.user_id),
    }));

    return { data: finalWithdrawals as WithdrawalRequest[], error: null };
}

export async function updateWithdrawalStatus(withdrawalId: number, newStatus: 'approved' | 'rejected'): Promise<{success: boolean, error: string | null}> {
    
    const { data: withdrawal, error: fetchError } = await supabaseAdmin
        .from('withdrawals')
        .select('*, profiles(balance)')
        .eq('id', withdrawalId)
        .single();
    
    if (fetchError || !withdrawal) {
        return { success: false, error: `Failed to fetch withdrawal: ${fetchError?.message}`};
    }

    // If rejecting, we refund the amount to the user's balance.
    if (newStatus === 'rejected') {
        // Fetch the user's current balance
        const { data: profile, error: profileFetchError } = await supabaseAdmin
            .from('profiles')
            .select('balance')
            .eq('id', withdrawal.user_id)
            .single();

        if (profileFetchError || !profile) {
            return { success: false, error: `Failed to fetch user for refund: ${profileFetchError?.message}` };
        }
        
        const newBalance = (profile.balance || 0) + withdrawal.amount;
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ balance: newBalance })
            .eq('id', withdrawal.user_id);
        
        if (profileError) {
            // If refund fails, we should not proceed with rejection.
            return { success: false, error: `Failed to refund user balance: ${profileError.message}` };
        }
    }
    
    // For both 'approved' and 'rejected', update the withdrawal status.
    const { error: updateError } = await supabaseAdmin
        .from('withdrawals')
        .update({ status: newStatus })
        .eq('id', withdrawalId);

    if (updateError) {
        // If status update fails after a rejection refund, we should ideally try to revert the refund.
        // For now, we will just report the error.
        if (newStatus === 'rejected') {
             console.error(`CRITICAL: User ${withdrawal.user_id} was refunded ${withdrawal.amount} but withdrawal status failed to update to 'rejected'. Manual correction needed.`);
        }
        return { success: false, error: `Failed to update withdrawal status: ${updateError.message}` };
    }
    
    return { success: true, error: null };
}
