import { createClient } from '@supabase/supabase-js'

// Ces deux valeurs viennent du fichier .env.local
// (voir .env.local.example pour savoir où les trouver dans Supabase)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Ce "client" est l'objet qu'on utilisera partout dans le site
// pour parler à la base de données et gérer les comptes utilisateurs
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
