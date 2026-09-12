import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlfyrqbvtqnwabyfcryy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qMWYL8288YoxId9tqdxYtg_7g1w5mli'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
