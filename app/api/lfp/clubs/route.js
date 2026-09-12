import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET() {
  try {
    const res = await fetch('https://lfp.dz/fr/clubs', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      next: { revalidate: 86400 } // Cache for 24 hours (clubs rarely change)
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch LFP clubs: ${res.status}`);
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
          clubs.push({
            id: id,
            name: text,
            url: `https://lfp.dz${href}`,
            logo_url: img.startsWith('http') ? img : `https://lfp.dz${img}`
          });
        }
      }
    });
    
    return NextResponse.json({ clubs });
    
  } catch (error) {
    console.error('LFP Clubs Scraper Error:', error);
    return NextResponse.json({ clubs: [], error: error.message }, { status: 500 });
  }
}
