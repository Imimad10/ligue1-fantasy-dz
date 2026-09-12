-- =========================================================
-- Fichier d'insertion (Seed) pour la Ligue 1 DZ
-- À exécuter dans le SQL Editor de Supabase
-- =========================================================

-- Vider les tables existantes (pour éviter les doublons si relancé)
TRUNCATE TABLE matches CASCADE;
TRUNCATE TABLE player_gameweek_stats CASCADE;
TRUNCATE TABLE fantasy_team_players CASCADE;
TRUNCATE TABLE fantasy_teams CASCADE;
TRUNCATE TABLE players CASCADE;
TRUNCATE TABLE teams CASCADE;
TRUNCATE TABLE gameweeks CASCADE;

-- 1. Insertion des Équipes de Ligue 1 (Top 6 pour l'exemple)
INSERT INTO teams (name, logo_url) VALUES 
('MC Alger', 'https://upload.wikimedia.org/wikipedia/fr/b/b5/Logo_MC_Alger.svg'),
('CR Belouizdad', 'https://upload.wikimedia.org/wikipedia/fr/5/5f/CR_Belouizdad_logo.svg'),
('JS Kabylie', 'https://upload.wikimedia.org/wikipedia/fr/2/23/Logo_JS_Kabylie.svg'),
('USM Alger', 'https://upload.wikimedia.org/wikipedia/fr/8/87/Logo_USM_Alger.svg'),
('ES Sétif', 'https://upload.wikimedia.org/wikipedia/fr/9/91/ES_Setif_logo.svg'),
('CS Constantine', 'https://upload.wikimedia.org/wikipedia/fr/0/05/CS_Constantine_Logo.svg');

-- 2. Insertion des Journées de championnat (Gameweeks)
INSERT INTO gameweeks (number, start_date, end_date, is_current) VALUES 
(1, '2026-09-15', '2026-09-17', true),
(2, '2026-09-22', '2026-09-24', false),
(3, '2026-09-29', '2026-10-01', false);

-- 3. Insertion des Matchs de la Journée 1
-- (1=MCA, 2=CRB, 3=JSK, 4=USMA, 5=ESS, 6=CSC)
INSERT INTO matches (gameweek_id, home_team_id, away_team_id, played_at) VALUES 
(1, 1, 2, '2026-09-15 20:00:00+01'), -- MCA vs CRB (Derby)
(1, 3, 4, '2026-09-16 18:00:00+01'), -- JSK vs USMA (Clasico)
(1, 5, 6, '2026-09-17 19:00:00+01'); -- ESS vs CSC

-- 4. Insertion des Joueurs
-- Nous allons générer un effectif de base pour chaque équipe (2 GK, 5 DEF, 5 MID, 3 FWD)

-- MC Alger (Team 1)
INSERT INTO players (team_id, name, position, price) VALUES
(1, 'O. Litim', 'GK', 5.0), (1, 'F. Chaal', 'GK', 4.5),
(1, 'A. Ghezala', 'DEF', 5.5), (1, 'M. Hachoud', 'DEF', 5.0), (1, 'A. Abdellaoui', 'DEF', 6.0), (1, 'H. Mouali', 'DEF', 4.5), (1, 'R. Helaïmia', 'DEF', 5.5),
(1, 'T. Tahar', 'MID', 6.5), (1, 'M. Benkhemassa', 'MID', 6.0), (1, 'Y. Belaïli', 'MID', 12.0), (1, 'Z. Draoui', 'MID', 7.0), (1, 'A. Bourdim', 'MID', 6.5),
(1, 'S. Bayazid', 'FWD', 8.5), (1, 'A. Naidji', 'FWD', 9.0), (1, 'K. Merzougui', 'FWD', 7.5);

-- CR Belouizdad (Team 2)
INSERT INTO players (team_id, name, position, price) VALUES
(2, 'A. Guendouz', 'GK', 5.5), (2, 'R. M''Bolhi', 'GK', 5.0),
(2, 'M. Bouchar', 'DEF', 6.0), (2, 'C. Keddad', 'DEF', 5.5), (2, 'Y. Laouafi', 'DEF', 5.0), (2, 'M. Belkhiter', 'DEF', 5.0), (2, 'A. Bouguerra', 'DEF', 4.5),
(2, 'H. Mrezigue', 'MID', 7.0), (2, 'A. Bouras', 'MID', 6.5), (2, 'B. Boussouf', 'MID', 8.0), (2, 'I. Bakir', 'MID', 7.0), (2, 'A. Benguit', 'MID', 6.5),
(2, 'L. Wamba', 'FWD', 9.5), (2, 'O. Darfalou', 'FWD', 8.5), (2, 'A. Meziane', 'FWD', 9.0);

-- JS Kabylie (Team 3)
INSERT INTO players (team_id, name, position, price) VALUES
(3, 'G. Hadid', 'GK', 4.5), (3, 'C. Rahmani', 'GK', 5.0),
(3, 'K. Bouhakak', 'DEF', 5.0), (3, 'B. Souyad', 'DEF', 5.5), (3, 'F. Nechat Djabri', 'DEF', 4.5), (3, 'A. Gatal', 'DEF', 4.5), (3, 'O. Benzaid', 'DEF', 4.5),
(3, 'S. Boumechra', 'MID', 6.5), (3, 'K. Ait-Atmane', 'MID', 6.0), (3, 'R. Boualia', 'MID', 8.5), (3, 'A. Amriche', 'MID', 5.5), (3, 'M. Benzaid', 'MID', 5.0),
(3, 'D. Mouaki', 'FWD', 8.0), (3, 'S. Msuva', 'FWD', 7.5), (3, 'F. Bwalya', 'FWD', 7.5);

-- USM Alger (Team 4)
INSERT INTO players (team_id, name, position, price) VALUES
(4, 'O. Benbot', 'GK', 6.0), (4, 'A. Benchelef', 'GK', 4.5),
(4, 'Z. Belaïd', 'DEF', 6.5), (4, 'S. Radouani', 'DEF', 5.5), (4, 'H. Deghmoum', 'DEF', 5.0), (4, 'H. Baouche', 'DEF', 4.5), (4, 'N. Khoualed', 'DEF', 4.5),
(4, 'O. Chita', 'MID', 6.0), (4, 'B. Benzaza', 'MID', 6.5), (4, 'I. Merili', 'MID', 5.5), (4, 'T. Orebonye', 'MID', 7.5), (4, 'A. Djahnit', 'MID', 6.5),
(4, 'A. Mahious', 'FWD', 9.0), (4, 'I. Belkacemi', 'FWD', 8.0), (4, 'A. Bacha', 'FWD', 7.0);

-- ES Sétif (Team 5)
INSERT INTO players (team_id, name, position, price) VALUES
(5, 'Z. Bouhalfaya', 'GK', 5.0), (5, 'A. Osmani', 'GK', 4.0),
(5, 'M. Ziti', 'DEF', 5.0), (5, 'T. Hachoud', 'DEF', 4.5), (5, 'D. Chaabi', 'DEF', 4.5), (5, 'I. Diarra', 'DEF', 5.0), (5, 'A. Brahimi', 'DEF', 4.5),
(5, 'A. Kendouci', 'MID', 8.0), (5, 'Y. Dali', 'MID', 6.0), (5, 'A. Yettou', 'MID', 5.5), (5, 'M. Bouchama', 'MID', 5.0), (5, 'W. Zamoum', 'MID', 5.5),
(5, 'A. Lahmeri', 'FWD', 7.5), (5, 'A. Benchoucha', 'FWD', 7.0), (5, 'M. Aouad', 'FWD', 6.5);

-- CS Constantine (Team 6)
INSERT INTO players (team_id, name, position, price) VALUES
(6, 'Z. Bouhalfaya', 'GK', 5.0), (6, 'K. Boussouf', 'GK', 4.0),
(6, 'M. Zaalani', 'DEF', 5.0), (6, 'A. Madani', 'DEF', 5.5), (6, 'H. Baouche', 'DEF', 5.0), (6, 'C. Derradji', 'DEF', 4.5), (6, 'M. Guemroud', 'DEF', 4.5),
(6, 'S. Belhocine', 'MID', 6.0), (6, 'A. Khaldi', 'MID', 6.5), (6, 'M. Benchaira', 'MID', 6.0), (6, 'M. Belmessaoud', 'MID', 5.5), (6, 'A. Chekal', 'MID', 5.5),
(6, 'M. Temine', 'FWD', 7.0), (6, 'B. Dib', 'FWD', 8.5), (6, 'A. Belhocini', 'FWD', 7.5);
