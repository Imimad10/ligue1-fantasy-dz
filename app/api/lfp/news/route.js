import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET() {
  try {
    const res = await fetch('https://lfp.dz/fr/articles', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
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
      
      if (href && href.includes('/article/') && text.length > 15 && text !== 'Lire la suite') {
        const fullUrl = href.startsWith('http') ? href : `https://lfp.dz${href}`;
        
        if (!seenUrls.has(fullUrl)) {
          seenUrls.add(fullUrl);
          
          // Try to find image and date by navigating to parent container
          const container = $(el).closest('div');
          const imgSrc = container.find('img').attr('src');
          const imageUrl = imgSrc ? (imgSrc.startsWith('http') ? imgSrc : `https://lfp.dz${imgSrc}`) : null;
          
          articles.push({
            id: fullUrl.split('/').pop(),
            title: text,
            url: fullUrl,
            imageUrl: imageUrl || '/logo.png', // Fallback to app logo
            source: 'LFP Officiel',
            date: new Date().toISOString() // Fallback if no date parsed
          });
        }
      }
    });
    
    return NextResponse.json({ articles });
    
  } catch (error) {
    console.error('LFP News Scraper Error:', error);
    return NextResponse.json({ articles: [], error: error.message }, { status: 500 });
  }
}
