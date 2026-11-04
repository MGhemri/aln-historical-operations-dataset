# Phase 0 — Diagnostic ALNOP

Référence inspectée : main, commit 97eef827834a7463e85eed8b5bd5c81e08069420, 4 novembre 2026.

## Résultats vérifiés

- 263 fiches et 263 identifiants uniques ; quatre exports validés.
- `npm test` : 30 tests réussis, aucun échec, dont le nouveau gel de référence.
- Le validateur existant signale 43 fiches pour revue scientifique. Ces notices ne sont pas des corrections autorisées.
- 21 scénarios v1 capturés : réponses, en-têtes et codes HTTP, avec empreintes SHA-256. Seuls les horodatages volatils des enveloppes sont exclus.
- Les empreintes des quatre fichiers de données et la liste des identifiants sont conservées dans `tests/baselines/v1.json`.
- Aucun fichier historique, contrat public ou licence modifié. Aucun déploiement effectué.

## Écarts avec l'archive décrite dans le CDC

La commande de test est déjà corrigée. Des tests API, un validateur portable, un tri stable, une normalisation FR/AR, des affiliations multiples et un générateur déterministe existent déjà. Ne pas les réimplémenter sans audit.

Le JSON racine demeure la source de génération ; l'API préfère toutefois la copie `docs/data`. La migration devra garantir leur parité. Les affiliations restent calculées par expressions régulières : les conserver pour v1, mais ne pas les recopier comme vérités canoniques. Les coordonnées sont explicitement approximatives dans les données initiales.

## Inventaire et dépendances

API : Node.js CommonJS sous `api/v1`, plus `api/contact.js` (courriel). Interface : HTML/CSS/JavaScript statique sous `docs`, traductions dans `i18n.js`. Routage Vercel : `vercel.json`. Documentation : README, API, méthodologie, OpenAPI et wiki. CI : validation, Pages, release et synchronisation du wiki.

Dépendance applicative déclarée : nodemailer ^6.9.16. Tests : Node intégré et Python 3 pour le validateur. Aucun ajout de dépendance pour cette phase. Licence racine MIT ; les réponses API annoncent CC BY 4.0. Clarifier le périmètre des droits avant tout changement.

## Plan de migration réversible

1. Proposer les JSON Schemas et un journal architectural ; préserver intégralement les objets legacy.
2. Créer un import idempotent vers une fiche par fichier, sans inventer dates, traductions, sources ou territoires. Marquer les incertitudes et les champs à revoir.
3. Vérifier les 263 IDs, l'aller-retour sans perte, les références et la reproductibilité avant de changer la source des exports.
4. Garder v1 derrière son adaptateur de compatibilité ; exposer les métadonnées nouvelles via v2.
5. Ajouter contributions et revue humaine, puis observatoire des lacunes ; réserver les analyses avancées aux phases ultérieures.

## Utilisation de la référence

`npm test` vérifie désormais aussi le gel de phase 0. La capture manuelle `node scripts/capture-v1-baseline.js` est réservée à une décision explicite de révision du contrat : ne pas la lancer pour masquer une régression. Cette référence stricte concerne le corpus initial ; la phase 1 devra distinguer préservation des 263 fiches initiales et ajouts légitimes.

## Limites

Tests locaux des handlers, pas de smoke test Vercel ni de validation visuelle mobile. Les empreintes ne prouvent pas la vérité historique. Le gel ne remplace pas des tests exhaustifs du protocole HTTP. Les phases 1 à 5 ne sont pas réalisées dans cette livraison.

## Fichiers ajoutés

- scripts/capture-v1-baseline.js
- tests/baselines/v1.json
- tests/baseline.test.js
- docs/PHASE_0_AUDIT.md
- docs/DECISIONS_PENDING.md
