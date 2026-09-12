# Ligue 1 Fantasy DZ — démarrage du projet

Ceci est le squelette de ton site. Suis ces étapes dans l'ordre, une par une.

## 1. Installer Node.js (si ce n'est pas déjà fait)

Télécharge et installe la version "LTS" depuis https://nodejs.org
Pour vérifier que c'est installé, ouvre un terminal et tape :
```
node -v
```
Tu dois voir un numéro de version s'afficher (ex: v20.x.x).

## 2. Installer les dépendances du projet

Dans un terminal, place-toi dans le dossier du projet puis lance :
```
npm install
```
Ça va télécharger tout ce dont le projet a besoin pour fonctionner (ça peut prendre 1-2 minutes).

## 3. Créer ton projet Supabase (gratuit)

1. Va sur https://supabase.com et crée un compte gratuit.
2. Clique sur "New Project", donne-lui un nom (ex: ligue1-fantasy-dz).
3. Choisis un mot de passe pour la base de données et note-le quelque part.
4. Attends 1-2 minutes que le projet se crée.
5. Une fois créé, va dans **Project Settings > API**.
6. Tu y trouveras deux valeurs : **Project URL** et **anon public key**.

## 4. Configurer tes clés

1. Fais une copie du fichier `.env.local.example` et renomme-la en `.env.local`.
2. Colle dedans ton Project URL et ta clé anon (celles de l'étape 3).

## 5. Lancer le site en local

```
npm run dev
```
Puis ouvre ton navigateur à l'adresse : http://localhost:3000

Si tout est bien configuré, tu dois voir "✅ Connexion à Supabase réussie !" sur la page.

---

## Et après ?

Ce squelette ne fait qu'une chose pour l'instant : vérifier que le site peut parler à
Supabase. La prochaine étape sera de créer les tables dans Supabase (équipes, joueurs,
matchs, utilisateurs...) — reviens vers Claude pour la suite dès que cette page
affiche bien le message de succès.
