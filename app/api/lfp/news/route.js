import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const FALLBACK_NEWS = [
  {
    id: '101',
    title: 'Ligue 1 Mobilis : Programme et désignation des arbitres pour la prochaine journée',
    url: 'https://lfp.dz/fr/actualites',
    imageUrl: 'https://lfp.dz/images/lfp_logo.png',
    source: 'LFP Officiel',
    date: '2026-09-12'
  },
  {
    id: '102',
    title: 'Discipline : Communiqué officiel du bureau de la Ligue de Football Professionnel',
    url: 'https://lfp.dz/fr/discipline',
    imageUrl: 'https://lfp.dz/images/lfp_logo.png',
    source: 'LFP Officiel',
    date: '2026-09-11'
  },
  {
    id: '103',
    title: 'LFP DZ : Homologation des stades et organisation des rencontres de Ligue 1',
    url: 'https://lfp.dz/fr/stades',
    imageUrl: 'https://lfp.dz/images/lfp_logo.png',
    source: 'LFP Officiel',
    date: '2026-09-10'
  }
];

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch('https://lfp.dz/fr/actualites', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal,
      next: { revalidate: 3600 }
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch LFP news: ${res.status}`);
    }
    
    const html = await res.text();
    const $ = cheerio.load(html);
    const articles = [];
    const seenUrls = new Set();
    
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
      
      if (href && (href.includes('/article/') || href.includes('/actualite/')) && text.length > 15 && text !== 'Lire la suite') {
        const fullUrl = href.startsWith('http') ? href : `https://lfp.dz${href}`;
        
        if (!seenUrls.has(fullUrl)) {
          seenUrls.add(fullUrl);
          const container = $(el).closest('div');
          const imgSrc = container.find('img').attr('src');
          const imageUrl = imgSrc ? (imgSrc.startsWith('http') ? imgSrc : `https://lfp.dz${imgSrc}`) : 'https://lfp.dz/images/lfp_logo.png';
          
          articles.push({
            id: fullUrl.split('/').pop(),
            title: text,
            url: fullUrl,
            imageUrl: imageUrl,
            source: 'LFP Officiel',
            date: new Date().toISOString().slice(0, 10)
          });
        }
      }
    });

    if (articles.length > 0) {
      return NextResponse.json({ articles });
    }
    
    return NextResponse.json({ articles: FALLBACK_NEWS });
    
  } catch (error) {
    console.error('LFP News Scraper Error:', error.message);
    return NextResponse.json({ articles: FALLBACK_NEWS });
  }
}
