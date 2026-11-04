# CAHIER DES CHARGES — ALNOP Data Foundation & Research Platform

**Version :** 1.0 — 4 novembre 2026  
**Statut :** Spécification d'implémentation technique et scientifique  
**Projet :** ALN Historical Operations Dataset (1954–1962)  
**Dépôt :** https://github.com/MGhemri/aln-historical-operations-dataset  
**Déploiement actuel :** https://alnop.vercel.app  
**Nature :** académique, open source, gratuit, pérenne, évolutif  
**Priorité absolue :** intégrité historique, traçabilité, compatibilité descendante, reproductibilité.

> **Directives d'implémentation :** implémenter progressivement cette spécification dans le dépôt existant. Inspecter les fichiers avant toute modification. Ne pas inventer, supprimer, réécrire ou « corriger » des faits historiques par inférence. Les 263 fiches existantes constituent le corpus initial, **pas un inventaire exhaustif**. Ne jamais interpréter une absence dans ALNOP comme une absence historique. Conserver les URLs et fonctionnalités publiques actuelles. Faire des commits atomiques et fournir des preuves de tests.

---

## 0. Périmètre, contexte et état initial

### 0.1 Constat établi sur l'archive du dépôt fournie

- Corpus historique dans `operations_fln_1954_1962.json`, objet racine `{dataset_metadata, operations}` ; `operations` contient initialement 263 fiches.
- Export GeoJSON `operations_fln_1954_1962.geojson`.
- Copies de publication dans `docs/data/`.
- API Node.js CommonJS sous `api/v1/`, notamment `operations.js`, `operations/[id].js`, `stats.js`, `wilayas.js`, `data-service.js`.
- Site statique sous `docs/` (`index.html`, `app.js`, `i18n.js`, `style.css`).
- Déploiement Vercel (`vercel.json`), workflows GitHub Actions, documentation `API.md`, `METHODOLOGIE.md`, wiki, validateur `validate_dataset.py`.
- L'attribution territoriale de l'API actuelle utilise notamment des expressions régulières sur `wilaya_concernee`. Ce mécanisme ne doit plus être la source de vérité dans le nouveau modèle.
- Le `package.json` fourni contient `"test": "node validate_dataset.py"`, à corriger en cohérence avec l'audit technique antérieur.
- Exemple de fiche : `OP_1954_001` désigne une opération à portée multiterritoriale ; ne pas la ramener scientifiquement à une seule wilaya.

**Vérification préalable obligatoire :** le dépôt peut avoir évolué depuis cette archive. L'implémentation doit comparer la branche actuelle, les fichiers et l'audit technique préalable. Les affirmations sur le code ci-dessus sont des constats sur l'archive fournie, pas sur les futurs commits.

### 0.2 Objectifs fonctionnels

1. Ajouter continuellement de nouvelles opérations, sources, lieux, acteurs et corrections sans refonte.
2. Permettre des contributions publiques **soumises à revue**, sans écriture directe anonyme dans le corpus publié.
3. Conserver l'intégralité des données initiales, leur sens et leurs identifiants.
4. Expliquer précisément d'où vient chaque affirmation et qui a validé sa publication.
5. Détecter les doublons, variantes de noms, incohérences et contradictions sans fusion ni arbitrage automatique.
6. Publier automatiquement des exports JSON, GeoJSON, CSV et des statistiques cohérentes.
7. Exposer une API versionnée, documentée, stable et adaptée aux chercheurs.
8. Offrir une interface responsive FR/AR avec recherche, contributions, transparence documentaire et indicateurs de couverture.
9. Préparer des analyses spatio-temporelles sans produire de conclusions trompeuses sur un corpus incomplet.
10. Assurer la reproductibilité : chaque publication possède une version, un hash et un journal des changements.

### 0.3 Hors périmètre de la première livraison

- Entraînement de modèles génératifs sans validation des sources ; réponses sans citations scientifiques vérifiables.
- « Prédiction » de batailles ou reconstitution de faits manquants.
- Attribution automatique d'une vérité historique à une source en fonction de son origine.
- Publication automatique de contenus extraits par OCR sans revue humaine.
- Migration obligatoire vers un service payant, un SaaS propriétaire ou une base serveur.
- Authentification maison, stockage de mots de passe, système de commentaires non modéré.
- Modification silencieuse des identifiants et schémas de l'API v1.

### 0.4 Principes non négociables

**Open source / coût :** privilégier GitHub, fichiers versionnés, Vercel et bibliothèques libres ; documenter licences et coûts éventuels. **Neutralité scientifique :** séparer fait rapporté, source, interprétation, incertitude et décision éditoriale. **Provenance :** toute assertion contestable doit être rattachable à une ou plusieurs sources, ou marquée explicitement « non sourcée / à vérifier ». **Incertitude :** représenter les dates partielles et positions approximatives honnêtement. **Contributions :** humain dans la boucle. **Accessibilité :** mobile, clavier, RTL, lecture sans compte. **Reproductibilité :** builds déterministes et artefacts comparables. **Non-régression :** préserver les consommateurs de l'API existante.

