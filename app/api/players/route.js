import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

const ALL_90_PLAYERS = [
  // MC Alger (team_id: 1)
  { id: 1, team_id: 1, name: 'O. Litim', position: 'GK', price: 5.0 },
  { id: 2, team_id: 1, name: 'F. Chaal', position: 'GK', price: 4.5 },
  { id: 3, team_id: 1, name: 'A. Ghezala', position: 'DEF', price: 5.5 },
  { id: 4, team_id: 1, name: 'M. Hachoud', position: 'DEF', price: 5.0 },
  { id: 5, team_id: 1, name: 'A. Abdellaoui', position: 'DEF', price: 6.0 },
  { id: 6, team_id: 1, name: 'H. Mouali', position: 'DEF', price: 4.5 },
  { id: 7, team_id: 1, name: 'R. Helaïmia', position: 'DEF', price: 5.5 },
  { id: 8, team_id: 1, name: 'T. Tahar', position: 'MID', price: 6.5 },
  { id: 9, team_id: 1, name: 'M. Benkhemassa', position: 'MID', price: 6.0 },
  { id: 10, team_id: 1, name: 'Y. Belaïli', position: 'MID', price: 12.0 },
  { id: 11, team_id: 1, name: 'Z. Draoui', position: 'MID', price: 7.0 },
  { id: 12, team_id: 1, name: 'A. Bourdim', position: 'MID', price: 6.5 },
  { id: 13, team_id: 1, name: 'S. Bayazid', position: 'FWD', price: 8.5 },
  { id: 14, team_id: 1, name: 'A. Naidji', position: 'FWD', price: 9.0 },
  { id: 15, team_id: 1, name: 'K. Merzougui', position: 'FWD', price: 7.5 },

  // CR Belouizdad (team_id: 2)
  { id: 16, team_id: 2, name: 'A. Guendouz', position: 'GK', price: 5.5 },
  { id: 17, team_id: 2, name: 'R. M\'Bolhi', position: 'GK', price: 5.0 },
  { id: 18, team_id: 2, name: 'M. Bouchar', position: 'DEF', price: 6.0 },
  { id: 19, team_id: 2, name: 'C. Keddad', position: 'DEF', price: 5.5 },
  { id: 20, team_id: 2, name: 'Y. Laouafi', position: 'DEF', price: 5.0 },
  { id: 21, team_id: 2, name: 'M. Belkhiter', position: 'DEF', price: 5.0 },
  { id: 22, team_id: 2, name: 'A. Bouguerra', position: 'DEF', price: 4.5 },
  { id: 23, team_id: 2, name: 'H. Mrezigue', position: 'MID', price: 7.0 },
  { id: 24, team_id: 2, name: 'A. Bouras', position: 'MID', price: 6.5 },
  { id: 25, team_id: 2, name: 'B. Boussouf', position: 'MID', price: 8.0 },
  { id: 26, team_id: 2, name: 'I. Bakir', position: 'MID', price: 7.0 },
  { id: 27, team_id: 2, name: 'A. Benguit', position: 'MID', price: 6.5 },
  { id: 28, team_id: 2, name: 'L. Wamba', position: 'FWD', price: 9.5 },
  { id: 29, team_id: 2, name: 'O. Darfalou', position: 'FWD', price: 8.5 },
  { id: 30, team_id: 2, name: 'A. Meziane', position: 'FWD', price: 9.0 },

  // JS Kabylie (team_id: 3)
  { id: 31, team_id: 3, name: 'G. Hadid', position: 'GK', price: 4.5 },
  { id: 32, team_id: 3, name: 'C. Rahmani', position: 'GK', price: 5.0 },
  { id: 33, team_id: 3, name: 'K. Bouhakak', position: 'DEF', price: 5.0 },
  { id: 34, team_id: 3, name: 'B. Souyad', position: 'DEF', price: 5.5 },
  { id: 35, team_id: 3, name: 'F. Nechat Djabri', position: 'DEF', price: 4.5 },
  { id: 36, team_id: 3, name: 'A. Gatal', position: 'DEF', price: 4.5 },
  { id: 37, team_id: 3, name: 'O. Benzaid', position: 'DEF', price: 4.5 },
  { id: 38, team_id: 3, name: 'S. Boumechra', position: 'MID', price: 6.5 },
  { id: 39, team_id: 3, name: 'K. Ait-Atmane', position: 'MID', price: 6.0 },
  { id: 40, team_id: 3, name: 'R. Boualia', position: 'MID', price: 8.5 },
  { id: 41, team_id: 3, name: 'A. Amriche', position: 'MID', price: 5.5 },
  { id: 42, team_id: 3, name: 'M. Benzaid', position: 'MID', price: 5.0 },
  { id: 43, team_id: 3, name: 'D. Mouaki', position: 'FWD', price: 8.0 },
  { id: 44, team_id: 3, name: 'S. Msuva', position: 'FWD', price: 7.5 },
  { id: 45, team_id: 3, name: 'F. Bwalya', position: 'FWD', price: 7.5 },

  // USM Alger (team_id: 4)
  { id: 46, team_id: 4, name: 'O. Benbot', position: 'GK', price: 6.0 },
  { id: 47, team_id: 4, name: 'A. Benchelef', position: 'GK', price: 4.5 },
  { id: 48, team_id: 4, name: 'Z. Belaïd', position: 'DEF', price: 6.5 },
  { id: 49, team_id: 4, name: 'S. Radouani', position: 'DEF', price: 5.5 },
  { id: 50, team_id: 4, name: 'H. Deghmoum', position: 'DEF', price: 5.0 },
  { id: 51, team_id: 4, name: 'H. Baouche', position: 'DEF', price: 4.5 },
  { id: 52, team_id: 4, name: 'N. Khoualed', position: 'DEF', price: 4.5 },
  { id: 53, team_id: 4, name: 'O. Chita', position: 'MID', price: 6.0 },
  { id: 54, team_id: 4, name: 'B. Benzaza', position: 'MID', price: 6.5 },
  { id: 55, team_id: 4, name: 'I. Merili', position: 'MID', price: 5.5 },
  { id: 56, team_id: 4, name: 'T. Orebonye', position: 'MID', price: 7.5 },
  { id: 57, team_id: 4, name: 'A. Djahnit', position: 'MID', price: 6.5 },
  { id: 58, team_id: 4, name: 'A. Mahious', position: 'FWD', price: 9.0 },
  { id: 59, team_id: 4, name: 'I. Belkacemi', position: 'FWD', price: 8.0 },
  { id: 60, team_id: 4, name: 'A. Bacha', position: 'FWD', price: 7.0 },

  // ES Sétif (team_id: 5)
  { id: 61, team_id: 5, name: 'Z. Bouhalfaya', position: 'GK', price: 5.0 },
  { id: 62, team_id: 5, name: 'A. Osmani', position: 'GK', price: 4.0 },
  { id: 63, team_id: 5, name: 'M. Ziti', position: 'DEF', price: 5.0 },
  { id: 64, team_id: 5, name: 'T. Hachoud', position: 'DEF', price: 4.5 },
  { id: 65, team_id: 5, name: 'D. Chaabi', position: 'DEF', price: 4.5 },
  { id: 66, team_id: 5, name: 'I. Diarra', position: 'DEF', price: 5.0 },
  { id: 67, team_id: 5, name: 'A. Brahimi', position: 'DEF', price: 4.5 },
  { id: 68, team_id: 5, name: 'A. Kendouci', position: 'MID', price: 8.0 },
  { id: 69, team_id: 5, name: 'Y. Dali', position: 'MID', price: 6.0 },
  { id: 70, team_id: 5, name: 'A. Yettou', position: 'MID', price: 5.5 },
  { id: 71, team_id: 5, name: 'M. Bouchama', position: 'MID', price: 5.0 },
  { id: 72, team_id: 5, name: 'W. Zamoum', position: 'MID', price: 5.5 },
  { id: 73, team_id: 5, name: 'A. Lahmeri', position: 'FWD', price: 7.5 },
  { id: 74, team_id: 5, name: 'A. Benchoucha', position: 'FWD', price: 7.0 },
  { id: 75, team_id: 5, name: 'M. Aouad', position: 'FWD', price: 6.5 },

  // CS Constantine (team_id: 6)
  { id: 76, team_id: 6, name: 'M. Rahmani', position: 'GK', price: 5.0 },
  { id: 77, team_id: 6, name: 'K. Boussouf', position: 'GK', price: 4.0 },
  { id: 78, team_id: 6, name: 'M. Zaalani', position: 'DEF', price: 5.0 },
  { id: 79, team_id: 6, name: 'A. Madani', position: 'DEF', price: 5.5 },
  { id: 80, team_id: 6, name: 'S. Baouche', position: 'DEF', price: 5.0 },
  { id: 81, team_id: 6, name: 'C. Derradji', position: 'DEF', price: 4.5 },
  { id: 82, team_id: 6, name: 'M. Guemroud', position: 'DEF', price: 4.5 },
  { id: 83, team_id: 6, name: 'S. Belhocine', position: 'MID', price: 6.0 },
  { id: 84, team_id: 6, name: 'A. Khaldi', position: 'MID', price: 6.5 },
  { id: 85, team_id: 6, name: 'M. Benchaira', position: 'MID', price: 6.0 },
  { id: 86, team_id: 6, name: 'M. Belmessaoud', position: 'MID', price: 5.5 },
  { id: 87, team_id: 6, name: 'A. Chekal', position: 'MID', price: 5.5 },
  { id: 88, team_id: 6, name: 'M. Temine', position: 'FWD', price: 7.0 },
  { id: 89, team_id: 6, name: 'B. Dib', position: 'FWD', price: 8.5 },
  { id: 90, team_id: 6, name: 'A. Belhocini', position: 'FWD', price: 7.5 }
];

