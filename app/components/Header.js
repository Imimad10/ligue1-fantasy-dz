'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchUsername(session.user.id)
    })

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchUsername(session.user.id)
      else setUsername('')
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUsername = async (userId) => {
    const { data } = await supabase.from('profiles').select('username').eq('id', userId).single()
    if (data) setUsername(data.username)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUsername('')
    router.push('/auth')
  }

  const linkStyle = (path) => ({
    color: pathname === path ? 'var(--primary)' : 'var(--text-muted)',
    textDecoration: 'none',
    fontWeight: pathname === path ? 600 : 400,
    transition: 'color 0.2s',
    cursor: 'pointer',
    fontSize: '0.95rem',
  })

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(10, 14, 23, 0.8)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div 
        onClick={() => router.push('/')} 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
      >
        <img
          src="/logo.png"
          alt="Ligue 1 Logo"
          style={{
            height: '40px',
            width: 'auto',
            borderRadius: '6px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 10px rgba(0, 255, 135, 0.35))'
          }}
        />
        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Fantasy <span style={{ color: 'var(--primary)' }}>DZ</span>
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
        <span style={linkStyle('/news')} onClick={() => router.push('/news')}>📰 Actualités</span>
        <span style={linkStyle('/clubs')} onClick={() => router.push('/clubs')}>🛡️ Clubs</span>
        <span style={linkStyle('/market')} onClick={() => router.push('/market')}>🛒 Transferts</span>
        {user && <span style={linkStyle('/my-team')} onClick={() => router.push('/my-team')}>🏟️ Mon Équipe</span>}
        <span style={linkStyle('/leaderboard')} onClick={() => router.push('/leaderboard')}>🏆 Classement</span>
        <span style={linkStyle('/admin/points')} onClick={() => router.push('/admin/points')}>🎯 Admin Points</span>
        
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ 
              color: 'var(--primary)', 
              fontSize: '0.85rem',
              background: 'rgba(0,255,135,0.1)',
              padding: '0.3rem 0.8rem',
              borderRadius: '20px',
              fontWeight: 600,
            }}>
              👤 {username || 'Joueur'}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s',
              }}
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/auth')}
            className="btn"
            style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
          >
            Se connecter
          </button>
        )}
      </nav>
    </header>
  )
}
