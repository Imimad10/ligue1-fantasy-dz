'use client'

import { useEffect, useState } from 'react'
import { fetchLiveFotmobData } from '../../lib/fotmobLiveData'

export default function FotmobTicker() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLiveMatches()
    // Rafraîchir toutes les 30 secondes pour du direct
    const interval = setInterval(loadLiveMatches, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadLiveMatches = async () => {
    const data = await fetchLiveFotmobData()
    if (data && data.matches) {
      setMatches(data.matches)
    }
    setLoading(false)
  }

  return (
    <div style={{
      background: 'rgba(10, 15, 25, 0.95)',
      borderBottom: '1px solid rgba(0, 255, 135, 0.15)',
      padding: '0.65rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      overflowX: 'auto',
      backdropFilter: 'blur(12px)',
      position: 'relative',
      zIndex: 100,
    }}>
      {/* Badge Sync Source FotMob en Direct */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(0, 255, 135, 0.12)',
        border: '1px solid rgba(0, 255, 135, 0.3)',
        padding: '0.35rem 0.8rem',
        borderRadius: '20px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}>
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: 'var(--primary)',
          boxShadow: '0 0 10px var(--primary)',
          animation: 'pulse 1.5s infinite'
        }}></span>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.04em' }}>
          FotMob Live Direct
        </span>
      </div>

      {/* Cartes de Matchs FotMob Réels */}
      {loading ? (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⏳ Chargement du direct FotMob...</span>
      ) : (
        <div style={{ display: 'flex', gap: '1rem', flex: 1, overflowX: 'auto', paddingTop: '0.5rem', paddingBottom: '0.5rem', alignItems: 'center' }}>
          {matches.map((match) => (
            <div
              key={match.id}
              className="fotmob-match-card"
            >
              {/* Statut (FT / LIVE) */}
              <div style={{ textAlign: 'center', paddingRight: '8px', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 800,
                  color: match.status === 'LIVE' ? '#ef4444' : 'var(--primary)',
                  display: 'block'
                }}>
                  {match.status}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{match.matchTime}</span>
              </div>

              {/* Équipes et Score */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={match.homeTeam.logo}
                      alt={match.homeTeam.name}
                      style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{match.homeTeam.name}</span>
                  </div>
                  <strong style={{ fontSize: '0.85rem', color: match.homeTeam.score > match.awayTeam.score ? 'var(--primary)' : '#fff' }}>
                    {match.homeTeam.score}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={match.awayTeam.logo}
                      alt={match.awayTeam.name}
                      style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{match.awayTeam.name}</span>
                  </div>
                  <strong style={{ fontSize: '0.85rem', color: match.awayTeam.score > match.homeTeam.score ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {match.awayTeam.score}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
