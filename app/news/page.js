'use client'

import { useState, useEffect } from 'react'
import { FOTMOB_CLUB_LOGOS } from '../../lib/fotmobLiveData'

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [tableFilter, setTableFilter] = useState('all') // all, home, away
  const [fixtureView, setFixtureView] = useState('by_date') // by_date, by_round, by_team
  const [standings, setStandings] = useState([])
  const [overviewMatches, setOverviewMatches] = useState([])
  const [fixtureGroups, setFixtureGroups] = useState([])
  const [season, setSeason] = useState('2026/2027')
  const [currentRound, setCurrentRound] = useState('')
  const [loading, setLoading] = useState(true)

  const [lfpArticles, setLfpArticles] = useState([])
  const [loadingLfp, setLoadingLfp] = useState(false)

  const [favClub, setFavClub] = useState('')

  useEffect(() => {
    fetchData()
    fetchLfpNews()
    loadFavClub()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadFavClub = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const saved = localStorage.getItem(`user_fav_club_${session.user.id}`)
        if (saved) setFavClub(saved)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'table', label: 'Table' },
    { id: 'fixtures', label: 'Fixtures' },
    { id: 'lfp_news', label: 'LFP Officiel' },
    { id: 'my_club', label: favClub ? `⭐ Mon Club (${favClub})` : '⭐ Mon Club' },
  ]

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* League Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem',
        padding: '1.5rem', background: 'rgba(15, 23, 36, 0.85)', borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <img
          src="/logo.png"
          alt="Ligue 1 Mobilis"
          style={{ width: '52px', height: '52px', objectFit: 'contain' }}
          onError={(e) => { e.target.src = 'https://images.fotmob.com/image_resources/logo/leaguelogo/516.png' }}
        />
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '2px' }}>Ligue 1</h1>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Algeria • {season}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex', gap: '0', marginBottom: '1.5rem',
        borderBottom: '2px solid rgba(255,255,255,0.08)',
        overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.85rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{
            width: '40px', height: '40px', border: '3px solid rgba(0,255,135,0.2)',
            borderTop: '3px solid var(--primary)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
          }} />
          <p>Chargement des données en direct...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && <OverviewTab standings={standings} matches={overviewMatches} currentRound={currentRound} />}
          {activeTab === 'table' && <TableTab standings={standings} filter={tableFilter} setFilter={setTableFilter} />}
          {activeTab === 'fixtures' && <FixturesTab fixtureGroups={fixtureGroups} matches={overviewMatches} view={fixtureView} setView={setFixtureView} />}
          {activeTab === 'lfp_news' && <LfpNewsTab articles={lfpArticles} loading={loadingLfp} />}
          {activeTab === 'my_club' && <MyClubTab favClub={favClub || 'MC Alger'} standings={standings} matches={overviewMatches} articles={lfpArticles} />}
        </>
      )}
    </main>
  )
}

