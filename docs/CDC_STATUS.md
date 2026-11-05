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

## Vérification

La 264e fiche est une fixture synthétique, uniquement dans tests/fixtures et dans les scénarios isolés. Elle vérifie le passage brouillon/revue/publication, les formats, les vrais handlers v1, la carte, les statistiques, FR/AR, l’absence de point fictif et l’échappement de textes malveillants. Le build de production refuse les IDs de fixtures. Aucune opération historique nouvelle n’est ajoutée par cette livraison.

Les 789 réserves de migration concernent les mêmes trois points pour chaque fiche initiale : import non revu, territoire à revoir et point représentatif à revoir. Le validateur historique conserve ses 43 notices. Ces avertissements ne sont pas des erreurs bloquantes ni des corrections historiques autorisées.

Les assertions contradictoires utilisées pour le test T10 sont également synthétiques : elles ne sont pas ajoutées aux 263 fiches publiées. La livraison met en place leur modèle, les contrôles, l’affichage et les exports, sans analyser automatiquement les textes historiques existants.

Validation locale : 73 tests Node et 34 tests navigateur, plus le validateur historique et les contrôles de génération. Les scénarios vérifient les contradictions, les références d’entités, les noms conservés, les brouillons, la revue liée au contenu, la comparaison Git réelle et la navigation mobile/ordinateur FR/AR.

Le rapport de rapprochement produit 135 paires candidates pour le corpus initial, sans confirmer de doublon. Sur six paires synthétiques annotées, précision et rappel valent 0,75 ; une calibration historique reste à effectuer. Les rapports internes ne sont pas exposés sur le site public.

## Suite du CDC

La chaîne technique, les assertions et les référentiels sont opérationnels ; une contribution réelle doit encore être revue par le mainteneur avant d’être ajoutée. Priorité suivante : API v2 et contrat OpenAPI. Restent également la consultation détaillée des entités, l’amélioration et la calibration des rapprochements, l’assistance aux contradictions, les versions scientifiques, les protections administratives du dépôt et l’observatoire des lacunes. Les choix de licence, de retrait et de nombre de reviewers restent dans DECISIONS_PENDING.md. Aucune validation scientifique ou conformité globale au CDC n’est prétendue par ce bilan.
