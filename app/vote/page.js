'use client'

import { useState, useEffect } from 'react'

const INITIAL_VOTES = {
  player_of_week: [
    { id: 1, name: 'Zakaria Naidji', club: 'MC Alger', position: 'FWD', logo: '/logos/mca.png', votes: 142 },
    { id: 2, name: 'Alexis Guendouz', club: 'JS Kabylie', position: 'GK', logo: '/logos/jsk.png', votes: 98 },
    { id: 3, name: 'Sofiane Bouchar', club: 'CR Belouizdad', position: 'DEF', logo: '/logos/crb.png', votes: 76 },
    { id: 4, name: 'Brahim Dib', club: 'CS Constantine', position: 'MID', logo: '/logos/csc.png', votes: 112 },
  ],
  best_gk: [
    { id: 10, name: 'Oussama Benbot', club: 'USM Alger', position: 'GK', logo: '/logos/usma.png', votes: 185 },
    { id: 11, name: 'Alexis Guendouz', club: 'JS Kabylie', position: 'GK', logo: '/logos/jsk.png', votes: 140 },
    { id: 12, name: 'Farid Chaal', club: 'CR Belouizdad', position: 'GK', logo: '/logos/crb.png', votes: 95 },
  ],
  best_def: [
    { id: 20, name: 'Ayoub Abdellaoui', club: 'MC Alger', position: 'DEF', logo: '/logos/mca.png', votes: 160 },
    { id: 21, name: 'Saadi Radouani', club: 'USM Alger', position: 'DEF', logo: '/logos/usma.png', votes: 124 },
    { id: 22, name: 'Chouhaib Keddad', club: 'CR Belouizdad', position: 'DEF', logo: '/logos/crb.png', votes: 89 },
  ],
  best_fwd: [
    { id: 30, name: 'Sofiane Bayazid', club: 'MC Alger', position: 'FWD', logo: '/logos/mca.png', votes: 178 },
    { id: 31, name: 'Abderrahmane Meziane', club: 'CR Belouizdad', position: 'FWD', logo: '/logos/crb.png', votes: 132 },
    { id: 32, name: 'Farid El Melali', club: 'CR Belouizdad', position: 'FWD', logo: '/logos/crb.png', votes: 105 },
  ],
  best_club: [
    { id: 40, name: 'MC Alger', club: 'Ligue 1', logo: '/logos/mca.png', votes: 245 },
    { id: 41, name: 'JS Kabylie', club: 'Ligue 1', logo: '/logos/jsk.png', votes: 198 },
    { id: 42, name: 'CR Belouizdad', club: 'Ligue 1', logo: '/logos/crb.png', votes: 172 },
    { id: 43, name: 'USM Alger', club: 'Ligue 1', logo: '/logos/usma.png', votes: 164 },
  ]
}

