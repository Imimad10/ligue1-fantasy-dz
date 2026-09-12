-- =========================================================
-- SCRIPT DE CORRECTION DES CONTRAINTES DE CLÉ ÉTRANGÈRE
-- Copie et colle ce script dans le SQL Editor de Supabase
-- puis clique sur "Run"
-- =========================================================

-- 1. Supprimer l'ancienne contrainte si elle pointe sur profiles(id)
ALTER TABLE IF EXISTS fantasy_teams 
  DROP CONSTRAINT IF EXISTS fantasy_teams_user_id_fkey;

-- 2. Ajouter la contrainte pointant directement vers auth.users(id)
ALTER TABLE IF EXISTS fantasy_teams 
  ADD CONSTRAINT fantasy_teams_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Ajouter la politique d'insertion pour la table profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Insérer son profil') THEN
    CREATE POLICY "Insérer son profil" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 4. Créer un trigger automatique pour créer un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, COALESCE(split_part(new.email, '@', 1), 'Joueur'))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Remplir rétroactivement les profils pour tous les utilisateurs existants dans Auth
INSERT INTO public.profiles (id, username)
SELECT id, COALESCE(split_part(email, '@', 1), 'Joueur')
FROM auth.users
ON CONFLICT (id) DO NOTHING;
