# TEMPORA — Framework pour les corpus historiques

TEMPORA est un framework en développement pour structurer et valider des corpus historiques à l’aide de profils explicites. Un profil définit un contexte documentaire : période, langues, référentiel géographique, vocabulaires et règles de validation.

**ALNOP est l’un de ses profils**, consacré aux opérations du FLN/ALN durant la guerre d’indépendance algérienne (1954–1962). Le corpus ALNOP comprend actuellement 263 notices. Ses choix historiques et ses règles métier appartiennent à ce profil, pas au noyau TEMPORA.

- [Découvrir TEMPORA sur GitHub Pages](https://mghemri.github.io/aln-historical-operations-dataset/)
- [Documentation du framework](./FRAMEWORK.md)
- [Guide du profil ALNOP](./ALNOP.md)
- [Consulter ALNOP sur Vercel](https://alnop.vercel.app/)

## Framework, profils et applications

| Élément | Rôle | Emplacement |
|---|---|---|
| Noyau TEMPORA | Contrats de profils, chargement, héritage et validation configurable | `src/framework/` |
| Schéma des profils | Format JSON des configurations | `schemas/tempora.profile.schema.json` |
| Profil ALNOP | Configuration historique et adaptateur du corpus FLN/ALN | `profiles/alnop/`, `src/profiles/alnop.js` |
| Application ALNOP | Atlas, recherche, fiches, contributions et consultation du corpus | `docs/`, `api/` |

GitHub et GitHub Pages présentent le framework et ses profils. Vercel présente l’application du profil ALNOP. Le nom historique du dépôt et les adresses publiques sont conservés pour la continuité des liens.

## Capacités disponibles

Le noyau charge des profils JSON locaux, vérifie leur schéma et leur compatibilité, résout leur héritage et isole leurs configurations. Il fournit des règles de présence, d’intervalle de dates et de vocabulaire, avec sévérités configurables et alias explicitement déclarés. Il ne déduit aucun fait historique, aucune identité et aucune traduction.

Le profil ALNOP utilise ces contrats tout en conservant ses validations canoniques, ses identifiants permanents, ses exports JSON/GeoJSON et ses API v1/v2. Un second profil synthétique, réservé aux tests, vérifie l’indépendance du noyau ; il ne constitue pas un corpus publié.

TEMPORA est en construction. Le modèle canonique v3 et une migration locale vérifiée sont disponibles. L’ingestion locale JSON/CSV/GeoJSON fournit une prévisualisation, une quarantaine et une acceptation explicite en copie de travail. Le pipeline générique de publication et un SDK public restent à livrer. La version de compatibilité du contrat ne signifie pas que toute la plateforme est achevée. Voir les [capacités et limites](./FRAMEWORK.md#compatibilité-et-limites).

## Commencer

```sh
npm ci
npm run validate:profiles
npm run validate:profiles -- --profile profiles/alnop/profile.json
npm test
npm run build
```

Pour consulter l’application ALNOP localement après compilation :

```sh
python -m http.server 8000 --directory docs
```

Ouvrir ensuite `http://localhost:8000`. Le serveur statique permet la consultation ; l’envoi des contributions et les fonctions serveur nécessitent l’environnement Vercel configuré.

## Documentation

- [TEMPORA : architecture, profils et validation](./FRAMEWORK.md)
- [Modèle canonique v3 et migration](./CANONICAL_MODEL.md)
- [Import local JSON, CSV et GeoJSON](./INGESTION.md)
- [Analyses documentaires et évaluation](./ANALYSIS.md)
- [ALNOP : corpus, application et méthode](./ALNOP.md)
- [Méthodologie historique ALNOP](./METHODOLOGIE.md)
- [Dictionnaire des données ALNOP](./DATA_DICTIONARY.md)
- [API ALNOP v1](./API.md) et [API ALNOP v2](./API_V2.md)
- [Versions et citation du corpus ALNOP](./RELEASE_POLICY.md)
- [Contribuer au framework ou au profil ALNOP](./CONTRIBUTING.md)

## Licence et contact

Consulter [LICENSE](./LICENSE) pour le code et la [politique de publication](./RELEASE_POLICY.md) pour les conditions de réutilisation et de citation des données. Contact : contact@connect-gm.com.

### Citation académique recommandée

Pour citer le corpus ALNOP, utiliser la référence et la version de données décrites dans la [politique de citation](./RELEASE_POLICY.md). Distinguer le corpus utilisé du framework TEMPORA qui porte ses contrats de validation.
