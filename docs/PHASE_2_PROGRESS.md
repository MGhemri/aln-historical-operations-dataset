# Contributions FR/AR — bilan

## Livraison locale

- Page `docs/contribute.html` : six types de propositions, sources ou justification de leur absence, consentement, récapitulatif, avertissement sur la visibilité publique et la revue humaine.
- Préparation d'une Issue GitHub sans appel d'écriture et téléchargement Markdown sans compte. Les textes trop longs basculent vers le téléchargement. Aucune confirmation d'envoi fictive.
- Lien de contribution dans l'atlas et lien de correction prérempli depuis chaque fiche.
- Traductions dans le dictionnaire i18n existant, RTL arabe, labels, annonce des erreurs, focus clavier et mise en page mobile.
- Six modèles d'Issues, modèle de PR, guide de contribution, politique éditoriale et code de conduite.
- Workflow de tests navigateur sans secrets, avec permission de lecture seulement.

## Vérifications exécutées

- 37 tests API/canon/compatibilité réussis ; les quatre exports legacy sont valides et contiennent toujours 263 fiches.
- `npm run check:canonical` : exports reproductibles et synchronisés.
- 3 tests navigateur Chromium réussis : FR mobile, AR RTL mobile, bureau et premiers parcours clavier. Validation, texte HTML malveillant affiché sans exécution, téléchargement, URL GitHub encodée, grande proposition et absence de débordement horizontal vérifiés.
- 7 fichiers YAML des modèles lus sans erreur.
- Captures FR/AR produites ; affichage FR et AR inspecté visuellement.

## Fichiers modifiés

`docs/index.html`, `docs/app.js`, `docs/i18n.js`, `docs/contribute.html`, `docs/contribute.css`, `docs/contribute.js`, `.github/ISSUE_TEMPLATE/*`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/workflows/test-contribution-ui.yml`, `CONTRIBUTING.md`, `EDITORIAL_POLICY.md`, `CODE_OF_CONDUCT.md`, `playwright.config.js`, `tests/browser/contribute.spec.js`, `package.json`, `package-lock.json`, `.gitignore`, ce bilan.

## Limites explicites

Aucune Issue/PR créée et aucun déploiement : le cycle de contribution réel « soumis, revu, publié » n'est donc pas attesté. Les modèles et règles ne remplacent pas les protections de branche ; celles-ci et le nombre obligatoire de reviewers restent à configurer par le responsable. Aucun CODEOWNERS inventé.

Les liens GitHub vers les nouveaux guides deviendront accessibles après publication des fichiers sur le dépôt. La conformité WCAG 2.2 AA complète et un test sur appareil Android réel restent à vérifier. Le formulaire ne stocke ni ne transmet automatiquement les propositions.

Le profil canonique demeure une prévisualisation ; sa bascule publique et les schémas scientifiques complets restent à terminer avant une contribution publiée dans le nouveau modèle. L'API v2 et l'observatoire ne sont pas livrés dans cette étape. Les 43 notices scientifiques existantes et la vulnérabilité nodemailer précédemment signalée restent ouvertes.
