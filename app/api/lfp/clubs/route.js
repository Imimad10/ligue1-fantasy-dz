import { NextResponse } from 'next/server';

const CLUBS_LIST = [
  { id: '524', name: 'ASO Chlef', logo_url: '/logos/524.png' },
  { id: '670', name: 'CR Belouizdad', logo_url: '/logos/670.png' },
  { id: '678', name: 'CS Constantine', logo_url: '/logos/678.png' },
  { id: '754', name: 'CR Témouchent', logo_url: '/logos/754.png' },
  { id: '518', name: 'US Biskra', logo_url: '/logos/518.png' },
  { id: '653', name: 'USM Khenchela', logo_url: '/logos/653.png' },
  { id: '673', name: 'USM Alger', logo_url: '/logos/673.png' },
  { id: '675', name: 'MC Oran', logo_url: '/logos/675.png' },
  { id: '677', name: 'MC Alger', logo_url: '/logos/677.png' },
  { id: '755', name: 'ES Ben Aknoun', logo_url: '/logos/755.png' },
  { id: '758', name: 'Olympique Akbou', logo_url: '/logos/758.png' },
  { id: '759', name: 'JS El Biar', logo_url: '/logos/759.png' },
  { id: '409', name: 'MB Rouissat', logo_url: '/logos/409.png' },
  { id: 'jsk', name: 'JS Kabylie', logo_url: '/logos/jsk.png' },
  { id: 'jssaoura', name: 'JS Saoura', logo_url: '/logos/jssaoura.png' },
  { id: 'essetif', name: 'ES Sétif', logo_url: '/logos/essetif.png' }
];

export async function GET() {
  return NextResponse.json({ clubs: CLUBS_LIST });
}
