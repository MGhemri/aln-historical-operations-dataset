# ALNOP — Journal des Modifications et Résultats de Recette

**Dépôt :** https://github.com/MGhemri/aln-historical-operations-dataset  
**Branche :** `fix/alnop-api-audit-v1`  
**Date :** 4 novembre 2026  
**Responsable technique :** Antigravity (Google DeepMind pair-programming agent)  
**Référence d'audit :** `AUDIT_ALNOP_V1_ANTIGRAVITY.md`  
**Cahier des charges :** `CDC_ALNOP_PLATEFORME_SCIENTIFIQUE_EVOLUTIVE_ANTIGRAVITY.md`  

---

## 1. Synthèse de la Phase A (Bloquants Immédiats)

Tous les objectifs de la **Phase A** ont été diagnostiqués, reproduits avant correction, corrigés de manière minimale et validés par une suite de tests automatisés.

| Réf. Anomalie | Gravité | Statut | Correction & Preuve |
| :--- | :--- | :--- | :--- |
| **ALNOP-001** | P0/P1 | **RÉSOLU** | Remplacement de la variable non déclarée `targetId` par `rawId` dans `api/v1/operations.js:65`. Les deux routes d'accès par ID (`/operations?id=...` et `/operations/:id`) retournent désormais HTTP 200 avec enveloppe conforme. |
| **ALNOP-002** | P1 | **RÉSOLU** | Correction de `package.json` : `"test": "npm run test:api && npm run test:data"`. Création de `tests/run-validation.js` pour une exécution multi-plateforme transparente de `validate_dataset.py` (détection `python3`/`python`/`py`). |
| **ALNOP-003** | P1 | **RÉSOLU** | Mise à niveau de `.github/workflows/validate-dataset.yml` : ajout d'un environnement Node.js 20, installation des dépendances et exécution de la suite de tests d'API (`npm run test:api`) avant la validation Python. |

---

## 2. Preuves de Reproduction et de Non-Régression

### 2.1 Reproduction d'ALNOP-001 (Avant correction)
Appel local de `api/v1/operations.js` avec `{ method: 'GET', query: { id: 'OP_1954_001' } }` :
```
API Operations error: ReferenceError: targetId is not defined
    at module.exports (api/v1/operations.js:65:22)
Response: 500 {
  status: 'error',
  error: 'Internal Server Error',
  message: 'targetId is not defined'
}
```
*Le test automatisé dans `tests/api.test.js` a d'abord échoué (RED) avec `500 !== 200`.*

### 2.2 Validation après correction (Après correction)
Exécution de `npm test` :
```
> aln-historical-operations-dataset@1.0.0 test
> npm run test:api && npm run test:data

> aln-historical-operations-dataset@1.0.0 test:api
> node --test tests/*.test.js

▶ ALNOP API v1 — Regression & Contract Test Suite
  ▶ ALNOP-001 Regression: Single operation via query param (?id=)
    ✔ GET /api/v1/operations?id=OP_1954_001 returns 200 and valid operation object (not 500) (7.3483ms)
    ✔ GET /api/v1/operations?id=UNKNOWN_ID returns 404 Not Found (0.3459ms)
    ✔ GET /api/v1/operations?id=aln-1954-001 handles aliases/normalization smoothly (0.2421ms)
    ✔ GET /api/v1/operations/:id via direct handler returns 200 and matches query route (0.2622ms)
    ✔ GET /api/v1/operations/:id with missing ID returns 400 Bad Request (0.139ms)
  ✔ ALNOP-001 Regression: Single operation via query param (?id=) (9.1621ms)
  ▶ Operations Collection & Filtering
    ✔ GET /api/v1/operations returns full collection with default pagination (8.2085ms)
    ✔ GET /api/v1/operations?year=1954 filters accurately (0.3473ms)
    ✔ GET /api/v1/operations?format=geojson returns GeoJSON FeatureCollection (1.3485ms)
  ✔ Operations Collection & Filtering (10.1181ms)
  ▶ Stats & Wilayas Endpoints
    ✔ GET /api/v1/stats returns computed statistics matching total dataset count (1.1011ms)
    ✔ GET /api/v1/wilayas returns 10 historical wilayas & autonomous zones (0.7777ms)
  ✔ Stats & Wilayas Endpoints (2.1395ms)
  ▶ HTTP Protocol & Methods
    ✔ OPTIONS request returns 204 No Content with CORS headers (0.1718ms)
    ✔ POST request returns 405 Method Not Allowed (0.1997ms)
  ✔ HTTP Protocol & Methods (0.489ms)
✔ ALNOP API v1 — Regression & Contract Test Suite (22.5479ms)
ℹ tests 12
ℹ suites 5
ℹ pass 12
ℹ fail 0

> aln-historical-operations-dataset@1.0.0 test:data
> node tests/run-validation.js

=== Commencing Dataset Validation Suite ===
--> Validating JSON: operations_fln_1954_1962.json
Success: 263 operations validated successfully in operations_fln_1954_1962.json.
--> Validating GeoJSON: operations_fln_1954_1962.geojson
Success: 263 GeoJSON features validated successfully in operations_fln_1954_1962.geojson.
--> Validating JSON: docs/data/operations_fln_1954_1962.json
Success: 263 operations validated successfully in docs/data/operations_fln_1954_1962.json.
--> Validating GeoJSON: docs/data/operations_fln_1954_1962.geojson
Success: 263 GeoJSON features validated successfully in docs/data/operations_fln_1954_1962.geojson.

ALL CHECKS PASSED: 4/4 files strictly valid with 263 confirmed operations.
```

---

## 3. Intégrité des Données Historiques

- **263 opérations** strictement conservées sans altération.
- Fichiers canoniques `operations_fln_1954_1962.json`, `.geojson`, et leurs copies miroirs dans `docs/data/` sont rigoureusement intacts (aucune modification textuelle ou sémantique).
- Aucune inférence ou interpolation de données n'a été appliquée au corpus.

---

## 4. Plan d'Implémentation des Phases Suivantes

### Phase B — Contrat API, Robustesse & Sécurité
1. **ALNOP-004 & ALNOP-005 :** Harmonisation de la pagination (`limit` / `page`) et spécification explicite du comportement GeoJSON (renvoi filtré complet vs paginé).
2. **ALNOP-006 :** Validation stricte des filtres (`year`, dates inversées `date_from > date_to`).
3. **ALNOP-009 :** Enveloppes d'erreurs 500 sans fuite de stack trace ou de messages d'exception système (`message: 'Une erreur interne est survenue'`).
4. **ALNOP-014 :** Tri déterministe avec bris d'égalité par `id` (`date_debut` puis `id`).
5. **ALNOP-016 :** Spécification OpenAPI 3.0 (`openapi.yaml`).

### Phase C — Intégrité Scientifique & Multi-Affiliations
1. **ALNOP-007 :** Transition progressive de l'heuristique regex exclusive vers le modèle de données `territorial_affiliations[]` et `primary_affiliation` sans modification unilatérale non sourcée.
2. **ALNOP-008 :** Mention explicite de non-exhaustivité dans les métadonnées et statistiques (« opérations documentées dans ce corpus »).
3. **ALNOP-013 :** Script de synchronisation déterministe entre la racine et `docs/data/`.
4. **ALNOP-020 :** Création du registre de révision historique `HISTORICAL_REVIEW_REQUIRED.md`.

### Phase D — Qualification & Validation Vercel
1. Vérification des headers CDN (`Cache-Control`, `s-maxage`, `stale-while-revalidate`).
2. Tests réels sur endpoints déployés avec `curl` et audit CORS en environnement isolé.
