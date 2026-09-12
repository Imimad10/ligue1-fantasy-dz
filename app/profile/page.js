'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

const CREST_OPTIONS = [
  { id: 'mca', name: 'MC Alger', url: '/logos/mca.png' },
  { id: 'crb', name: 'CR Belouizdad', url: '/logos/crb.png' },
  { id: 'jsk', name: 'JS Kabylie', url: '/logos/jsk.png' },
  { id: 'usma', name: 'USM Alger', url: '/logos/usma.png' },
  { id: 'ess', name: 'ES Sétif', url: '/logos/ess.png' },
  { id: 'csc', name: 'CS Constantine', url: '/logos/csc.png' },
  { id: 'jss', name: 'JS Saoura', url: '/logos/jss.png' },
  { id: 'aso', name: 'ASO Chlef', url: '/logos/aso.png' },
  { id: 'mco', name: 'MC Oran', url: '/logos/mco.png' },
  { id: 'usmk', name: 'USM Khenchela', url: '/logos/usmk.png' },
  { id: 'usb', name: 'US Biskra', url: '/logos/usb.png' },
  { id: 'esba', name: 'ES Ben Aknoun', url: '/logos/esba.png' },
  { id: 'oa', name: 'Olympique Akbou', url: '/logos/oa.png' },
  { id: 'jseb', name: 'JS El Biar', url: '/logos/jseb.png' },
  { id: 'mbr', name: 'MB Rouissat', url: '/logos/mbr.png' },
  { id: 'crt', name: 'CR Témouchent', url: '/logos/crt.png' }
]

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [selectedCrest, setSelectedCrest] = useState('/logos/mca.png')
  const [favoriteClub, setFavoriteClub] = useState('MC Alger')
  const [fantasyTeam, setFantasyTeam] = useState(null)
  const [totalPoints, setTotalPoints] = useState(0)
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

    try {
      // Charger local preference
      if (typeof window !== 'undefined' && currentUser?.id) {
        const savedCrest = localStorage.getItem(`user_crest_${currentUser.id}`)
        if (savedCrest && CREST_OPTIONS.some(c => c.url === savedCrest)) {
          setSelectedCrest(savedCrest)
        }
        const savedFavClub = localStorage.getItem(`user_fav_club_${currentUser.id}`)
        if (savedFavClub) setFavoriteClub(savedFavClub)
      }

      // 1. Charger le profil Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle()

      const defaultName = (currentUser.email && typeof currentUser.email === 'string')
        ? currentUser.email.split('@')[0]
        : 'Joueur'

      if (profile && profile.username) {
        setUsername(String(profile.username))
        setNewUsername(String(profile.username))
        if (profile.crest_url) setSelectedCrest(profile.crest_url)
        if (profile.favorite_club) setFavoriteClub(profile.favorite_club)
      } else {
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
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!newUsername || !newUsername.trim()) return alert('Veuillez entrer un nom d\'utilisateur valide.')
    setUpdating(true)
    setMessage(null)

    const cleanUsername = newUsername.trim()

    // Save to localStorage
    if (typeof window !== 'undefined' && user?.id) {
      localStorage.setItem(`user_crest_${user.id}`, selectedCrest)
      localStorage.setItem(`user_fav_club_${user.id}`, favoriteClub)
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: cleanUsername,
        crest_url: selectedCrest,
        favorite_club: favoriteClub
      }, { onConflict: 'id' })

    if (error) {
      setUsername(cleanUsername)
      setMessage({ type: 'success', text: 'Profil et Blason mis à jour avec succès ! 🎉' })
    } else {
      setUsername(cleanUsername)
      setMessage({ type: 'success', text: 'Profil, Blason & Club Cœur mis à jour avec succès ! 🎉' })
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

  const isAdmin = Boolean(
    (username && typeof username === 'string' && username.toLowerCase().includes('imadbousserouel')) ||
    (user?.email && typeof user.email === 'string' && user.email.toLowerCase().includes('imadbousserouel'))
  )

  const currentCrestUrl = selectedCrest || '/logos/mca.png'

  return (
    <main style={{ padding: '2rem 1rem', maxWidth: '750px', margin: '0 auto' }}>
      
      {/* Carte d'en-tête du profil */}
      <div className="glass-panel" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', marginBottom: '2rem', position: 'relative' }}>
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)', border: '2px solid var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
          boxShadow: '0 0 20px rgba(0,255,135,0.3)',
          overflow: 'hidden'
        }}>
          <img
            src={currentCrestUrl}
            alt="Crest"
            style={{ width: '60px', height: '60px', objectFit: 'contain' }}
            onError={(e) => { e.target.src = '/logos/mca.png' }}
          />
        </div>

        <h1 style={{ fontSize: '1.8rem', margin: '0 0 0.2rem', color: '#fff' }}>{username || 'Joueur'}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.8rem' }}>{user?.email}</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, margin: '0 0 1rem' }}>
          ❤️ Club Cœur : {favoriteClub || 'MC Alger'}
        </p>

        <span style={{
          background: isAdmin ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 255, 135, 0.15)',
          border: isAdmin ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(0, 255, 135, 0.3)',
          color: isAdmin ? '#f87171' : 'var(--primary)',
          padding: '0.4rem 1.2rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700
        }}>
          {isAdmin ? '👑 Administrateur Principal' : '🎮 Joueur Ligue 1 Fantasy'}
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
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Nom & Blason</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '0.4rem' }}>
                <img
                  src={currentCrestUrl}
                  alt="Crest"
                  style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                  onError={(e) => { e.target.src = '/logos/mca.png' }}
                />
                <h3 style={{ margin: 0, color: '#fff' }}>{fantasyTeam.name}</h3>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Points Cumulés</span>
              <h3 style={{ margin: '0.3rem 0 0', color: 'var(--primary)' }}>⚽ {totalPoints} pts</h3>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Budget Restant</span>
              <h3 style={{ margin: '0.3rem 0 0', color: 'var(--accent)' }}>💰 {Number(fantasyTeam.budget || 0).toFixed(1)}M</h3>
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
        <h2 style={{ fontSize: '1.2rem', margin: '0 0 1rem' }}>✏️ Personaliser mon Profil & Blason</h2>

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

        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

          {/* Choix du Club Cœur */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              ❤️ Club Préféré (Club Cœur)
            </label>
            <select
              value={favoriteClub}
              onChange={(e) => setFavoriteClub(e.target.value)}
              style={{
                width: '100%', padding: '0.8rem 1rem', borderRadius: '8px',
                background: 'rgba(15,23,36,0.95)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', fontSize: '1rem', outline: 'none'
              }}
            >
              {CREST_OPTIONS.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Choix du Blason / Crest */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
              🛡️ Choisis ton Blason Équipe (Crest)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '10px' }}>
              {CREST_OPTIONS.map(crest => (
                <div
                  key={crest.id}
                  onClick={() => setSelectedCrest(crest.url)}
                  style={{
                    padding: '8px',
                    borderRadius: '10px',
                    background: selectedCrest === crest.url ? 'rgba(0, 255, 135, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedCrest === crest.url ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <img
                    src={crest.url}
                    alt={crest.name}
                    style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                    onError={(e) => { e.target.style.opacity = '0.3' }}
                  />
                  <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {crest.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="btn"
            style={{ alignSelf: 'flex-start', padding: '0.7rem 1.4rem' }}
          >
            {updating ? 'Enregistrement...' : 'Sauvegarder mon Profil & Blason'}
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
