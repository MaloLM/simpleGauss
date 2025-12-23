# Guide de Déploiement - SimpleGauss

Ce projet est hébergé sur Firebase Hosting en tant que site "multisite" (sous-domaine).

## Prérequis

1. Avoir Node.js installé.
2. Avoir la CLI Firebase installée :

```bash
npm install -g firebase-tools
```

3. Être connecté à Firebase :

```bash
firebase login
```

## Configuration (Déjà faite)

Le projet utilise une **target** nommée `gauss` pour ne pas écraser le site principal du projet Firebase.
Configuration dans `firebase.json` :

- **Target** : `gauss`
- **Dossier public** : `dist` (généré par Vite)

## Comment déployer manuellement ?

À chaque mise à jour du code, lancez cette commande unique à la racine du projet :

```bash
npm run build && firebase deploy --only hosting:gauss
```

### Détail de la commande :

1. `npm run build` : Compile le code TypeScript/React en fichiers statiques optimisés dans le dossier `/dist`.
2. `firebase deploy` : Envoie les fichiers vers les serveurs de Google.
3. `--only hosting:gauss` : **Sécurité**. Assure qu'on ne déploie QUE l'hébergement (pas la base de données ou les fonctions) et UNIQUEMENT pour la cible `gauss` (pas le site principal).

## Vérification

Une fois le déploiement terminé, l'URL s'affichera dans le terminal (ex: `https://votre-site.web.app`).
