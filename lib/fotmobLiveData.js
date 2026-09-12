import { supabase } from './supabaseClient'

// Live Fotmob CDN Logos mapping for Algerian Ligue 1 clubs
export const FOTMOB_CLUB_LOGOS = {
  'MC Alger': 'https://lfp.dz/clubs-logos/677-1715269288.png',
  'CR Belouizdad': 'https://lfp.dz/clubs-logos/670-1788197077.png',
  'JS Kabylie': 'https://lfp.dz/clubs-logos/jsk.png',
  'USM Alger': 'https://lfp.dz/clubs-logos/673-1715352459.png',
  'ES Sétif': 'https://lfp.dz/clubs-logos/essetif.png',
  'CS Constantine': 'https://lfp.dz/clubs-logos/678-1744537577.png',
  'ASO Chlef': 'https://lfp.dz/clubs-logos/524-1663164373.png',
  'US Biskra': 'https://lfp.dz/clubs-logos/518-1637065781.png',
  'JS Saoura': 'https://lfp.dz/clubs-logos/jssaoura.png',
  'USM Khenchela': 'https://lfp.dz/clubs-logos/653-1663164387.png',
  'MC Oran': 'https://lfp.dz/clubs-logos/675-1757531391.png',
  'ES Ben Aknoun': 'https://lfp.dz/clubs-logos/755-1663164159.png',
  'NC Magra': 'https://images.fotmob.com/image_resources/logo/teamlogo/975932.png',
  'MC El Bayadh': 'https://images.fotmob.com/image_resources/logo/teamlogo/1335956.png',
  'US Souf': 'https://images.fotmob.com/image_resources/logo/teamlogo/1474273.png',
  'Paradou AC': 'https://images.fotmob.com/image_resources/logo/teamlogo/420790.png',
  'USM Annaba': 'https://images.fotmob.com/image_resources/logo/teamlogo/101629.png',
  'Olympique Akbou': 'https://lfp.dz/clubs-logos/758-1770131189.png',
  'O Akbou': 'https://lfp.dz/clubs-logos/758-1770131189.png',
  'CR Témouchent': 'https://lfp.dz/clubs-logos/754-1663163636.png',
  'MB Rouissat': 'https://lfp.dz/clubs-logos/409-1755174810.png',
  'JS El Biar': 'https://lfp.dz/clubs-logos/759-1788436581.png'
}

// Scraper / Extracteur en direct depuis FotMob (Ligue 1 - ID 516)
export async function fetchLiveFotmobData() {
  try {
    const res = await fetch('https://www.fotmob.com/leagues/516/overview/ligue-1', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 60 } // Revalidation automatique chaque minute
    })

    if (!res.ok) throw new Error(`FotMob fetch status ${res.status}`)

    const html = await res.text()
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)
    
    if (!nextDataMatch) throw new Error('__NEXT_DATA__ non trouvé')

    const json = JSON.parse(nextDataMatch[1])
    const props = json.props?.pageProps || {}

    // 1. Extraire les matchs réels
    const rawMatches = props.overview?.leagueOverviewMatches || props.fixtures?.allFixtures || []
    const parsedMatches = rawMatches.slice(0, 8).map((m, idx) => {
      const homeName = m.home?.name || m.opponent?.name || 'Home'
      const awayName = m.away?.name || 'Away'
      const isFinished = m.status?.finished || false
      const scoreStr = m.status?.scoreStr || '0 - 0'
      const [hScore, aScore] = scoreStr.split('-').map(s => parseInt(s.trim()) || 0)

      return {
        id: m.id || idx + 1,
        status: isFinished ? 'FT' : (m.status?.started ? 'LIVE' : 'VS'),
        matchTime: isFinished ? '90\'' : (m.status?.reason?.short || '20:00'),
        homeTeam: {
          name: homeName,
          score: hScore,
          logo: FOTMOB_CLUB_LOGOS[homeName] || `https://images.fotmob.com/image_resources/logo/teamlogo/${m.home?.id || 101632}.png`
        },
        awayTeam: {
          name: awayName,
          score: aScore,
          logo: FOTMOB_CLUB_LOGOS[awayName] || `https://images.fotmob.com/image_resources/logo/teamlogo/${m.away?.id || 101631}.png`
        }
      }
    })

    // 2. Extraire le classement réel des clubs
    const rawTable = props.table?.[0]?.data?.table?.all || props.table?.[0]?.data?.tables?.[0]?.table?.all || []
    const parsedStandings = rawTable.map(row => ({
      rank: row.idx,
      name: row.name,
      logo: FOTMOB_CLUB_LOGOS[row.name] || `https://images.fotmob.com/image_resources/logo/teamlogo/${row.id}.png`,
      played: row.played,
      wins: row.wins,
      draws: row.draws,
      losses: row.losses,
      pts: row.pts,
      goalDiff: row.goalConDiff
    }))

    return {
      success: true,
      matches: parsedMatches,
      standings: parsedStandings,
      season: props.details?.selectedSeason || '2026/2027',
      fetchedAt: new Date().toISOString()
    }

  } catch (err) {
    console.error('FotMob live fetch failed:', err.message)
    // Fallback de secours
    return {
      success: false,
      error: err.message,
      matches: [
        {
          id: 1, status: 'FT', matchTime: '90\'',
          homeTeam: { name: 'MC Oran', score: 2, logo: FOTMOB_CLUB_LOGOS['MC Oran'] },
          awayTeam: { name: 'CR Témouchent', score: 0, logo: FOTMOB_CLUB_LOGOS['CR Témouchent'] }
        },
        {
          id: 2, status: 'FT', matchTime: '90\'',
          homeTeam: { name: 'CR Belouizdad', score: 1, logo: FOTMOB_CLUB_LOGOS['CR Belouizdad'] },
          awayTeam: { name: 'ES Sétif', score: 0, logo: FOTMOB_CLUB_LOGOS['ES Sétif'] }
        },
        {
          id: 3, status: 'FT', matchTime: '90\'',
          homeTeam: { name: 'MB Rouissat', score: 0, logo: FOTMOB_CLUB_LOGOS['MB Rouissat'] },
          awayTeam: { name: 'Olympique Akbou', score: 0, logo: FOTMOB_CLUB_LOGOS['Olympique Akbou'] }
        },
        {
          id: 4, status: 'VS', matchTime: '21:00',
          homeTeam: { name: 'CS Constantine', score: 0, logo: FOTMOB_CLUB_LOGOS['CS Constantine'] },
          awayTeam: { name: 'ASO Chlef', score: 0, logo: FOTMOB_CLUB_LOGOS['ASO Chlef'] }
        }
      ]
    }
  }
}
