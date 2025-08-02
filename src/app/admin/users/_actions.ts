
'use server';

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getUsers() {
    const { data: profiles, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, username, balance, status')
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
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: error.message };
    }

    return { success: true, error: null };
}
