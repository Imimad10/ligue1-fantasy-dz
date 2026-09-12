// Script de seed pour remplir la base de données Supabase
// Usage: node scripts/seed.js

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://vlfyrqbvtqnwabyfcryy.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_qMWYL8288YoxId9tqdxYtg_7g1w5mli'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function seed() {
  console.log('🚀 Début du seed...\n')

  // 1. Insérer les équipes
  console.log('⚽ Insertion des équipes...')
  const { data: teams, error: teamsErr } = await supabase.from('teams').upsert([
    { id: 1, name: 'MC Alger', logo_url: 'https://upload.wikimedia.org/wikipedia/fr/b/b5/Logo_MC_Alger.svg' },
    { id: 2, name: 'CR Belouizdad', logo_url: 'https://upload.wikimedia.org/wikipedia/fr/5/5f/CR_Belouizdad_logo.svg' },
    { id: 3, name: 'JS Kabylie', logo_url: 'https://upload.wikimedia.org/wikipedia/fr/2/23/Logo_JS_Kabylie.svg' },
    { id: 4, name: 'USM Alger', logo_url: 'https://upload.wikimedia.org/wikipedia/fr/8/87/Logo_USM_Alger.svg' },
    { id: 5, name: 'ES Sétif', logo_url: 'https://upload.wikimedia.org/wikipedia/fr/9/91/ES_Setif_logo.svg' },
    { id: 6, name: 'CS Constantine', logo_url: 'https://upload.wikimedia.org/wikipedia/fr/0/05/CS_Constantine_Logo.svg' },
  ], { onConflict: 'id' }).select()
  
  if (teamsErr) {
    console.error('❌ Erreur équipes:', teamsErr.message)
    console.log('\n⚠️  Tu dois utiliser la clé SERVICE_ROLE pour contourner le RLS.')
    console.log('   1. Va dans Supabase > Project Settings > API')
    console.log('   2. Copie la clé "service_role" (pas la "anon")')
    console.log('   3. Relance avec: set SUPABASE_SERVICE_ROLE_KEY=ta_cle && node scripts/seed.js')
    return
  }
  console.log(`   ✅ ${teams.length} équipes insérées`)

  // 2. Insérer les gameweeks
  console.log('📅 Insertion des journées...')
  const { data: gw, error: gwErr } = await supabase.from('gameweeks').upsert([
    { id: 1, number: 1, start_date: '2026-09-15', end_date: '2026-09-17', is_current: true },
    { id: 2, number: 2, start_date: '2026-09-22', end_date: '2026-09-24', is_current: false },
    { id: 3, number: 3, start_date: '2026-09-29', end_date: '2026-10-01', is_current: false },
  ], { onConflict: 'id' }).select()
  if (gwErr) { console.error('❌ Erreur gameweeks:', gwErr.message); return }
  console.log(`   ✅ ${gw.length} journées insérées`)

  // 3. Insérer les matchs de la Journée 1
  console.log('🏟️  Insertion des matchs...')
  const { data: matchesData, error: matchErr } = await supabase.from('matches').upsert([
    { id: 1, gameweek_id: 1, home_team_id: 1, away_team_id: 2, played_at: '2026-09-15T20:00:00+01:00' },
    { id: 2, gameweek_id: 1, home_team_id: 3, away_team_id: 4, played_at: '2026-09-16T18:00:00+01:00' },
    { id: 3, gameweek_id: 1, home_team_id: 5, away_team_id: 6, played_at: '2026-09-17T19:00:00+01:00' },
  ], { onConflict: 'id' }).select()
  if (matchErr) { console.error('❌ Erreur matchs:', matchErr.message); return }
  console.log(`   ✅ ${matchesData.length} matchs insérés`)

  // 4. Insérer les joueurs
  console.log('🧑‍🤝‍🧑 Insertion des joueurs...')
  
  const allPlayers = [
    // MC Alger (1)
    { team_id: 1, name: 'O. Litim', position: 'GK', price: 5.0 },
    { team_id: 1, name: 'F. Chaal', position: 'GK', price: 4.5 },
    { team_id: 1, name: 'A. Ghezala', position: 'DEF', price: 5.5 },
    { team_id: 1, name: 'M. Hachoud', position: 'DEF', price: 5.0 },
    { team_id: 1, name: 'A. Abdellaoui', position: 'DEF', price: 6.0 },
    { team_id: 1, name: 'H. Mouali', position: 'DEF', price: 4.5 },
    { team_id: 1, name: 'R. Helaïmia', position: 'DEF', price: 5.5 },
    { team_id: 1, name: 'T. Tahar', position: 'MID', price: 6.5 },
    { team_id: 1, name: 'M. Benkhemassa', position: 'MID', price: 6.0 },
    { team_id: 1, name: 'Y. Belaïli', position: 'MID', price: 12.0 },
    { team_id: 1, name: 'Z. Draoui', position: 'MID', price: 7.0 },
    { team_id: 1, name: 'A. Bourdim', position: 'MID', price: 6.5 },
    { team_id: 1, name: 'S. Bayazid', position: 'FWD', price: 8.5 },
    { team_id: 1, name: 'A. Naidji', position: 'FWD', price: 9.0 },
    { team_id: 1, name: 'K. Merzougui', position: 'FWD', price: 7.5 },

    // CR Belouizdad (2)
    { team_id: 2, name: 'A. Guendouz', position: 'GK', price: 5.5 },
    { team_id: 2, name: "R. M'Bolhi", position: 'GK', price: 5.0 },
    { team_id: 2, name: 'M. Bouchar', position: 'DEF', price: 6.0 },
    { team_id: 2, name: 'C. Keddad', position: 'DEF', price: 5.5 },
    { team_id: 2, name: 'Y. Laouafi', position: 'DEF', price: 5.0 },
    { team_id: 2, name: 'M. Belkhiter', position: 'DEF', price: 5.0 },
    { team_id: 2, name: 'A. Bouguerra', position: 'DEF', price: 4.5 },
    { team_id: 2, name: 'H. Mrezigue', position: 'MID', price: 7.0 },
    { team_id: 2, name: 'A. Bouras', position: 'MID', price: 6.5 },
    { team_id: 2, name: 'B. Boussouf', position: 'MID', price: 8.0 },
    { team_id: 2, name: 'I. Bakir', position: 'MID', price: 7.0 },
    { team_id: 2, name: 'A. Benguit', position: 'MID', price: 6.5 },
    { team_id: 2, name: 'L. Wamba', position: 'FWD', price: 9.5 },
    { team_id: 2, name: 'O. Darfalou', position: 'FWD', price: 8.5 },
    { team_id: 2, name: 'A. Meziane', position: 'FWD', price: 9.0 },

    // JS Kabylie (3)
    { team_id: 3, name: 'G. Hadid', position: 'GK', price: 4.5 },
    { team_id: 3, name: 'C. Rahmani', position: 'GK', price: 5.0 },
    { team_id: 3, name: 'K. Bouhakak', position: 'DEF', price: 5.0 },
    { team_id: 3, name: 'B. Souyad', position: 'DEF', price: 5.5 },
    { team_id: 3, name: 'F. Nechat Djabri', position: 'DEF', price: 4.5 },
    { team_id: 3, name: 'A. Gatal', position: 'DEF', price: 4.5 },
    { team_id: 3, name: 'O. Benzaid', position: 'DEF', price: 4.5 },
    { team_id: 3, name: 'S. Boumechra', position: 'MID', price: 6.5 },
    { team_id: 3, name: 'K. Ait-Atmane', position: 'MID', price: 6.0 },
    { team_id: 3, name: 'R. Boualia', position: 'MID', price: 8.5 },
    { team_id: 3, name: 'A. Amriche', position: 'MID', price: 5.5 },
    { team_id: 3, name: 'M. Benzaid', position: 'MID', price: 5.0 },
    { team_id: 3, name: 'D. Mouaki', position: 'FWD', price: 8.0 },
    { team_id: 3, name: 'S. Msuva', position: 'FWD', price: 7.5 },
    { team_id: 3, name: 'F. Bwalya', position: 'FWD', price: 7.5 },

    // USM Alger (4)
    { team_id: 4, name: 'O. Benbot', position: 'GK', price: 6.0 },
    { team_id: 4, name: 'A. Benchelef', position: 'GK', price: 4.5 },
    { team_id: 4, name: 'Z. Belaïd', position: 'DEF', price: 6.5 },
    { team_id: 4, name: 'S. Radouani', position: 'DEF', price: 5.5 },
    { team_id: 4, name: 'H. Deghmoum', position: 'DEF', price: 5.0 },
    { team_id: 4, name: 'H. Baouche', position: 'DEF', price: 4.5 },
    { team_id: 4, name: 'N. Khoualed', position: 'DEF', price: 4.5 },
    { team_id: 4, name: 'O. Chita', position: 'MID', price: 6.0 },
    { team_id: 4, name: 'B. Benzaza', position: 'MID', price: 6.5 },
    { team_id: 4, name: 'I. Merili', position: 'MID', price: 5.5 },
    { team_id: 4, name: 'T. Orebonye', position: 'MID', price: 7.5 },
    { team_id: 4, name: 'A. Djahnit', position: 'MID', price: 6.5 },
    { team_id: 4, name: 'A. Mahious', position: 'FWD', price: 9.0 },
    { team_id: 4, name: 'I. Belkacemi', position: 'FWD', price: 8.0 },
    { team_id: 4, name: 'A. Bacha', position: 'FWD', price: 7.0 },

    // ES Sétif (5)
    { team_id: 5, name: 'Z. Bouhalfaya', position: 'GK', price: 5.0 },
    { team_id: 5, name: 'A. Osmani', position: 'GK', price: 4.0 },
    { team_id: 5, name: 'M. Ziti', position: 'DEF', price: 5.0 },
    { team_id: 5, name: 'T. Hachoud', position: 'DEF', price: 4.5 },
    { team_id: 5, name: 'D. Chaabi', position: 'DEF', price: 4.5 },
    { team_id: 5, name: 'I. Diarra', position: 'DEF', price: 5.0 },
    { team_id: 5, name: 'A. Brahimi', position: 'DEF', price: 4.5 },
    { team_id: 5, name: 'A. Kendouci', position: 'MID', price: 8.0 },
    { team_id: 5, name: 'Y. Dali', position: 'MID', price: 6.0 },
    { team_id: 5, name: 'A. Yettou', position: 'MID', price: 5.5 },
    { team_id: 5, name: 'M. Bouchama', position: 'MID', price: 5.0 },
    { team_id: 5, name: 'W. Zamoum', position: 'MID', price: 5.5 },
    { team_id: 5, name: 'A. Lahmeri', position: 'FWD', price: 7.5 },
    { team_id: 5, name: 'A. Benchoucha', position: 'FWD', price: 7.0 },
    { team_id: 5, name: 'M. Aouad', position: 'FWD', price: 6.5 },

    // CS Constantine (6)
    { team_id: 6, name: 'M. Rahmani', position: 'GK', price: 5.0 },
    { team_id: 6, name: 'K. Boussouf', position: 'GK', price: 4.0 },
    { team_id: 6, name: 'M. Zaalani', position: 'DEF', price: 5.0 },
    { team_id: 6, name: 'A. Madani', position: 'DEF', price: 5.5 },
    { team_id: 6, name: 'S. Baouche', position: 'DEF', price: 5.0 },
    { team_id: 6, name: 'C. Derradji', position: 'DEF', price: 4.5 },
    { team_id: 6, name: 'M. Guemroud', position: 'DEF', price: 4.5 },
    { team_id: 6, name: 'S. Belhocine', position: 'MID', price: 6.0 },
    { team_id: 6, name: 'A. Khaldi', position: 'MID', price: 6.5 },
    { team_id: 6, name: 'M. Benchaira', position: 'MID', price: 6.0 },
    { team_id: 6, name: 'M. Belmessaoud', position: 'MID', price: 5.5 },
    { team_id: 6, name: 'A. Chekal', position: 'MID', price: 5.5 },
    { team_id: 6, name: 'M. Temine', position: 'FWD', price: 7.0 },
    { team_id: 6, name: 'B. Dib', position: 'FWD', price: 8.5 },
    { team_id: 6, name: 'A. Belhocini', position: 'FWD', price: 7.5 },
  ]

  const { data: playersData, error: playersErr } = await supabase.from('players').upsert(allPlayers, { onConflict: 'id' }).select()
  if (playersErr) { console.error('❌ Erreur joueurs:', playersErr.message); return }
  console.log(`   ✅ ${playersData.length} joueurs insérés`)

  console.log('\n🎉 Seed terminé avec succès ! Rafraîchis ton site pour voir les joueurs.')
}

seed().catch(console.error)
