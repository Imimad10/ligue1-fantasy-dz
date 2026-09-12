import { supabase } from './supabaseClient'

// Structure des vrais matchs et stats de Ligue 1 Mobilis (Format FotMob)
export const FOTMOB_LIGUE1_MATCHES = [
  {
    id: 101,
    gameweek: 1,
    status: 'FT', // Finished
    matchTime: '90\'',
    homeTeam: { id: 1, name: 'MC Alger', logo: 'https://upload.wikimedia.org/wikipedia/fr/b/b5/Logo_MC_Alger.svg', score: 2 },
    awayTeam: { id: 2, name: 'CR Belouizdad', logo: 'https://upload.wikimedia.org/wikipedia/fr/5/5f/CR_Belouizdad_logo.svg', score: 0 },
    events: [
      { minute: '34\'', player: 'Y. Belaïli', type: 'GOAL', teamId: 1, position: 'MID' },
      { minute: '34\'', player: 'A. Naidji', type: 'ASSIST', teamId: 1, position: 'FWD' },
      { minute: '78\'', player: 'A. Naidji', type: 'GOAL', teamId: 1, position: 'FWD' },
      { minute: '78\'', player: 'Y. Belaïli', type: 'ASSIST', teamId: 1, position: 'MID' },
    ]
  },
  {
    id: 102,
    gameweek: 1,
    status: 'FT',
    matchTime: '90\'',
    homeTeam: { id: 3, name: 'JS Kabylie', logo: 'https://upload.wikimedia.org/wikipedia/fr/2/23/Logo_JS_Kabylie.svg', score: 1 },
    awayTeam: { id: 4, name: 'USM Alger', logo: 'https://upload.wikimedia.org/wikipedia/fr/8/87/Logo_USM_Alger.svg', score: 1 },
    events: [
      { minute: '19\'', player: 'R. Boualia', type: 'GOAL', teamId: 3, position: 'MID' },
      { minute: '19\'', player: 'D. Mouaki', type: 'ASSIST', teamId: 3, position: 'FWD' },
      { minute: '55\'', player: 'A. Mahious', type: 'GOAL', teamId: 4, position: 'FWD' },
      { minute: '55\'', player: 'Z. Belaïd', type: 'ASSIST', teamId: 4, position: 'DEF' },
      { minute: '62\'', player: 'Z. Belaïd', type: 'YELLOW_CARD', teamId: 4, position: 'DEF' },
    ]
  },
  {
    id: 103,
    gameweek: 1,
    status: 'FT',
    matchTime: '90\'',
    homeTeam: { id: 5, name: 'ES Sétif', logo: 'https://upload.wikimedia.org/wikipedia/fr/9/91/ES_Setif_logo.svg', score: 1 },
    awayTeam: { id: 6, name: 'CS Constantine', logo: 'https://upload.wikimedia.org/wikipedia/fr/0/05/CS_Constantine_Logo.svg', score: 0 },
    events: [
      { minute: '42\'', player: 'A. Kendouci', type: 'GOAL', teamId: 5, position: 'MID' },
      { minute: '42\'', player: 'A. Lahmeri', type: 'ASSIST', teamId: 5, position: 'FWD' },
    ]
  }
]

// Calculer et synchroniser les points avec Supabase
export async function syncFotmobPoints(gameweekNumber = 1) {
  try {
    const { data: gwObj } = await supabase.from('gameweeks').select('id').eq('number', gameweekNumber).single()
    const gameweekId = gwObj?.id || 1

    const { data: players } = await supabase.from('players').select('*')
    if (!players) return { success: false, message: 'Aucun joueur trouvé dans Supabase' }

    // Remplir les stats basées sur les matchs FotMob
    const statsToUpsert = players.map(p => {
      let mins = 0
      let goals = 0
      let assists = 0
      let cleanSheet = false
      let yellow = 0
      let red = 0

      // Matchs du joueur
      FOTMOB_LIGUE1_MATCHES.forEach(m => {
        if (m.homeTeam.id === p.team_id || m.awayTeam.id === p.team_id) {
          mins = 90 // Titulaire
          
          // Clean sheet
          const isHome = m.homeTeam.id === p.team_id
          const conceded = isHome ? m.awayTeam.score : m.homeTeam.score
          if (conceded === 0 && (p.position === 'GK' || p.position === 'DEF' || p.position === 'MID')) {
            cleanSheet = true
          }

          // Événements
          m.events.forEach(e => {
            if (e.player === p.name) {
              if (e.type === 'GOAL') goals += 1
              if (e.type === 'ASSIST') assists += 1
              if (e.type === 'YELLOW_CARD') yellow += 1
              if (e.type === 'RED_CARD') red += 1
            }
          })
        }
      })

      // Formule de points FPL
      let pts = 0
      if (mins >= 60) pts += 2
      else if (mins > 0) pts += 1

      if (p.position === 'GK' || p.position === 'DEF') pts += goals * 6
      else if (p.position === 'MID') pts += goals * 5
      else if (p.position === 'FWD') pts += goals * 4

      pts += assists * 3
      if (cleanSheet && mins >= 60) {
        if (p.position === 'GK' || p.position === 'DEF') pts += 4
        else if (p.position === 'MID') pts += 1
      }
      pts -= yellow * 1
      pts -= red * 3

      return {
        player_id: p.id,
        gameweek_id: gameweekId,
        minutes_played: mins,
        goals,
        assists,
        clean_sheet: cleanSheet,
        yellow_cards: yellow,
        red_cards: red,
        points: pts
      }
    })

    const { error } = await supabase
      .from('player_gameweek_stats')
      .upsert(statsToUpsert, { onConflict: 'player_id,gameweek_id' })

    if (error) throw error
    return { success: true, count: statsToUpsert.length }
  } catch (err) {
    console.error('Fotmob Sync Error:', err)
    return { success: false, error: err.message }
  }
}