---

## 1. Architecture cible

### 1.1 Stratégie : Git comme source de vérité, génération déterministe

```text
GitHub (données canoniques + schémas + revue)
  ├── contributions externes (Issue / PR)
  ├── validations CI (structure, liens, cohérence, tests)
  ├── revue humaine et merge
  └── build reproductible
       ├── JSON public / legacy
       ├── GeoJSON / CSV
       ├── index de recherche
       ├── métriques / rapports de couverture
       ├── manifeste de version / checksums
       ├── API REST v1 maintenue
       ├── API REST v2 ajoutée
       └── site statique et interface de contribution
```

Aucune base PostgreSQL n'est nécessaire au lancement. Prévoir une abstraction `Repository` pour pouvoir brancher Postgres/PostGIS ultérieurement sans changer les contrats publics. La disponibilité d'une PR ne doit pas dépendre d'un serveur privé.

### 1.2 Arborescence cible indicative

```text
/
├── data/
│   ├── operations/              # une fiche canonique par fichier
│   ├── sources/                 # références bibliographiques normalisées
│   ├── places/                  # gazetteer / toponymes
│   ├── persons/                 # entités historiques
│   ├── organizations/
│   ├── territorial-units/       # unités et validités temporelles
│   ├── claims/                  # assertions sourcées, si séparation retenue
│   ├── relationships/
│   └── releases/                # métadonnées de publication
├── schemas/                     # JSON Schema + exemples
├── migrations/                  # scripts idempotents et rapports
├── scripts/                     # import, build, vérifications, exports
├── src/                         # bibliothèque partagée, recherche, qualité
├── api/v1/                      # compatibilité, non-régression
├── api/v2/                      # nouvelles ressources
├── docs/                        # interface publique actuelle, enrichie
├── tests/                       # unitaires, contrats, intégration, fixtures
├── .github/
│   ├── workflows/
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
├── generated/                   # artefacts générés si retenu par convention
├── CONTRIBUTING.md
├── DATA_DICTIONARY.md
├── EDITORIAL_POLICY.md
├── PROVENANCE_POLICY.md
├── RELEASE_POLICY.md
├── SECURITY.md
└── CHANGELOG.md
```

Conserver les chemins publics historiques `operations_fln_1954_1962.json`, `.geojson`, `docs/data/...` tant que les utilisateurs en dépendent. Choisir **une seule** représentation canonique ; toutes les autres sont générées. Ne jamais maintenir à la main plusieurs copies.

### 1.3 Choix d'implémentation

- Réutiliser JavaScript/Node.js déjà présent pour l'API et l'interface ; scripts Python autorisés pour validation/statistique si justifiés.
- Ajouter seulement les dépendances nécessaires, avec lockfiles, licences compatibles et maintenance raisonnable.
- Préférer JSON Schema Draft 2020-12, OpenAPI 3.1, GeoJSON RFC 7946, CSV UTF-8.
- Les workflows doivent tourner sans secrets pour la validation des PR de forks ; les tâches d'écriture et de release utilisent des permissions minimales.
- Aucun appel réseau externe requis pour les tests unitaires. Les contrôles d'URLs sont séparés et non bloquants sauf politique explicite.

---

## 2. Modèle de données canonique

### 2.1 Identité et permanence

- Chaque opération reçoit un `id` permanent. Conserver les `OP_YYYY_NNN` existants ; les futurs identifiants ne doivent pas dépendre d'un compteur recalculé ou de la date corrigible.
- Introduire `canonical_id` si nécessaire, avec `legacy_ids` et `aliases` ; ne pas renuméroter les 263 fiches.
- Une opération peut être `superseded` ou `merged_into` uniquement après décision humaine documentée ; les anciens liens restent résolubles avec redirection logique et explication.
- Définir un identifiant stable pour chaque source, lieu, personne, organisation et unité territoriale.
- Interdire la réutilisation d'un ID supprimé ; préférer les tombstones aux suppressions destructives.

### 2.2 Schéma de l'opération

Champs minimaux proposés (adapter avec migration sans perte) :

| Champ | Type | Règle |
|---|---|---|
| `id` | string | Unique, stable, obligatoire |
| `schema_version` | string | Version du schéma canonique |
| `title.fr` | string | Libellé principal ; ne pas inventer une traduction |
| `title.ar` | string/null | Facultatif ; `null` si inconnu |
| `aliases[]` | array | Noms alternatifs avec langue et provenance |
| `event_type[]` | array | Vocabulaire contrôlé, éventuellement plusieurs types |
| `start_date`, `end_date` | objet date | Précision explicite, jamais de fausse exactitude |
| `locations[]` | array | Un ou plusieurs lieux, géométries, incertitudes |
| `territorial_assignments[]` | array | Plusieurs unités, rôle et intervalle de validité |
| `participants[]` | array | Personnes/organisations et rôles sourcés |
| `description` | texte multilingue | Texte avec provenance ou statut à vérifier |
| `outcomes[]` | array | Bilans sous forme d'assertions, pas de nombres inventés |
| `claims[]` | array | Assertions et références précises |
| `source_ids[]` | array | Références bibliographiques normalisées |
| `editorial_status` | enum | `proposed`, `under_review`, `published`, `disputed`, `withdrawn` |
| `quality_flags[]` | array | Alertes de qualité, non jugements historiques |
| `created_at`, `updated_at` | timestamp | Traçabilité éditoriale |
| `review_history[]` | array | Décisions, justification, référence de PR/commit |

