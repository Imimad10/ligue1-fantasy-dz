'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { checkTransferWindow, saveTeamFormation } from '../actions/fantasy'

export default function MyTeamPage() {
  const [user, setUser] = useState(null)
  const [fantasyTeam, setFantasyTeam] = useState(null)
  const [teamPlayers, setTeamPlayers] = useState([])
  const [playerStatsMap, setPlayerStatsMap] = useState({})
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [isLocked, setIsLocked] = useState(false)
  const [gwName, setGwName] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push('/auth')
        return
      }
      setUser(session.user)
      loadTeam(session.user.id)
    })
  }, [])

  const loadTeam = async (userId) => {
    // Récupérer l'équipe fantasy la plus récente
    const { data: ft, error: ftErr } = await supabase
      .from('fantasy_teams')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1)
      .single()

    if (ftErr || !ft) {
      setLoading(false)
      return
    }

    setFantasyTeam(ft)

    // Récupérer les joueurs de cette équipe avec les détails
    const { data: ftp } = await supabase
      .from('fantasy_team_players')
      .select('*, players(*)')
      .eq('fantasy_team_id', ft.id)

    if (ftp) setTeamPlayers(ftp)

    // Récupérer les points des joueurs (synchronisation automatique si non calculés)
    let { data: statsData } = await supabase.from('player_gameweek_stats').select('player_id, points')
    if (!statsData || statsData.length === 0) {
      try {
        await fetch('/api/cron/sync-points')
        const { data: freshStats } = await supabase.from('player_gameweek_stats').select('player_id, points')
        statsData = freshStats
      } catch (err) {
        console.error("Auto-sync error:", err)
      }
    }

    if (statsData) {
      const statsMap = {}
      statsData.forEach(s => {
        statsMap[s.player_id] = (statsMap[s.player_id] || 0) + (s.points || 0)
      })
      setPlayerStatsMap(statsMap)
    }

    // Check if the gameweek window is open
    const windowStatus = await checkTransferWindow()
    setIsLocked(!windowStatus.isOpen)
    if (windowStatus.name) setGwName(windowStatus.name)

    setLoading(false)
  }

  // Intervertir deux joueurs (Titulaire <-> Remplaçant)
  const handleSelectPlayer = (tp) => {
    if (isLocked) {
      setMessage(`🔒 L'équipe est verrouillée pour la ${gwName}. Modifications impossibles.`)
      return
    }
    if (!selectedPlayer) {
      setSelectedPlayer(tp)
      return
    }

    if (selectedPlayer.id === tp.id) {
      setSelectedPlayer(null)
      return
    }

    // Permuter is_starting entre selectedPlayer et tp
    const updated = teamPlayers.map(p => {
      if (p.id === selectedPlayer.id) return { ...p, is_starting: tp.is_starting }
      if (p.id === tp.id) return { ...p, is_starting: selectedPlayer.is_starting }
      return p
    })

    setTeamPlayers(updated)
    setSelectedPlayer(null)
    setMessage("🔄 Changement effectué ! N'oublie pas de sauvegarder la composition.")
  }

  // Définir le capitaine
  const handleSetCaptain = (tpId, e) => {
    e.stopPropagation()
    if (isLocked) {
      setMessage(`🔒 Capitaine verrouillé pour la ${gwName}.`)
      return
    }
    const updated = teamPlayers.map(p => ({
      ...p,
      is_captain: p.id === tpId
    }))
    setTeamPlayers(updated)
    setMessage("👑 Capitaine mis à jour ! N'oublie pas de sauvegarder.")
  }

  // Sauvegarder la composition
  const handleSaveComposition = async () => {
    setSaving(true)
    setMessage(null)

    // Check count of starting players = 11
    const startingCount = teamPlayers.filter(p => p.is_starting).length
    if (startingCount !== 11) {
      setMessage(`❌ Ta composition doit comporter exactement 11 titulaires (actuellement : ${startingCount}).`)
      setSaving(false)
      return
    }

    // Call the server action with deadline validation
    const updatedPlayersList = teamPlayers.map(p => ({
      player_id: p.player_id,
      is_starting: p.is_starting,
      is_captain: p.is_captain,
      bench_order: p.is_starting ? null : 1 // simplified for now, would need a real UI for bench ordering
    }))

    const res = await saveTeamFormation(fantasyTeam.id, updatedPlayersList)

    if (!res.success) {
      setMessage(`❌ Erreur: ${res.error}`)
    } else {
      setMessage("✅ Composition sauvegardée avec succès !")
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <main style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>⏳ Chargement de ton équipe...</p>
      </main>
    )
  }

  if (!fantasyTeam) {
    return (
      <main style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div className="glass-panel">
          <h1 style={{ marginBottom: '1rem' }}>🏟️ Mon Équipe</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Tu n'as pas encore créé d'équipe fantasy.
          </p>
          <button className="btn" style={{ padding: '1rem 2rem' }} onClick={() => router.push('/')}>
            ⚽ Composer mon équipe
          </button>
        </div>
      </main>
    )
  }

  const starters = teamPlayers.filter((p) => p.is_starting)
  const subs = teamPlayers.filter((p) => !p.is_starting)
  
  // Calculate total points
  const totalTeamPoints = teamPlayers.reduce((acc, p) => {
    if (!p.is_starting) return acc
    const pPts = playerStatsMap[p.player_id] || 0
    return acc + (p.is_captain ? pPts * 2 : pPts)
  }, 0)

  const startersByPos = {
    GK: starters.filter((p) => p.players?.position === 'GK'),
    DEF: starters.filter((p) => p.players?.position === 'DEF'),
    MID: starters.filter((p) => p.players?.position === 'MID'),
    FWD: starters.filter((p) => p.players?.position === 'FWD'),
  }

  const positionLabels = { GK: 'Gardien', DEF: 'Défenseurs', MID: 'Milieux', FWD: 'Attaquants' }

  return (
    <main style={{ padding: '2rem 1rem', maxWidth: '950px', margin: '0 auto' }}>
      
      {/* En-tête de l'équipe */}
      <div className="glass-panel" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '1.8rem', margin: 0 }}>🏟️ {fantasyTeam.name}</h1>
            <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>Gère ta composition et effectue des remplacements</p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Points Total</span>
              <h2 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.6rem' }}>⚽ {totalTeamPoints} pts</h2>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Budget</span>
              <h3 style={{ color: 'var(--accent)', margin: 0 }}>💰 {Number(fantasyTeam.budget).toFixed(1)}M</h3>
            </div>
            <button
              onClick={handleSaveComposition}
              disabled={saving || isLocked}
              className="btn"
              style={{ 
                padding: '0.7rem 1.4rem', 
                fontSize: '0.9rem',
                opacity: isLocked ? 0.5 : 1,
                cursor: isLocked ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? '⏳ Enregistrement...' : isLocked ? '🔒 Verrouillé' : '💾 Sauvegarder 11'}
            </button>
          </div>
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

      {isLocked && !message && (
        <div style={{
          padding: '1rem', marginBottom: '1.5rem', borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171', fontWeight: 600, textAlign: 'center'
        }}>
          🔒 La deadline pour la {gwName} est passée. Votre composition et votre capitaine sont verrouillés jusqu'à la fin de la journée.
        </div>
      )}

      {selectedPlayer && (
        <div style={{
          padding: '0.8rem 1.2rem',
          marginBottom: '1.5rem',
          borderRadius: '10px',
          background: 'rgba(59, 130, 246, 0.2)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          color: '#60a5fa',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <span>👆 Joueur sélectionné : <strong>{selectedPlayer.players?.name}</strong>. Clique sur un autre joueur pour procéder à l'échange.</span>
          <button onClick={() => setSelectedPlayer(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Annuler</button>
        </div>
      )}

      {/* Terrain de Football - Titulaires */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>📋 Titulaires (11)</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>💡 Clique sur un joueur pour l'échanger ou le nommer Capitaine (C)</span>
      </div>

      <div className="glass-panel" style={{
        marginBottom: '2rem',
        background: 'linear-gradient(180deg, rgba(20, 40, 30, 0.6) 0%, rgba(10, 25, 20, 0.8) 100%)',
        border: '1px solid rgba(0, 255, 135, 0.15)',
        position: 'relative',
      }}>
        {['FWD', 'MID', 'DEF', 'GK'].map((pos) => (
          <div key={pos} style={{ marginBottom: pos !== 'GK' ? '1.8rem' : 0 }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              {positionLabels[pos]}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {startersByPos[pos].map((p) => {
                const isSelected = selectedPlayer?.id === p.id
                const pPts = playerStatsMap[p.player_id] || 0
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPlayer(p)}
                    style={{
                      flex: '1 1 140px',
                      maxWidth: '180px',
                      background: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0,0,0,0.4)',
                      border: isSelected ? '2px solid #60a5fa' : p.is_captain ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      padding: '0.8rem 0.5rem',
                      textAlign: 'center',
                      position: 'relative',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 0 15px rgba(96, 165, 250, 0.4)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* Badge Capitaine */}
                    {(!isLocked || p.is_captain) && (
                      <button
                        onClick={(e) => handleSetCaptain(p.id, e)}
                        title="Définir comme Capitaine"
                      style={{
                        position: 'absolute', top: '-8px', right: '-8px',
                        background: p.is_captain ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                        color: p.is_captain ? '#000' : '#fff',
                        border: 'none',
                        borderRadius: '50%', width: '24px', height: '24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
                      }}
                    >
                      C
                    </button>
                  )}

                    <div style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>
                      {pos === 'GK' ? '🧤' : pos === 'DEF' ? '🛡️' : pos === 'MID' ? '🎯' : '⚡'}
                    </div>
                    <strong style={{ fontSize: '0.85rem', display: 'block', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.players?.name}
                    </strong>
                    
                    <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <span className={`badge ${pos}`}>{pos}</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                        {p.is_captain ? pPts * 2 : pPts} pts {p.is_captain && '(x2)'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Remplaçants (4) */}
      <h2 style={{ marginBottom: '1rem' }}>🔄 Remplaçants (4)</h2>
      <div className="glass-panel">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {subs.map((p) => {
            const isSelected = selectedPlayer?.id === p.id
            const pPts = playerStatsMap[p.player_id] || 0
            return (
              <div
                key={p.id}
                onClick={() => handleSelectPlayer(p)}
                style={{
                  flex: '1 1 200px',
                  background: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.03)',
                  border: isSelected ? '2px solid #60a5fa' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '0.8rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{p.players?.name}</strong>
                  <div style={{ marginTop: '0.2rem' }}>
                    <span className={`badge ${p.players?.position}`}>{p.players?.position}</span>
                    <span style={{ marginLeft: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.players?.price}M</span>
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {pPts} pts
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
