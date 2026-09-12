import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const CLUB_DATA = {
  '524': {
    name: 'ASO Chlef',
    logo: 'https://lfp.dz/clubs-logos/524-1663164373.png',
    address: 'CHLEF, Algérie',
    colors: 'Rouge et Blanc',
    players: [
      { id: '5241', number: '1', name: 'Chamce Eddine Rahmani', position: 'Gardien', age: '28', nationality: 'Algérie' },
      { id: '5242', number: '16', name: 'Ali-Tadjeddine Tergou', position: 'Gardien', age: '24', nationality: 'Algérie' },
      { id: '5243', number: '30', name: 'Abderrahmane Medjadel', position: 'Gardien', age: '26', nationality: 'Algérie' },
      
      { id: '5244', number: '2', name: 'Said Lamrani', position: 'Défenseur', age: '25', nationality: 'Algérie' },
      { id: '5245', number: '3', name: 'Amir Laidouni', position: 'Défenseur', age: '24', nationality: 'Algérie' },
      { id: '5246', number: '4', name: 'Belkacem Brahimi', position: 'Défenseur', age: '29', nationality: 'Algérie' },
      { id: '5247', number: '5', name: 'Abderrahim Hamdani', position: 'Défenseur', age: '23', nationality: 'Algérie' },
      { id: '5248', number: '12', name: 'Chems Eddine Bekkouche', position: 'Défenseur', age: '22', nationality: 'Algérie' },
      { id: '5249', number: '15', name: 'Abdelhak Debbari', position: 'Défenseur', age: '30', nationality: 'Algérie' },
      { id: '5250', number: '22', name: 'Zakaria Abdelli', position: 'Défenseur', age: '26', nationality: 'Algérie' },

      { id: '5251', number: '6', name: 'Mohamed Alaa Eddine Belaribi', position: 'Milieu', age: '23', nationality: 'Algérie' },
      { id: '5252', number: '8', name: 'Imad Eddine Larbi', position: 'Milieu', age: '25', nationality: 'Algérie' },
      { id: '5253', number: '10', name: 'Samir Aiboud', position: 'Milieu', age: '28', nationality: 'Algérie' },
      { id: '5254', number: '14', name: 'Mahamadou Ismael', position: 'Milieu', age: '24', nationality: 'Niger' },
      { id: '5255', number: '18', name: 'Djamel Belalem', position: 'Milieu', age: '22', nationality: 'Algérie' },
      { id: '5256', number: '20', name: 'Ousmane Diakite', position: 'Milieu', age: '23', nationality: 'Mali' },

      { id: '5257', number: '7', name: 'Zoubir Motrani', position: 'Attaquant', age: '29', nationality: 'Algérie' },
      { id: '5258', number: '9', name: 'Edward Daddy Ledlum', position: 'Attaquant', age: '25', nationality: 'Liberia' },
      { id: '5259', number: '11', name: 'Anis Elhadj Benchouya', position: 'Attaquant', age: '22', nationality: 'Algérie' },
      { id: '5260', number: '17', name: 'Yasser Belaribi', position: 'Attaquant', age: '24', nationality: 'Algérie' },
      { id: '5261', number: '19', name: 'Kokou Bruno Avotor', position: 'Attaquant', age: '23', nationality: 'Togo' }
    ],
    staff: [
      { name: 'Abdelkader Amrani', role: 'ENTRAINEUR PRINCIPAL', nationality: 'Algérie' },
      { name: 'Fouad Bouali', role: 'ENTRAINEUR ADJOINT', nationality: 'Algérie' },
      { name: 'Kamel Boudjenane', role: 'PREPARATEUR PHYSIQUE', nationality: 'Algérie' },
      { name: 'Mohamed Benhamou', role: 'ENTRAINEUR DES GARDIENS', nationality: 'Algérie' }
    ]
  },

  '670': {
    name: 'CR Belouizdad',
    logo: 'https://lfp.dz/clubs-logos/670-1788197077.png',
    address: 'BELOUIZDAD, ALGER',
    colors: 'Rouge et Blanc',
    players: [
      { id: '6701', number: '1', name: 'Alexis Guendouz', position: 'Gardien', age: '28', nationality: 'Algérie' },
      { id: '6702', number: '16', name: 'Rais M\'Bolhi', position: 'Gardien', age: '38', nationality: 'Algérie' },
      { id: '6703', number: '2', name: 'Chouaib Keddad', position: 'Défenseur', age: '29', nationality: 'Algérie' },
      { id: '6704', number: '4', name: 'Sofiane Bouchar', position: 'Défenseur', age: '30', nationality: 'Algérie' },
      { id: '6705', number: '3', name: 'Youssef Laouafi', position: 'Défenseur', age: '28', nationality: 'Algérie' },
      { id: '6706', number: '6', name: 'Houssem Mrezigue', position: 'Milieu', age: '24', nationality: 'Algérie' },
      { id: '6707', number: '8', name: 'Abderraouf Benguit', position: 'Milieu', age: '28', nationality: 'Algérie' },
      { id: '6708', number: '10', name: 'Ishak Boussouf', position: 'Milieu', age: '23', nationality: 'Algérie' },
      { id: '6709', number: '9', name: 'Leonel Wamba', position: 'Attaquant', age: '22', nationality: 'Cameroun' },
      { id: '6710', number: '11', name: 'Abderrahmane Meziane', position: 'Attaquant', age: '30', nationality: 'Algérie' }
    ],
    staff: [
      { name: 'Marcos Paqueta', role: 'ENTRAINEUR PRINCIPAL', nationality: 'Brésil' },
      { name: 'Saber Bensmain', role: 'ENTRAINEUR ADJOINT', nationality: 'Algérie' }
    ]
  },

  '677': {
    name: 'MC Alger',
    logo: 'https://lfp.dz/clubs-logos/677-1715269288.png',
    address: 'ALGER',
    colors: 'Vert et Rouge',
    players: [
      { id: '6771', number: '1', name: 'Oussama Litim', position: 'Gardien', age: '32', nationality: 'Algérie' },
      { id: '6772', number: '16', name: 'Farid Chaal', position: 'Gardien', age: '29', nationality: 'Algérie' },
      { id: '6773', number: '5', name: 'Ayoub Abdellaoui', position: 'Défenseur', age: '31', nationality: 'Algérie' },
      { id: '6774', number: '4', name: 'Ayoub Ghezala', position: 'Défenseur', age: '28', nationality: 'Algérie' },
      { id: '6775', number: '10', name: 'Yousef Belaïli', position: 'Milieu', age: '32', nationality: 'Algérie' },
      { id: '6776', number: '8', name: 'Mohamed Benkhemassa', position: 'Milieu', age: '30', nationality: 'Algérie' },
      { id: '6777', number: '9', name: 'Zakaria Naidji', position: 'Attaquant', age: '29', nationality: 'Algérie' },
      { id: '6778', number: '11', name: 'Sofiane Bayazid', position: 'Attaquant', age: '27', nationality: 'Algérie' }
    ],
    staff: [
      { name: 'Patrice Beaumelle', role: 'ENTRAINEUR PRINCIPAL', nationality: 'France' }
    ]
  },

  '673': {
    name: 'USM Alger',
    logo: 'https://lfp.dz/clubs-logos/673-1715352459.png',
    address: 'SOUSTARA, ALGER',
    colors: 'Rouge et Noir',
    players: [
      { id: '6731', number: '1', name: 'Oussama Benbot', position: 'Gardien', age: '29', nationality: 'Algérie' },
      { id: '6732', number: '4', name: 'Zineddine Belaïd', position: 'Défenseur', age: '25', nationality: 'Algérie' },
      { id: '6733', number: '6', name: 'Oussama Chita', position: 'Milieu', age: '27', nationality: 'Algérie' },
      { id: '6734', number: '18', name: 'Ismail Belkacemi', position: 'Attaquant', age: '31', nationality: 'Algérie' }
    ],
    staff: [
      { name: 'Juan Carlos Garrido', role: 'ENTRAINEUR PRINCIPAL', nationality: 'Espagne' }
    ]
  },

  'jsk': {
    name: 'JS Kabylie',
    logo: 'https://lfp.dz/clubs-logos/jsk.png',
    address: 'TIZI OUZOU',
    colors: 'Jaune et Vert',
    players: [
      { id: 'jsk1', number: '1', name: 'Charaf Eddine Rahmani', position: 'Gardien', age: '31', nationality: 'Algérie' },
      { id: 'jsk2', number: '5', name: 'Badr Eddine Souyad', position: 'Défenseur', age: '29', nationality: 'Algérie' },
      { id: 'jsk3', number: '10', name: 'Rachid Boualia', position: 'Milieu', age: '23', nationality: 'Algérie' },
      { id: 'jsk4', number: '9', name: 'Dadi Mouaki', position: 'Attaquant', age: '28', nationality: 'Algérie' }
    ],
    staff: [
      { name: 'Josef Zinnbauer', role: 'ENTRAINEUR PRINCIPAL', nationality: 'Allemagne' }
    ]
  },

  '678': {
    name: 'CS Constantine',
    logo: 'https://lfp.dz/clubs-logos/678-1744537577.png',
    address: 'CONSTANTINE',
    colors: 'Vert et Noir',
    players: [
      { id: '6781', number: '1', name: 'Zakaria Bouhalfaya', position: 'Gardien', age: '27', nationality: 'Algérie' },
      { id: '6782', number: '5', name: 'Nacereddine Zaalani', position: 'Défenseur', age: '32', nationality: 'Algérie' },
      { id: '6783', number: '10', name: 'Brahim Dib', position: 'Attaquant', age: '30', nationality: 'Algérie' }
    ],
    staff: [
      { name: 'Khaled Benyahia', role: 'ENTRAINEUR PRINCIPAL', nationality: 'Tunisie' }
    ]
  },

  'essetif': {
    name: 'ES Sétif',
    logo: 'https://lfp.dz/clubs-logos/essetif.png',
    address: 'SETIF',
    colors: 'Noir et Blanc',
    players: [
      { id: 'ess1', number: '1', name: 'Tarek Boussouf', position: 'Gardien', age: '25', nationality: 'Algérie' },
      { id: 'ess2', number: '4', name: 'Mohamed Ziti', position: 'Défenseur', age: '34', nationality: 'Algérie' },
      { id: 'ess3', number: '8', name: 'Amir Kendouci', position: 'Milieu', age: '24', nationality: 'Algérie' },
      { id: 'ess4', number: '9', name: 'Aymen Lahmeri', position: 'Attaquant', age: '26', nationality: 'Algérie' }
    ],
    staff: [
      { name: 'Ammar Souayah', role: 'ENTRAINEUR PRINCIPAL', nationality: 'Tunisie' }
    ]
  }
};

