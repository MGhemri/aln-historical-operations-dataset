# ALNOP — Journal des Modifications et Résultats de Recette

**Dépôt :** https://github.com/MGhemri/aln-historical-operations-dataset  
**Branche :** `main`  
**Date :** 4 novembre 2026  
**Responsable technique & scientifique :** Ghemri M.  
**Moteur de contrôle et d'audit :** Algorithme de Contrôle et Validation Déterministe ALNOP-Val v1.0  
**Cahier des charges :** [CDC_ALNOP_PLATEFORME_SCIENTIFIQUE_EVOLUTIVE.md](CDC_ALNOP_PLATEFORME_SCIENTIFIQUE_EVOLUTIVE.md)  

---

## 1. Synthèse de la Phase A (Bloquants Immédiats — Mergée sur main via PR #2)

| Réf. Anomalie | Gravité | Statut | Correction & Preuve |
| :--- | :--- | :--- | :--- |
| **ALNOP-001** | P0/P1 | **RÉSOLU** | Remplacement de la variable non déclarée `targetId` par `rawId` dans `api/v1/operations.js:65`. Les deux routes d'accès par ID (`/operations?id=...` et `/operations/:id`) retournent désormais HTTP 200 avec enveloppe conforme. |
| **ALNOP-002** | P1 | **RÉSOLU** | Correction de `package.json` : `"test": "npm run test:api && npm run test:data"`. Création de `tests/run-validation.js` pour une exécution multi-plateforme transparente de `validate_dataset.py` (détection `python3`/`python`/`py`). |
| **ALNOP-003** | P1 | **RÉSOLU** | Mise à niveau de `.github/workflows/validate-dataset.yml` : ajout d'un environnement Node.js 20, installation des dépendances et exécution de la suite de tests d'API (`npm run test:api`) avant la validation Python. |

---

## 2. Synthèse de la Phase B (Contrat d'API, Robustesse & Sécurité — Mergée sur main via PR #3)

| Réf. Anomalie | Gravité | Statut | Correction & Preuve |
| :--- | :--- | :--- | :--- |
| **ALNOP-004** | P2 | **RÉSOLU** | Formalisation du contrat GeoJSON (`format=geojson`) : exporte l'ensemble des entités filtrées sans pagination pour garantir un rendu cartographique complet dans les SIG (Leaflet, QGIS). Métadonnées `pagination: { paginated: false, note: "..." }` explicitées dans la FeatureCollection. |
| **ALNOP-005** | P2 | **RÉSOLU** | Validation stricte des paramètres de pagination dans `api/v1/validator.js` : `limit` (entier de 1 à 300) et `page` (entier >= 1). Les valeurs malformées (`limit=abc`, `limit=-1`, `page=0`) renvoient désormais HTTP `400 Bad Request` au lieu d'un repli silencieux. |
| **ALNOP-006** | P2 | **RÉSOLU** | Validation stricte des filtres : rejet des années invalides (`year=abc`), des plages chronologiques inversées (`date_from > date_to`), des formats inconnus (`format=xml`) et des tris invalides avec `HTTP 400 Bad Request`. |
| **ALNOP-009** | P2 | **RÉSOLU** | Assainissement des erreurs 500 dans tous les endpoints (`operations.js`, `operations/[id].js`, `stats.js`, `wilayas.js`) : message d'erreur générique standardisé sans divulgation de détails système ou stack traces. |
| **ALNOP-014** | P2 | **RÉSOLU** | Tri déterministe dans `api/v1/data-service.js` : ajout de l'identifiant unique canonique (`op.id`) en bris d'égalité lors du tri chronologique (`date_asc` ou `date_desc`). Zéro doublon ni saut d'enregistrement entre les pages successives (vérifié par test unitaire). |
| **ALNOP-015** | P3 | **RÉSOLU** | Normalisation multilingue et arabe étendue dans `normalizeString` : suppression des diacritiques arabes (Tashkeel: Fatha, Damma, Kasra, Sukun, Tanwin), du Tatweel (`ـ`), normalisation des variantes d'Alef (إ, أ, آ, ٱ -> ا), de Ta Marbuta (ة -> ه) et de Ya (ى -> ي). Recherche plein texte étendue aux titres de sources académiques arabes et labels wilayas. |
| **ALNOP-016** | P3 | **RÉSOLU** | Création de la spécification OpenAPI 3.0 officielle `openapi.yaml` couvrant tous les endpoints, paramètres, formats GeoJSON/JSON, codes 200/400/404/405/500 et schémas d'enveloppe. Documentation `API.md` alignée. |

---

