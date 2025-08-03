
'use server';

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getUsers() {
    const { data: profiles, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, username, balance, status, total_investment, daily_earnings, referral_earnings')
        .order('username');

    if (profileError) {
        console.error('Error fetching profiles:', profileError);
        return { data: null, error: 'Failed to fetch profiles.' };
    }

    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
        console.error('Error fetching auth users:', authError);
        return { data: null, error: 'Failed to fetch auth users.' };
    }

    const emailMap = new Map(authUsers.users.map(u => [u.id, u.email]));
    const finalUsers = profiles.map(p => ({
        ...p,
        email: emailMap.get(p.id) || 'N/A'
    }));

    return { data: finalUsers, error: null };
}

export async function deleteUser(userId: string) {
    // Note: RLS with ON DELETE CASCADE should handle cleaning up the profile.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: error.message };
    }

    return { success: true, error: null };
}


export async function updateUserProfile(userId: string, data: { balance: number; daily_earnings: number; referral_earnings: number; }) {
    const { error } = await supabaseAdmin
        .from('profiles')
        .update(data)
        .eq('id', userId)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating user profile:', error);
        return { success: false, error: 'Failed to update user profile.' };
    }

    return { success: true, error: null };
}