const ALL_TEAMS = [
  { id: 1, name: 'MC Alger', logo_url: 'https://lfp.dz/clubs-logos/677-1715269288.png' },
  { id: 2, name: 'CR Belouizdad', logo_url: 'https://lfp.dz/clubs-logos/670-1788197077.png' },
  { id: 3, name: 'JS Kabylie', logo_url: 'https://lfp.dz/clubs-logos/jsk.png' },
  { id: 4, name: 'USM Alger', logo_url: 'https://lfp.dz/clubs-logos/673-1715352459.png' },
  { id: 5, name: 'ES Sétif', logo_url: 'https://lfp.dz/clubs-logos/essetif.png' },
  { id: 6, name: 'CS Constantine', logo_url: 'https://lfp.dz/clubs-logos/678-1744537577.png' },
  { id: 524, name: 'ASO Chlef', logo_url: 'https://lfp.dz/clubs-logos/524-1663164373.png' },
  { id: 675, name: 'MC Oran', logo_url: 'https://lfp.dz/clubs-logos/675-1757531391.png' },
  { id: 653, name: 'USM Khenchela', logo_url: 'https://lfp.dz/clubs-logos/653-1663164387.png' },
  { id: 518, name: 'US Biskra', logo_url: 'https://lfp.dz/clubs-logos/518-1637065781.png' },
  { id: 755, name: 'ES Ben Aknoun', logo_url: 'https://lfp.dz/clubs-logos/755-1663164159.png' },
  { id: 758, name: 'Olympique Akbou', logo_url: 'https://lfp.dz/clubs-logos/758-1770131189.png' },
  { id: 759, name: 'JS El Biar', logo_url: 'https://lfp.dz/clubs-logos/759-1788436581.png' },
  { id: 409, name: 'MB Rouissat', logo_url: 'https://lfp.dz/clubs-logos/409-1755174810.png' },
  { id: 754, name: 'CR Témouchent', logo_url: 'https://lfp.dz/clubs-logos/754-1663163636.png' }
];

export async function GET() {
  try {
    const [playersRes, teamsRes] = await Promise.all([
      supabase.from('players').select('*').order('price', { ascending: false }),
      supabase.from('teams').select('*').order('name')
    ]);

    let players = (playersRes.data && playersRes.data.length > 0) ? playersRes.data : ALL_90_PLAYERS;
    let teams = (teamsRes.data && teamsRes.data.length > 0) ? teamsRes.data : ALL_TEAMS;

    return NextResponse.json({ players, teams });
  } catch (error) {
    console.error('API Players Error:', error);
    return NextResponse.json({ players: ALL_90_PLAYERS, teams: ALL_TEAMS });
  }
}
