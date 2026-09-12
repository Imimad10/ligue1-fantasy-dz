'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [gameweeks, setGameweeks] = useState([])
  const [selectedGw, setSelectedGw] = useState('all') // 'all' or gameweek number
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboardData()
  }, [selectedGw])

  const fetchLeaderboardData = async () => {
    setLoading(true)

    // Fetch Gameweeks
    const { data: gwData } = await supabase.from('gameweeks').select('*').order('number', { ascending: true })
    if (gwData) setGameweeks(gwData)

    // Fetch All Fantasy Teams with Profiles
    const { data: teamsData, error: teamsError } = await supabase
      .from('fantasy_teams')
      .select('id, name, budget, user_id, profiles(username)')

    if (teamsError || !teamsData) {
      setLoading(false)
      return
    }

    // Fetch All Fantasy Team Players
    const { data: teamPlayersData } = await supabase
      .from('fantasy_team_players')
      .select('fantasy_team_id, player_id, is_starting, is_captain, gameweek_id')

    // Fetch All Player Stats
    let statsQuery = supabase.from('player_gameweek_stats').select('player_id, gameweek_id, points')
    if (selectedGw !== 'all') {
      const gwObj = gwData?.find(g => g.number === Number(selectedGw))
      if (gwObj) {
        statsQuery = statsQuery.eq('gameweek_id', gwObj.id)
      }
    }
    let { data: statsData } = await statsQuery
    if (!statsData || statsData.length === 0) {
      try {
        await fetch('/api/cron/sync-points')
        const { data: freshData } = await statsQuery
        statsData = freshData
      } catch (err) {
        console.error("Leaderboard auto-sync error:", err)
      }
    }

    // Calculate score for each team
    const rankedTeams = teamsData.map(team => {
      const playersInTeam = teamPlayersData?.filter(tp => tp.fantasy_team_id === team.id) || []
      
      let totalPts = 0

      playersInTeam.forEach(tp => {
        // Only starting players count towards score
        if (tp.is_starting) {
          // Find stats for this player
          const playerStatsList = statsData?.filter(s => s.player_id === tp.player_id) || []
          
          playerStatsList.forEach(stat => {
            let pts = stat.points || 0
            if (tp.is_captain) {
              pts *= 2 // Captain gets 2x points
            }
            totalPts += pts
          })
        }
      })

      return {
        id: team.id,
        name: team.name,
        username: team.profiles?.username || 'Inconnu',
        budget: team.budget,
        totalPoints: totalPts
      }
    })

    // Sort descending by totalPoints
    rankedTeams.sort((a, b) => b.totalPoints - a.totalPoints)
    setLeaderboard(rankedTeams)
    setLoading(false)
  }

  const getRankBadge = (index) => {
    if (index === 0) return '🥇 1er'
    if (index === 1) return '🥈 2e'
    if (index === 2) return '🥉 3e'
    return `#${index + 1}`
  }

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🏆 Classement Général
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Découvre les meilleures équipes de la ligue Ligue 1 Fantasy DZ</p>
        </div>

        {/* Filtre Gameweek */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <label style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Période :</label>
          <select
            value={selectedGw}
            onChange={(e) => setSelectedGw(e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-main)',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="all" style={{ background: '#0a0e17' }}>Toutes les Journées (Général)</option>
            {gameweeks.map(g => (
              <option key={g.id} value={g.number} style={{ background: '#0a0e17' }}>
                Journée {g.number} {g.is_current ? '(Actuelle)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          ⏳ Calcul du classement...
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Aucune équipe n'a été créée pour le moment.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem 0.8rem' }}>RANG</th>
                <th style={{ padding: '1rem 0.8rem' }}>ÉQUIPE</th>
                <th style={{ padding: '1rem 0.8rem' }}>MANAGER</th>
                <th style={{ padding: '1rem 0.8rem', textAlign: 'right' }}>POINTS TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((team, index) => {
                const isPodium = index < 3
                return (
                  <tr
                    key={team.id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: index === 0 ? 'rgba(234, 179, 8, 0.08)' : index === 1 ? 'rgba(148, 163, 184, 0.08)' : index === 2 ? 'rgba(180, 83, 9, 0.08)' : 'transparent',
                      transition: 'background 0.2s',
                    }}
                  >
                    <td style={{ padding: '1rem 0.8rem', fontWeight: 800, fontSize: isPodium ? '1.1rem' : '0.95rem' }}>
                      {getRankBadge(index)}
                    </td>
                    <td style={{ padding: '1rem 0.8rem', fontWeight: 700, fontSize: '1rem', color: isPodium ? '#fff' : 'var(--text-main)' }}>
                      {team.name}
                    </td>
                    <td style={{ padding: '1rem 0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                      👤 {team.username}
                    </td>
                    <td style={{ padding: '1rem 0.8rem', textAlign: 'right', fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>
                      {team.totalPoints} pts
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
