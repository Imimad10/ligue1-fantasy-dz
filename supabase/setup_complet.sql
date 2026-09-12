-- =========================================================
-- SCRIPT COMPLET : Schéma + Données
-- Copie TOUT ce fichier dans le SQL Editor de Supabase
-- puis clique sur "Run"
-- =========================================================

-- ===================== SCHÉMA =====================

-- 1. Équipes de Ligue 1
create table if not exists teams (
  id bigint generated always as identity primary key,
  name text not null,
  logo_url text
);

-- 2. Joueurs réels
create table if not exists players (
  id bigint generated always as identity primary key,
  team_id bigint references teams(id) on delete set null,
  name text not null,
  position text not null check (position in ('GK','DEF','MID','FWD')),
  price numeric(4,1) not null default 5.0
);

-- 3. Journées
create table if not exists gameweeks (
  id bigint generated always as identity primary key,
  number int not null unique,
  start_date date,
  end_date date,
  is_current boolean not null default false
);

-- 4. Matchs
create table if not exists matches (
  id bigint generated always as identity primary key,
  gameweek_id bigint references gameweeks(id) on delete cascade,
  home_team_id bigint references teams(id),
  away_team_id bigint references teams(id),
  home_score int,
  away_score int,
  played_at timestamptz
);

-- 5. Stats joueur par journée
create table if not exists player_gameweek_stats (
  id bigint generated always as identity primary key,
  player_id bigint references players(id) on delete cascade,
  gameweek_id bigint references gameweeks(id) on delete cascade,
  minutes_played int not null default 0,
  goals int not null default 0,
  assists int not null default 0,
  yellow_cards int not null default 0,
  red_cards int not null default 0,
  clean_sheet boolean not null default false,
  points int not null default 0,
  unique (player_id, gameweek_id)
);

-- 6. Profil utilisateur
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null
);

-- 7. Équipe fantasy
create table if not exists fantasy_teams (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  budget numeric(5,1) not null default 100.0
);

-- 8. Joueurs sélectionnés
create table if not exists fantasy_team_players (
  id bigint generated always as identity primary key,
  fantasy_team_id bigint references fantasy_teams(id) on delete cascade,
  player_id bigint references players(id),
  gameweek_id bigint references gameweeks(id),
  is_captain boolean not null default false,
  is_starting boolean not null default true
);

-- 9. Ligues privées
create table if not exists leagues (
  id bigint generated always as identity primary key,
  name text not null,
  invite_code text unique not null,
  created_by uuid references profiles(id)
);

