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
- Versions de données immuables : ZIP reproductible, exports figés depuis un commit, manifeste, SHA-256, journal et citation CFF. Première version `data-2026.11.1` : 263 fiches initiales, sans nouvelle validation historique.
- Page de versions FR/AR sur Vercel et GitHub Pages, catalogue API et workflow de publication GitHub Releases après tests et reproduction des sources.
- Observatoire documentaire FR/AR : filtres, tableaux par année/territoire/type, incertitudes, références, traces de revue, assertions contestées et exports JSON/CSV reproductibles.
- Même calcul dans le navigateur et l’API ; empreintes des données et du moteur conservées. Les sélections vides signalent une lacune documentaire, les propositions en attente restent non mesurées et aucun classement primaire n’est inféré.
- Assistance interne enrichie : variantes de noms sourcées, réserves sur les dates, comparaison des assertions par contexte, unité et intervalle. Registre des annotations humaines lié aux empreintes des fiches et sources, avec exclusion des annotations périmées. Voir [le guide de revue](../ASSISTANCE.md).
- Comparateur public FR/AR : une ou deux fiches, filtres sur toutes les fiches publiées, sources, précision des dates, rôles géométriques et assertions contextualisées. Export JSON avec snapshot et empreinte du moteur ; vérification des données avant affichage. Aucun diagnostic de brouillon exposé.
- Pages publiques des personnes, organisations et lieux : recherche des variantes, détails sourcés, périodes, identités revues, géométrie sans point inventé et opérations explicitement reliées. Consultation FR/AR, export JSON et contrôle des empreintes ; référentiels actuellement vides en attente de revue documentaire.

## Vérification

La 264e fiche est une fixture synthétique, uniquement dans tests/fixtures et dans les scénarios isolés. Elle vérifie le passage brouillon/revue/publication, les formats, les vrais handlers v1, la carte, les statistiques, FR/AR, l’absence de point fictif et l’échappement de textes malveillants. Le build de production refuse les IDs de fixtures. Aucune opération historique nouvelle n’est ajoutée par cette livraison.

Les 789 réserves de migration concernent les mêmes trois points pour chaque fiche initiale : import non revu, territoire à revoir et point représentatif à revoir. Le validateur historique conserve ses 43 notices. Ces avertissements ne sont pas des erreurs bloquantes ni des corrections historiques autorisées.

Les assertions contradictoires utilisées pour le test T10 sont également synthétiques : elles ne sont pas ajoutées aux 263 fiches publiées. La livraison met en place leur modèle, les contrôles, l’affichage et les exports, sans analyser automatiquement les textes historiques existants.

Validation locale : 112 tests Node et 58 tests navigateur, plus le validateur historique et les contrôles de génération. L’observatoire est testé pour les incertitudes, les regroupements non additifs, les sources primaires revues, les brouillons, les conflits publiés, les sélections vides, les exports, la vérification d’intégrité et l’affichage mobile/ordinateur FR/AR. Les archives et contrats v1/v2 restent vérifiés. Les exemples GET restent exécutables après déploiement via `npm run smoke:api:v2`.

Le rapport de rapprochement produit 135 paires candidates pour le corpus initial, sans confirmer de doublon. Sur six paires synthétiques annotées, précision et rappel valent 0,75 ; une calibration historique reste à effectuer. Les rapports internes ne sont pas exposés sur le site public.

## Suite du CDC

La chaîne technique, les assertions, les référentiels, l’API v2, les archives versionnées et l’observatoire sont opérationnels ; une contribution réelle doit encore être revue par le mainteneur avant d’être ajoutée. L’observatoire expose les réserves du corpus, sans les résoudre automatiquement. La version `data-2026.11.1` et les 263 fiches restent inchangées ; les rapports sont des produits dérivés identifiés séparément. Les archives ne certifient pas historiquement les fiches et ne disposent pas de DOI automatique.

Priorités suivantes : alimentation documentaire du benchmark historique. Le moteur interne de rapprochement et d’assistance aux contradictions est livré ; les annotations historiques restent à constituer après revue. Restent également les protections administratives du dépôt, les analyses avancées et les mesures de performance à grande échelle. Les choix de licence, de retrait et de nombre de reviewers restent dans DECISIONS_PENDING.md. Aucune validation scientifique ou conformité globale au CDC n’est prétendue par ce bilan.