## 3. Synthèse de la Phase C (Intégrité Scientifique, Multi-Affiliations & Traçabilité — Mergée sur main via PR #4)

| Réf. Anomalie | Gravité | Statut | Correction & Preuve |
| :--- | :--- | :--- | :--- |
| **ALNOP-007** | P2 | **RÉSOLU** | Conception du modèle de multi-affiliations territoriales : ajout de `primary_affiliation` et `territorial_affiliations[]` dans les données enrichies et le GeoJSON, détectant les actions conjointes et zones inter-wilayas sans modifier l'affectation historique primaire d'origine. |
| **ALNOP-008** | P2 | **RÉSOLU** | Mention explicite de non-exhaustivité et de portée documentaire (`coverage_note`) intégrée dans toutes les métadonnées de réponse API et dans le endpoint `/stats`. Version du jeu de données formalisée à `1.0.0`. |
| **ALNOP-012** | P2 | **RÉSOLU** | Extension de `validate_dataset.py` : contrôle de validité calendaire réelle (années bissextiles, jours réels par mois), validation des bornes de coordonnées GPS, concordance stricte des identifiants entre JSON et GeoJSON, et journalisation de 43 avertissements de qualité scientifique sans faux-positif bloquant. |
| **ALNOP-013** | P2 | **RÉSOLU** | Création du script de synchronisation déterministe `scripts/sync-dataset.js` et script npm `"build:data"`. Génération reproductible de GeoJSON RFC 7946 et vérification de la stricte parité sémantique avec `docs/data/`. |
| **ALNOP-020** | Audit Hist. | **RÉSOLU** | Création du registre formel `HISTORICAL_REVIEW_REQUIRED.md` répertoriant les 26 opérations inter-wilayas, les spécificités de résolution géospatiale et le protocole de validation humaine par des historiens universitaires. **Aucun fait historique n'a été altéré unilatéralement.** |

---

## 4. Résultats des Suites de Tests Automatisées

### 4.1 Tests de Contrat & Régression (`npm run test:api`)
- **29 tests automatisés exécutés** via `node:test`.
- **29/29 réussis (100% PASS)** en ~134ms.
- Couverture complète :
  - ALNOP-001 : Régression `targetId`
  - ALNOP-004 : Contrat GeoJSON non paginé pour SIG
  - ALNOP-005 : Validation stricte `limit` et `page` (HTTP 400)
  - ALNOP-006 : Validation stricte `year`, plages inversées, formats (HTTP 400)
  - ALNOP-007 : Exposition des multi-affiliations territoriales (`territorial_affiliations[]`)
  - ALNOP-008 : Présence de `coverage_note` et `dataset_version: 1.0.0`
  - ALNOP-009 : Assainissement des erreurs 500
  - ALNOP-014 : Tri déterministe avec bris d'égalité par `id`
  - ALNOP-015 : Normalisation multilingue et diacritiques arabes
  - Protocoles HTTP : OPTIONS (204) et POST (405)

### 4.2 Fuzzing & Test à l'Aveugle (`npm run test:blind`)
- **51 cas de test exécutés**.
- **50 Clean Passes, 1 Behavioral Notice** (comportement GeoJSON non paginé vérifié et documenté).
- **0 échec critique / crash serveur**.

### 4.3 Intégrité du Corpus (`npm run test:data`)
- **4/4 fichiers strictement valides** (`operations_fln_1954_1962.json`, `.geojson`, `docs/data/*`).
- Concordance 100% vérifiée des identifiants JSON ↔ GeoJSON.
- **263 opérations historiques intactes** (aucune altération, suppression ou falsification).

---

## 5. Synthèse de la Phase D (Qualification & Validation de Production en Direct)

Des vérifications directes en production ont été effectuées sur l'infrastructure Vercel (`https://alnop.vercel.app/api/v1`) :

1. `GET /api/v1/operations?id=OP_1954_001` : **HTTP 200 OK** (régression 500 résolue).
2. `GET /api/v1/operations?limit=abc` : **HTTP 400 Bad Request** (validation stricte active).
3. `GET /api/v1/operations?date_from=1962&date_to=1954` : **HTTP 400 Bad Request** (rejet d'incohérence chronologique).
4. `GET /api/v1/stats` : **HTTP 200 OK** avec `dataset_version: "1.0.0"` et `coverage_note`.
5. `GET /api/v1/wilayas` : **HTTP 200 OK** avec 10 wilayas et comptages cohérents.
6. `OPTIONS /api/v1/operations` : **HTTP 204 No Content** avec en-têtes CORS conformes.
7. `POST /api/v1/operations` : **HTTP 405 Method Not Allowed** avec rejet conforme.