Ne pas imposer artificiellement une valeur connue à tous les champs. Définir `null`, `unknown`, `not_applicable` et `not_recorded` lorsque sémantiquement utile. Les champs hérités (`nom_operation`, `date_debut`, `wilaya_concernee`, `localisation`, `commandement_aln`, `bilan_et_pertes`, `sources`, etc.) doivent être conservés ou transformés **sans perte**, avec un rapport de correspondance.

### 2.3 Dates imprécises

Exemples : jour connu (`1956-08-20`), mois connu (`1956-08`), année connue (`1956`), intervalle approximatif, date disputée. Modéliser `earliest`, `latest`, `precision` (`day|month|year|range|unknown`), `certainty` (`documented|approximate|disputed|unknown`), `calendar` et références. Ne jamais transformer `1956` en `1956-01-01` sans conserver le niveau de précision. Pour les filtres, documenter si une plage est sélectionnée par chevauchement ou inclusion complète.

### 2.4 Géographie et incertitude

- Stocker longitude/latitude en WGS84, ordre `[longitude, latitude]` pour GeoJSON ; valider les bornes.
- Autoriser `Point`, `MultiPoint`, `Polygon`, `MultiPolygon` ou `null` si localisation non résolue, selon cas réel et validation.
- `geometry_role`: `exact_site`, `approximate_site`, `regional_centroid`, `representative_point`, `multi_site`.
- `accuracy_m` ou `uncertainty_radius_m` facultatif et sourcé ; ne pas inventer de précision numérique.
- Pour une opération multi-sites, ne pas faire passer un point représentatif pour le lieu unique de l'opération.
- Permettre plusieurs localisations avec leur source et leur statut de désaccord.
- Afficher une légende d'incertitude dans l'interface et les propriétés GeoJSON.
- Éviter la publication de géométries non justifiées ; `geometry:null` est acceptable.

### 2.5 Territoires historiques

- Séparer **territoire historique**, **région géographique** et **département/wilaya administratif actuel**.
- Unité territoriale : `id`, noms FR/AR, type, `valid_from`, `valid_to`, sources, éventuellement géométrie historique validée.
- Une opération peut appartenir à plusieurs unités (`territorial_assignments[]`) avec rôle (`primary`, `secondary`, `cross_territorial`, `uncertain`) et preuve.
- Conserver les 10 catégories publiques actuelles pour compatibilité ; documenter leur statut de **classification éditoriale**, qui ne signifie pas que toutes sont des wilayas équivalentes à une date donnée.
- Ne pas déduire automatiquement une attribution certaine par regex ; l'ancienne fonction devient uniquement une aide de migration avec résultat `needs_review`.

### 2.6 Sources et citations

Source : `source_id`, titre, auteur/organisme, date de publication, type documentaire, langue, URL, identifiant externe (ISBN/DOI/cote), date de consultation, éditeur/dépôt, droits, notes, disponibilité et éventuelle copie archivable licite. Une URL seule n'est pas une citation suffisante si la page est longue : autoriser page, chapitre, paragraphe, citation courte et localisation du passage. Ne pas copier intégralement des documents protégés.

Créer des **claims** reliant une affirmation précise (`subject`, `predicate`, `value`) à ses `evidence[]` et à son statut (`supported`, `contested`, `unverified`, `withdrawn`). Les contradictions coexistent ; elles ne sont pas écrasées par une valeur unique.

### 2.7 Entités historiques

Créer `persons`, `organizations`, `places` et `territorial-units` comme référentiels réutilisables. Pour chaque nom, conserver `label`, langue, script, variantes orthographiques, translittérations, période d'usage, références. Prévoir des relations `same_as_candidate` non confirmées et `same_as` approuvées. Ne pas inférer identité ou rôle à partir d'une simple similarité de noms.

---

## 3. Migration initiale et non-régression

### MIG-01 — Inventaire et sauvegarde

Avant modification, calculer SHA-256 des quatre fichiers JSON/GeoJSON publics, exporter la liste des 263 IDs, compter les fiches, conserver un snapshot immuable dans une release/branche de sauvegarde et enregistrer le commit source. Ne jamais modifier l'historique Git existant.

### MIG-02 — Import réversible

Créer `scripts/migrate-legacy` : importer `dataset_metadata` et chaque entrée `operations` vers le schéma canonique ; conserver le document source brut ou un champ de correspondance exhaustif ; produire `migration-report.json` avec champs convertis, pertes éventuelles, alertes et erreurs. **Critère : aucune perte silencieuse**. L'import doit être idempotent.