-- 10. Membres d'une ligue
create table if not exists league_members (
  league_id bigint references leagues(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  primary key (league_id, user_id)
);

-- ===================== SÉCURITÉ RLS =====================

alter table teams enable row level security;
alter table players enable row level security;
alter table gameweeks enable row level security;
alter table matches enable row level security;
alter table player_gameweek_stats enable row level security;
alter table fantasy_teams enable row level security;
alter table fantasy_team_players enable row level security;
alter table leagues enable row level security;
alter table league_members enable row level security;
alter table profiles enable row level security;

-- Lecture publique
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lecture publique teams') THEN
    CREATE POLICY "Lecture publique teams" ON teams FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lecture publique players') THEN
    CREATE POLICY "Lecture publique players" ON players FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lecture publique gameweeks') THEN
    CREATE POLICY "Lecture publique gameweeks" ON gameweeks FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lecture publique matches') THEN
    CREATE POLICY "Lecture publique matches" ON matches FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lecture publique stats') THEN
    CREATE POLICY "Lecture publique stats" ON player_gameweek_stats FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lecture publique leagues') THEN
    CREATE POLICY "Lecture publique leagues" ON leagues FOR SELECT USING (true);
  END IF;
END $$;

-- Profils
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Voir son profil') THEN
    CREATE POLICY "Voir son profil" ON profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Modifier son profil') THEN
    CREATE POLICY "Modifier son profil" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Fantasy teams
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Voir ses equipes fantasy') THEN
    CREATE POLICY "Voir ses equipes fantasy" ON fantasy_teams FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Creer ses equipes fantasy') THEN
    CREATE POLICY "Creer ses equipes fantasy" ON fantasy_teams FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Modifier ses equipes fantasy') THEN
    CREATE POLICY "Modifier ses equipes fantasy" ON fantasy_teams FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Fantasy team players
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Voir composition equipe') THEN
    CREATE POLICY "Voir composition equipe" ON fantasy_team_players FOR SELECT USING (
      exists (select 1 from fantasy_teams ft where ft.id = fantasy_team_id and ft.user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Modifier composition equipe') THEN
    CREATE POLICY "Modifier composition equipe" ON fantasy_team_players FOR ALL USING (
      exists (select 1 from fantasy_teams ft where ft.id = fantasy_team_id and ft.user_id = auth.uid())
    );
  END IF;
END $$;

-- League members
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Voir ses ligues') THEN
    CREATE POLICY "Voir ses ligues" ON league_members FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Rejoindre une ligue') THEN
    CREATE POLICY "Rejoindre une ligue" ON league_members FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ===================== DONNÉES =====================

-- Équipes
INSERT INTO teams (name, logo_url) VALUES 
('MC Alger', 'https://upload.wikimedia.org/wikipedia/fr/b/b5/Logo_MC_Alger.svg'),
('CR Belouizdad', 'https://upload.wikimedia.org/wikipedia/fr/5/5f/CR_Belouizdad_logo.svg'),
('JS Kabylie', 'https://upload.wikimedia.org/wikipedia/fr/2/23/Logo_JS_Kabylie.svg'),
('USM Alger', 'https://upload.wikimedia.org/wikipedia/fr/8/87/Logo_USM_Alger.svg'),
('ES Sétif', 'https://upload.wikimedia.org/wikipedia/fr/9/91/ES_Setif_logo.svg'),
('CS Constantine', 'https://upload.wikimedia.org/wikipedia/fr/0/05/CS_Constantine_Logo.svg');

-- Journées
INSERT INTO gameweeks (number, start_date, end_date, is_current) VALUES 
(1, '2026-09-15', '2026-09-17', true),
(2, '2026-09-22', '2026-09-24', false),
(3, '2026-09-29', '2026-10-01', false);

-- Matchs Journée 1
INSERT INTO matches (gameweek_id, home_team_id, away_team_id, played_at) VALUES 
(1, 1, 2, '2026-09-15 20:00:00+01'),
(1, 3, 4, '2026-09-16 18:00:00+01'),
(1, 5, 6, '2026-09-17 19:00:00+01');

-- Joueurs MC Alger
INSERT INTO players (team_id, name, position, price) VALUES
(1, 'O. Litim', 'GK', 5.0), (1, 'F. Chaal', 'GK', 4.5),
(1, 'A. Ghezala', 'DEF', 5.5), (1, 'M. Hachoud', 'DEF', 5.0), (1, 'A. Abdellaoui', 'DEF', 6.0), (1, 'H. Mouali', 'DEF', 4.5), (1, 'R. Helaïmia', 'DEF', 5.5),
(1, 'T. Tahar', 'MID', 6.5), (1, 'M. Benkhemassa', 'MID', 6.0), (1, 'Y. Belaïli', 'MID', 12.0), (1, 'Z. Draoui', 'MID', 7.0), (1, 'A. Bourdim', 'MID', 6.5),
(1, 'S. Bayazid', 'FWD', 8.5), (1, 'A. Naidji', 'FWD', 9.0), (1, 'K. Merzougui', 'FWD', 7.5);

-- Joueurs CR Belouizdad
INSERT INTO players (team_id, name, position, price) VALUES
(2, 'A. Guendouz', 'GK', 5.5), (2, 'R. M''Bolhi', 'GK', 5.0),
(2, 'M. Bouchar', 'DEF', 6.0), (2, 'C. Keddad', 'DEF', 5.5), (2, 'Y. Laouafi', 'DEF', 5.0), (2, 'M. Belkhiter', 'DEF', 5.0), (2, 'A. Bouguerra', 'DEF', 4.5),
(2, 'H. Mrezigue', 'MID', 7.0), (2, 'A. Bouras', 'MID', 6.5), (2, 'B. Boussouf', 'MID', 8.0), (2, 'I. Bakir', 'MID', 7.0), (2, 'A. Benguit', 'MID', 6.5),
(2, 'L. Wamba', 'FWD', 9.5), (2, 'O. Darfalou', 'FWD', 8.5), (2, 'A. Meziane', 'FWD', 9.0);

-- Joueurs JS Kabylie
INSERT INTO players (team_id, name, position, price) VALUES
(3, 'G. Hadid', 'GK', 4.5), (3, 'C. Rahmani', 'GK', 5.0),
(3, 'K. Bouhakak', 'DEF', 5.0), (3, 'B. Souyad', 'DEF', 5.5), (3, 'F. Nechat Djabri', 'DEF', 4.5), (3, 'A. Gatal', 'DEF', 4.5), (3, 'O. Benzaid', 'DEF', 4.5),
(3, 'S. Boumechra', 'MID', 6.5), (3, 'K. Ait-Atmane', 'MID', 6.0), (3, 'R. Boualia', 'MID', 8.5), (3, 'A. Amriche', 'MID', 5.5), (3, 'M. Benzaid', 'MID', 5.0),
(3, 'D. Mouaki', 'FWD', 8.0), (3, 'S. Msuva', 'FWD', 7.5), (3, 'F. Bwalya', 'FWD', 7.5);

-- Joueurs USM Alger
INSERT INTO players (team_id, name, position, price) VALUES
(4, 'O. Benbot', 'GK', 6.0), (4, 'A. Benchelef', 'GK', 4.5),
(4, 'Z. Belaïd', 'DEF', 6.5), (4, 'S. Radouani', 'DEF', 5.5), (4, 'H. Deghmoum', 'DEF', 5.0), (4, 'H. Baouche', 'DEF', 4.5), (4, 'N. Khoualed', 'DEF', 4.5),
(4, 'O. Chita', 'MID', 6.0), (4, 'B. Benzaza', 'MID', 6.5), (4, 'I. Merili', 'MID', 5.5), (4, 'T. Orebonye', 'MID', 7.5), (4, 'A. Djahnit', 'MID', 6.5),
(4, 'A. Mahious', 'FWD', 9.0), (4, 'I. Belkacemi', 'FWD', 8.0), (4, 'A. Bacha', 'FWD', 7.0);

-- Joueurs ES Sétif
INSERT INTO players (team_id, name, position, price) VALUES
(5, 'Z. Bouhalfaya', 'GK', 5.0), (5, 'A. Osmani', 'GK', 4.0),
(5, 'M. Ziti', 'DEF', 5.0), (5, 'T. Hachoud', 'DEF', 4.5), (5, 'D. Chaabi', 'DEF', 4.5), (5, 'I. Diarra', 'DEF', 5.0), (5, 'A. Brahimi', 'DEF', 4.5),
(5, 'A. Kendouci', 'MID', 8.0), (5, 'Y. Dali', 'MID', 6.0), (5, 'A. Yettou', 'MID', 5.5), (5, 'M. Bouchama', 'MID', 5.0), (5, 'W. Zamoum', 'MID', 5.5),
(5, 'A. Lahmeri', 'FWD', 7.5), (5, 'A. Benchoucha', 'FWD', 7.0), (5, 'M. Aouad', 'FWD', 6.5);

-- Joueurs CS Constantine
INSERT INTO players (team_id, name, position, price) VALUES
(6, 'M. Rahmani', 'GK', 5.0), (6, 'K. Boussouf', 'GK', 4.0),
(6, 'M. Zaalani', 'DEF', 5.0), (6, 'A. Madani', 'DEF', 5.5), (6, 'S. Baouche', 'DEF', 5.0), (6, 'C. Derradji', 'DEF', 4.5), (6, 'M. Guemroud', 'DEF', 4.5),
(6, 'S. Belhocine', 'MID', 6.0), (6, 'A. Khaldi', 'MID', 6.5), (6, 'M. Benchaira', 'MID', 6.0), (6, 'M. Belmessaoud', 'MID', 5.5), (6, 'A. Chekal', 'MID', 5.5),
(6, 'M. Temine', 'FWD', 7.0), (6, 'B. Dib', 'FWD', 8.5), (6, 'A. Belhocini', 'FWD', 7.5);
