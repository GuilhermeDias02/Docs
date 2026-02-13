## Application d’édition de documents collaborative

Cette application est une **web app d’édition de documents collaborative**, inspirée de Google Docs / Word Online.  
Elle permet à plusieurs utilisateurs de modifier un même document en temps réel grâce à des **connexions WebSocket** :

- **Liste des documents**: une page d’accueil affiche tous les documents existants et permet d’en créer de nouveaux.
- **Édition en temps réel**: en cliquant sur un document, on accède à une page d’édition où l’on voit :
  - le **curseur** de chaque utilisateur connecté,
  - les **modifications en direct** effectuées par chacun.

L’objectif est de fournir une expérience fluide de co‑édition, proche des grands outils du marché, mais auto‑hébergeable.

## Démarrer le projet en local

### 1. Cloner le dépôt

```bash
git clone https://github.com/GuilhermeDias02/Docs.git
cd Docs
```

### 2. Installer les dépendances

Dans le dossier `back` :

```bash
cd back
npm install
```

Dans le dossier `front` (dans un autre terminal ou après être revenu à la racine) :

```bash
cd ../front
npm install
```

### 3. Lancer les serveurs de développement

Dans le dossier `back` :

```bash
cd back
npm run dev
```

Dans le dossier `front` :

```bash
cd front
npm run dev
```

Ensuite, ouvre ton navigateur à l’URL indiquée par le front (souvent `http://localhost:5173` ou similaire) pour accéder à la page d’accueil, voir les documents et tester l’édition collaborative en temps réel.

## Crédits

Développement réalisé par :

- **GuilhermeDias02**
- **Araden14**
- **vs1518**
