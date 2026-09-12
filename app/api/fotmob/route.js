import { FOTMOB_CLUB_LOGOS } from '../../../lib/fotmobLiveData'

// Server-side API route to fetch FotMob data directly from their JSON API
export async function GET(request) {
  try {
    // Use FotMob's direct JSON API (much cleaner than scraping HTML)
    const res = await fetch('https://www.fotmob.com/api/leagues?id=516', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 60 }
    })

    if (!res.ok) throw new Error(`FotMob API HTTP ${res.status}`)

    const data = await res.json()

    // 1. Parse standings
    const rawTable = data.table?.[0]?.data?.table?.all
      || data.table?.[0]?.data?.tables?.[0]?.table?.all
      || data.overview?.table?.[0]?.data?.table?.all
      || []

    const standings = rawTable.map(row => {
      const [goalsFor, goalsAgainst] = (row.scoresStr || '0-0')
        .split('-')
        .map(s => parseInt(s.trim(), 10) || 0)

      // Parse form: can be strings ["w","d","l"] or objects [{result:"w", resultString:"W"}]
      const rawForm = row.form || []
      const form = rawForm.map(f => {
        if (typeof f === 'string') {
          return { result: f.toUpperCase() }
        }
        return { result: (f.resultString || f.result || '').toUpperCase() }
      })

      return {
        rank: row.idx,
        id: row.id,
        name: row.name,
        shortName: row.shortName || row.name,
        logo: FOTMOB_CLUB_LOGOS[row.name] || `https://images.fotmob.com/image_resources/logo/teamlogo/${row.id}.png`,
        played: row.played,
        wins: row.wins,
        draws: row.draws,
        losses: row.losses,
        goalsFor: String(goalsFor),
        goalsAgainst: String(goalsAgainst),
        goalDiff: row.goalConDiff,
        pts: row.pts,
        form,
        qualColor: row.qualColor || null,
      }
    })

    // 2. Parse overview matches
    const rawOverviewMatches = data.overview?.leagueOverviewMatches || []
    const overviewMatches = rawOverviewMatches.map(m => parseMatch(m))

    // 3. Parse full season fixtures grouped by round
    let fixtureGroups = []
    const allFixturesRaw = data.fixtures?.allFixtures?.fixtures || data.fixtures?.allFixtures
    if (Array.isArray(allFixturesRaw)) {
      fixtureGroups = allFixturesRaw.map(roundItem => ({
        roundName: roundItem.roundName || `Round ${roundItem.round}`,
        round: roundItem.round,
        matches: (roundItem.matches || []).map(m => parseMatch(m))
      }))
    }

    // If no fixture groups but have overview matches, group them by date
    if (fixtureGroups.length === 0 && overviewMatches.length > 0) {
      const byDate = {}
      overviewMatches.forEach(m => {
        const key = m.date || 'À venir'
        if (!byDate[key]) byDate[key] = []
        byDate[key].push(m)
      })
      fixtureGroups = Object.entries(byDate).map(([date, matches]) => ({
        roundName: date,
        matches
      }))
    }

    // 4. Parse legend (qualification zones)
    const legend = data.table?.[0]?.data?.legend || []

    return Response.json({
      success: true,
      standings,
      overviewMatches,
      fixtureGroups,
      legend,
      season: data.details?.selectedSeason || '2026/2027',
      fetchedAt: new Date().toISOString()
    })

  } catch (err) {
    console.error('FotMob API error:', err.message)

    // Fallback: try HTML scraping
    try {
      return await scrapeHtmlFallback()
    } catch (e2) {
      console.error('HTML fallback also failed:', e2.message)
      return Response.json({
        success: false,
        error: err.message,
        standings: getFallbackStandings(),
        overviewMatches: getFallbackMatches(),
        fixtureGroups: getFallbackFixtures(),
        legend: [],
        season: '2026/2027',
        fetchedAt: new Date().toISOString()
      })
    }
  }
}

