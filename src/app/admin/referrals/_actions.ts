
'use server';

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getReferralData() {
    try {
        // 1. Fetch all referral records
        const { data: referrals, error: referralsError } = await supabaseAdmin
            .from('referrals')
            .select(`
                id,
                referrer_id,
                referred_id,
                bonus_amount,
                created_at
            `)
            .order('created_at', { ascending: false });

        if (referralsError) throw new Error(`Failed to fetch referrals: ${referralsError.message}`);

        if (!referrals || referrals.length === 0) {
            return {
                data: {
                    stats: { totalReferrals: 0, totalBonusesPaid: 0, topReferrer: 'N/A' },
                    history: []
                },
                error: null
            };
        }

        // 2. Gather all unique user IDs from referrals
        const userIds = [...new Set(referrals.flatMap(r => [r.referrer_id, r.referred_id]))];
        
        // 3. Fetch all corresponding profiles
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from('profiles')
            .select('id, username')
            .in('id', userIds);
        
        if (profilesError) throw new Error(`Failed to fetch profiles: ${profilesError.message}`);

        const profilesMap = new Map(profiles.map(p => [p.id, p.username]));

        // 4. Calculate stats
        const totalReferrals = referrals.length;
        const totalBonusesPaid = referrals.reduce((sum, r) => sum + r.bonus_amount, 0);

        const referrerCounts = referrals.reduce((acc, r) => {
            acc[r.referrer_id] = (acc[r.referrer_id] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        let topReferrerId = '';
        let maxReferrals = 0;
        for (const referrerId in referrerCounts) {
            if (referrerCounts[referrerId] > maxReferrals) {
                maxReferrals = referrerCounts[referrerId];
                topReferrerId = referrerId;
            }
        }
        
        const topReferrer = profilesMap.get(topReferrerId) || 'N/A';

        // 5. Combine data for history
        const history = referrals.map(r => ({
            id: r.id,
            referrerName: profilesMap.get(r.referrer_id) || 'Unknown',
            referredName: profilesMap.get(r.referred_id) || 'Unknown',
            bonus_amount: r.bonus_amount,
            created_at: r.created_at,
        }));

        return {
            data: {
                stats: { totalReferrals, totalBonusesPaid, topReferrer },
                history
            },
            error: null
        };

    } catch (error) {
        console.error("Error in getReferralData:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return { data: null, error: errorMessage };
    }
}
