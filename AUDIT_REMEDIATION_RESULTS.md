# ALNOP — Journal des Modifications et Résultats de Recette

**Dépôt :** https://github.com/MGhemri/aln-historical-operations-dataset  
**Branche actuelle :** `fix/alnop-api-phase-b`  
**Date :** 4 novembre 2026  
**Responsable technique :** Antigravity (Google DeepMind pair-programming agent)  
**Référence d'audit :** `AUDIT_ALNOP_V1_ANTIGRAVITY.md`  
**Cahier des charges :** `CDC_ALNOP_PLATEFORME_SCIENTIFIQUE_EVOLUTIVE_ANTIGRAVITY.md`  

---

## 1. Synthèse de la Phase A (Bloquants Immédiats — Mergée sur main via PR #2)

| Réf. Anomalie | Gravité | Statut | Correction & Preuve |
| :--- | :--- | :--- | :--- |
| **ALNOP-001** | P0/P1 | **RÉSOLU** | Remplacement de la variable non déclarée `targetId` par `rawId` dans `api/v1/operations.js:65`. Les deux routes d'accès par ID (`/operations?id=...` et `/operations/:id`) retournent désormais HTTP 200 avec enveloppe conforme. |
| **ALNOP-002** | P1 | **RÉSOLU** | Correction de `package.json` : `"test": "npm run test:api && npm run test:data"`. Création de `tests/run-validation.js` pour une exécution multi-plateforme transparente de `validate_dataset.py` (détection `python3`/`python`/`py`). |
| **ALNOP-003** | P1 | **RÉSOLU** | Mise à niveau de `.github/workflows/validate-dataset.yml` : ajout d'un environnement Node.js 20, installation des dépendances et exécution de la suite de tests d'API (`npm run test:api`) avant la validation Python. |

---

## 2. Synthèse de la Phase B (Contrat d'API, Robustesse & Sécurité)

| Réf. Anomalie | Gravité | Statut | Correction & Preuve |
| :--- | :--- | :--- | :--- |
| **ALNOP-004** | P2 | **RÉSOLU** | Formalisation du contrat GeoJSON (`format=geojson`) : exporte l'ensemble des entités filtrées sans pagination pour garantir un rendu cartographique complet dans les SIG (Leaflet, QGIS). Métadonnées `pagination: { paginated: false, note: "..." }` explicitées dans la FeatureCollection. |
| **ALNOP-005** | P2 | **RÉSOLU** | Validation stricte des paramètres de pagination dans `api/v1/validator.js` : `limit` (entier de 1 à 300) et `page` (entier >= 1). Les valeurs malformées (`limit=abc`, `limit=-1`, `page=0`) renvoient désormais HTTP `400 Bad Request` au lieu d'un repli silencieux. |
| **ALNOP-006** | P2 | **RÉSOLU** | Validation stricte des filtres : rejet des années invalides (`year=abc`), des plages chronologiques inversées (`date_from > date_to`), des formats inconnus (`format=xml`) et des tris invalides avec `HTTP 400 Bad Request`. |
| **ALNOP-009** | P2 | **RÉSOLU** | Assainissement des erreurs 500 dans tous les endpoints (`operations.js`, `operations/[id].js`, `stats.js`, `wilayas.js`) : message d'erreur générique `Une erreur interne est survenue lors du traitement de la requête.` sans divulgation de détails système ou stack traces. |
| **ALNOP-014** | P2 | **RÉSOLU** | Tri déterministe dans `api/v1/data-service.js` : ajout de l'identifiant unique canonique (`op.id`) en bris d'égalité lors du tri chronologique (`date_asc` ou `date_desc`). Zéro doublon ni saut d'enregistrement entre les pages successives (vérifié par test unitaire). |
| **ALNOP-015** | P3 | **RÉSOLU** | Normalisation multilingue et arabe étendue dans `normalizeString` : suppression des diacritiques arabes (Tashkeel: Fatha, Damma, Kasra, Sukun, Tanwin), du Tatweel (`ـ`), normalisation des variantes d'Alef (إ, أ, آ, ٱ -> ا), de Ta Marbuta (ة -> ه) et de Ya (ى -> ي). Recherche plein texte étendue aux titres de sources académiques arabes et labels wilayas. |
| **ALNOP-016** | P3 | **RÉSOLU** | Création de la spécification OpenAPI 3.0 officielle `openapi.yaml` couvrant tous les endpoints, paramètres, formats GeoJSON/JSON, codes 200/400/404/405/500 et schémas d'enveloppe. Documentation `API.md` alignée. |

---

## 3. Résultats des Suites de Tests Automatisées

### 3.1 Tests de Contrat & Régression (`npm run test:api`)
- **26 tests automatisés exécutés** via `node:test`.
- **26/26 réussis (100% PASS)** en ~118ms.
- Couverture complète :
  - Régression `targetId` (ALNOP-001)
  - Filtres temporels, géographiques et thématiques
  - Rejet HTTP 400 sur `limit=abc`, `limit=-5`, `limit=0`, `limit=500`, `page=0`, `page=-1` (ALNOP-005)
  - Rejet HTTP 400 sur `year=abc`, `date_from > date_to`, `sort=random_sort`, `format=xml` (ALNOP-006)
  - Déterminisme de pagination sans chevauchement d'IDs (ALNOP-014)
  - Recherche arabe vocalisée vs non vocalisée (ALNOP-015)
  - Codes HTTP 204 (OPTIONS) et 405 (POST)

### 3.2 Fuzzing & Test à l'Aveugle (`npm run test:blind`)
- **51 cas de test exécutés**.
- **50 Clean Passes, 1 Behavioral Notice** (comportement GeoJSON non paginé vérifié et documenté).
- **0 échec critique / crash serveur**.

### 3.3 Intégrité du Corpus (`npm run test:data`)
- **4/4 fichiers strictement valides** (`operations_fln_1954_1962.json`, `.geojson`, `docs/data/*`).
- **263 opérations historiques intactes** (aucune altération, suppression ou falsification).

---

## 4. Prochaines Étapes (Phase C & D)

### Phase C — Intégrité Scientifique & Multi-Affiliations
1. **ALNOP-007 :** Transition progressive vers le modèle de données `territorial_affiliations[]` et `primary_affiliation` sans modification unilatérale non sourcée.
2. **ALNOP-008 :** Mention explicite de non-exhaustivité dans les métadonnées et statistiques (« opérations documentées dans ce corpus »).
3. **ALNOP-013 :** Script de synchronisation déterministe entre la racine et `docs/data/`.
4. **ALNOP-020 :** Création du registre de révision historique `HISTORICAL_REVIEW_REQUIRED.md`.

### Phase D — Qualification & Validation Vercel
1. Déploiement en préproduction/production sur Vercel.
2. Vérification des headers CDN (`Cache-Control`, `s-maxage`, `stale-while-revalidate`).
3. Audit en conditions réelles avec navigateurs et logiciels SIG (QGIS).