### MIG-03 — Réconciliation

Comparer ancien/nouveau : 263 IDs présents, titres, dates, sources, coordonnées, descriptions, bilans ; les transformations sémantiques nécessitant interprétation passent en revue humaine. Définir fixtures représentatives : opération multiterritoriale, date imprécise, sources multiples, nom arabe, lieu ambigu.

### MIG-04 — Génération des anciens exports

À partir du nouveau canon, produire exactement les chemins legacy attendus ; vérifier la forme de la réponse de `/api/v1/operations`, `/api/v1/operations/:id`, `/api/v1/stats`, `/api/v1/wilayas` et les paramètres existants. Si une évolution de valeur est nécessaire, la signaler explicitement et la tester. Ne pas promettre une égalité octet pour octet lorsque la correction d'un bug modifie légitimement le contenu ; imposer une compatibilité contractuelle.

### MIG-05 — Garde-fous

CI bloquante si un ID existant disparaît sans tombstone approuvé, si un champ sourcé est effacé sans justification, si des exports divergent, si une référence est cassée, ou si la migration n'est pas reproductible.

---

## 4. Cycle de contribution et revue scientifique

### 4.1 Parcours public sans compte ALNOP

- Bouton « Proposer une opération » ; formulaire mobile FR/AR accessible.
- Formulaire « Corriger une fiche », « Ajouter une source », « Signaler un doublon », « Signaler une contradiction », « Proposer un toponyme ».
- Champs obligatoires minimaux : type de contribution, description, au moins une référence **ou** justification explicite de l'absence de source (qui empêche la publication directe), acceptation de la politique de contribution.
- Afficher un récapitulatif avant envoi et prévenir de la visibilité publique des contributions GitHub.
- Ne pas exiger d'adresse email, téléphone, identité civile ou données personnelles non nécessaires.

**MVP recommandé :** formulaires statiques préremplissant des URLs GitHub Issues (`issue templates`) et instructions pour PR ; pas de jeton GitHub exposé au navigateur. Pour les utilisateurs sans GitHub, proposer téléchargement d'un fichier de proposition JSON/Markdown à transmettre aux mainteneurs ; ne pas prétendre fournir un dépôt anonyme côté serveur si aucun backend n'existe.

### 4.2 États et transitions

`proposed -> under_review -> published` ; alternatives `needs_information`, `rejected`, `disputed`, `withdrawn`, `superseded`. Définir une table de transitions autorisées et permissions. `disputed` est un état scientifique éditorial, non une condamnation d'une source. Les brouillons non validés ne figurent pas dans les statistiques publiées par défaut.

### 4.3 Règles de revue

- Au moins un mainteneur habilité approuve la structure et la provenance avant merge.
- Les changements substantiels d'interprétation historique exigent une justification dans la PR et, lorsque possible, une deuxième revue indépendante ; rendre le seuil configurable et documenté.
- Les conflits documentaires sont enregistrés et présentés, non supprimés par vote.
- Chaque décision est liée à l'issue/PR/commit ; distinguer `submitted_by`, `reviewed_by` et `published_by` quand disponibles.
- Maintenir une procédure d'appel/réexamen, un code de conduite et une politique de corrections publiques.
- Interdire le scraping non autorisé et les uploads de documents protégés sans droits.

### 4.4 Modèles GitHub

Créer `ISSUE_TEMPLATE/new-operation.yml`, `correction.yml`, `new-source.yml`, `duplicate.yml`, `historical-dispute.yml`, `place-name.yml`, `config.yml`, `PULL_REQUEST_TEMPLATE.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CODEOWNERS` si approprié. Les formulaires doivent inclure champs structurés, liens de sources, niveau d'incertitude et checklist anti-invention. Décrire clairement le passage d'une Issue à une PR canonique.

---

## 5. Algorithmes d'assistance à l'enrichissement

### ALG-01 — Détection de doublons (P0)

**Entrée :** proposition + corpus publié et en revue. **Étapes :** normalisation Unicode, casse, diacritiques FR/AR, translittérations documentées, tokens, dates en intervalles, proximité spatiale conditionnelle, alias de lieux, typologies. **Candidats :** recherche lexicale/BM25 ou trigrammes, puis score explicable par dimensions. **Sortie :** liste de correspondances possibles avec facteurs explicatifs et liens ; aucun merge automatique.

Ne pas appliquer un seuil universel comme vérité. Prévoir tests sur doublons connus, opérations distinctes le même jour et au même endroit, opérations simultanées multiterritoriales, noms homonymes. Mesurer précision/rappel sur un petit jeu annoté, publié avec le code (hors données personnelles).

### ALG-02 — Entity resolution (P1)

Normaliser les variantes FR/AR, graphies, translittérations et toponymes coloniaux ; proposer `candidate_match` avec explication et sources. Seule la revue humaine transforme une suggestion en relation `same_as`. Gérer la séparation d'entités fusionnées à tort.

### ALG-03 — Détection de contradictions (P1)