/* ─── OVERVIEW TAB ─── */
function OverviewTab({ standings, matches, currentRound }) {
  // Split matches: finished (results) and upcoming
  const finishedMatches = matches.filter(m => m.status === 'FT')
  const upcomingMatches = matches.filter(m => m.status !== 'FT')

  // Group by date for the sidebar
  const matchesByDate = {}
  matches.forEach(m => {
    const key = m.date || 'À venir'
    if (!matchesByDate[key]) matchesByDate[key] = []
    matchesByDate[key].push(m)
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
      {/* Left: Standings Table (compact) */}
      <div>
        <StandingsTable standings={standings} compact={true} />
      </div>

      {/* Right: Match Results sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Round selector */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.8rem 1rem', background: 'rgba(15,23,36,0.85)',
          borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
            {currentRound || 'Journée 2'} ▾
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button style={navBtnStyle}>◀</button>
            <button style={navBtnStyle}>▶</button>
          </div>
        </div>

        {/* Match results grouped by date */}
        {Object.entries(matchesByDate).map(([date, dateMatches]) => (
          <div key={date}>
            <div style={{
              padding: '0.5rem 0.8rem', marginBottom: '8px',
              background: 'rgba(0,255,135,0.06)', borderRadius: '8px',
              fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'capitalize',
            }}>
              {date}
            </div>
            {dateMatches.map(match => (
              <MatchRow key={match.id} match={match} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── TABLE TAB ─── */
function TableTab({ standings, filter, setFilter }) {
  return (
    <div>
      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.2rem' }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'home', label: 'Home' },
          { id: 'away', label: 'Away' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '0.5rem 1.2rem', borderRadius: '20px', border: 'none',
              background: filter === f.id ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
              color: filter === f.id ? '#000' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <StandingsTable standings={standings} compact={false} />
    </div>
  )
}

/* ─── FIXTURES TAB ─── */
function FixturesTab({ fixtureGroups, matches, view, setView }) {
  // Build grouped view from matches if fixtureGroups is empty
  let groups = fixtureGroups
  if ((!groups || groups.length === 0) && matches.length > 0) {
    const byDate = {}
    matches.forEach(m => {
      const key = m.date || 'À venir'
      if (!byDate[key]) byDate[key] = []
      byDate[key].push(m)
    })
    groups = Object.entries(byDate).map(([date, ms]) => ({
      roundName: date,
      matches: ms
    }))
  }

  return (
    <div>
      {/* View filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        {[
          { id: 'by_date', label: 'By date' },
          { id: 'by_round', label: 'By round' },
          { id: 'by_team', label: 'By team' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setView(f.id)}
            style={{
              padding: '0.5rem 1.2rem', borderRadius: '20px', border: 'none',
              background: view === f.id ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
              color: view === f.id ? '#000' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Fixture groups */}
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {groups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: '1.5rem' }}>
            {/* Group header */}
            <div style={{
              padding: '0.6rem 1rem', marginBottom: '8px',
              background: 'rgba(0,255,135,0.08)', borderRadius: '10px',
              fontSize: '0.85rem', fontWeight: 700, color: '#fff',
              textTransform: 'capitalize',
            }}>
              {group.roundName}
            </div>

            {/* Matches in group */}
            {group.matches.map(match => (
              <FixtureRow key={match.id} match={match} />
            ))}
          </div>
        ))}

        {groups.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Aucun match programmé pour le moment.
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── STANDINGS TABLE COMPONENT ─── */
function StandingsTable({ standings, compact }) {
  if (!standings || standings.length === 0) return null

  return (
    <div style={{
      background: 'rgba(15, 23, 36, 0.85)', borderRadius: '14px',
      border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
    }}>
      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: compact
          ? '30px 1fr 30px 30px 30px 30px 40px 35px 35px 60px'
          : '30px 1fr 30px 30px 30px 30px 50px 40px 40px 70px',
        padding: '0.7rem 1rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>
        <span>#</span>
        <span></span>
        <span style={{ textAlign: 'center' }}>PL</span>
        <span style={{ textAlign: 'center' }}>W</span>
        <span style={{ textAlign: 'center' }}>D</span>
        <span style={{ textAlign: 'center' }}>L</span>
        <span style={{ textAlign: 'center' }}>+/-</span>
        <span style={{ textAlign: 'center' }}>GD</span>
        <span style={{ textAlign: 'center' }}>PTS</span>
        <span style={{ textAlign: 'center' }}>Form</span>
      </div>

      {/* Table rows */}
      {standings.map((team, i) => {
        // Determine qualification zone color
        let zoneColor = 'transparent'
        let zoneBorder = 'transparent'
        if (i < 2) { zoneColor = 'rgba(0,255,135,0.08)'; zoneBorder = 'var(--primary)' } // Champions League
        else if (i < 4) { zoneColor = 'rgba(56,189,248,0.06)'; zoneBorder = 'var(--accent)' } // Conf Cup
        else if (i >= 14) { zoneColor = 'rgba(239,68,68,0.06)'; zoneBorder = 'var(--danger)' } // Relegation

        return (
          <div
            key={team.rank || i}
            style={{
              display: 'grid',
              gridTemplateColumns: compact
                ? '30px 1fr 30px 30px 30px 30px 40px 35px 35px 60px'
                : '30px 1fr 30px 30px 30px 30px 50px 40px 40px 70px',
              padding: '0.65rem 1rem',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              borderLeft: `3px solid ${zoneBorder}`,
              background: zoneColor,
              alignItems: 'center',
              fontSize: '0.85rem',
              transition: 'background 0.15s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={(e) => e.currentTarget.style.background = zoneColor}
          >
            <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {team.rank || i + 1}
            </span>

            {/* Team name + logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <img
                src={team.logo || FOTMOB_CLUB_LOGOS[team.name] || ''}
                alt={team.name}
                style={{ width: '22px', height: '22px', objectFit: 'contain', flexShrink: 0 }}
                onError={(e) => { e.target.style.opacity = '0.3' }}
              />
              <span style={{
                fontWeight: 600, color: '#fff', fontSize: '0.85rem',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {team.name}
              </span>
            </div>

            <span style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{team.played}</span>
            <span style={{ textAlign: 'center', color: '#fff', fontWeight: 600 }}>{team.wins}</span>
            <span style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{team.draws}</span>
            <span style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{team.losses}</span>
            <span style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {team.goalsFor || '0'}-{team.goalsAgainst || '0'}
            </span>
            <span style={{
              textAlign: 'center', fontWeight: 700,
              color: (team.goalDiff || 0) > 0 ? 'var(--primary)' : (team.goalDiff || 0) < 0 ? 'var(--danger)' : 'var(--text-muted)'
            }}>
              {(team.goalDiff || 0) > 0 ? '+' : ''}{team.goalDiff || 0}
            </span>
            <span style={{ textAlign: 'center', fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>
              {team.pts}
            </span>

            {/* Form indicators */}
            <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
              {(team.form || []).slice(-5).map((f, fi) => (
                <span key={fi} style={{
                  width: '18px', height: '18px', borderRadius: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6rem', fontWeight: 800, color: '#fff',
                  background: f.result === 'W' ? '#22c55e' : f.result === 'D' ? '#6b7280' : '#ef4444',
                }}>
                  {f.result}
                </span>
              ))}
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div style={{
        padding: '0.8rem 1rem', display: 'flex', gap: '1.2rem', flexWrap: 'wrap',
        fontSize: '0.72rem', color: 'var(--text-muted)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--primary)' }}></span>
          CAF Champions League Qualification
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--accent)' }}></span>
          CAF Confederation Cup Qualification
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--danger)' }}></span>
          Relegation
        </span>
      </div>
    </div>
  )
}

/* ─── MATCH ROW (Overview sidebar) ─── */
function MatchRow({ match }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '0.6rem 0.8rem', marginBottom: '6px',
      background: 'rgba(255,255,255,0.025)', borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.04)',
      transition: 'all 0.15s', cursor: 'pointer',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
    >
      {/* Status badge */}
      <div style={{
        minWidth: '28px', textAlign: 'center',
        fontSize: '0.65rem', fontWeight: 800,
        color: match.status === 'LIVE' ? '#ef4444' : match.status === 'FT' ? 'var(--text-muted)' : 'var(--primary)',
      }}>
        {match.status === 'LIVE' && (
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444',
            display: 'inline-block', marginRight: '3px', animation: 'pulse 1s infinite',
          }}></span>
        )}
        {match.status}
      </div>

      {/* Teams */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <TeamScoreLine team={match.homeTeam} isWinner={match.homeTeam.score > match.awayTeam.score} />
        <TeamScoreLine team={match.awayTeam} isWinner={match.awayTeam.score > match.homeTeam.score} />
      </div>

      {/* Score or time */}
      <div style={{ minWidth: '42px', textAlign: 'center' }}>
        {match.status === 'VS' ? (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {match.time}
          </span>
        ) : (
          <div style={{
            background: 'rgba(0,255,135,0.12)', border: '1px solid rgba(0,255,135,0.25)',
            borderRadius: '6px', padding: '2px 8px',
            fontWeight: 800, fontSize: '0.82rem', color: 'var(--primary)',
          }}>
            {match.homeTeam.score} - {match.awayTeam.score}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── FIXTURE ROW (Fixtures tab, centered layout) ─── */
function FixtureRow({ match }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '16px', padding: '0.75rem 1rem', marginBottom: '4px',
      background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.03)',
      transition: 'all 0.15s', cursor: 'pointer',
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
    >
      {/* Live dot if live */}
      {match.status === 'LIVE' && (
        <span style={{
          width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e',
          boxShadow: '0 0 8px rgba(34,197,94,0.6)',
          animation: 'pulse 1.5s infinite',
        }}></span>
      )}

      {/* Home team (right aligned) */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff', textAlign: 'right' }}>
          {match.homeTeam.name}
        </span>
        <img
          src={match.homeTeam.logo || FOTMOB_CLUB_LOGOS[match.homeTeam.name]}
          alt={match.homeTeam.name}
          style={{ width: '24px', height: '24px', objectFit: 'contain' }}
          onError={(e) => { e.target.style.opacity = '0.3' }}
        />
      </div>

      {/* Score / Time */}
      <div style={{ minWidth: '60px', textAlign: 'center' }}>
        {match.status === 'FT' || match.status === 'LIVE' ? (
          <span style={{
            fontWeight: 800, fontSize: '0.95rem',
            color: match.status === 'LIVE' ? '#ef4444' : '#fff',
          }}>
            {match.homeTeam.score} - {match.awayTeam.score}
          </span>
        ) : (
          <span style={{
            fontWeight: 700, fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}>
            {match.time || 'TBD'}
          </span>
        )}
      </div>

      {/* Away team (left aligned) */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img
          src={match.awayTeam.logo || FOTMOB_CLUB_LOGOS[match.awayTeam.name]}
          alt={match.awayTeam.name}
          style={{ width: '24px', height: '24px', objectFit: 'contain' }}
          onError={(e) => { e.target.style.opacity = '0.3' }}
        />
        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>
          {match.awayTeam.name}
        </span>
      </div>
    </div>
  )
}

/* ─── TEAM SCORE LINE (for sidebar match card) ─── */
function TeamScoreLine({ team, isWinner }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <img
        src={team.logo || FOTMOB_CLUB_LOGOS[team.name]}
        alt={team.name}
        style={{ width: '16px', height: '16px', objectFit: 'contain' }}
        onError={(e) => { e.target.style.opacity = '0.3' }}
      />
      <span style={{
        fontSize: '0.78rem', fontWeight: isWinner ? 700 : 500,
        color: isWinner ? '#fff' : 'var(--text-muted)',
      }}>
        {team.name}
      </span>
    </div>
  )
}

/* Shared styles */
const navBtnStyle = {
  width: '28px', height: '28px', borderRadius: '6px',
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
  color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'inherit', transition: 'all 0.15s',
}

/* ─── LFP NEWS TAB ─── */
function LfpNewsTab({ articles, loading }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Chargement des communiqués LFP...
      </div>
    )
  }

  if (!articles || articles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Aucun communiqué officiel disponible pour le moment.
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
      {articles.map((article, idx) => (
        <a key={idx} href={article.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'rgba(15, 23, 36, 0.85)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
            transition: 'transform 0.2s, border-color 0.2s',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
          }}
          >
            <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{
                  background: 'rgba(0, 255, 135, 0.1)',
                  color: 'var(--primary)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {article.source}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(article.date).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                {article.title}
              </h3>
            </div>
            <div style={{
              padding: '0.8rem 1.2rem',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              color: 'var(--primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              Lire le communiqué <span>→</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}

/* ─── MY CLUB DEDICATED TAB ─── */
function MyClubTab({ favClub, standings, matches, articles }) {
  const teamStandings = standings.find(s => s.name?.toLowerCase().includes(favClub.toLowerCase()) || favClub.toLowerCase().includes(s.name?.toLowerCase()))
  const teamMatches = matches.filter(m => 
    m.homeTeam?.name?.toLowerCase().includes(favClub.toLowerCase()) || 
    m.awayTeam?.name?.toLowerCase().includes(favClub.toLowerCase())
  )

  const logoUrl = teamStandings?.logo || FOTMOB_CLUB_LOGOS[favClub] || '/logos/mca.png'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Club Banner */}
      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <img
          src={logoUrl}
          alt={favClub}
          style={{ width: '75px', height: '75px', objectFit: 'contain', filter: 'drop-shadow(0 0 15px rgba(0,255,135,0.4))' }}
        />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>⭐ Ton Club Cœur</span>
          <h2 style={{ fontSize: '1.8rem', margin: '2px 0 6px', color: '#fff' }}>{favClub}</h2>
          {teamStandings ? (
            <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Rang : <strong style={{ color: '#fff' }}>#{teamStandings.rank}</strong></span>
              <span>Points : <strong style={{ color: 'var(--primary)' }}>{teamStandings.pts} pts</strong></span>
              <span>Victoires : <strong style={{ color: '#22c55e' }}>{teamStandings.wins}V</strong></span>
              <span>Diff : <strong style={{ color: teamStandings.goalDiff >= 0 ? 'var(--primary)' : 'var(--danger)' }}>{teamStandings.goalDiff > 0 ? '+' : ''}{teamStandings.goalDiff}</strong></span>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Données du classement disponibles dès les prochaines rencontres.</p>
          )}
        </div>
      </div>

      {/* Matchs du club */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#fff' }}>🏟️ Rencontres de {favClub}</h3>
        {teamMatches.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {teamMatches.map(m => (
              <FixtureRow key={m.id} match={m} />
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>Toutes les rencontres de {favClub} s'afficheront ici en direct.</p>
        )}
      </div>

      {/* Communiqués & Actualités */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#fff' }}>📰 Communiqués & Actualités LFP Officiel</h3>
        <LfpNewsTab articles={articles} loading={false} />
      </div>

    </div>
  )
}

