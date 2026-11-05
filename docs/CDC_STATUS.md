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
- Référentiels personnes, organisations et lieux : noms, variantes, périodes, preuves, relations d’identité candidates et revues. Structure et exports livrés, alimentation historique à effectuer après revue.
- Contrôle Git des modifications publiques : nouvelle décision liée à l’empreinte du contenu, historique préservé et suppressions de fichiers refusées.
- Détection de doublons candidats avec facteurs explicatifs et rapport interne ; aucune fusion automatique. Évaluation synthétique avec faux positifs et limites documentés.
- API v2 de lecture : fiches, preuves, sources, assertions, référentiels, statistiques, indicateurs documentaires, snapshot et exports ; filtres, pagination stable et GeoJSON paginé.
- Contrat OpenAPI 3.1 généré et vérifié, erreurs structurées, ETag/GET conditionnel, limites de réponse, vérification des empreintes et exemples HTTP exécutables.

## Vérification

La 264e fiche est une fixture synthétique, uniquement dans tests/fixtures et dans les scénarios isolés. Elle vérifie le passage brouillon/revue/publication, les formats, les vrais handlers v1, la carte, les statistiques, FR/AR, l’absence de point fictif et l’échappement de textes malveillants. Le build de production refuse les IDs de fixtures. Aucune opération historique nouvelle n’est ajoutée par cette livraison.

Les 789 réserves de migration concernent les mêmes trois points pour chaque fiche initiale : import non revu, territoire à revoir et point représentatif à revoir. Le validateur historique conserve ses 43 notices. Ces avertissements ne sont pas des erreurs bloquantes ni des corrections historiques autorisées.

Les assertions contradictoires utilisées pour le test T10 sont également synthétiques : elles ne sont pas ajoutées aux 263 fiches publiées. La livraison met en place leur modèle, les contrôles, l’affichage et les exports, sans analyser automatiquement les textes historiques existants.

Validation locale : 88 tests Node et 34 tests navigateur, plus le validateur historique et les contrôles de génération. Les scénarios couvrent aussi le contrat v2, les dates partielles/inconnues, les filtres combinés, les appartenances multiples, la BBOX traversant l’antiméridien, le cache 304, les erreurs, le stockage par empreintes et les exemples HTTP locaux. Les exemples GET sont également exécutables après déploiement via `npm run smoke:api:v2`.

Le rapport de rapprochement produit 135 paires candidates pour le corpus initial, sans confirmer de doublon. Sur six paires synthétiques annotées, précision et rappel valent 0,75 ; une calibration historique reste à effectuer. Les rapports internes ne sont pas exposés sur le site public.

## Suite du CDC

La chaîne technique, les assertions, les référentiels et l’API v2 sont opérationnels ; une contribution réelle doit encore être revue par le mainteneur avant d’être ajoutée. Les endpoints de statistiques et couverture sont disponibles, mais l’observatoire visuel des lacunes reste à développer. Les releases scientifiques ne sont pas encore activées : `/releases` est vide et `/releases/current` identifie un snapshot par empreinte, sans version scientifique fictive.

Priorités suivantes : versions scientifiques reproductibles, observatoire documentaire et calibration des rapprochements. Restent également les pages détaillées de consultation des entités, l’assistance aux contradictions, les protections administratives du dépôt, les analyses avancées et les mesures de performance à grande échelle. Les choix de licence, de retrait et de nombre de reviewers restent dans DECISIONS_PENDING.md. Aucune validation scientifique ou conformité globale au CDC n’est prétendue par ce bilan.