Comparer des assertions **portant sur le même sujet, prédicat et contexte** : dates, localisation, noms, bilans, rôles. Produire `conflict_candidate`, références et valeurs divergentes. Ne pas qualifier automatiquement une source de mensongère. Distinguer contradiction, précision différente et complémentarité.

### ALG-04 — Contrôles qualité (P0)

Détecter : schéma invalide, ID dupliqué, source référencée absente, géométrie hors bornes, date inversée, anachronisme potentiel, valeur inconnue déguisée en valeur exacte, catégorie non référencée, lien interne brisé, assertion sans source. Produire un rapport JSON lisible machine et un rapport Markdown lisible humain ; séparer erreurs bloquantes et avertissements.

### ALG-05 — Indexation incrémentale (P1)

Générer un index statique à partir des fiches publiées ; reconstruire uniquement les partitions modifiées si la complexité le justifie. Fournir une commande de reconstruction totale de référence et vérifier que les deux méthodes produisent les mêmes résultats. Pour 263 fiches, privilégier d'abord la simplicité et le rebuild complet déterministe.

### ALG-06 — Indicateurs de lacunes documentaires (P1)

Calculer par période/territoire/type : nombre de fiches publiées, sources, fiches sans source primaire identifiée, incertitudes, conflits ouverts, contributions en attente, couverture des champs. **Ne jamais calculer un « taux de couverture de la guerre » sans dénominateur historiquement justifié.** Afficher « couverture du corpus ALNOP » et non « intensité réelle des opérations ».

### ALG-07 — Analyses spatio-temporelles (P2)

Ajouter agrégations mensuelles/annuelles, filtres de précision, comparaisons entre territoires, visualisations H3/KDE en option. Les algorithmes de densité doivent afficher effectifs, paramètres, biais d'échantillonnage et avertissements. Ne pas utiliser de points représentatifs régionaux comme coordonnées exactes ; permettre l'exclusion des localisations approximatives. Tests sur petits jeux synthétiques à résultats attendus.

### ALG-08 — Recherche multilingue (P2)

Recherche FR/AR, normalisation diacritiques, synonymes contrôlés, recherche exacte et floue, classement explicable. BM25 ou recherche lexicale locale en premier ; embeddings facultatifs et désactivables, avec modèle/licence/documentation, jamais dépendance à une API payante obligatoire.

### ALG-09 — Graphe historique (P3)

Relations sourcées entre opérations, lieux, acteurs, unités, sources ; provenance par arête. Parcours de graphe et exports RDF/JSON-LD en option. Ne jamais transformer une cooccurrence en relation causale.

---

## 6. API REST v2 et compatibilité v1

### 6.1 Principes

- Préserver `/api/v1/*` ; écrire des tests de contrat sur ses réponses et erreurs.
- Introduire `/api/v2/*` pour les nouvelles ressources et schémas, avec pagination cohérente et `meta` documenté.
- Lecture publique sans clé ; mutations **interdites** par API publique dans le MVP. Contributions via GitHub.
- Réponses JSON UTF-8 ; erreurs structurées `{error:{code,message,details?}}` sans stack trace ni secrets.
- `Cache-Control`, `ETag`/hash de release, CORS explicite, limites de pagination et taille de réponse.
- Versionner OpenAPI 3.1 et générer des exemples exécutables ; tests de conformité OpenAPI.

### 6.2 Endpoints minimaux proposés

| Méthode | Route | Fonction |
|---|---|---|
| GET | `/api/v2/operations` | Recherche, filtres, pagination, tri |
| GET | `/api/v2/operations/:id` | Fiche canonique et provenance |
| GET | `/api/v2/sources` | Sources filtrables |
| GET | `/api/v2/sources/:id` | Notice bibliographique |
| GET | `/api/v2/places` | Gazetteer |
| GET | `/api/v2/places/:id` | Toponyme et variantes |
| GET | `/api/v2/persons` | Entités personnes |
| GET | `/api/v2/organizations` | Entités organisations |
| GET | `/api/v2/territorial-units` | Territoires historiques datés |
| GET | `/api/v2/claims` | Assertions sourcées |
| GET | `/api/v2/operations/:id/evidence` | Preuves et contradictions |
| GET | `/api/v2/stats` | Agrégations du corpus |
| GET | `/api/v2/coverage` | Lacunes et qualité documentaire |
| GET | `/api/v2/releases` | Versions publiées |
| GET | `/api/v2/releases/current` | Version/hash actifs |
| GET | `/api/v2/exports` | Formats et liens d'exports |
| GET | `/api/v2/openapi.json` | Contrat OpenAPI |

Routes optionnelles P2/P3 : `/search`, `/related`, `/graph`, `/analytics/spatial`, `/analytics/temporal` ; ne pas les livrer vides ou trompeuses.

### 6.3 Filtres et sémantique

