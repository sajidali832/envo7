import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// This key has admin privileges and should ONLY be used on the server.
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL and Service Role Key are required for the admin client.')
}

// Note: this client bypasses Row Level Security.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
