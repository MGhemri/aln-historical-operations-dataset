# Navigation autonome sur Vercel

Le site Vercel et les domaines personnalisés ne proposent aucun lien actif vers github.com ou raw.githubusercontent.com. Seul un domaine GitHub Pages peut activer les liens de dépôt et de préparation d’Issue. Les liens de documentation restent locaux sur les deux hébergements.

Documentation publiée dans `docs/documentation/` : méthodologie, API, contribution, politique éditoriale et code de conduite. Génération déterministe depuis les fichiers Markdown par `npm run build:documentation`, contrôle CI par `npm run check:documentation`. Aucun téléchargement de documentation depuis GitHub n’est requis à la lecture. `/api/docs` renvoie à la documentation locale sur Vercel.

Sur Vercel, le parcours de contribution propose le téléchargement Markdown et explique qu’il ne s’agit pas d’un envoi. Les liens de suivi et d’Issue GitHub restent disponibles sur GitHub Pages. La protection des liens s’applique aussi aux contenus insérés dynamiquement.

Navigation : boutons documentation et contribution munis d’icônes et de libellés accessibles, barre mobile répartie sur deux lignes, actions conservées à 360 et 390 pixels. Les panneaux fermés ne recouvrent plus temporairement l’écran pendant un changement de langue.

Validation : 37 tests API/corpus réussis ; 25 tests navigateur réussis couvrant les deux modes d’hébergement, les six contributions FR/AR, l’absence de liens de dépôt sur Vercel, le téléchargement, les documents locaux, les URLs propres, la navigation carte/liste et les tailles 360/390/1280. Captures inspectées. Les essais locaux utilisent les mêmes versions de bibliothèques cartographiques sans dépendance réseau pour les tests.

Limites : navigation testée sous Chromium, pas de certification exhaustive d’accessibilité ni essai matériel sur tous les téléphones. Les contributions ne sont pas automatiquement transmises par le site. Les 263 fiches et l’API v1 restent inchangées.
