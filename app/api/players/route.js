import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

// ============================================================
// 🏟️ EFFECTIFS RÉELS LFP 2025-2026 — 16 CLUBS × 15 JOUEURS
// Source : lfp.dz (scraped le 12/09/2026)
// ============================================================

const ALL_PLAYERS = [
  // ============================
  // MC Alger (team_id: 677)
  // ============================
  { id: 1, team_id: 677, name: 'Hammache Mastias', position: 'GK', price: 5.0 },
  { id: 2, team_id: 677, name: 'Ramdane Abdelatif', position: 'GK', price: 4.5 },
  { id: 3, team_id: 677, name: 'Abdellaoui Ayoub', position: 'DEF', price: 6.0 },
  { id: 4, team_id: 677, name: 'Ghezala Ayoub', position: 'DEF', price: 5.5 },
  { id: 5, team_id: 677, name: 'Halaimia Med Redha', position: 'DEF', price: 5.5 },
  { id: 6, team_id: 677, name: 'Chaib Yacine', position: 'DEF', price: 5.0 },
  { id: 7, team_id: 677, name: 'Bouguerra Aimen', position: 'DEF', price: 4.5 },
  { id: 8, team_id: 677, name: 'Benkhemassa Mohammed', position: 'MID', price: 6.5 },
  { id: 9, team_id: 677, name: 'Mehdaoui Merouane', position: 'MID', price: 6.0 },
  { id: 10, team_id: 677, name: 'Boukholda Chahreddine', position: 'MID', price: 5.5 },
  { id: 11, team_id: 677, name: 'Ferhat Zinedine', position: 'FWD', price: 9.0 },
  { id: 12, team_id: 677, name: 'Bayazid Sofiane', position: 'FWD', price: 8.5 },
  { id: 13, team_id: 677, name: 'Naidji Zakaria', position: 'FWD', price: 8.0 },
  { id: 14, team_id: 677, name: 'Konate Siriman', position: 'FWD', price: 7.5 },
  { id: 15, team_id: 677, name: 'Kohili Ben Ahmed', position: 'FWD', price: 7.0 },

  // ============================
  // CR Belouizdad (team_id: 670)
  // ============================
  { id: 16, team_id: 670, name: 'Chaal Farid', position: 'GK', price: 5.5 },
  { id: 17, team_id: 670, name: 'Bousseder Tarek', position: 'GK', price: 5.0 },
  { id: 18, team_id: 670, name: 'Bouchar Sofiane', position: 'DEF', price: 6.0 },
  { id: 19, team_id: 670, name: 'Keddad Chouhaib', position: 'DEF', price: 5.5 },
  { id: 20, team_id: 670, name: 'Laouafi Youcef', position: 'DEF', price: 5.5 },
  { id: 21, team_id: 670, name: 'Benayada Houcine', position: 'DEF', price: 5.0 },
  { id: 22, team_id: 670, name: 'Khacef Mohamed Naoufel', position: 'DEF', price: 4.5 },
  { id: 23, team_id: 670, name: 'Boukhanchouche Salim', position: 'MID', price: 6.5 },
  { id: 24, team_id: 670, name: 'Kahia Abdelaziz', position: 'MID', price: 6.0 },
  { id: 25, team_id: 670, name: 'Tka Houssem', position: 'MID', price: 5.5 },
  { id: 26, team_id: 670, name: 'El Melali Farid', position: 'FWD', price: 9.5 },
  { id: 27, team_id: 670, name: 'Ben Hamouda Mohamed Ali', position: 'FWD', price: 9.0 },
  { id: 28, team_id: 670, name: 'Meziane Abderrahmane', position: 'FWD', price: 8.5 },
  { id: 29, team_id: 670, name: 'Etouga Frank', position: 'FWD', price: 8.0 },
  { id: 30, team_id: 670, name: 'Bouzok Yousri', position: 'FWD', price: 7.5 },

  // ============================
  // JS Kabylie (team_id: 674)
  // ============================
  { id: 31, team_id: 674, name: 'Guendouz Alexis', position: 'GK', price: 5.5 },
  { id: 32, team_id: 674, name: 'Benrabah Seif', position: 'GK', price: 4.5 },
  { id: 33, team_id: 674, name: 'Madani Mohamed Amine', position: 'DEF', price: 5.5 },
  { id: 34, team_id: 674, name: 'Cherifi Toufik', position: 'DEF', price: 5.0 },
  { id: 35, team_id: 674, name: 'Hamidi Mohamed Reda', position: 'DEF', price: 5.0 },
  { id: 36, team_id: 674, name: 'Abeid Aly', position: 'DEF', price: 5.5 },
  { id: 37, team_id: 674, name: 'Bendouma Abdellah', position: 'DEF', price: 4.5 },
  { id: 38, team_id: 674, name: 'Merbah Messala', position: 'MID', price: 6.5 },
  { id: 39, team_id: 674, name: 'Benchamma Samy', position: 'MID', price: 6.0 },
  { id: 40, team_id: 674, name: 'Bouamama Badis', position: 'MID', price: 5.5 },
  { id: 41, team_id: 674, name: 'Mahious Aimen', position: 'FWD', price: 9.0 },
  { id: 42, team_id: 674, name: 'Messaoudi Billal', position: 'FWD', price: 7.5 },
  { id: 43, team_id: 674, name: 'Belhocini Abdennour', position: 'FWD', price: 7.0 },
  { id: 44, team_id: 674, name: 'Soukkou Djabril', position: 'FWD', price: 7.0 },
  { id: 45, team_id: 674, name: 'Akhrib Lahlou', position: 'FWD', price: 6.5 },

  // ============================
  // USM Alger (team_id: 673)
  // ============================
  { id: 46, team_id: 673, name: 'Benbot Oussama', position: 'GK', price: 6.0 },
  { id: 47, team_id: 673, name: 'Hadid Mohamed Idir', position: 'GK', price: 5.0 },
  { id: 48, team_id: 673, name: 'Radouani Saadi', position: 'DEF', price: 5.5 },
  { id: 49, team_id: 673, name: 'Abada Achref', position: 'DEF', price: 5.5 },
  { id: 50, team_id: 673, name: 'Loucif Haithem', position: 'DEF', price: 5.0 },
  { id: 51, team_id: 673, name: 'Kourdi Walid', position: 'DEF', price: 4.5 },
  { id: 52, team_id: 673, name: 'Azzi Imad Eddine', position: 'DEF', price: 4.5 },
  { id: 53, team_id: 673, name: 'Boulaya Farid', position: 'MID', price: 8.5 },
  { id: 54, team_id: 673, name: 'Draoui Zakaria', position: 'MID', price: 7.0 },
  { id: 55, team_id: 673, name: 'Benguit Abderaouf', position: 'MID', price: 6.5 },
  { id: 56, team_id: 673, name: 'Ghacha Houssam Eddine', position: 'FWD', price: 8.0 },
  { id: 57, team_id: 673, name: 'Guenaoui Ghiles', position: 'FWD', price: 7.5 },
  { id: 58, team_id: 673, name: 'Khaldi Ahmed', position: 'FWD', price: 7.0 },
  { id: 59, team_id: 673, name: 'Likonza Glody', position: 'FWD', price: 7.0 },
  { id: 60, team_id: 673, name: 'Kamagate Dramane', position: 'FWD', price: 6.5 },

  // ============================
  // ES Sétif (team_id: 676)
  // ============================
  { id: 61, team_id: 676, name: 'Oukidja Alexandre', position: 'GK', price: 6.0 },
  { id: 62, team_id: 676, name: 'Trad Zakaria', position: 'GK', price: 5.0 },
  { id: 63, team_id: 676, name: 'Khemaissia Anis', position: 'DEF', price: 5.5 },
  { id: 64, team_id: 676, name: 'Lakehal Chems-Eddine', position: 'DEF', price: 5.0 },
  { id: 65, team_id: 676, name: 'Alhourani Hadi', position: 'DEF', price: 5.0 },
  { id: 66, team_id: 676, name: 'Bouteldja Slimane', position: 'DEF', price: 4.5 },
  { id: 67, team_id: 676, name: 'Zenadji Amine', position: 'DEF', price: 4.5 },
  { id: 68, team_id: 676, name: 'Boumechra Mohammed Reda', position: 'MID', price: 7.0 },
  { id: 69, team_id: 676, name: 'Tabti Larbi', position: 'MID', price: 6.0 },
  { id: 70, team_id: 676, name: 'Akkal Salim', position: 'MID', price: 5.5 },
  { id: 71, team_id: 676, name: 'Benchaa Zakaria', position: 'FWD', price: 8.0 },
  { id: 72, team_id: 676, name: 'Belkhir Mohammed Islem', position: 'FWD', price: 7.5 },
  { id: 73, team_id: 676, name: 'Zerrouki Merouane', position: 'FWD', price: 7.0 },
  { id: 74, team_id: 676, name: 'Bouchagoura Imad Eddine', position: 'FWD', price: 6.5 },
  { id: 75, team_id: 676, name: 'Abu Jalboush Yousef', position: 'FWD', price: 6.5 },

  // ============================
  // CS Constantine (team_id: 678)
  // ============================
  { id: 76, team_id: 678, name: 'Bouhalfaya Zakaria', position: 'GK', price: 5.5 },
  { id: 77, team_id: 678, name: 'Melala Oussama', position: 'GK', price: 4.5 },
  { id: 78, team_id: 678, name: 'Meddahi Oussama', position: 'DEF', price: 5.5 },
  { id: 79, team_id: 678, name: 'Zeghad Yacine', position: 'DEF', price: 5.0 },
  { id: 80, team_id: 678, name: 'Chikhi Abdelmoumen', position: 'DEF', price: 5.0 },
  { id: 81, team_id: 678, name: 'Atibu Radjabu Johnson', position: 'DEF', price: 5.0 },
  { id: 82, team_id: 678, name: 'Torach Rogers', position: 'DEF', price: 4.5 },
  { id: 83, team_id: 678, name: 'Dib Brahim', position: 'MID', price: 7.0 },
  { id: 84, team_id: 678, name: 'Chekal Affari Hadji', position: 'MID', price: 6.5 },
  { id: 85, team_id: 678, name: 'Rebiai Miloud', position: 'MID', price: 6.0 },
  { id: 86, team_id: 678, name: 'Bakir Mohamed Islam', position: 'FWD', price: 8.0 },
  { id: 87, team_id: 678, name: 'Lahmeri Aimen', position: 'FWD', price: 7.5 },
  { id: 88, team_id: 678, name: 'Djaouchi Hamid', position: 'FWD', price: 7.0 },
  { id: 89, team_id: 678, name: 'Anatouf Moslem', position: 'FWD', price: 6.5 },
  { id: 90, team_id: 678, name: 'Agbagno Evra', position: 'FWD', price: 6.0 },

  // ============================
  // JS Saoura (team_id: 672)
  // ============================
  { id: 91, team_id: 672, name: 'Salhi Abdelkadir', position: 'GK', price: 5.0 },
  { id: 92, team_id: 672, name: 'Hannane Abdesslam', position: 'GK', price: 4.5 },
  { id: 93, team_id: 672, name: 'Mebarki Fayçal', position: 'DEF', price: 5.5 },
  { id: 94, team_id: 672, name: 'Yerou Oussama', position: 'DEF', price: 5.0 },
  { id: 95, team_id: 672, name: 'Benmiloud Amine', position: 'DEF', price: 4.5 },
  { id: 96, team_id: 672, name: 'Tra Bi Tra Anthony', position: 'DEF', price: 5.0 },
  { id: 97, team_id: 672, name: 'Haddouche Ilyes', position: 'DEF', price: 4.5 },
  { id: 98, team_id: 672, name: 'Khoumani Abdelhak', position: 'MID', price: 6.0 },
  { id: 99, team_id: 672, name: 'Dahamni Khalid', position: 'MID', price: 5.5 },
  { id: 100, team_id: 672, name: 'Daibeche Oussama', position: 'MID', price: 5.5 },
  { id: 101, team_id: 672, name: 'Fenniri Mohamed', position: 'FWD', price: 7.5 },
  { id: 102, team_id: 672, name: 'Bouguerri Oussama', position: 'FWD', price: 7.0 },
  { id: 103, team_id: 672, name: 'Benyahia Dhiya Eddine', position: 'FWD', price: 6.5 },
  { id: 104, team_id: 672, name: 'Bouklila Mohammed', position: 'FWD', price: 6.5 },
  { id: 105, team_id: 672, name: 'Ojo Mohamed Ashiraf', position: 'FWD', price: 6.0 },

  // ============================
  // ASO Chlef (team_id: 524)
  // ============================
  { id: 106, team_id: 524, name: 'Rahmani Chamce Eddine', position: 'GK', price: 5.0 },
  { id: 107, team_id: 524, name: 'Tergou Ali-Tadjeddine', position: 'GK', price: 4.5 },
  { id: 108, team_id: 524, name: 'Brahimi Belkacem', position: 'DEF', price: 5.5 },
  { id: 109, team_id: 524, name: 'Bekkouche Chems Eddine', position: 'DEF', price: 5.0 },
  { id: 110, team_id: 524, name: 'Debbari Abdelhak', position: 'DEF', price: 4.5 },
  { id: 111, team_id: 524, name: 'Lamrani Said', position: 'DEF', price: 5.0 },
  { id: 112, team_id: 524, name: 'Laidouni Amir', position: 'DEF', price: 4.5 },
  { id: 113, team_id: 524, name: 'Aiboud Samir', position: 'MID', price: 6.0 },
  { id: 114, team_id: 524, name: 'Belalem Djamel', position: 'MID', price: 6.0 },
  { id: 115, team_id: 524, name: 'Larbi Imad Eddine', position: 'MID', price: 5.5 },
  { id: 116, team_id: 524, name: 'Motrani Zoubir', position: 'FWD', price: 7.0 },
  { id: 117, team_id: 524, name: 'Ledlum Edward', position: 'FWD', price: 6.5 },
  { id: 118, team_id: 524, name: 'Benchouya Anis', position: 'FWD', price: 6.5 },
  { id: 119, team_id: 524, name: 'Feddal Aissa', position: 'FWD', price: 6.0 },
  { id: 120, team_id: 524, name: 'Avotor Kokou Bruno', position: 'FWD', price: 6.0 },

  // ============================
  // MC Oran (team_id: 675)
  // ============================
  { id: 121, team_id: 675, name: 'Soufi Kamel', position: 'GK', price: 5.5 },
  { id: 122, team_id: 675, name: 'Zeghba Moustafa', position: 'GK', price: 4.5 },
  { id: 123, team_id: 675, name: 'Baouche Houari', position: 'DEF', price: 5.5 },
  { id: 124, team_id: 675, name: 'Hamra Abderrahim', position: 'DEF', price: 5.0 },
  { id: 125, team_id: 675, name: 'Belkhither Mokhtar', position: 'DEF', price: 5.0 },
  { id: 126, team_id: 675, name: 'Hadded Mouad', position: 'DEF', price: 4.5 },
  { id: 127, team_id: 675, name: 'Bagnama Oumar', position: 'DEF', price: 4.5 },
  { id: 128, team_id: 675, name: 'Bourdim Abderrahmane', position: 'MID', price: 6.5 },
  { id: 129, team_id: 675, name: 'Keniche Mortada', position: 'MID', price: 6.0 },
  { id: 130, team_id: 675, name: 'Morsli Abdelouhab', position: 'MID', price: 5.5 },
  { id: 131, team_id: 675, name: 'Aliane Yacine', position: 'FWD', price: 7.5 },
  { id: 132, team_id: 675, name: 'Ghennam Ahmed', position: 'FWD', price: 7.0 },
  { id: 133, team_id: 675, name: 'Saadi Ismail', position: 'FWD', price: 6.5 },
  { id: 134, team_id: 675, name: 'Traore Boubacar', position: 'FWD', price: 6.5 },
  { id: 135, team_id: 675, name: 'Goudjil Yacine', position: 'FWD', price: 6.0 },

  // ============================
  // USM Khenchela (team_id: 653)
  // ============================
  { id: 136, team_id: 653, name: 'Litim Oussama', position: 'GK', price: 5.0 },
  { id: 137, team_id: 653, name: 'Bencheikh El Fegoun Hatem', position: 'GK', price: 4.5 },
  { id: 138, team_id: 653, name: 'Hachoud Ibrahim', position: 'DEF', price: 5.0 },
  { id: 139, team_id: 653, name: 'Lamara Nabil', position: 'DEF', price: 5.0 },
  { id: 140, team_id: 653, name: 'Douar Youcef', position: 'DEF', price: 4.5 },
  { id: 141, team_id: 653, name: 'Meddour Zin Eddine', position: 'DEF', price: 4.5 },
  { id: 142, team_id: 653, name: 'Boubekeur Imadeddine', position: 'DEF', price: 4.5 },
  { id: 143, team_id: 653, name: 'Zenasni Ahmida', position: 'MID', price: 6.0 },
  { id: 144, team_id: 653, name: 'Benzid Necer Marouane', position: 'MID', price: 5.5 },
  { id: 145, team_id: 653, name: 'Chaibi Adem', position: 'MID', price: 5.5 },
  { id: 146, team_id: 653, name: 'Camara Alhassane', position: 'FWD', price: 7.5 },
  { id: 147, team_id: 653, name: 'Nezla Massinissa', position: 'FWD', price: 7.0 },
  { id: 148, team_id: 653, name: 'Fall Almamy', position: 'FWD', price: 6.5 },
  { id: 149, team_id: 653, name: 'Askar Abdelhak', position: 'FWD', price: 6.0 },
  { id: 150, team_id: 653, name: 'Boukassi Mohammed', position: 'FWD', price: 6.0 },

  // ============================
  // US Biskra (team_id: 518)
  // ============================
  { id: 151, team_id: 518, name: 'Maachou Redouane', position: 'GK', price: 5.0 },
  { id: 152, team_id: 518, name: 'Benchlef Imad', position: 'GK', price: 4.5 },
  { id: 153, team_id: 518, name: 'Bouhakak Khaled', position: 'DEF', price: 5.0 },
  { id: 154, team_id: 518, name: 'Barka Mohammed El-Amine', position: 'DEF', price: 5.0 },
  { id: 155, team_id: 518, name: 'Gatal Oussama', position: 'DEF', price: 4.5 },
  { id: 156, team_id: 518, name: 'Sakhri Mohamed Ali', position: 'DEF', price: 4.5 },
  { id: 157, team_id: 518, name: 'Zaddy Ezechiel', position: 'DEF', price: 4.5 },
  { id: 158, team_id: 518, name: 'Neche Khaled', position: 'MID', price: 6.0 },
  { id: 159, team_id: 518, name: 'Benamara Abdelhafid', position: 'MID', price: 5.5 },
  { id: 160, team_id: 518, name: 'Diha Imad Eddine', position: 'MID', price: 5.5 },
  { id: 161, team_id: 518, name: 'Darfalou Oussama', position: 'FWD', price: 8.5 },
  { id: 162, team_id: 518, name: 'Belkhadem Mohamed', position: 'FWD', price: 7.0 },
  { id: 163, team_id: 518, name: 'Debbih Chouieb', position: 'FWD', price: 6.5 },
  { id: 164, team_id: 518, name: 'Ghorab Abdelkader', position: 'FWD', price: 6.0 },
  { id: 165, team_id: 518, name: 'Belmiloud Kamel', position: 'FWD', price: 6.0 },

  // ============================
  // ES Ben Aknoun (team_id: 755)
  // ============================
  { id: 166, team_id: 755, name: 'Medjadji Mohamed', position: 'GK', price: 5.0 },
  { id: 167, team_id: 755, name: 'Boussouf Kheir-Eddine', position: 'GK', price: 4.5 },
  { id: 168, team_id: 755, name: 'Talah Fateh', position: 'DEF', price: 5.0 },
  { id: 169, team_id: 755, name: 'Boukarroum Billal', position: 'DEF', price: 5.0 },
  { id: 170, team_id: 755, name: 'Hachoud Abderrahmane', position: 'DEF', price: 4.5 },
  { id: 171, team_id: 755, name: 'Boualleg Aymene', position: 'DEF', price: 4.5 },
  { id: 172, team_id: 755, name: 'Merouani M\'Hammed', position: 'DEF', price: 4.5 },
  { id: 173, team_id: 755, name: 'Benchaira Mohamed', position: 'MID', price: 6.0 },
  { id: 174, team_id: 755, name: 'Djahnit Akram', position: 'MID', price: 6.0 },
  { id: 175, team_id: 755, name: 'Selmi Housseyn', position: 'MID', price: 5.5 },
  { id: 176, team_id: 755, name: 'Adjout Louanas', position: 'FWD', price: 7.5 },
  { id: 177, team_id: 755, name: 'Bechou Youcef', position: 'FWD', price: 6.5 },
  { id: 178, team_id: 755, name: 'Djabout Adil', position: 'FWD', price: 6.5 },
  { id: 179, team_id: 755, name: 'Zaouache Ahmed', position: 'FWD', price: 6.0 },
  { id: 180, team_id: 755, name: 'Allam Yanis', position: 'FWD', price: 6.0 },

  // ============================
  // Olympique Akbou (team_id: 758)
  // ============================
  { id: 181, team_id: 758, name: 'Yesli Rayane', position: 'GK', price: 5.0 },
  { id: 182, team_id: 758, name: 'Klileche Benaouda', position: 'GK', price: 4.5 },
  { id: 183, team_id: 758, name: 'Mouali Hamza', position: 'DEF', price: 5.0 },
  { id: 184, team_id: 758, name: 'Zaalani Nasreddine', position: 'DEF', price: 5.0 },
  { id: 185, team_id: 758, name: 'Diaw Khadim', position: 'DEF', price: 5.0 },
  { id: 186, team_id: 758, name: 'Sogue Moussa', position: 'DEF', price: 4.5 },
  { id: 187, team_id: 758, name: 'Boutiba Riad', position: 'DEF', price: 4.5 },
  { id: 188, team_id: 758, name: 'Amriche Ali', position: 'MID', price: 6.0 },
  { id: 189, team_id: 758, name: 'Addadi Toufik', position: 'MID', price: 5.5 },
  { id: 190, team_id: 758, name: 'Farhi Ibrahim', position: 'MID', price: 5.5 },
  { id: 191, team_id: 758, name: 'Tahar Feth-Allah', position: 'FWD', price: 7.0 },
  { id: 192, team_id: 758, name: 'Zamoum Walid', position: 'FWD', price: 6.5 },
  { id: 193, team_id: 758, name: 'Hitala Ramdane', position: 'FWD', price: 6.0 },
  { id: 194, team_id: 758, name: 'Ouamri Mehdi', position: 'FWD', price: 6.0 },
  { id: 195, team_id: 758, name: 'Sediri M\'Hend', position: 'FWD', price: 5.5 },

  // ============================
  // JS El Biar (team_id: 759)
  // ============================
  { id: 196, team_id: 759, name: 'Moussaoui Toufik', position: 'GK', price: 5.0 },
  { id: 197, team_id: 759, name: 'Aziria Mounir', position: 'GK', price: 4.5 },
  { id: 198, team_id: 759, name: 'Bouchina Mustapha', position: 'DEF', price: 5.0 },
  { id: 199, team_id: 759, name: 'Guemroud Mohamed', position: 'DEF', price: 5.0 },
  { id: 200, team_id: 759, name: 'Zeggai Omar', position: 'DEF', price: 4.5 },
  { id: 201, team_id: 759, name: 'Mammeri Ahmed', position: 'DEF', price: 4.5 },
  { id: 202, team_id: 759, name: 'Cisse Bangaly', position: 'DEF', price: 4.5 },
  { id: 203, team_id: 759, name: 'Chita Oussama', position: 'MID', price: 6.0 },
  { id: 204, team_id: 759, name: 'Tahar Taha Yassine', position: 'MID', price: 5.5 },
  { id: 205, team_id: 759, name: 'Boukerma Djelloul', position: 'MID', price: 5.5 },
  { id: 206, team_id: 759, name: 'Mouaki Dadi El Hocine', position: 'FWD', price: 7.0 },
  { id: 207, team_id: 759, name: 'Merzougui Khayreddine', position: 'FWD', price: 6.5 },
  { id: 208, team_id: 759, name: 'Aribi Karim', position: 'FWD', price: 6.5 },
  { id: 209, team_id: 759, name: 'Abbaci Islam', position: 'FWD', price: 6.0 },
  { id: 210, team_id: 759, name: 'Mellouk Hamza', position: 'FWD', price: 5.5 },

  // ============================
  // MB Rouissat (team_id: 409)
  // ============================
  { id: 211, team_id: 409, name: 'Beklal Abdeldjabr', position: 'GK', price: 5.0 },
  { id: 212, team_id: 409, name: 'Rahal Djalal Eddine', position: 'GK', price: 4.5 },
  { id: 213, team_id: 409, name: 'Kherroubi Abdennour', position: 'DEF', price: 5.0 },
  { id: 214, team_id: 409, name: 'Benabda Zahreddine', position: 'DEF', price: 4.5 },
  { id: 215, team_id: 409, name: 'Gaid Aymen', position: 'DEF', price: 4.5 },
  { id: 216, team_id: 409, name: 'Salem Hamza', position: 'DEF', price: 4.5 },
  { id: 217, team_id: 409, name: 'Fatawu Hamidu Abdul', position: 'DEF', price: 4.5 },
  { id: 218, team_id: 409, name: 'Mahi Mohammed', position: 'MID', price: 6.0 },
  { id: 219, team_id: 409, name: 'Midoune Messaoud', position: 'MID', price: 5.5 },
  { id: 220, team_id: 409, name: 'Chadli Aimen', position: 'MID', price: 5.5 },
  { id: 221, team_id: 409, name: 'Hamroune Rezki', position: 'FWD', price: 7.0 },
  { id: 222, team_id: 409, name: 'Mamadou Sy', position: 'FWD', price: 6.5 },
  { id: 223, team_id: 409, name: 'Amokrane Abdelhakim', position: 'FWD', price: 6.0 },
  { id: 224, team_id: 409, name: 'Khiari Oussama', position: 'FWD', price: 6.0 },
  { id: 225, team_id: 409, name: 'Ben Kheira Nadji', position: 'FWD', price: 5.5 },

  // ============================
  // CR Témouchent (team_id: 754)
  // ============================
  { id: 226, team_id: 754, name: 'Morcely Abdelkader', position: 'GK', price: 5.0 },
  { id: 227, team_id: 754, name: 'Saou Mohamed Amine', position: 'GK', price: 4.5 },
  { id: 228, team_id: 754, name: 'Meddah Abdellah', position: 'DEF', price: 5.0 },
  { id: 229, team_id: 754, name: 'Boutamina Hammad', position: 'DEF', price: 4.5 },
  { id: 230, team_id: 754, name: 'Berkoun Abderrahmane', position: 'DEF', price: 4.5 },
  { id: 231, team_id: 754, name: 'Belkacemi Abdelhak', position: 'DEF', price: 4.5 },
  { id: 232, team_id: 754, name: 'Chahrour Islam', position: 'DEF', price: 4.5 },
  { id: 233, team_id: 754, name: 'Saihi Imed', position: 'MID', price: 6.0 },
  { id: 234, team_id: 754, name: 'Baaziz Khathir', position: 'MID', price: 5.5 },
  { id: 235, team_id: 754, name: 'Khodja El Kacem', position: 'MID', price: 5.5 },
  { id: 236, team_id: 754, name: 'Bensaha Billel', position: 'FWD', price: 8.0 },
  { id: 237, team_id: 754, name: 'Itim Mohamed', position: 'FWD', price: 6.5 },
  { id: 238, team_id: 754, name: 'Hedroug Mehdi', position: 'FWD', price: 6.0 },
  { id: 239, team_id: 754, name: 'Hamri Souhaib', position: 'FWD', price: 6.0 },
  { id: 240, team_id: 754, name: 'Mardja Naoufel', position: 'FWD', price: 5.5 },
];