async function scrapeHtmlFallback() {
  const res = await fetch('https://www.fotmob.com/leagues/516/overview/ligue-1', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    next: { revalidate: 60 }
  })
  if (!res.ok) throw new Error(`HTML scrape HTTP ${res.status}`)
  const html = await res.text()
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)
  if (!match) throw new Error('__NEXT_DATA__ not found')
  const json = JSON.parse(match[1])
  const data = json.props?.pageProps || {}

  const rawTable = data.table?.[0]?.data?.table?.all || []
  const standings = rawTable.map(row => {
    const [goalsFor, goalsAgainst] = (row.scoresStr || '0-0').split('-').map(s => parseInt(s.trim(), 10) || 0)
    const rawForm = row.form || []
    const form = rawForm.map(f => typeof f === 'string' ? { result: f.toUpperCase() } : { result: (f.resultString || f.result || '').toUpperCase() })
    return {
      rank: row.idx, id: row.id, name: row.name, shortName: row.shortName || row.name,
      logo: FOTMOB_CLUB_LOGOS[row.name] || `https://images.fotmob.com/image_resources/logo/teamlogo/${row.id}.png`,
      played: row.played, wins: row.wins, draws: row.draws, losses: row.losses,
      goalsFor: String(goalsFor), goalsAgainst: String(goalsAgainst),
      goalDiff: row.goalConDiff, pts: row.pts, form, qualColor: row.qualColor || null,
    }
  })

  const overviewMatches = (data.overview?.leagueOverviewMatches || []).map(m => parseMatch(m))
  const byDate = {}
  overviewMatches.forEach(m => {
    const key = m.date || 'À venir'
    if (!byDate[key]) byDate[key] = []
    byDate[key].push(m)
  })

  return Response.json({
    success: true,
    standings,
    overviewMatches,
    fixtureGroups: Object.entries(byDate).map(([date, matches]) => ({ roundName: date, matches })),
    legend: data.table?.[0]?.data?.legend || [],
    season: data.details?.selectedSeason || '2026/2027',
    fetchedAt: new Date().toISOString()
  })
}

