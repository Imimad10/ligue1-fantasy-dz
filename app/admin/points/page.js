'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminPointsPage() {
  const [gameweeks, setGameweeks] = useState([])
  const [selectedGw, setSelectedGw] = useState(1)
  const [players, setPlayers] = useState([])
  const [teamsMap, setTeamsMap] = useState({})
  const [stats, setStats] = useState({}) // { [playerId]: { minutes_played, goals, assists, clean_sheet, yellow_cards, red_cards, points } }
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedGw && players.length > 0) {
      fetchGameweekStats(selectedGw)
    }
  }, [selectedGw, players])

  const fetchInitialData = async () => {
    setLoading(true)
    // Fetch Teams
    const { data: teamsData } = await supabase.from('teams').select('*')
    const tMap = {}
    teamsData?.forEach(t => tMap[t.id] = t.name)
    setTeamsMap(tMap)

    // Fetch Gameweeks
    const { data: gwData } = await supabase.from('gameweeks').select('*').order('number', { ascending: true })
    if (gwData && gwData.length > 0) {
      setGameweeks(gwData)
      const current = gwData.find(g => g.is_current) || gwData[0]
      setSelectedGw(current.number)
    }

    // Fetch Players
    const { data: playersData } = await supabase.from('players').select('*').order('team_id', { ascending: true })
    if (playersData) {
      setPlayers(playersData)
    }

    setLoading(false)
  }

  const fetchGameweekStats = async (gwNumber) => {
    const gwObj = gameweeks.find(g => g.number === gwNumber)
    if (!gwObj) return

    const { data: statsData } = await supabase
      .from('player_gameweek_stats')
      .select('*')
      .eq('gameweek_id', gwObj.id)

    const initialStats = {}
    players.forEach(p => {
      const existing = statsData?.find(s => s.player_id === p.id)
      if (existing) {
        initialStats[p.id] = {
          minutes_played: existing.minutes_played || 0,
          goals: existing.goals || 0,
          assists: existing.assists || 0,
          clean_sheet: existing.clean_sheet || false,
          yellow_cards: existing.yellow_cards || 0,
          red_cards: existing.red_cards || 0,
          points: existing.points || 0
        }
      } else {
        initialStats[p.id] = {
          minutes_played: 0,
          goals: 0,
          assists: 0,
          clean_sheet: false,
          yellow_cards: 0,
          red_cards: 0,
          points: 0
        }
      }
    })
    setStats(initialStats)
  }

  const calculatePoints = (position, pStats) => {
    let pts = 0
    const mins = pStats.minutes_played || 0
    if (mins >= 60) pts += 2
    else if (mins > 0) pts += 1

    const goals = pStats.goals || 0
    if (position === 'GK' || position === 'DEF') pts += goals * 6
    else if (position === 'MID') pts += goals * 5
    else if (position === 'FWD') pts += goals * 4

    const assists = pStats.assists || 0
    pts += assists * 3

    if (pStats.clean_sheet && mins >= 60) {
      if (position === 'GK' || position === 'DEF') pts += 4
      else if (position === 'MID') pts += 1
    }

    pts -= (pStats.yellow_cards || 0) * 1
    pts -= (pStats.red_cards || 0) * 3

    return pts
  }

  const handleStatChange = (playerId, field, value) => {
    const player = players.find(p => p.id === playerId)
    setStats(prev => {
      const currentPStats = { ...prev[playerId], [field]: value }
      const newPts = calculatePoints(player.position, currentPStats)
      return {
        ...prev,
        [playerId]: { ...currentPStats, points: newPts }
      }
    })
  }

  // Presets de Vrais Matchs Réels Ligue 1 DZ
  const handleLoadRealMatchResults = () => {
    const newStats = {}
    
    // Initialiser tous les joueurs à 0
    players.forEach(p => {
      newStats[p.id] = {
        minutes_played: 0,
        goals: 0,
        assists: 0,
        clean_sheet: false,
        yellow_cards: 0,
        red_cards: 0,
        points: 0
      }
    })

    // Match 1: MC Alger (2) - (0) CR Belouizdad
    // MCA: Belaïli (1 goal + 1 assist), Naidji (1 goal), Litim (GK, CS), Abdellaoui (DEF, CS), Ghezala (DEF, CS), Hachoud (DEF, CS)
    players.forEach(p => {
      if (p.name === 'Y. Belaïli') {
        newStats[p.id] = { minutes_played: 90, goals: 1, assists: 1, clean_sheet: false, yellow_cards: 0, red_cards: 0 }
      } else if (p.name === 'A. Naidji') {
        newStats[p.id] = { minutes_played: 85, goals: 1, assists: 0, clean_sheet: false, yellow_cards: 0, red_cards: 0 }
      } else if (['O. Litim', 'A. Abdellaoui', 'A. Ghezala', 'M. Hachoud', 'R. Helaïmia'].includes(p.name)) {
        newStats[p.id] = { minutes_played: 90, goals: 0, assists: 0, clean_sheet: true, yellow_cards: 0, red_cards: 0 }
      } else if (['T. Tahar', 'M. Benkhemassa', 'Z. Draoui'].includes(p.name)) {
        newStats[p.id] = { minutes_played: 90, goals: 0, assists: 0, clean_sheet: false, yellow_cards: 1, red_cards: 0 }
      } else if (p.team_id === 2) {
        // CR Belouizdad - 0 goal, 90 mins pour les titulaires
        if (['L. Wamba', 'A. Meziane', 'H. Mrezigue', 'A. Guendouz', 'M. Bouchar', 'C. Keddad'].includes(p.name)) {
          newStats[p.id] = { minutes_played: 90, goals: 0, assists: 0, clean_sheet: false, yellow_cards: 0, red_cards: 0 }
        }
      }

      // Match 2: JS Kabylie (1) - (1) USM Alger
      else if (p.name === 'R. Boualia') {
        newStats[p.id] = { minutes_played: 90, goals: 1, assists: 0, clean_sheet: false, yellow_cards: 0, red_cards: 0 }
      } else if (p.name === 'D. Mouaki') {
        newStats[p.id] = { minutes_played: 75, goals: 0, assists: 1, clean_sheet: false, yellow_cards: 0, red_cards: 0 }
      } else if (p.name === 'A. Mahious') {
        newStats[p.id] = { minutes_played: 90, goals: 1, assists: 0, clean_sheet: false, yellow_cards: 0, red_cards: 0 }
      } else if (p.name === 'Z. Belaïd') {
        newStats[p.id] = { minutes_played: 90, goals: 0, assists: 1, clean_sheet: false, yellow_cards: 1, red_cards: 0 }
      } else if (['C. Rahmani', 'K. Bouhakak', 'B. Souyad', 'O. Benbot', 'S. Radouani'].includes(p.name)) {
        newStats[p.id] = { minutes_played: 90, goals: 0, assists: 0, clean_sheet: false, yellow_cards: 0, red_cards: 0 }
      }

      // Match 3: ES Sétif (1) - (0) CS Constantine
      else if (p.name === 'A. Kendouci') {
        newStats[p.id] = { minutes_played: 90, goals: 1, assists: 0, clean_sheet: true, yellow_cards: 0, red_cards: 0 }
      } else if (p.name === 'A. Lahmeri') {
        newStats[p.id] = { minutes_played: 80, goals: 0, assists: 1, clean_sheet: false, yellow_cards: 0, red_cards: 0 }
      } else if (['Z. Bouhalfaya', 'M. Ziti', 'T. Hachoud', 'D. Chaabi'].includes(p.name)) {
        newStats[p.id] = { minutes_played: 90, goals: 0, assists: 0, clean_sheet: true, yellow_cards: 0, red_cards: 0 }
      } else if (['M. Rahmani', 'M. Zaalani', 'A. Madani', 'B. Dib', 'M. Temine'].includes(p.name)) {
        newStats[p.id] = { minutes_played: 90, goals: 0, assists: 0, clean_sheet: false, yellow_cards: 1, red_cards: 0 }
      }

      // Calcul des points selon poste
      newStats[p.id].points = calculatePoints(p.position, newStats[p.id])
    })

    setStats(newStats)
    setMessage("⚽ Résultats réels des matchs de Ligue 1 DZ chargés (ex: MC Alger 2-0 CRB, JSK 1-1 USMA, ESS 1-0 CSC) !")
    return newStats
  }

  const handleSimulateAll = () => {
    const newStats = {}
    players.forEach(p => {
      const played = Math.random() < 0.8
      const minutes = played ? (Math.random() < 0.85 ? 90 : Math.floor(Math.random() * 45) + 15) : 0
      const goals = (played && Math.random() < (p.position === 'FWD' ? 0.35 : p.position === 'MID' ? 0.2 : 0.05)) ? 1 : 0
      const assists = (played && Math.random() < 0.2) ? 1 : 0
      const clean_sheet = (played && minutes >= 60 && Math.random() < 0.4)
      const yellow = (played && Math.random() < 0.15) ? 1 : 0
      const red = (played && Math.random() < 0.02) ? 1 : 0

      const pStats = {
        minutes_played: minutes,
        goals,
        assists,
        clean_sheet,
        yellow_cards: yellow,
        red_cards: red
      }

      pStats.points = calculatePoints(p.position, pStats)
      newStats[p.id] = pStats
    })

    setStats(newStats)
    setMessage("🎲 Stats simulées ! N'oublie pas d'enregistrer.")
    return newStats
  }

  const handleSimulateAndSave = async () => {
    setSaving(true)
    const computedStats = handleLoadRealMatchResults()
    
    const gwObj = gameweeks.find(g => g.number === selectedGw)
    if (!gwObj) return

    const rowsToUpsert = players.map(p => ({
      player_id: p.id,
      gameweek_id: gwObj.id,
      minutes_played: computedStats[p.id]?.minutes_played || 0,
      goals: computedStats[p.id]?.goals || 0,
      assists: computedStats[p.id]?.assists || 0,
      clean_sheet: computedStats[p.id]?.clean_sheet || false,
      yellow_cards: computedStats[p.id]?.yellow_cards || 0,
      red_cards: computedStats[p.id]?.red_cards || 0,
      points: computedStats[p.id]?.points || 0
    }))

    const { error } = await supabase
      .from('player_gameweek_stats')
      .upsert(rowsToUpsert, { onConflict: 'player_id,gameweek_id' })

    setSaving(false)
    if (error) {
      setMessage("❌ Erreur lors du calcul des matchs réels : " + error.message)
    } else {
      setMessage("⚽ Résultats des matchs réels FPL calculés et enregistrés avec succès pour la Journée " + selectedGw + " !")
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    const gwObj = gameweeks.find(g => g.number === selectedGw)
    if (!gwObj) return

    const rowsToUpsert = players.map(p => ({
      player_id: p.id,
      gameweek_id: gwObj.id,
      minutes_played: stats[p.id]?.minutes_played || 0,
      goals: stats[p.id]?.goals || 0,
      assists: stats[p.id]?.assists || 0,
      clean_sheet: stats[p.id]?.clean_sheet || false,
      yellow_cards: stats[p.id]?.yellow_cards || 0,
      red_cards: stats[p.id]?.red_cards || 0,
      points: stats[p.id]?.points || 0
    }))

    const { error } = await supabase
      .from('player_gameweek_stats')
      .upsert(rowsToUpsert, { onConflict: 'player_id,gameweek_id' })

    setSaving(false)
    if (error) {
      setMessage("❌ Erreur lors de l'enregistrement : " + error.message)
    } else {
      setMessage("✅ Points et stats enregistrés avec succès pour la Journée " + selectedGw + " !")
    }
  }

  if (loading) {
    return <main style={{ padding: '3rem', textAlign: 'center' }}>⏳ Chargement du panneau Admin...</main>
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🎯 Admin — Calcul des Points Par Journée
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Saisis les performances réelles ou simule les résultats des matchs.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontWeight: 600 }}>Journée :</label>
          <select
            value={selectedGw}
            onChange={(e) => setSelectedGw(Number(e.target.value))}
            style={{
              padding: '0.6rem 1rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-main)',
              borderRadius: '8px',
              fontWeight: 600,
            }}
          >
            {gameweeks.map(g => (
              <option key={g.id} value={g.number} style={{ background: '#0a0e17' }}>
                Journée {g.number} {g.is_current ? '(En cours)' : ''}
              </option>
            ))}
          </select>

          <button
            onClick={handleSimulateAndSave}
            disabled={saving}
            style={{
              background: 'linear-gradient(135deg, #00ff87 0%, #38bdf8 100%)',
              color: '#000',
              border: 'none',
              padding: '0.6rem 1.3rem',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0, 255, 135, 0.3)',
            }}
          >
            {saving ? '⏳ Calcul des vrais matchs...' : '⚽ Calculer Vrais Matchs FPL'}
          </button>

          <button
            onClick={handleSimulateAll}
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#60a5fa',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🎲 Simuler
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn"
            style={{ padding: '0.6rem 1.5rem', fontSize: '0.95rem' }}
          >
            {saving ? '⏳ Enregistrement...' : '💾 Sauvegarder les Points'}
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: '10px',
          background: message.includes('❌') ? 'rgba(239,68,68,0.15)' : 'rgba(0,255,135,0.15)',
          border: message.includes('❌') ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(0,255,135,0.3)',
          color: message.includes('❌') ? '#f87171' : 'var(--primary)',
          fontWeight: 600,
        }}>
          {message}
        </div>
      )}

      {/* Tableau des joueurs */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '0.8rem' }}>JOUEUR</th>
              <th style={{ padding: '0.8rem' }}>POSTE</th>
              <th style={{ padding: '0.8rem' }}>CLUB</th>
              <th style={{ padding: '0.8rem' }}>MINUTES</th>
              <th style={{ padding: '0.8rem' }}>BUTS</th>
              <th style={{ padding: '0.8rem' }}>PASSES D.</th>
              <th style={{ padding: '0.8rem' }}>CLEAN SHEET</th>
              <th style={{ padding: '0.8rem' }}>🟨 JAUNE</th>
              <th style={{ padding: '0.8rem' }}>🟥 ROUGE</th>
              <th style={{ padding: '0.8rem', textAlign: 'right' }}>POINTS TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {players.map(p => {
              const pStat = stats[p.id] || {}
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                  <td style={{ padding: '0.8rem', fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: '0.8rem' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                      background: p.position === 'GK' ? '#eab308' : p.position === 'DEF' ? '#3b82f6' : p.position === 'MID' ? '#10b981' : '#ef4444',
                      color: '#000'
                    }}>
                      {p.position}
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem', color: 'var(--text-muted)' }}>{teamsMap[p.team_id] || '-'}</td>
                  
                  {/* Inputs */}
                  <td style={{ padding: '0.8rem' }}>
                    <input
                      type="number"
                      min="0"
                      max="90"
                      value={pStat.minutes_played ?? 0}
                      onChange={(e) => handleStatChange(p.id, 'minutes_played', Number(e.target.value))}
                      style={{ width: '60px', padding: '0.3rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </td>
                  <td style={{ padding: '0.8rem' }}>
                    <input
                      type="number"
                      min="0"
                      value={pStat.goals ?? 0}
                      onChange={(e) => handleStatChange(p.id, 'goals', Number(e.target.value))}
                      style={{ width: '50px', padding: '0.3rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </td>
                  <td style={{ padding: '0.8rem' }}>
                    <input
                      type="number"
                      min="0"
                      value={pStat.assists ?? 0}
                      onChange={(e) => handleStatChange(p.id, 'assists', Number(e.target.value))}
                      style={{ width: '50px', padding: '0.3rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </td>
                  <td style={{ padding: '0.8rem' }}>
                    <input
                      type="checkbox"
                      checked={!!pStat.clean_sheet}
                      onChange={(e) => handleStatChange(p.id, 'clean_sheet', e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '0.8rem' }}>
                    <input
                      type="number"
                      min="0"
                      max="2"
                      value={pStat.yellow_cards ?? 0}
                      onChange={(e) => handleStatChange(p.id, 'yellow_cards', Number(e.target.value))}
                      style={{ width: '50px', padding: '0.3rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </td>
                  <td style={{ padding: '0.8rem' }}>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      value={pStat.red_cards ?? 0}
                      onChange={(e) => handleStatChange(p.id, 'red_cards', Number(e.target.value))}
                      style={{ width: '50px', padding: '0.3rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </td>

                  {/* Calculated Points */}
                  <td style={{ padding: '0.8rem', textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', color: (pStat.points || 0) > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {pStat.points || 0} pts
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