// ============================================================
// 🏟️ 16 CLUBS OFFICIELS — LFP 2025-2026
// ============================================================

const ALL_TEAMS = [
  { id: 677, name: 'MC Alger', logo_url: '/logos/mca.png' },
  { id: 670, name: 'CR Belouizdad', logo_url: '/logos/crb.png' },
  { id: 674, name: 'JS Kabylie', logo_url: '/logos/jsk.png' },
  { id: 673, name: 'USM Alger', logo_url: '/logos/usma.png' },
  { id: 676, name: 'ES Sétif', logo_url: '/logos/ess.png' },
  { id: 678, name: 'CS Constantine', logo_url: '/logos/csc.png' },
  { id: 672, name: 'JS Saoura', logo_url: '/logos/jss.png' },
  { id: 524, name: 'ASO Chlef', logo_url: '/logos/aso.png' },
  { id: 675, name: 'MC Oran', logo_url: '/logos/mco.png' },
  { id: 653, name: 'USM Khenchela', logo_url: '/logos/usmk.png' },
  { id: 518, name: 'US Biskra', logo_url: '/logos/usb.png' },
  { id: 755, name: 'ES Ben Aknoun', logo_url: '/logos/esba.png' },
  { id: 758, name: 'Olympique Akbou', logo_url: '/logos/oa.png' },
  { id: 759, name: 'JS El Biar', logo_url: '/logos/jseb.png' },
  { id: 409, name: 'MB Rouissat', logo_url: '/logos/mbr.png' },
  { id: 754, name: 'CR Témouchent', logo_url: '/logos/crt.png' },
];

export async function GET() {
  try {
    const [playersRes, teamsRes] = await Promise.all([
      supabase.from('players').select('*').order('price', { ascending: false }),
      supabase.from('teams').select('*').order('name')
    ]);

    let players = (playersRes.data && playersRes.data.length > 200) ? playersRes.data : ALL_PLAYERS;
    let teams = (teamsRes.data && teamsRes.data.length >= 16) ? teamsRes.data : ALL_TEAMS;

    return NextResponse.json({ players, teams });
  } catch (error) {
    console.error('API Players Error:', error);
    return NextResponse.json({ players: ALL_PLAYERS, teams: ALL_TEAMS });
  }
}
