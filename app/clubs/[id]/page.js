'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function ClubDetailPage() {
  const { id } = useParams()
  const [club, setClub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('joueurs')

  useEffect(() => {
    async function fetchClub() {
      try {
        const res = await fetch(`/api/lfp/club/${id}`)
        const data = await res.json()
        setClub(data)
      } catch (err) {
        console.error('Failed to load club:', err)
      }
      setLoading(false)
    }
    if (id) fetchClub()
  }, [id])

  if (loading) {
    return (
      <main style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
          <div style={{
            width: '50px', height: '50px', border: '3px solid rgba(0,255,135,0.2)',
            borderTop: '3px solid var(--primary)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 1.5rem',
          }} />
          <p style={{ fontSize: '1.1rem' }}>Chargement des données du club depuis LFP.dz...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </main>
    )
  }

  if (!club || club.error) {
    return (
      <main style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>❌ Club introuvable</h2>
          <p style={{ color: 'var(--text-muted)' }}>Impossible de charger les données de ce club.</p>
          <Link href="/clubs" style={{ color: 'var(--primary)' }}>← Retour aux clubs</Link>
        </div>
      </main>
    )
  }

  const groupedPlayers = {
    'Gardien': club.players?.filter(p => p.position === 'Gardien') || [],
    'Défenseur': club.players?.filter(p => p.position === 'Défenseur') || [],
    'Milieu': club.players?.filter(p => p.position === 'Milieu') || [],
    'Attaquant': club.players?.filter(p => p.position === 'Attaquant') || [],
  }

  const positionLabels = {
    'Gardien': { label: 'Gardiens de but', icon: '🧤', color: '#f59e0b' },
    'Défenseur': { label: 'Défenseurs', icon: '🛡️', color: '#3b82f6' },
    'Milieu': { label: 'Milieux de terrain', icon: '⚙️', color: '#10b981' },
    'Attaquant': { label: 'Attaquants', icon: '⚡', color: '#ef4444' },
  }

  const tabs = [
    { id: 'joueurs', label: 'Joueurs', icon: '⚽' },
    { id: 'staff', label: 'Staff', icon: '👔' },
    { id: 'info', label: 'Infos', icon: 'ℹ️' },
  ]

  return (
    <main style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Back button */}
      <Link href="/clubs" style={{
        color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex',
        alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem',
        transition: 'color 0.2s'
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        ← Retour aux clubs
      </Link>

      {/* Hero Banner */}
      <div className="glass-panel" style={{
        position: 'relative', overflow: 'hidden', marginBottom: '2rem',
        padding: '3rem 2rem', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,255,135,0.05) 100%)',
      }}>
        {/* Decorative glow */}
        <div style={{
          position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,135,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        {club.logo && (
          <img
            src={club.logo}
            alt={club.name || 'Logo du club'}
            referrerPolicy="no-referrer"
            style={{
              width: '110px', height: '110px', objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
              marginBottom: '1rem', position: 'relative', zIndex: 1
            }}
          />
        )}
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#fff' }}>
            {club.name}
          </h1>
          {club.address && (
            <p style={{
              color: 'var(--primary)', fontSize: '0.95rem', fontWeight: 600,
              margin: '0 0 0.5rem', letterSpacing: '0.5px'
            }}>
              📍 {club.address}
            </p>
          )}
          {club.colors && (
            <p style={{
              color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0,
              display: 'inline-block', padding: '0.3rem 1rem', borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)'
            }}>
              🎨 Couleurs: {club.colors}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.5rem', marginBottom: '2rem',
        overflowX: 'auto', paddingBottom: '0.5rem'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.7rem 1.5rem', border: 'none', borderRadius: '12px',
              cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600,
              transition: 'all 0.3s',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, var(--primary), #00cc6a)'
                : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.id ? '#000' : 'var(--text-muted)',
              border: activeTab === tab.id
                ? 'none'
                : '1px solid rgba(255,255,255,0.08)',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Joueurs */}
      {activeTab === 'joueurs' && (
        <div>
          {Object.entries(groupedPlayers).map(([position, players]) => {
            if (players.length === 0) return null
            const meta = positionLabels[position]
            return (
              <div key={position} style={{ marginBottom: '2.5rem' }}>
                <h2 style={{
                  fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  color: '#fff',
                  borderBottom: `2px solid ${meta.color}`,
                  paddingBottom: '0.5rem',
                }}>
                  {meta.icon} {meta.label}
                  <span style={{
                    fontSize: '0.8rem', color: 'var(--text-muted)',
                    fontWeight: 400, marginLeft: '0.5rem'
                  }}>
                    ({players.length})
                  </span>
                </h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  {players.map((player, idx) => (
                    <div
                      key={player.id || idx}
                      className="glass-panel"
                      style={{
                        padding: '1rem', textAlign: 'center',
                        transition: 'transform 0.3s, border-color 0.3s',
                        cursor: 'default', position: 'relative', overflow: 'hidden'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.borderColor = meta.color + '66'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                      }}
                    >
                      {/* Player photo */}
                      <div style={{
                        width: '90px', height: '90px', borderRadius: '50%',
                        overflow: 'hidden', margin: '0 auto 0.8rem',
                        border: `2px solid ${meta.color}44`,
                        background: 'rgba(255,255,255,0.05)',
                        position: 'relative'
                      }}>
                        {player.photo ? (
                          <img
                            src={player.photo}
                            alt={player.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.parentElement.innerHTML = '<span style="font-size:2.5rem;display:flex;align-items:center;justify-content:center;height:100%">👤</span>'
                            }}
                          />
                        ) : (
                          <span style={{
                            fontSize: '2.5rem', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', height: '100%'
                          }}>👤</span>
                        )}
                      </div>
                      
                      {/* Jersey number badge */}
                      {player.number && (
                        <span style={{
                          position: 'absolute', top: '8px', right: '8px',
                          background: meta.color, color: '#fff',
                          width: '28px', height: '28px', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 800,
                          boxShadow: `0 2px 8px ${meta.color}44`
                        }}>
                          {player.number}
                        </span>
                      )}
                      
                      {/* Player name */}
                      <h3 style={{
                        fontSize: '0.85rem', fontWeight: 700, margin: '0 0 0.3rem',
                        color: '#fff', lineHeight: '1.2',
                        textTransform: 'capitalize'
                      }}>
                        {player.name?.toLowerCase()}
                      </h3>
                      
                      {/* Player info */}
                      <div style={{
                        display: 'flex', justifyContent: 'center', gap: '0.8rem',
                        fontSize: '0.75rem', color: 'var(--text-muted)'
                      }}>
                        {player.age && <span>🎂 {player.age} ans</span>}
                        {player.nationality && <span>🏳️ {player.nationality}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          
          {club.players?.length === 0 && (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                Aucun joueur trouvé pour ce club.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Staff */}
      {activeTab === 'staff' && (
        <div>
          <h2 style={{
            fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem',
            borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem',
            color: '#fff'
          }}>
            👔 Staff Technique
          </h2>
          
          {club.staff?.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1rem'
            }}>
              {club.staff.map((member, idx) => (
                <div
                  key={idx}
                  className="glass-panel"
                  style={{
                    padding: '1.5rem', textAlign: 'center',
                    transition: 'transform 0.3s, border-color 0.3s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.borderColor = 'rgba(0,255,135,0.3)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  }}
                >
                  <div style={{
                    width: '90px', height: '90px', borderRadius: '50%',
                    overflow: 'hidden', margin: '0 auto 1rem',
                    border: '2px solid rgba(0,255,135,0.2)',
                    background: 'rgba(255,255,255,0.05)'
                  }}>
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = '<span style="font-size:2.5rem;display:flex;align-items:center;justify-content:center;height:100%">👔</span>'
                        }}
                      />
                    ) : (
                      <span style={{
                        fontSize: '2.5rem', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', height: '100%'
                      }}>👔</span>
                    )}
                  </div>
                  
                  <h3 style={{
                    fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.4rem',
                    color: '#fff', textTransform: 'capitalize'
                  }}>
                    {member.name?.toLowerCase()}
                  </h3>
                  
                  <p style={{
                    fontSize: '0.75rem', color: 'var(--primary)',
                    fontWeight: 600, margin: '0 0 0.3rem',
                    textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>
                    {member.role}
                  </p>
                  
                  {member.nationality && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                      🏳️ {member.nationality}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>Aucun membre du staff trouvé.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Info */}
      {activeTab === 'info' && (
        <div>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>
              ℹ️ Informations du Club
            </h2>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {club.address && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>📍</span>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.2rem' }}>Adresse</p>
                    <p style={{ fontSize: '1rem', color: '#fff', margin: 0, fontWeight: 600 }}>{club.address}</p>
                  </div>
                </div>
              )}
              
              {club.colors && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>🎨</span>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.2rem' }}>Couleurs</p>
                    <p style={{ fontSize: '1rem', color: '#fff', margin: 0, fontWeight: 600 }}>{club.colors}</p>
                  </div>
                </div>
              )}
              
              <div style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <span style={{ fontSize: '1.5rem' }}>👥</span>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.2rem' }}>Effectif</p>
                  <p style={{ fontSize: '1rem', color: '#fff', margin: 0, fontWeight: 600 }}>
                    {club.players?.length || 0} joueurs · {club.staff?.length || 0} staff
                  </p>
                </div>
              </div>
              
              <div style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <span style={{ fontSize: '1.5rem' }}>🔗</span>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.2rem' }}>Source officielle</p>
                  <a
                    href={club.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none' }}
                  >
                    lfp.dz/fr/club/{id} ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