- `q`, `from`, `to`, `date_precision`, `territory`, `territory_role`, `type`, `source_id`, `status`, `has_geometry`, `min_sources`, `bbox`, `sort`, `page`, `limit`, `format`.
- Documenter `AND` entre familles de filtres, `OR` au sein d'une liste, et comportement des valeurs inconnues.
- `status=published` par défaut ; accès public aux contestations uniquement selon politique éditoriale.
- Pagination stable avec tri déterministe et identifiant secondaire ; `limit` plafonné, `page` validé ; `400` sur syntaxe invalide, `404` sur ressource absente, `200` + tableau vide pour filtre valide sans résultat.
- `format=geojson` : FeatureCollection RFC 7946, propriétés d'incertitude, exclusion documentée des géométries nulles ou Features à géométrie null selon contrat ; pagination explicitement appliquée ou endpoint d'export distinct.
- BBOX antimeridien, validation des coordonnées et restrictions de taille : tester les cas limites.
- Pas de données personnelles non nécessaires dans les sorties.

### 6.4 Exemple indicatif de réponse

```json
{
  "data": [{"id": "OP_1954_001", "editorial_status": "published"}],
  "meta": {
    "dataset_release": "2026.11",
    "total": 263,
    "page": 1,
    "limit": 20,
    "has_next": true,
    "corpus_is_incomplete": true
  }
}
```

Exemple contractuel illustratif, pas une réponse actuellement garantie. `total` est le nombre de fiches répondant au filtre, non le nombre réel d'opérations historiques.

---

## 7. Interface utilisateur et expérience scientifique

### UI-01 — Préserver l'atlas

Garder carte de l'Algérie complète, filtres par wilayas historiques, fiches, navigation mobile et ordinateur, liens de sources ouvrables séparément. Ne pas dégrader le site existant. Afficher un avertissement permanent mais discret : « Corpus documentaire en cours d'enrichissement ; la carte n'est pas exhaustive. »

### UI-02 — Fiche historique enrichie

Afficher titre, dates avec précision, lieux et degré de précision, territoires multiples, acteurs, description, sources avec pages/URLs, contradictions, statut éditorial, date de mise à jour, version de publication et lien « Proposer une correction ». Distinguer visuellement les informations documentées, approximatives et contestées sans score de vérité simpliste.

### UI-03 — Contributions

Ajouter entrée claire « Contribuer », parcours de sélection, formulaires GitHub et modèle téléchargeable sans compte, consignes de citation, état des propositions via GitHub. Aucune confirmation « contribution enregistrée » si l'utilisateur n'a pas effectivement créé l'Issue/PR.

### UI-04 — Observatoire des lacunes

Tableaux par année/territoire/type : fiches présentes, qualité des métadonnées, sources, propositions en attente. Filtres et exports. Les zones vides doivent porter la mention « aucune fiche actuellement recensée » et non « aucune opération ».

### UI-05 — Comparaison scientifique

Comparer deux périodes/territoires avec effectifs et incertitudes, légendes de méthodologie et export des paramètres de requête ; ne pas faire de classement historique sans mise en garde.

### UI-06 — Internationalisation et accessibilité

FR/AR, RTL réel pour arabe, UTF-8, prise en charge des diacritiques, contrastes WCAG 2.2 AA visés, navigation clavier, labels de formulaire, annonces d'erreurs, tableaux accessibles, taille tactile, performance sur Android et réseaux modestes. Conserver la structure i18n actuelle et éviter les chaînes codées en dur.

---

## 8. Publications, licences, reproductibilité

### REL-01 — Version de corpus

Publier des versions de données distinctes des versions logicielles, par exemple `data-2026.11` ; chaque release possède date UTC, commit SHA, schema version, nombre de fiches, checksum SHA-256 des exports, changelog et avertissement de non-exhaustivité. Ne pas promettre un DOI automatiquement : documenter le processus Zenodo si le mainteneur l'active.

### REL-02 — Exports

Générer JSON canonique, JSON legacy, GeoJSON, CSV UTF-8 et manifeste `dataset-manifest.json` ; ordre stable, encodage stable, formats documentés, tests de parité. Ajouter métadonnées de provenance et précision dans les nouveaux formats sans casser les anciens.

### REL-03 — Licences

Auditer la licence logicielle existante et définir explicitement la licence **des données**, des textes, des photographies et des documents importés. Ne pas supposer que tous les documents sources sont redistribuables. Prévoir attribution et conditions de contribution compatibles. Aucun changement de licence sans validation du responsable.

### REL-04 — Citation scientifique

Créer `CITATION.cff`, texte de citation recommandé et identifiant de release. Inclure le commit/release dans les exports et notebooks. Documenter comment reproduire un graphique ou une sélection d'opérations.

---

## 9. Sécurité, confidentialité et gouvernance

