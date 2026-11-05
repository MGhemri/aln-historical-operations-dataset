# TEMPORA

**TEMPORA est un framework pour préparer, valider et analyser des corpus historiques.** Chaque corpus s’appuie sur un profil qui déclare ses langues, sa période, ses vocabulaires et ses règles de validation.

| Pour commencer | Où aller |
|---|---|
| Découvrir le framework et ses profils | [Portail TEMPORA](https://mghemri.github.io/aln-historical-operations-dataset/) |
| Utiliser TEMPORA dans ce dépôt | [Démarrage local](#démarrage-local) |
| Explorer un corpus historique | [Atlas ALNOP](https://alnop.vercel.app/) · [Guide du profil](./ALNOP.md) |

## Ce que TEMPORA permet aujourd’hui

| Besoin | Fonction disponible | Guide |
|---|---|---|
| Définir les règles d’un corpus | Profils JSON versionnés, héritage et validation configurable | [Profils et validation](./FRAMEWORK.md) |
| Structurer les données | Modèle canonique v3 pour les événements, sources, assertions, entités et relations | [Modèle canonique](./CANONICAL_MODEL.md) |
| Préparer des ajouts | Import local JSON, CSV ou GeoJSON, prévisualisation, quarantaine et sélection des propositions | [Import local](./INGESTION.md) |
| Examiner un corpus | Rapprochements à revoir, assertions divergentes, comparaisons spatio-temporelles et couverture documentaire | [Analyses documentaires](./ANALYSIS.md) |

Les analyses fournissent des pistes pour la revue scientifique. Les rapports indiquent le profil, les paramètres et l’empreinte du corpus analysé. Les mesures de performance des rapprochements portent actuellement sur des cas fictifs annotés.

## Démarrage local

Le dépôt utilise Node.js 20 et npm dans sa CI. Installer les dépendances, vérifier les profils, puis essayer la migration ALNOP en simulation.

```sh
npm ci
npm run validate:profiles
npm run migrate:tempora
```

Pour créer une première copie de travail v3 et produire un rapport d’analyse, exécuter les commandes suivantes. Si la copie existe déjà, réutiliser son chemin et lancer directement l’analyse.

```sh
npm run migrate:tempora -- --write
npm run --silent quality:tempora -- --base work/tempora-v3/corpus-v3.json
```

La copie et les rapports de travail sont destinés à un usage local. Pour essayer les analyses avec un profil fictif indépendant en anglais et espagnol, lancer `npm run quality:tempora:reference`.

## Noyau, profils et applications

| Partie | Rôle | Emplacement |
|---|---|---|
| Noyau | Contrats, validation, ingestion et analyses génériques | [src/framework](./src/framework/) |
| Schémas | Profils, mappings d’import et modèle canonique | [schemas](./schemas/) |
| Profils | Règles et mappings propres à un corpus | [profiles](./profiles/) |
| Adaptateurs | Passage des données d’un profil vers les contrats TEMPORA | [src/profiles](./src/profiles/) |
| Application ALNOP | Atlas, recherche, contributions et consultation du corpus | [docs](./docs/) · [api](./api/) |

## ALNOP, un profil de TEMPORA

ALNOP rassemble 263 notices sur les opérations du FLN/ALN pendant la guerre d’indépendance algérienne, de 1954 à 1962. Son atlas est disponible en français et en arabe. Ses règles historiques et ses vocabulaires sont déclarés par le profil. [Guide ALNOP](./ALNOP.md) · [Méthodologie historique](./METHODOLOGIE.md)

Les API publiques v1 et v2 servent le corpus ALNOP. Le parcours TEMPORA v3 de ce dépôt utilise une copie de travail locale. L’API générique TEMPORA et le SDK public relèvent de la phase suivante. [API ALNOP v1](./API.md) · [API ALNOP v2](./API_V2.md)

## Contribuer

Pour le framework, préciser le comportement attendu et les profils concernés. Pour le corpus ALNOP, identifier les notices, les sources et les incertitudes à examiner. [Guide de contribution](./CONTRIBUTING.md)

Les vérifications courantes sont `npm test` et `npm run build`. La suite navigateur utilise Playwright et un serveur local Python. La CI utilise Python 3.11.

## Licence et citation

Consulter la licence pour le logiciel et la politique de publication pour les droits et conditions de réutilisation du corpus. [Licence](./LICENSE) · [Politique de publication](./RELEASE_POLICY.md)

### Citation académique recommandée

Pour citer le corpus ALNOP, indiquer la version archivée, l’URL de son manifeste et son empreinte. Pour une analyse reproductible, relever aussi le commit source et les paramètres de sélection. [Versions et citation](./RELEASE_POLICY.md#citation-académique-recommandée)

Contact [contact@connect-gm.com](mailto:contact@connect-gm.com)