function parseMatch(m) {
  const homeName = m.home?.name || 'Home'
  const awayName = m.away?.name || 'Away'
  const isFinished = m.status?.finished || false
  const isStarted = m.status?.started || false
  const isOngoing = m.status?.ongoing || (isStarted && !isFinished)

  // Get score from either score field or scoreStr
  let hScore = m.home?.score
  let aScore = m.away?.score
  if (hScore == null && m.status?.scoreStr) {
    const parts = m.status.scoreStr.split('-').map(s => parseInt(s.trim()) || 0)
    hScore = parts[0]
    aScore = parts[1]
  }

  // Parse date/time
  const utcTime = m.status?.utcTime || ''
  let dateStr = ''
  let timeStr = ''
  if (utcTime) {
    const d = new Date(utcTime)
    dateStr = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  return {
    id: m.id || Math.random(),
    status: isFinished ? 'FT' : (isOngoing ? 'LIVE' : 'VS'),
    minute: m.status?.liveTime?.short || '',
    date: dateStr,
    time: timeStr || m.time || m.status?.reason?.short || '',
    round: m.round || m.roundName || '',
    homeTeam: {
      name: homeName,
      id: m.home?.id,
      score: isFinished || isOngoing ? (hScore ?? 0) : null,
      logo: FOTMOB_CLUB_LOGOS[homeName] || `https://images.fotmob.com/image_resources/logo/teamlogo/${m.home?.id || 0}.png`
    },
    awayTeam: {
      name: awayName,
      id: m.away?.id,
      score: isFinished || isOngoing ? (aScore ?? 0) : null,
      logo: FOTMOB_CLUB_LOGOS[awayName] || `https://images.fotmob.com/image_resources/logo/teamlogo/${m.away?.id || 0}.png`
    }
  }
}

// Fallback data based on real Ligue 1 Mobilis 2026/27 results
function getFallbackStandings() {
  const teams = [
    { rank: 1, name: 'USM Alger', played: 2, wins: 1, draws: 1, losses: 0, goalsFor: '2', goalsAgainst: '0', goalDiff: 2, pts: 4, form: [{result:'W'},{result:'D'}] },
    { rank: 2, name: 'Olympique Akbou', played: 2, wins: 1, draws: 1, losses: 0, goalsFor: '2', goalsAgainst: '0', goalDiff: 2, pts: 4, form: [{result:'D'},{result:'W'}] },
    { rank: 3, name: 'CR Belouizdad', played: 2, wins: 1, draws: 1, losses: 0, goalsFor: '4', goalsAgainst: '3', goalDiff: 1, pts: 4, form: [{result:'D'},{result:'W'}] },
    { rank: 4, name: 'ES Ben Aknoun', played: 2, wins: 1, draws: 1, losses: 0, goalsFor: '3', goalsAgainst: '2', goalDiff: 1, pts: 4, form: [{result:'W'},{result:'D'}] },
    { rank: 5, name: 'MC Oran', played: 1, wins: 1, draws: 0, losses: 0, goalsFor: '2', goalsAgainst: '0', goalDiff: 2, pts: 3, form: [{result:'W'}] },
    { rank: 6, name: 'JS Kabylie', played: 1, wins: 1, draws: 0, losses: 0, goalsFor: '1', goalsAgainst: '0', goalDiff: 1, pts: 3, form: [{result:'W'}] },
    { rank: 7, name: 'ASO Chlef', played: 1, wins: 0, draws: 1, losses: 0, goalsFor: '3', goalsAgainst: '3', goalDiff: 0, pts: 1, form: [{result:'D'}] },
    { rank: 8, name: 'US Biskra', played: 1, wins: 0, draws: 1, losses: 0, goalsFor: '2', goalsAgainst: '2', goalDiff: 0, pts: 1, form: [{result:'D'}] },
    { rank: 9, name: 'CS Constantine', played: 1, wins: 0, draws: 1, losses: 0, goalsFor: '1', goalsAgainst: '1', goalDiff: 0, pts: 1, form: [{result:'D'}] },
    { rank: 10, name: 'USM Khenchela', played: 1, wins: 0, draws: 1, losses: 0, goalsFor: '0', goalsAgainst: '0', goalDiff: 0, pts: 1, form: [{result:'D'}] },
    { rank: 11, name: 'MB Rouissat', played: 2, wins: 0, draws: 1, losses: 1, goalsFor: '0', goalsAgainst: '1', goalDiff: -1, pts: 1, form: [{result:'D'},{result:'L'}] },
    { rank: 12, name: 'CR Témouchent', played: 2, wins: 0, draws: 1, losses: 1, goalsFor: '1', goalsAgainst: '3', goalDiff: -2, pts: 1, form: [{result:'D'},{result:'L'}] },
    { rank: 13, name: 'JS Saoura', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: '0', goalsAgainst: '0', goalDiff: 0, pts: 0, form: [] },
    { rank: 14, name: 'MC Alger', played: 0, wins: 0, draws: 0, losses: 0, goalsFor: '0', goalsAgainst: '0', goalDiff: 0, pts: 0, form: [] },
    { rank: 15, name: 'ES Sétif', played: 2, wins: 0, draws: 0, losses: 2, goalsFor: '0', goalsAgainst: '2', goalDiff: -2, pts: 0, form: [{result:'L'},{result:'L'}] },
    { rank: 16, name: 'JS El Biar', played: 2, wins: 0, draws: 0, losses: 2, goalsFor: '0', goalsAgainst: '4', goalDiff: -4, pts: 0, form: [{result:'L'},{result:'L'}] },
  ]
  return teams.map(t => ({ ...t, logo: FOTMOB_CLUB_LOGOS[t.name] || '' }))
}

function getFallbackMatches() {
  return [
    { id: 1, status: 'FT', date: 'jeudi 11 septembre', time: '', round: 'Journée 2',
      homeTeam: { name: 'ES Ben Aknoun', score: 2, logo: FOTMOB_CLUB_LOGOS['ES Ben Aknoun'] },
      awayTeam: { name: 'US Biskra', score: 2, logo: FOTMOB_CLUB_LOGOS['US Biskra'] } },
    { id: 2, status: 'FT', date: 'jeudi 11 septembre', time: '', round: 'Journée 2',
      homeTeam: { name: 'USM Alger', score: 2, logo: FOTMOB_CLUB_LOGOS['USM Alger'] },
      awayTeam: { name: 'JS El Biar', score: 0, logo: FOTMOB_CLUB_LOGOS['JS El Biar'] } },
    { id: 3, status: 'FT', date: 'vendredi 12 septembre', time: '', round: 'Journée 2',
      homeTeam: { name: 'MC Oran', score: 2, logo: FOTMOB_CLUB_LOGOS['MC Oran'] },
      awayTeam: { name: 'CR Témouchent', score: 0, logo: FOTMOB_CLUB_LOGOS['CR Témouchent'] } },
    { id: 4, status: 'FT', date: 'vendredi 12 septembre', time: '', round: 'Journée 2',
      homeTeam: { name: 'CR Belouizdad', score: 1, logo: FOTMOB_CLUB_LOGOS['CR Belouizdad'] },
      awayTeam: { name: 'ES Sétif', score: 0, logo: FOTMOB_CLUB_LOGOS['ES Sétif'] } },
    { id: 5, status: 'FT', date: 'vendredi 12 septembre', time: '', round: 'Journée 2',
      homeTeam: { name: 'MB Rouissat', score: 0, logo: FOTMOB_CLUB_LOGOS['MB Rouissat'] },
      awayTeam: { name: 'Olympique Akbou', score: 0, logo: FOTMOB_CLUB_LOGOS['Olympique Akbou'] } },
    { id: 6, status: 'VS', date: 'vendredi 19 septembre', time: '21:00', round: 'Journée 3',
      homeTeam: { name: 'CS Constantine', score: null, logo: FOTMOB_CLUB_LOGOS['CS Constantine'] },
      awayTeam: { name: 'ASO Chlef', score: null, logo: FOTMOB_CLUB_LOGOS['ASO Chlef'] } },
  ]
}

function getFallbackFixtures() {
  return [
    {
      roundName: 'Journée 3',
      round: 3,
      matches: [
        { id: 10, status: 'VS', date: 'jeudi 18 septembre', time: '18:00', homeTeam: { name: 'US Biskra', score: null, logo: FOTMOB_CLUB_LOGOS['US Biskra'] }, awayTeam: { name: 'CR Belouizdad', score: null, logo: FOTMOB_CLUB_LOGOS['CR Belouizdad'] } },
        { id: 11, status: 'VS', date: 'jeudi 18 septembre', time: '20:00', homeTeam: { name: 'CR Témouchent', score: null, logo: FOTMOB_CLUB_LOGOS['CR Témouchent'] }, awayTeam: { name: 'JS Kabylie', score: null, logo: FOTMOB_CLUB_LOGOS['JS Kabylie'] } },
        { id: 12, status: 'VS', date: 'vendredi 19 septembre', time: '16:00', homeTeam: { name: 'USM Khenchela', score: null, logo: FOTMOB_CLUB_LOGOS['USM Khenchela'] }, awayTeam: { name: 'ES Ben Aknoun', score: null, logo: FOTMOB_CLUB_LOGOS['ES Ben Aknoun'] } },
        { id: 13, status: 'VS', date: 'vendredi 19 septembre', time: '19:00', homeTeam: { name: 'MC Alger', score: null, logo: FOTMOB_CLUB_LOGOS['MC Alger'] }, awayTeam: { name: 'MB Rouissat', score: null, logo: FOTMOB_CLUB_LOGOS['MB Rouissat'] } },
        { id: 14, status: 'VS', date: 'vendredi 19 septembre', time: '21:00', homeTeam: { name: 'ASO Chlef', score: null, logo: FOTMOB_CLUB_LOGOS['ASO Chlef'] }, awayTeam: { name: 'MC Oran', score: null, logo: FOTMOB_CLUB_LOGOS['MC Oran'] } },
      ]
    }
  ]
}
