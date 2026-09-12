import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const FALLBACK_CLUBS = [
  { id: '524', name: 'ASO Chlef', logo_url: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F524-1663164373.png' },
  { id: '670', name: 'CR Belouizdad', logo_url: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F670-1788197077.png' },
  { id: '678', name: 'CS Constantine', logo_url: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F678-1744537577.png' },
  { id: '754', name: 'CR Témouchent', logo_url: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F754-1663163636.png' },
  { id: '518', name: 'US Biskra', logo_url: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F518-1637065781.png' },
  { id: '653', name: 'USM Khenchela', logo_url: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F653-1663164387.png' },
  { id: '673', name: 'USM Alger', logo_url: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F673-1715352459.png' },
  { id: '675', name: 'MC Oran', logo_url: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F675-1757531391.png' },
  { id: '677', name: 'MC Alger', logo_url: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F677-1715269288.png' },
  { id: '755', name: 'ES Ben Aknoun', logo_url: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F755-1663164159.png' },
  { id: '758', name: 'Olympique Akbou', logo_url: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F758-1770131189.png' },
  { id: '759', name: 'JS El Biar', logo_url: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F759-1788436581.png' },
  { id: '409', name: 'MB Rouissat', logo_url: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2F409-1755174810.png' },
  { id: 'jsk', name: 'JS Kabylie', logo_url: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2Fjsk.png' },
  { id: 'jssaoura', name: 'JS Saoura', logo_url: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2Fjssaoura.png' },
  { id: 'essetif', name: 'ES Sétif', logo_url: '/api/image-proxy?url=https%3A%2F%2Flfp.dz%2Fclubs-logos%2Fessetif.png' }
];

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://lfp.dz/fr/clubs', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal,
      next: { revalidate: 3600 }
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`LFP HTTP error ${res.status}`);
    }
    
    const html = await res.text();
    const $ = cheerio.load(html);
    const clubs = [];
    
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('/club/')) {
        const text = $(el).text().trim();
        const img = $(el).find('img').attr('src');
        const id = href.split('/').pop();
        
        if (text && img && id && id !== '-1' && !clubs.find(c => c.id === id)) {
          const rawUrl = img.startsWith('http') ? img : `https://lfp.dz${img}`;
          clubs.push({
            id: id,
            name: text,
            url: `https://lfp.dz${href}`,
            logo_url: `/api/image-proxy?url=${encodeURIComponent(rawUrl)}`
          });
        }
      }
    });

    if (clubs.length > 0) {
      return NextResponse.json({ clubs });
    }
    
    return NextResponse.json({ clubs: FALLBACK_CLUBS });
    
  } catch (error) {
    console.error('LFP Clubs Scraper Error:', error.message);
    return NextResponse.json({ clubs: FALLBACK_CLUBS });
  }
}
