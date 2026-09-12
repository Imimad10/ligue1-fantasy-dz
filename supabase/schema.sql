-- =========================================================
-- Ligue 1 Fantasy DZ — schéma de base de données
-- À coller dans Supabase : SQL Editor > New query > Run
-- =========================================================

-- 1. Équipes de Ligue 1 (ES Sétif, USM Alger, etc.)
create table teams (
  id bigint generated always as identity primary key,
  name text not null,
  logo_url text
);

-- 2. Joueurs réels de Ligue 1
create table players (
  id bigint generated always as identity primary key,
  team_id bigint references teams(id) on delete set null,
  name text not null,
  position text not null check (position in ('GK','DEF','MID','FWD')),
  price numeric(4,1) not null default 5.0
);

-- 3. Journées de championnat (gameweeks)
create table gameweeks (
  id bigint generated always as identity primary key,
  number int not null unique,
  start_date date,
  end_date date,
  is_current boolean not null default false
);

-- 4. Matchs
create table matches (
  id bigint generated always as identity primary key,
  gameweek_id bigint references gameweeks(id) on delete cascade,
  home_team_id bigint references teams(id),
  away_team_id bigint references teams(id),
  home_score int,
  away_score int,
  played_at timestamptz
);

-- 5. Stats brutes + points d'un joueur pour une journée donnée
create table player_gameweek_stats (
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

-- 6. Profil utilisateur (lié au compte Supabase créé automatiquement à l'inscription)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null
);

-- 7. Équipe fantasy d'un utilisateur
create table fantasy_teams (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  budget numeric(5,1) not null default 100.0
);

-- 8. Les 15 joueurs sélectionnés dans une équipe fantasy, par journée
create table fantasy_team_players (
  id bigint generated always as identity primary key,
  fantasy_team_id bigint references fantasy_teams(id) on delete cascade,
  player_id bigint references players(id),
  gameweek_id bigint references gameweeks(id),
  is_captain boolean not null default false,
  is_starting boolean not null default true
);

-- 9. Ligues privées entre amis
create table leagues (
  id bigint generated always as identity primary key,
  name text not null,
  invite_code text unique not null,
  created_by uuid references profiles(id)
);

-- 10. Membres d'une ligue
create table league_members (
  league_id bigint references leagues(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  primary key (league_id, user_id)
);

-- =========================================================
-- Sécurité (RLS) : tout le monde peut LIRE les données publiques
-- (équipes, joueurs, matchs, stats), mais seul un utilisateur
-- peut modifier SES PROPRES équipes fantasy.
-- =========================================================

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

-- Lecture publique des données de championnat
create policy "Lecture publique" on teams for select using (true);
create policy "Lecture publique" on players for select using (true);
create policy "Lecture publique" on gameweeks for select using (true);
create policy "Lecture publique" on matches for select using (true);
create policy "Lecture publique" on player_gameweek_stats for select using (true);
create policy "Lecture publique" on leagues for select using (true);

-- Un utilisateur ne gère que ses propres données
create policy "Voir son profil" on profiles for select using (true);
create policy "Modifier son profil" on profiles for update using (auth.uid() = id);

create policy "Voir ses équipes fantasy" on fantasy_teams for select using (auth.uid() = user_id);
create policy "Créer ses équipes fantasy" on fantasy_teams for insert with check (auth.uid() = user_id);
create policy "Modifier ses équipes fantasy" on fantasy_teams for update using (auth.uid() = user_id);

create policy "Voir composition équipe" on fantasy_team_players for select using (
  exists (select 1 from fantasy_teams ft where ft.id = fantasy_team_id and ft.user_id = auth.uid())
);
create policy "Modifier composition équipe" on fantasy_team_players for all using (
  exists (select 1 from fantasy_teams ft where ft.id = fantasy_team_id and ft.user_id = auth.uid())
);

create policy "Voir ses ligues" on league_members for select using (auth.uid() = user_id);
create policy "Rejoindre une ligue" on league_members for insert with check (auth.uid() = user_id);
