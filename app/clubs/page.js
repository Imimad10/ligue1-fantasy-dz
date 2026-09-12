'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ClubsPage() {
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClubs() {
      try {
        const res = await fetch('/api/lfp/clubs')
        const data = await res.json()
        if (data.clubs) {
          setClubs(data.clubs)
        }
      } catch (err) {
        console.error('Failed to load clubs:', err)
      }
      setLoading(false)
    }
    fetchClubs()
  }, [])

  return (
    <main style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* En-tête */}
      <div className="glass-panel" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>🛡️ Clubs de Ligue 1 Mobilis</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>
          Découvrez les 16 équipes engagées dans le championnat pour la saison 2026/2027.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{
            width: '40px', height: '40px', border: '3px solid rgba(0,255,135,0.2)',
            borderTop: '3px solid var(--primary)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
          }} />
          <p>Chargement des clubs depuis LFP.dz...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.5rem'
        }}>
          {clubs.map(club => (
            <Link
              key={club.id}
              href={`/clubs/${club.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                className="glass-panel"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                  cursor: 'pointer',
                  minHeight: '180px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,255,135,0.2)'
                  e.currentTarget.style.borderColor = 'rgba(0,255,135,0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                }}
              >
                <img
                  src={club.logo_url}
                  alt={club.name}
                  style={{
                    width: '80px', height: '80px', objectFit: 'contain', marginBottom: '1rem',
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))'
                  }}
                  onError={(e) => { e.target.style.opacity = '0.3' }}
                />
                <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, color: '#fff' }}>
                  {club.name}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