export async function GET(request, { params }) {
  const { id } = await params;
  const known = CLUB_DATA[id];
  const clubName = known?.name || `Club ${id}`;
  const rawLogo = known?.logo || `https://lfp.dz/clubs-logos/${id}-logo.png`;
  const logo = `/api/image-proxy?url=${encodeURIComponent(rawLogo)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://lfp.dz/fr/club/${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal,
      next: { revalidate: 3600 }
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const scrapedName = $('h3').first().text().trim();
    const scrapedLogo = $('img').filter((i, el) => {
      const src = $(el).attr('src') || '';
      return src.includes('clubs-logos');
    }).first().attr('src');

    let address = known?.address || 'Algérie';
    let colors = known?.colors || 'Officiel LFP';

    $('span, div, p').each((i, el) => {
      const text = $(el).text().trim();
      if (text.startsWith('Adresse:')) address = text.replace('Adresse:', '').trim();
      if (text.startsWith('Couleurs:')) colors = text.replace('Couleurs:', '').trim();
    });

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
      let playerName = '';
      let age = '';
      let nationality = '';
      
      for (const line of lines) {
        if (/^\d{1,2}$/.test(line)) {
          number = line;
        } else if (line.startsWith('Âge')) {
          age = line.replace('Âge :', '').replace('Âge:', '').trim();
        } else if (['Algérie', 'Tunisie', 'Maroc', 'France', 'Cameroun', 'Mali', 'Sénégal', "Côte d'Ivoire", 'Guinée', 'Nigeria'].includes(line)) {
          nationality = line;
        } else if (line.length > 2 && !playerName) {
          playerName = line;
        }
      }

      if (playerName || number) {
        const pImg = img ? (img.startsWith('http') ? img : `https://lfp.dz${img}`) : null;
        players.push({
          id: playerId,
          number,
          name: playerName,
          age,
          nationality,
          position: activePosition || 'Inconnu',
          photo: pImg ? `/api/image-proxy?url=${encodeURIComponent(pImg)}` : null
        });
      }
    });

    const staff = [];
    $('a[href*="/staff/"], a[href*="/coach/"]').each((i, el) => {
      const fullText = $(el).text().trim();
      const img = $(el).find('img').attr('src');
      const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
      
      let staffName = '';
      let role = '';
      let nationality = '';
      
      for (const line of lines) {
        if (['Algérie', 'Tunisie', 'Maroc', 'France', 'Cameroun', 'Mali', 'Sénégal'].includes(line)) {
          nationality = line;
        } else if (line.includes('ENTRAINEUR') || line.includes('DTS') || line.includes('ADJOINT') || line.includes('MEDECIN') || line.includes('KINE') || line.includes('PREPARATEUR')) {
          role = line;
        } else if (!staffName && line.length > 3) {
          staffName = line;
        }
      }
      
      if (staffName) {
        const sImg = img ? (img.startsWith('http') ? img : `https://lfp.dz${img}`) : null;
        staff.push({
          name: staffName,
          role: role || 'Staff',
          nationality,
          photo: sImg ? `/api/image-proxy?url=${encodeURIComponent(sImg)}` : null
        });
      }
    });

    const finalLogoRaw = scrapedLogo ? (scrapedLogo.startsWith('http') ? scrapedLogo : `https://lfp.dz${scrapedLogo}`) : rawLogo;

    return NextResponse.json({
      id,
      name: scrapedName || clubName,
      logo: `/api/image-proxy?url=${encodeURIComponent(finalLogoRaw)}`,
      address: address || 'Algérie',
      colors: colors || 'Officiel LFP',
      players: players.length > 0 ? players : (known?.players || []),
      staff: staff.length > 0 ? staff : (known?.staff || []),
      source: `https://lfp.dz/fr/club/${id}`
    });

  } catch (error) {
    console.error(`LFP Club ${id} scraper error, using complete fallback data:`, error.message);
    return NextResponse.json({
      id,
      name: clubName,
      logo: logo,
      address: known?.address || 'Algérie',
      colors: known?.colors || 'Officiel LFP',
      players: known?.players || [],
      staff: known?.staff || [],
      source: `https://lfp.dz/fr/club/${id}`
    });
  }
}
