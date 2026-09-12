'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function MarketPage() {
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [teamName, setTeamName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)
  const router = useRouter()

  // Filtres
  const [search, setSearch] = useState('')
  const [filterPos, setFilterPos] = useState('ALL')
  const [filterClub, setFilterClub] = useState('ALL')
  const [sortBy, setSortBy] = useState('price_desc')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch('/api/players')
        const data = await res.json()
        if (data.players && data.players.length > 0) setPlayers(data.players)
        if (data.teams && data.teams.length > 0) setTeams(data.teams)
      } catch (err) {
        console.error("API players load error, trying Supabase direct:", err)
        const [playersRes, teamsRes] = await Promise.all([
          supabase.from('players').select('*').order('price', { ascending: false }),
          supabase.from('teams').select('*').order('name')
        ])
        if (playersRes.data) setPlayers(playersRes.data)
        if (teamsRes.data) setTeams(teamsRes.data)
      }
      setLoading(false)
    }
    fetchData()

    // Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadExistingUserTeam(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadExistingUserTeam(session.user.id)
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadExistingUserTeam = async (userId) => {
    const { data: ft } = await supabase
      .from('fantasy_teams')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (ft) {
      setTeamName(ft.name)
      const { data: ftp } = await supabase
        .from('fantasy_team_players')
        .select('*, players(*)')
        .eq('fantasy_team_id', ft.id)

      if (ftp && ftp.length > 0) {
        const loadedPlayers = ftp.map(item => item.players).filter(Boolean)
        setTeam(loadedPlayers)
      }
    }
  }

  const saveTeam = async () => {
    if (!user) { router.push('/auth'); return }
    if (!teamName.trim()) { alert('Donne un nom à ton équipe !'); return }
    setSaving(true)
    setSaveMsg(null)

    const { data: gw } = await supabase.from('gameweeks').select('id').eq('is_current', true).single()
    const gameweekId = gw?.id || 1

    // S'assurer que le profil existe
    await supabase.from('profiles').upsert({
      id: user.id,
      username: user.email ? user.email.split('@')[0] : `user_${user.id.slice(0, 5)}`
    }, { onConflict: 'id' })

    const { data: existingFt } = await supabase
      .from('fantasy_teams')
      .select('id')
      .eq('user_id', user.id)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle()

    let fantasyTeamId = existingFt?.id

    if (fantasyTeamId) {
      await supabase.from('fantasy_teams').update({
        name: teamName.trim(),
        budget: budgetRestant,
      }).eq('id', fantasyTeamId)

      await supabase.from('fantasy_team_players').delete().eq('fantasy_team_id', fantasyTeamId)
    } else {
      const { data: ftData, error: ftErr } = await supabase.from('fantasy_teams').insert({
        user_id: user.id,
        name: teamName.trim(),
        budget: budgetRestant,
      }).select().single()

      if (ftErr) {
        setSaveMsg({ type: 'error', text: ftErr.message })
        setSaving(false)
        return
      }
      fantasyTeamId = ftData.id
    }

    // RÈGLE : Garantir 1 GK, 3 DEF, 4 MID, 3 FWD comme titulaires (11 au total)
    const gks = team.filter(p => p.position === 'GK')
    const defs = team.filter(p => p.position === 'DEF')
    const mids = team.filter(p => p.position === 'MID')
    const fwds = team.filter(p => p.position === 'FWD')

    const starterIds = new Set([
      ...gks.slice(0, 1).map(p => p.id),
      ...defs.slice(0, 3).map(p => p.id),
      ...mids.slice(0, 4).map(p => p.id),
      ...fwds.slice(0, 3).map(p => p.id),
    ])

    const playersToInsert = team.map((p, i) => ({
      fantasy_team_id: fantasyTeamId,
      player_id: p.id,
      gameweek_id: gameweekId,
      is_captain: i === 0,
      is_starting: starterIds.has(p.id),
    }))

    const { error: pErr } = await supabase.from('fantasy_team_players').insert(playersToInsert)
    if (pErr) {
      setSaveMsg({ type: 'error', text: pErr.message })
    } else {
      setSaveMsg({ type: 'success', text: 'Équipe enregistrée avec succès ! 🎉' })
      setTimeout(() => router.push('/my-team'), 1200)
    }
    setSaving(false)
  }

  const TEAM_LOGOS = {
    1: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F677-1715269288.png',
    2: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F670-1788197077.png',
    3: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2Fjsk.png',
    4: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F673-1715352459.png',
    5: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2Fessetif.png',
    6: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F678-1744537577.png',
    524: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F524-1663164373.png',
    675: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F675-1757531391.png',
    653: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F653-1663164387.png',
    518: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F518-1637065781.png',
    755: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F755-1663164159.png',
    758: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F758-1770131189.png',
    759: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F759-1788436581.png',
    409: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F409-1755174810.png',
    754: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F754-1663163636.png'
  }

  const getTeamLogo = (teamId) => {
    const t = teams.find((t) => t.id === teamId)
    const url = t?.logo_url || TEAM_LOGOS[teamId]
    if (!url) return null
    if (url.startsWith('/api/image-proxy')) return url
    return `/api/image-proxy?url=${encodeURIComponent(url)}`
  }

  const budgetRestant = 100.0 - team.reduce((acc, p) => acc + Number(p.price), 0)
  const isFull = team.length === 15
  const positionCount = (pos) => team.filter((p) => p.position === pos).length
  const limits = { GK: 2, DEF: 5, MID: 5, FWD: 3 }

  const filteredPlayers = players
    .filter((p) => {
      if (filterPos !== 'ALL' && p.position !== filterPos) return false
      if (filterClub !== 'ALL' && p.team_id !== Number(filterClub)) return false
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price_desc') return b.price - a.price
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name)
      return 0
    })

  const getTeamName = (teamId) => {
    const t = teams.find((t) => t.id === teamId)
    return t ? t.name : ''
  }

  const addPlayer = (player) => {
    if (team.find((p) => p.id === player.id)) return alert("Joueur déjà sélectionné !")
    if (isFull) return alert("Ton équipe est déjà complète (15 joueurs) !")
    if (positionCount(player.position) >= limits[player.position]) {
      return alert(`Limite atteinte pour les ${player.position} (${limits[player.position]} max).`)
    }
    if (budgetRestant - player.price < 0) {
      return alert("Budget insuffisant !")
    }
    setTeam([...team, player])
  }

  const removePlayer = (playerId) => {
    setTeam(team.filter((p) => p.id !== playerId))
  }

  const autoSelect = () => {
    const maxTenths = 1000
    const needed = { GK: 2, DEF: 5, MID: 5, FWD: 3 }
    const byPos = { GK: [], DEF: [], MID: [], FWD: [] }

    players.forEach((p) => {
      if (byPos[p.position]) {
        byPos[p.position].push({ ...p, priceTenths: Math.round(Number(p.price) * 10) })
      }
    })

    for (const pos in byPos) {
      byPos[pos].sort((a, b) => b.priceTenths - a.priceTenths)
    }

    const selected = []
    let spentTenths = 0

    for (const pos of ['FWD', 'MID', 'DEF', 'GK']) {
      const posNeeded = needed[pos]
      let posCount = 0

      for (const player of byPos[pos]) {
        if (posCount >= posNeeded) break

        let minRemainingTenths = 0
        for (const p of ['GK', 'DEF', 'MID', 'FWD']) {
          const alreadyPicked = selected.filter((s) => s.position === p).length
          const targetNeeded = (p === pos ? posCount + 1 : alreadyPicked)
          const remainingSlots = needed[p] - targetNeeded
          
          if (remainingSlots > 0) {
            const availableCheap = byPos[p]
              .filter((pl) => pl.id !== player.id && !selected.some((s) => s.id === pl.id))
              .sort((a, b) => a.priceTenths - b.priceTenths)
              .slice(0, remainingSlots)
            
            minRemainingTenths += availableCheap.reduce((acc, c) => acc + c.priceTenths, 0)
          }
        }

        if (spentTenths + player.priceTenths + minRemainingTenths <= maxTenths) {
          selected.push(player)
          spentTenths += player.priceTenths
          posCount++
        }
      }

      if (posCount < posNeeded) {
        const cheapCandidates = [...byPos[pos]]
          .filter((pl) => !selected.some((s) => s.id === pl.id))
          .sort((a, b) => a.priceTenths - b.priceTenths)

        for (const player of cheapCandidates) {
          if (posCount >= posNeeded) break
          selected.push(player)
          spentTenths += player.priceTenths
          posCount++
        }
      }
    }

    while (spentTenths > maxTenths && selected.length === 15) {
      let maxSaved = 0
      let bestSwap = null

      for (const player of selected) {
        const cheaperOptions = byPos[player.position]
          .filter((pl) => !selected.some((s) => s.id === pl.id) && pl.priceTenths < player.priceTenths)
          .sort((a, b) => a.priceTenths - b.priceTenths)

        if (cheaperOptions.length > 0) {
          const cheap = cheaperOptions[0]
          const saved = player.priceTenths - cheap.priceTenths
          if (saved > maxSaved) {
            maxSaved = saved
            bestSwap = { removeId: player.id, addPlayer: cheap, saved }
          }
        }
      }

      if (bestSwap) {
        const idx = selected.findIndex((s) => s.id === bestSwap.removeId)
        if (idx !== -1) {
          selected[idx] = bestSwap.addPlayer
          spentTenths -= bestSwap.saved
        }
      } else {
        break
      }
    }

    if (selected.length === 15 && spentTenths <= maxTenths) {
      setTeam(selected)
    } else {
      alert(`Erreur d'auto-sélection : budget trop restreint.`)
    }
  }

  const resetTeam = () => setTeam([])

  const selectStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-main)',
    padding: '0.5rem 0.8rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    outline: 'none',
    cursor: 'pointer',
    flex: '1',
    minWidth: '0',
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      
      {/* Liste des joueurs disponibles */}
      <div style={{ flex: '1 1 500px' }}>
        <h1>🛒 Marché des Transferts</h1>

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="🔍 Rechercher un joueur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-main)',
              borderRadius: '12px',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <select value={filterPos} onChange={(e) => setFilterPos(e.target.value)} style={selectStyle}>
            <option value="ALL">Tous les postes</option>
            <option value="GK">🧤 Gardiens</option>
            <option value="DEF">🛡️ Défenseurs</option>
            <option value="MID">🎯 Milieux</option>
            <option value="FWD">⚡ Attaquants</option>
          </select>

          <select value={filterClub} onChange={(e) => setFilterClub(e.target.value)} style={selectStyle}>
            <option value="ALL">Tous les clubs</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={selectStyle}>
            <option value="price_desc">💰 Prix ↓</option>
            <option value="price_asc">💰 Prix ↑</option>
            <option value="name_asc">🔤 Nom A-Z</option>
          </select>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          {filteredPlayers.length} joueur{filteredPlayers.length > 1 ? 's' : ''} trouvé{filteredPlayers.length > 1 ? 's' : ''}
        </p>

        {loading ? <p style={{ color: 'var(--text-muted)' }}>Chargement des joueurs...</p> : (
          <div className="glass-panel" style={{ height: '60vh', overflowY: 'auto' }}>
            {filteredPlayers.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Aucun joueur trouvé avec ces filtres.</p> : null}
            {filteredPlayers.map((p) => {
              const isSelected = team.find((t) => t.id === p.id)
              return (
                <div key={p.id} className="player-card" style={{ opacity: isSelected ? 0.4 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getTeamLogo(p.team_id) && (
                      <img 
                        src={getTeamLogo(p.team_id)} 
                        alt="" 
                        style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                      />
                    )}
                    <div>
                      <strong style={{ fontSize: '1rem' }}>{p.name}</strong> 
                      <span style={{ marginLeft: '8px' }} className={`badge ${p.position}`}>{p.position}</span>
                      <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{getTeamName(p.team_id)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{p.price}M</span>
                    <button 
                      className="btn" 
                      onClick={() => isSelected ? removePlayer(p.id) : addPlayer(p)}
                      style={isSelected ? { background: 'var(--danger)', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)' } : {}}
                    >
                      {isSelected ? '−' : '+'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Mon Équipe (Sidebar) */}
      <div className="glass-panel" style={{ flex: '1 1 350px', height: 'fit-content' }}>
        <h2>Mon Équipe ({team.length}/15)</h2>
        <h3 style={{ color: budgetRestant >= 0 ? 'var(--primary)' : 'var(--danger)', margin: '1rem 0 1.5rem 0' }}>
          💰 Budget: {budgetRestant.toFixed(1)}M
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
             <span className="badge GK">GK</span> {positionCount('GK')}/{limits.GK}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
             <span className="badge DEF">DEF</span> {positionCount('DEF')}/{limits.DEF}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
             <span className="badge MID">MID</span> {positionCount('MID')}/{limits.MID}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
             <span className="badge FWD">FWD</span> {positionCount('FWD')}/{limits.FWD}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto', paddingRight: '6px' }}>
          {team.map((p) => (
            <div key={p.id} className="player-card" style={{ padding: '0.6rem 1rem', marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getTeamLogo(p.team_id) && (
                  <img 
                    src={getTeamLogo(p.team_id)} 
                    alt="" 
                    style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                  />
                )}
                <div>
                  <strong style={{ fontSize: '0.9rem' }}>{p.name}</strong>
                  <span style={{ marginLeft: '8px' }} className={`badge ${p.position}`}>{p.position}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.price}M</span>
                <button className="btn btn-remove" onClick={() => removePlayer(p.id)}>✖</button>
              </div>
            </div>
          ))}
          {team.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '2rem 0' }}>Aucun joueur sélectionné</p>}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
          <button 
            className="btn"
            style={{ flex: 1, padding: '0.8rem', background: 'var(--accent)', boxShadow: '0 4px 14px rgba(96, 165, 250, 0.3)' }}
            onClick={autoSelect}
            disabled={players.length === 0}
          >
            🎲 Auto-sélection
          </button>
          <button 
            className="btn btn-remove"
            style={{ padding: '0.8rem' }}
            onClick={resetTeam}
            disabled={team.length === 0}
          >
            🗑️ Reset
          </button>
        </div>

        {isFull && (
          <input
            type="text"
            placeholder="Nom de ton équipe (ex: Les Fennecs)"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            style={{
              width: '100%', marginTop: '1rem', padding: '0.8rem 1rem',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-main)', borderRadius: '10px', fontSize: '0.95rem', outline: 'none',
            }}
          />
        )}

        {saveMsg && (
          <div style={{
            padding: '0.8rem', marginTop: '0.8rem', borderRadius: '8px', fontSize: '0.9rem',
            background: saveMsg.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(0,255,135,0.1)',
            border: `1px solid ${saveMsg.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(0,255,135,0.3)'}`,
            color: saveMsg.type === 'error' ? '#f87171' : 'var(--primary)',
          }}>
            {saveMsg.type === 'error' ? '❌' : '✅'} {saveMsg.text}
          </div>
        )}

        <button 
          disabled={!isFull || saving}
          className="btn"
          style={{ width: '100%', marginTop: '0.8rem', padding: '1rem' }}
          onClick={saveTeam}
        >
          {saving ? '⏳ Sauvegarde...' : (user ? "Valider l'équipe" : "Se connecter pour valider")}
        </button>
      </div>

    </main>
  )
}