- API de lecture seulement ; aucun endpoint d'écriture non authentifié.
- Ne jamais stocker de jeton GitHub dans `docs/`, JavaScript client ou fichiers publics.
- GitHub Actions : permissions minimales, PR forks non privilégiées, pas de `pull_request_target` exécutant du code non fiable.
- Échapper/sanitiser les textes dans l'interface pour prévenir XSS ; valider toutes les URLs et paramètres.
- Protéger contre traversée de chemin, injections dans filtres, requêtes trop coûteuses et réponses trop volumineuses.
- Pas de stack traces en production ; logs sans secrets et sans données personnelles inutiles.
- Contributions publiques : informer sur visibilité du pseudonyme GitHub et permanence possible de l'historique.
- `SECURITY.md` : divulgation responsable, politique de mise à jour des dépendances, procédure de retrait légalement justifié.
- Séparer révocation d'une fiche publique, correction de ses assertions et retrait de contenu illicite ; conserver une trace non sensible de la décision.

---

## 10. CI/CD et assurance qualité

### 10.1 Workflows

1. `validate-data.yml` : schémas, références, IDs, dates, géométries, cohérence, format.
2. `test-api.yml` : unitaires, contrat v1, contrat v2, cas limites, erreurs.
3. `build-artifacts.yml` : génération et comparaison déterministe des exports, docs et index.
4. `quality-report.yml` : rapport de qualité, doublons candidats, contradictions, couverture ; pas de merge automatique.
5. `release-data.yml` : publication sur tag/validation, manifestes, checksums, notes de version.
6. `deploy.yml` : publication après validations, contrôles de smoke test ; conserver les workflows existants ou les adapter sans conflit.

### 10.2 Matrice de tests d'acceptation

| ID | Scénario | Attendu |
|---|---|---|
| T01 | Import du corpus initial | 263 fiches, 263 IDs historiques conservés |
| T02 | Import répété | Aucun doublon, résultat identique |
| T03 | Export puis réimport | Aucune perte de champs sourcés |
| T04 | Ajout d'une fiche valide | 264 fiches après revue/merge, exports et stats mis à jour |
| T05 | Fiche invalide | CI échoue avec diagnostic exploitable |
| T06 | ID déjà présent | Refus de publication |
| T07 | Date `1956` seulement | Précision `year` préservée |
| T08 | Localisation inconnue | Pas de point cartographique fictif |
| T09 | Opération multiterritoriale | Plusieurs territoires affichés, aucun écrasement |
| T10 | Sources divergentes | Deux assertions et conflit visible |
| T11 | Doublon probable | Alerte, aucune fusion automatique |
| T12 | Correction de toponyme | Alias et ancienne graphie conservés |
| T13 | GET v1 existants | Contrats et URLs préservés |
| T14 | GET v2 ressource absente | 404 structuré |
| T15 | Filtre sans résultat | 200 et liste vide |
| T16 | Pagination invalide | 400 documenté |
| T17 | GeoJSON | Conforme RFC 7946, coordonnées dans le bon ordre |
| T18 | Rebuild identique | Hashes identiques à environnement équivalent |
| T19 | PR non validée | Aucune donnée non revue dans le site public |
| T20 | FR/AR mobile | Navigation, RTL, formulaires utilisables |
| T21 | Source supprimée | Référence orpheline signalée |
| T22 | Release | Manifestes, hashes, changelog présents |
| T23 | Aucune fiche sur une période | Interface indique lacune documentaire, pas absence historique |
| T24 | Données malveillantes | Pas de XSS ni de fuite de secrets |
| T25 | API déployée | Smoke tests GET sur Vercel, sans dépendre des tests locaux |

### 10.3 Performance et SLO cibles

- Fixer une référence mesurée sur le site existant avant optimisation.
- À 263, 1 000 et 10 000 fiches synthétiques, mesurer temps de build, poids des exports, recherche et rendu de la carte ; fournir benchmarks reproductibles.
- Objectifs indicatifs à confirmer : p95 API de lecture inférieur à 500 ms sur données en cache dans une région stable ; page initiale utilisable sur mobile moyen ; génération complète du corpus en moins de 2 minutes à 10 000 fiches sur CI standard.
- Ces seuils sont des **cibles d'ingénierie**, pas des performances actuellement observées. Documenter les limites et stratégies de pagination/chargement différé.

---

## 11. Phasage obligatoire de l'implémentation

### Phase 0 — Diagnostic et gel des contrats (P0)

**Livrables :** inventaire du dépôt, audit de compatibilité, sauvegarde/checksums, tests v1 de référence, plan de migration, liste de dépendances. **Gate :** aucun changement destructif ; validation explicite des choix de schéma et licences avant migration irréversible.

### Phase 1 — Fondation canonique (P0)

**Livrables :** JSON Schemas, répertoires canoniques, migration idempotente, validateurs, référentiels initiaux, exports générés, tests T01–T09/T13/T17/T18. **Gate :** 263 fiches préservées et API v1 fonctionnelle.

### Phase 2 — Contribution et gouvernance (P0/P1)

**Livrables :** modèles Issues/PR, guides, politique éditoriale, formulaire web, revue, statuts, CI de contributions, tests T10/T11/T19/T20/T24. **Gate :** proposition de test soumise, revue et publiée sans contournement.

### Phase 3 — API v2 et provenance (P1)

