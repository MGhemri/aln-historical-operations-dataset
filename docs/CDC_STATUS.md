# CDC — Bilan de la publication et de la provenance

## Livré

- Canon relié à l’atlas, à l’API v1 et aux quatre chemins publics historiques.
- 263 objets initiaux et identifiants protégés ; référence d’origine immuable et contrat v1 conservé.
- Nouvelles opérations/révisions structurées, sources, territoires et vocabulaire validés.
- Brouillons exclus ; publication conditionnée à une trace explicite de revue et à des sources.
- JSON, JSON compatible, GeoJSON, CSV, sources, rapports et manifeste SHA-256 reproductibles.
- Préparation d’un brouillon depuis la pièce jointe JSON d’une contribution, sans publication automatique ni reprise de l’adresse de réponse dans les données.
- Compteurs dynamiques de l’atlas, coordonnées distinctes du total, appartenances multiples et revue visibles pour les fiches révisées.
- Contrôles avant déploiement sur Vercel et GitHub Pages.
- Assertions sourcées distinctes des champs de fiche, avec passage documentaire et revue explicites.
- Contradictions conservées dans les deux versions, affichées en FR/AR et exportées dans `claims.json` ; aucun arbitrage automatique.
- Références orphelines, contradictions incohérentes et assertions publiées sans revue bloquées ; brouillons et leurs preuves exclus des exports.

## Vérification

La 264e fiche est une fixture synthétique, uniquement dans tests/fixtures et dans les scénarios isolés. Elle vérifie le passage brouillon/revue/publication, les formats, les vrais handlers v1, la carte, les statistiques, FR/AR, l’absence de point fictif et l’échappement de textes malveillants. Le build de production refuse les IDs de fixtures. Aucune opération historique nouvelle n’est ajoutée par cette livraison.

Les 789 réserves de migration concernent les mêmes trois points pour chaque fiche initiale : import non revu, territoire à revoir et point représentatif à revoir. Le validateur historique conserve ses 43 notices. Ces avertissements ne sont pas des erreurs bloquantes ni des corrections historiques autorisées.

Les assertions contradictoires utilisées pour le test T10 sont également synthétiques : elles ne sont pas ajoutées aux 263 fiches publiées. La livraison met en place leur modèle, les contrôles, l’affichage et les exports, sans analyser automatiquement les textes historiques existants.

Validation locale : 57 tests Node et 34 tests navigateur, plus le validateur historique et les contrôles de génération. Les scénarios vérifient les deux versions contradictoires, leurs passages sources, leur restitution par le vrai handler v1, l’absence de fuite des brouillons et la navigation mobile/ordinateur FR/AR.

## Suite du CDC

La chaîne technique de publication et le modèle d’assertions sont opérationnels ; une contribution réelle doit encore être revue par le mainteneur avant d’être ajoutée. Les lieux/personnes/organisations réutilisables, les doublons candidats, l’API v2, les versions scientifiques et l’observatoire des lacunes restent à développer. Les choix de licence, de retrait et de nombre de reviewers restent dans DECISIONS_PENDING.md. Aucune validation scientifique ou conformité globale au CDC n’est prétendue par ce bilan.
