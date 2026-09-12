'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [fantasyTeam, setFantasyTeam] = useState(null)
  const [totalPoints, setTotalPoints] = useState(0)
  const [rank, setRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push('/auth')
        return
      }
      setUser(session.user)
      loadUserProfile(session.user)
    })
  }, [])

  const loadUserProfile = async (currentUser) => {
    setLoading(true)

    // 1. Charger le profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', currentUser.id)
      .single()

    if (profile) {
      setUsername(profile.username)
      setNewUsername(profile.username)
    } else {
      const defaultName = currentUser.email ? currentUser.email.split('@')[0] : 'Joueur'
      setUsername(defaultName)
      setNewUsername(defaultName)
    }

    // 2. Charger l'équipe fantasy
    const { data: ft } = await supabase
      .from('fantasy_teams')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (ft) {
      setFantasyTeam(ft)

      // Calculer les points totaux de l'équipe
      const { data: ftp } = await supabase
        .from('fantasy_team_players')
        .select('player_id, is_captain, is_starting')
        .eq('fantasy_team_id', ft.id)

      if (ftp && ftp.length > 0) {
        const { data: statsData } = await supabase.from('player_gameweek_stats').select('player_id, points')
        if (statsData) {
          const statsMap = {}
          statsData.forEach(s => {
            statsMap[s.player_id] = (statsMap[s.player_id] || 0) + (s.points || 0)
          })
          const starters = ftp.filter(p => p.is_starting)
          const pts = starters.reduce((acc, p) => {
            const playerPts = statsMap[p.player_id] || 0
            return acc + (p.is_captain ? playerPts * 2 : playerPts)
          }, 0)
          setTotalPoints(pts)
        }
      }
    }

    setLoading(false)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!newUsername.trim()) return alert('Veuillez entrer un nom d\'utilisateur valide.')
    setUpdating(true)
    setMessage(null)

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, username: newUsername.trim() }, { onConflict: 'id' })

    if (error) {
      setMessage({ type: 'error', text: `Erreur : ${error.message}` })
    } else {
      setUsername(newUsername.trim())
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès ! 🎉' })
    }
    setUpdating(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) {
    return (
      <main style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>⏳ Chargement de ton profil...</p>
      </main>
    )
  }

  return (
    <main style={{ padding: '2rem 1rem', maxWidth: '750px', margin: '0 auto' }}>
      
      {/* Carte d'en-tête du profil */}
      <div className="glass-panel" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', marginBottom: '2rem', position: 'relative' }}>
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary) 0%, #00b359 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', margin: '0 auto 1rem', color: '#000',
          boxShadow: '0 0 20px rgba(0,255,135,0.4)'
        }}>
          👤
        </div>

        <h1 style={{ fontSize: '1.8rem', margin: '0 0 0.2rem', color: '#fff' }}>{username}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 1rem' }}>{user?.email}</p>

        <span style={{
          background: username.toLowerCase().includes('imadbousserouel') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 255, 135, 0.15)',
          border: username.toLowerCase().includes('imadbousserouel') ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(0, 255, 135, 0.3)',
          color: username.toLowerCase().includes('imadbousserouel') ? '#f87171' : 'var(--primary)',
          padding: '0.4rem 1.2rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700
        }}>
          {username.toLowerCase().includes('imadbousserouel') ? '👑 Administrateur Principal' : '🎮 Joueur Ligue 1 Fantasy'}
        </span>
      </div>

      {/* Résumé de l'Équipe Fantasy */}
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚽ Résumé de ton Équipe
        </h2>

        {fantasyTeam ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Nom de l'équipe</span>
              <h3 style={{ margin: '0.3rem 0 0', color: '#fff' }}>🏟️ {fantasyTeam.name}</h3>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Points Cumulés</span>
              <h3 style={{ margin: '0.3rem 0 0', color: 'var(--primary)' }}>⚽ {totalPoints} pts</h3>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Budget Restant</span>
              <h3 style={{ margin: '0.3rem 0 0', color: 'var(--accent)' }}>💰 {Number(fantasyTeam.budget).toFixed(1)}M</h3>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <p style={{ color: 'var(--text-muted)' }}>Tu n'as pas encore créé ton équipe fantasy pour la saison.</p>
            <button className="btn" onClick={() => router.push('/market')} style={{ marginTop: '0.8rem' }}>Créer mon équipe</button>
          </div>
        )}

        {fantasyTeam && (
          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button className="btn" onClick={() => router.push('/my-team')}>Gérer mon Équipe →</button>
          </div>
        )}
      </div>

      {/* Formulaire de modification du profil */}
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', margin: '0 0 1rem' }}>✏️ Modifier mes informations</h2>

        {message && (
          <div style={{
            padding: '0.8rem 1rem', marginBottom: '1rem', borderRadius: '8px',
            background: message.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(0,255,135,0.15)',
            color: message.type === 'error' ? '#f87171' : 'var(--primary)',
            fontWeight: 600
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Nom d'utilisateur (Pseudo Fantasy)
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Ton pseudo..."
              style={{
                width: '100%', padding: '0.8rem 1rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', fontSize: '1rem', outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="btn"
            style={{ alignSelf: 'flex-start', padding: '0.7rem 1.4rem' }}
          >
            {updating ? 'Enregistrement...' : 'Sauvegarder les modifications'}
          </button>
        </form>
      </div>

      {/* Zone de déconnexion */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.7rem 1.8rem',
            borderRadius: '10px',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
        >
          🚪 Se déconnecter de la plateforme
        </button>
      </div>

    </main>
  )
}