**Livrables :** API v2, OpenAPI, sources/claims/territoires, erreurs et pagination, preuves dans les fiches, tests de contrat et smoke tests. **Gate :** API v1 inchangée contractuellement, v2 documentée.

### Phase 4 — Research Gaps et moteur d'assistance (P1)

**Livrables :** contrôles de couverture, doublons candidats, rapprochement de noms, contradictions, tableaux de bord et rapports. **Gate :** faux positifs identifiables, aucun arbitrage historique automatique.

### Phase 5 — Analytics, recherche et graphe (P2/P3)

**Livrables :** comparateur temporel, recherche FR/AR améliorée, analyses spatiales avec incertitude, graphe sourcé si qualité des données suffisante. **Gate :** résultats reproductibles et avertissements méthodologiques visibles.

**Instruction de cadence :** ne pas réaliser toutes les phases en un seul commit ni masquer les échecs. Après chaque phase : exécuter tests, publier bilan, liste de fichiers modifiés, captures si interface modifiée, risques résiduels et décisions à arbitrer. Si une phase dépend d'un choix scientifique non tranché, implémenter la structure sans inventer les valeurs.

---

## 12. Définition de « terminé » (Definition of Done)

Une fonctionnalité n'est terminée que si : code présent ; tests verts ; schéma et documentation à jour ; compatibilité v1 vérifiée ; exemples FR/AR ; traitement des erreurs ; accessibilité raisonnable ; aucun fait historique inventé ; provenance affichée ; données générées reproductibles ; limites méthodologiques explicites ; validation humaine pour les changements historiques ; CI et déploiement contrôlés ; aucune dépendance propriétaire obligatoire.

**Critères de réception globale :**

- Le corpus initial est préservé, avec 263 IDs retrouvables.
- Ajouter une 264e fiche **fictive de test dans une fixture**, puis une contribution réelle après revue, fonctionne de bout en bout.
- Une source contradictoire ne remplace pas silencieusement une assertion précédente.
- La carte et les statistiques se mettent à jour depuis le corpus canonique.
- Les chercheurs peuvent télécharger une release précise et la citer.
- L'API v1 demeure utilisable ; la v2 expose les nouvelles métadonnées.
- La documentation dit explicitement que la base est non exhaustive et en enrichissement continu.
- Les résultats de tests et limitations non résolues sont publiés honnêtement.

---

## 13. Décisions à soumettre au mainteneur (ne pas supposer)

1. Licence des données : CC BY 4.0, CC0, ODbL ou autre selon droits et objectifs ; conserver licence actuelle tant que non validée.
2. Politique de revue : un ou deux validateurs pour changements historiques substantiels.
3. Traitement public des fiches `disputed` : visibles avec avertissement ou accessibles dans un espace dédié.
4. Langues de rédaction obligatoires ou facultatives pour chaque fiche ; ne pas traduire automatiquement sans signalement.
5. Règles de publication de documents tiers et de témoignages potentiellement sensibles.
6. Niveau de détail autorisé pour les frontières historiques et la précision cartographique.
7. Périmètre chronologique : 1954–1962 strict pour les opérations, ou événements de contexte hors période dans un référentiel distinct.
8. Convention de nouveaux identifiants et politique de fusion/scission.

Par défaut, l'implémentation technique doit retenir les options **réversibles, conservatrices, libres et sans suppression**, puis consigner les questions dans `docs/DECISIONS_PENDING.md` plutôt que bloquer les fondations techniques.

---

## 14. Cadre d'exécution et directives d'implémentation

> Le responsable technique assure la conformité du projet académique open source ALNOP. Implémenter le cahier des charges par phases, en préservant scrupuleusement les 263 fiches et tous leurs identifiants ; ne jamais modifier une donnée historique par supposition. Conserver l'API REST v1 et le site existant. Faire du dépôt Git la source de vérité et générer les exports de façon déterministe. Ajouter les schémas, validations, tests et CI. Présenter pour chaque phase les résultats des tests et les décisions scientifiques nécessaires.

---

## 15. Annexe — Exemples de fixtures de test (NON historiques)

Les exemples ci-dessous sont **synthétiques** et doivent rester dans `tests/fixtures/`, jamais dans le corpus publié.

```json
{
  "id": "TEST_SYNTHETIC_001",
  "schema_version": "2.0.0",
  "title": {"fr": "Événement fictif de validation", "ar": null},
  "start_date": {"earliest": "1956-01-01", "latest": "1956-12-31", "precision": "year", "certainty": "approximate"},
  "locations": [{"geometry": null, "geometry_role": "unknown"}],
  "territorial_assignments": [
    {"territory_id": "W1", "role": "secondary"},
    {"territory_id": "W3", "role": "secondary"}
  ],
  "source_ids": [],
  "editorial_status": "proposed",
  "quality_flags": ["missing_source", "uncertain_location"]
}
```

Ce document spécifie les résultats attendus ; les noms exacts des modules et types internes peuvent être ajustés après inspection du code, à condition de préserver les contrats publics et d'expliquer les écarts dans un journal de décisions architecturales (`docs/ADR/`).