export default function VotePage() {
  const [votesData, setVotesData] = useState(INITIAL_VOTES)
  const [userVotes, setUserVotes] = useState({})
  const [activeCategory, setActiveCategory] = useState('player_of_week')

  useEffect(() => {
    // Restore user vote history from localStorage
    const savedUserVotes = localStorage.getItem('l1_user_votes')
    if (savedUserVotes) {
      try {
        setUserVotes(JSON.parse(savedUserVotes))
      } catch (e) {
        console.error(e)
      }
    }

    const savedVotesData = localStorage.getItem('l1_votes_counts')
    if (savedVotesData) {
      try {
        setVotesData(JSON.parse(savedVotesData))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const handleCastVote = (categoryKey, candidateId) => {
    if (userVotes[categoryKey]) {
      alert('Tu as déjà voté pour cette catégorie cette semaine ! 🗳️')
      return
    }

    const updatedUserVotes = { ...userVotes, [categoryKey]: candidateId }
    setUserVotes(updatedUserVotes)
    localStorage.setItem('l1_user_votes', JSON.stringify(updatedUserVotes))

    const updatedCategory = votesData[categoryKey].map(c => 
      c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
    )
    const updatedVotesData = { ...votesData, [categoryKey]: updatedCategory }
    setVotesData(updatedVotesData)
    localStorage.setItem('l1_votes_counts', JSON.stringify(updatedVotesData))
  }

  const categories = [
    { id: 'player_of_week', title: '🏆 Joueur de la Semaine', badge: 'Joueur de la Semaine' },
    { id: 'best_gk', title: '🧤 Meilleur Gardien', badge: 'Meilleur Gardien' },
    { id: 'best_def', title: '🛡️ Meilleur Défenseur', badge: 'Meilleur Défenseur' },
    { id: 'best_fwd', title: '⚡ Meilleur Attaquant', badge: 'Meilleur Buteur / Attaquant' },
    { id: 'best_club', title: '🏟️ Meilleur Club', badge: 'Club de la Semaine' },
  ]

  const currentCandidates = votesData[activeCategory] || []
  const totalCategoryVotes = currentCandidates.reduce((acc, c) => acc + c.votes, 0)

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', marginBottom: '2rem' }}>
        <span style={{
          background: 'rgba(0, 255, 135, 0.15)', border: '1px solid rgba(0, 255, 135, 0.3)',
          color: 'var(--primary)', padding: '0.4rem 1.2rem', borderRadius: '20px',
          fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em'
        }}>
          🗳️ Trophées & Votes Fans Ligue 1
        </span>
        <h1 style={{ fontSize: '2.2rem', margin: '0.8rem 0 0.4rem', color: '#fff' }}>
          Votes Officiels de la Semaine
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
          Vote pour les meilleurs acteurs de la Ligue 1 Mobilis ! Ton vote compte pour élire le Joueur et l'Équipe de la Semaine.
        </p>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex', gap: '0.8rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem'
      }}>
        {categories.map(cat => {
          const isVoted = !!userVotes[cat.id]
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '0.8rem 1.4rem',
                borderRadius: '12px',
                border: activeCategory === cat.id ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                background: activeCategory === cat.id ? 'rgba(0,255,135,0.15)' : 'rgba(15,23,36,0.85)',
                color: activeCategory === cat.id ? 'var(--primary)' : '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {cat.title}
              {isVoted && (
                <span style={{ background: '#22c55e', color: '#000', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Candidates List */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>
              {categories.find(c => c.id === activeCategory)?.title}
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Total des suffrages exprimés : <strong>{totalCategoryVotes} votes</strong>
            </span>
          </div>

          {userVotes[activeCategory] && (
            <span style={{
              background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#22c55e', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800
            }}>
              ✅ A VOTÉ DANS CETTE CATÉGORIE
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {currentCandidates.map(candidate => {
            const pct = totalCategoryVotes > 0 ? Math.round((candidate.votes / totalCategoryVotes) * 100) : 0
            const isUserChoice = userVotes[activeCategory] === candidate.id

            return (
              <div
                key={candidate.id}
                style={{
                  background: isUserChoice ? 'rgba(0, 255, 135, 0.08)' : 'rgba(255, 255, 255, 0.025)',
                  border: isUserChoice ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '1.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s'
                }}
              >
                {/* Header candidate */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={candidate.logo}
                    alt={candidate.club}
                    style={{ width: '48px', height: '48px', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '0 0 2px' }}>{candidate.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{candidate.club}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{candidate.votes} votes</span>
                    <strong style={{ color: 'var(--primary)' }}>{pct}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: 'linear-gradient(90deg, var(--primary) 0%, #00b359 100%)',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>

                {/* Vote button */}
                <button
                  onClick={() => handleCastVote(activeCategory, candidate.id)}
                  disabled={!!userVotes[activeCategory]}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: isUserChoice ? 'var(--primary)' : userVotes[activeCategory] ? 'rgba(255,255,255,0.05)' : 'rgba(0, 255, 135, 0.15)',
                    color: isUserChoice ? '#000' : userVotes[activeCategory] ? 'var(--text-muted)' : 'var(--primary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: userVotes[activeCategory] ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    marginTop: 'auto'
                  }}
                >
                  {isUserChoice ? '✓ Ton Choix' : userVotes[activeCategory] ? 'Vote Enregistré' : 'Voter pour ce candidat'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

    </main>
  )
}
