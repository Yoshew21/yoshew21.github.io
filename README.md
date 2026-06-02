# Yoshew21 Portfolio (GitHub Pages)

Ce dépôt déploie un portfolio GitHub Pages qui affiche automatiquement les repositories publics du compte **Yoshew21**.

## Fonctionnement

- La page d’accueil (`index.html`) lit `data/repos.json` et rend les cartes de projets (nom, description, langages, stars, forks, date de mise à jour, lien GitHub).
- Le workflow GitHub Actions `.github/workflows/update-repos-data.yml` régénère `data/repos.json` automatiquement.
- Si le JSON est vide/non disponible, le client tente un fallback en direct sur l’API GitHub (sans token), avec message d’erreur en cas de rate-limit.

## Mise à jour automatique des données

Workflow: **Update repos data**

- Déclenchement manuel: `workflow_dispatch`
- Déclenchement planifié: à 00:17 et 12:17 UTC chaque jour (cron)
- Authentification: `GITHUB_TOKEN` (aucun secret personnalisé requis)

Le workflow:
1. récupère tous les repos publics de `Yoshew21`;
2. récupère les langages principaux pour chaque repo;
3. écrit `data/repos.json`;
4. commit/push uniquement si le fichier a changé.

## Développement local

Aucun build n’est nécessaire (site statique HTML/CSS/JS).

Exemple:

```bash
cd /tmp/workspace/Yoshew21/yoshew21.github.io
python3 -m http.server 8000
```

Puis ouvrir: `http://localhost:8000`

## Structure

- `index.html` : sections **À propos**, **Projets**, **Contact**
- `assets/css/styles.css` : style responsive
- `assets/js/main.js` : chargement/rendu des repos
- `data/repos.json` : snapshot des données des repos
- `.github/workflows/update-repos-data.yml` : génération automatique du JSON
