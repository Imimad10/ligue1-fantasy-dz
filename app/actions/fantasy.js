'use server'

import { createClient } from '@supabase/supabase-js'

// Using the regular client or service role if needed
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  // Note: if you want to bypass RLS entirely for server actions, you can use process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Checks if the current gameweek transfer window is open based on the deadline
 */
export async function checkTransferWindow() {
  const { data: gameweek, error } = await supabase
    .from('gameweeks')
    .select('start_date, number')
    .eq('is_current', true)
    .single()

  if (error || !gameweek) {
    // If no active gameweek is found, default to open
    return { isOpen: true }
  }

  // The deadline is considered to be the start_date of the gameweek
  const isOpen = new Date() < new Date(gameweek.start_date)
  
  return {
    isOpen,
    deadline: gameweek.start_date,
    name: `Journée ${gameweek.number}`
  }
}

/**
 * Server Action: Save the team formation (Starters / Bench / Captain)
 */
export async function saveTeamFormation(userTeamId, playersUpdate) {
  // 1. ANTI-CHEAT: Check if deadline has passed
  const windowStatus = await checkTransferWindow()
  
  if (!windowStatus.isOpen) {
    return { 
      success: false, 
      error: `La deadline pour la ${windowStatus.name} est passée. Les modifications de l'équipe sont verrouillées.` 
    }
  }

  // 2. Save changes if deadline is respected
  try {
    // Update each player's starter/bench/captain status
    for (const p of playersUpdate) {
      const { error } = await supabase
        .from('fantasy_team_players')
        .update({ 
          is_starting: p.is_starting, 
          is_captain: p.is_captain 
        })
        .eq('fantasy_team_id', userTeamId)
        .eq('player_id', p.player_id)
        
      if (error) throw error;
    }

    return { success: true }
  } catch (err) {
    console.error('Error saving team:', err)
    return { success: false, error: err.message }
  }
}
