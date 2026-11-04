# Fondation canonique — bilan de l'étape

## Implémenté et vérifié

- 263 fiches dans `data/operations`, notices de sources réutilisables dans `data/sources`, métadonnées et ordre originel dans `data/dataset.json`.
- JSON Schemas Draft 2020-12 et validation Ajv : formes, formats de dates, références, coordonnées, doublons et dates inversées.
- Import idempotent, refus d'écrasement des fichiers modifiés, objet legacy intégral, rapport détaillé de migration.
- Exports de prévisualisation JSON, legacy JSON, GeoJSON, CSV UTF-8, manifeste SHA-256 et rapports qualité JSON/Markdown.
- Vérification automatique des exports dans le workflow existant, installation reproductible par `npm ci`.
- 37 tests réussis ; validation existante des quatre exports publics réussie ; les empreintes et réponses v1 de phase 0 restent identiques.
- Test synthétique en mémoire : 264 fiches dans l'export uniquement après passage explicite de la fixture à `published`. Aucune fixture dans les données publiées.

## Commandes

- `npm ci`
- `npm run migrate:legacy` : import initial ou vérification idempotente ; refuse les écrasements.
- `npm run build:canonical` : reconstruire les prévisualisations depuis `data/`.
- `npm run check:canonical` : détecter les artefacts périmés.
- `npm test` : tests et validation legacy.

## Interprétation des avertissements

Les 789 notices du nouvel import correspondent à trois réserves par fiche : import non revu, territoires non attribués et localisation représentative à revoir. Elles s'ajoutent aux 43 notices scientifiques du validateur existant ; elles ne représentent pas 789 erreurs historiques identifiées. Aucune certitude historique n'est ajoutée par la migration.

## Limites et reste à faire

Cette livraison est une fondation de prévisualisation, pas la clôture de la phase 1 complète. Les exports publics restent inchangés ; les chemins legacy ne sont pas encore générés depuis le nouveau canon. Les schémas d'entités, territoires et assertions restent à compléter après validation des choix scientifiques. Les contributions, API v2 et changements d'interface ne sont pas encore livrés. Pas de déploiement ni de test distant Vercel.

L'installation signale une vulnérabilité élevée dans la dépendance préexistante nodemailer. Les nouvelles dépendances de validation ne sont pas signalées. La correction de nodemailer nécessite une mise à niveau majeure et des vérifications du formulaire de contact ; elle n'est pas appliquée aveuglément dans cette migration.

## Fichiers concernés

`src/canonical.js`, `schemas/*.json`, `scripts/migrate-legacy.js`, `scripts/build-canonical.js`, `tests/canonical.test.js`, `data/**`, `generated/**`, `migrations/migration-report.json`, `package.json`, `package-lock.json`, `.github/workflows/validate-dataset.yml`, `docs/ADR/001-canonical-preview.md`, ce bilan. Les fichiers de phase 0 sont conservés dans un changement distinct.
