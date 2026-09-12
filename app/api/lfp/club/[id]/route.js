import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const res = await fetch(`https://lfp.dz/fr/club/${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) throw new Error(`Failed to fetch club ${id}: ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract club name
    const name = $('h3').first().text().trim() || '';

    // Extract club logo
    const logo = $('img').filter((i, el) => {
      const src = $(el).attr('src') || '';
      return src.includes('clubs-logos');
    }).first().attr('src');

    // Extract address and colors
    let address = '';
    let colors = '';
    $('span, div, p').each((i, el) => {
      const text = $(el).text().trim();
      if (text.startsWith('Adresse:')) address = text.replace('Adresse:', '').trim();
      if (text.startsWith('Couleurs:')) colors = text.replace('Couleurs:', '').trim();
    });

    // Extract players grouped by position
    const players = [];
    let activePosition = '';
    
    $('h4, a[href*="/player/"]').each((i, el) => {
      const tag = el.tagName || el.name;
      if (tag === 'h4') {
        const text = $(el).text().trim();
        const posMap = {
          'Gardiens de but': 'Gardien',
          'Défenseurs': 'Défenseur', 
          'Milieux de terrain': 'Milieu',
          'Attaquants': 'Attaquant'
        };
        if (posMap[text]) activePosition = posMap[text];
        return;
      }
      
      const href = $(el).attr('href') || '';
      if (!href.includes('/player/')) return;
      
      const playerId = href.split('/').pop();
      const fullText = $(el).text().trim();
      const img = $(el).find('img').attr('src');
      
      const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
      
      let number = '';
      let name = '';
      let age = '';
      let nationality = '';
      
      for (const line of lines) {
        if (/^\d{1,2}$/.test(line)) {
          number = line;
        } else if (line.startsWith('Âge')) {
          age = line.replace('Âge :', '').replace('Âge:', '').trim();
        } else if (['Algérie', 'Tunisie', 'Maroc', 'France', 'Cameroun', 'Mali', 'Sénégal', "Côte d'Ivoire", 'Guinée', 'Nigeria', 'RD Congo', 'Congo', 'Burkina Faso', 'Ghana', 'Gabon', 'Libye', 'Egypte', 'Palestine', 'Syrie', 'Jordanie', 'Irak', 'Gambie', 'Centrafrique', 'Mauritanie', 'Niger', 'Bénin', 'Togo', 'Comores', 'Madagascar', 'Cap-Vert'].includes(line)) {
          nationality = line;
        } else if (line.length > 2 && !name) {
          name = line;
        }
      }
      
      if (!name && lines.length >= 2) {
        name = lines.find(l => l.length > 3 && !/^\d+$/.test(l) && !l.startsWith('Âge')) || '';
      }

      if (name || number) {
        players.push({
          id: playerId,
          number,
          name,
          age,
          nationality,
          position: activePosition || 'Inconnu',
          photo: img ? (img.startsWith('http') ? img : `https://lfp.dz${img}`) : null
        });
      }
    });

    // Extract staff
    const staff = [];
    $('a[href*="/staff/"], a[href*="/coach/"]').each((i, el) => {
      const fullText = $(el).text().trim();
      const img = $(el).find('img').attr('src');
      const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
      
      let name = '';
      let role = '';
      let nationality = '';
      
      for (const line of lines) {
        if (['Algérie', 'Tunisie', 'Maroc', 'France', 'Cameroun', 'Mali', 'Sénégal'].includes(line)) {
          nationality = line;
        } else if (line.includes('ENTRAINEUR') || line.includes('DTS') || line.includes('ADJOINT') || line.includes('MEDECIN') || line.includes('KINE') || line.includes('PREPARATEUR') || line.includes('INTENDANT')) {
          role = line;
        } else if (!name && line.length > 3) {
          name = line;
        }
      }
      
      if (name) {
        staff.push({
          name,
          role: role || 'Staff',
          nationality,
          photo: img ? (img.startsWith('http') ? img : `https://lfp.dz${img}`) : null
        });
      }
    });

    return NextResponse.json({
      id,
      name,
      logo: logo ? (logo.startsWith('http') ? logo : `https://lfp.dz${logo}`) : null,
      address,
      colors,
      players,
      staff,
      source: `https://lfp.dz/fr/club/${id}`
    });

  } catch (error) {
    console.error('LFP Club Detail Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
