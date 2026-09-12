import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function GET() {
  try {
    const [playersRes, teamsRes] = await Promise.all([
      supabase.from('players').select('*').order('price', { ascending: false }),
      supabase.from('teams').select('*').order('name')
    ]);

    let players = playersRes.data || [];
    let teams = teamsRes.data || [];

    // Fallback static players if DB query returns empty array
    if (players.length === 0) {
      players = [
        { id: 1, team_id: 1, name: 'O. Litim', position: 'GK', price: 5.0 },
        { id: 2, team_id: 1, name: 'A. Abdellaoui', position: 'DEF', price: 6.0 },
        { id: 3, team_id: 1, name: 'M. Benkhemassa', position: 'MID', price: 6.5 },
        { id: 4, team_id: 1, name: 'Y. Belaïli', position: 'FWD', price: 10.5 },
        { id: 5, team_id: 1, name: 'Z. Naidji', position: 'FWD', price: 9.5 },
        { id: 6, team_id: 2, name: 'A. Guendouz', position: 'GK', price: 5.5 },
        { id: 7, team_id: 2, name: 'C. Keddad', position: 'DEF', price: 6.0 },
        { id: 8, team_id: 2, name: 'H. Mrezigue', position: 'MID', price: 7.0 },
        { id: 9, team_id: 2, name: 'L. Boussouar', position: 'FWD', price: 8.5 },
        { id: 10, team_id: 3, name: 'O. Benbot', position: 'GK', price: 5.5 },
        { id: 11, team_id: 3, name: 'Z. Belaïd', position: 'DEF', price: 6.5 },
        { id: 12, team_id: 3, name: 'O. Chita', position: 'MID', price: 6.0 },
        { id: 13, team_id: 3, name: 'A. Kanou', position: 'FWD', price: 8.0 }
      ];
    }

    if (teams.length === 0) {
      teams = [
        { id: 1, name: 'MC Alger' },
        { id: 2, name: 'CR Belouizdad' },
        { id: 3, name: 'USM Alger' },
        { id: 4, name: 'JS Kabylie' },
        { id: 5, name: 'CS Constantine' },
        { id: 6, name: 'ES Sétif' }
      ];
    }

    return NextResponse.json({ players, teams });
  } catch (error) {
    console.error('API Players Error:', error);
    return NextResponse.json({ players: [], teams: [], error: error.message }, { status: 500 });
  }
}
