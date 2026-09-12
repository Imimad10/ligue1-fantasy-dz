-- =========================================================
-- SCRIPT DE CORRECTION DES POLITIQUES RLS ADMIN / STATS
-- Copie et colle ce script dans le SQL Editor de Supabase
-- puis clique sur "Run"
-- =========================================================

-- 1. Permettre l'insertion/modification des statistiques de matchs (player_gameweek_stats)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Gestion admin stats') THEN
    CREATE POLICY "Gestion admin stats" ON player_gameweek_stats FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 2. Permettre la gestion des journées (gameweeks)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Gestion admin gameweeks') THEN
    CREATE POLICY "Gestion admin gameweeks" ON gameweeks FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 3. Permettre la gestion des matchs (matches)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Gestion admin matches') THEN
    CREATE POLICY "Gestion admin matches" ON matches FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 4. Permettre la gestion des joueurs et équipes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Gestion admin players') THEN
    CREATE POLICY "Gestion admin players" ON players FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Gestion admin teams') THEN
    CREATE POLICY "Gestion admin teams" ON teams FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
