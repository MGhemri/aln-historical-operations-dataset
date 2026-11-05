# TEMPORA — Profils et validation

TEMPORA fournit des contrats réutilisables pour configurer la validation de corpus historiques. ALNOP conserve son application, ses données, ses identifiants et ses API publiques. Les commandes ci-dessous concernent les profils et les contrôles configurables actuellement implémentés ; elles ne constituent pas une migration vers un nouveau modèle de données.

## Valider un profil

```sh
npm run validate:profiles
npm run validate:profiles -- --profile profiles/alnop/profile.json
```

La première commande découvre les configurations publiées sous `profiles/`, vérifie leurs identifiants et valide les opérations ALNOP avec les vocabulaires actuels. La seconde vérifie un manifeste explicite, sans importer de corpus. Les formats et contraintes figurent dans `schemas/tempora.profile.schema.json`, version `1.0.0`.

Le profil ALNOP reprend la fenêtre annuelle de validation historique existante : 1954 à 1962 inclus. Il ne restreint pas artificiellement le dernier jour au 5 juillet. Cette fenêtre est une règle technique du profil, pas une preuve de date ni une mesure d'exhaustivité historique. Les vocabulaires restent lus depuis les données canoniques ; ils ne sont pas recopiés dans le profil.

## Charger une configuration

```js
const {loadProfile} = require('./src/framework/profile-loader');
const profile = loadProfile('/chemin/projet/profiles/alnop/profile.json', {
  rootDirectory: '/chemin/projet'
});
```

Le chargeur accepte uniquement un fichier JSON UTF-8 explicite, de taille inférieure ou égale à 128 Kio, situé dans la racine autorisée après résolution des liens. Aucun accès réseau n'est effectué. La découverte ne parcourt que les sous-répertoires immédiats du dossier fourni, chacun contenant `profile.json`.

Un profil peut hériter d'un parent par `extends`, chemin relatif vers un fichier situé dans la même racine autorisée. Les cycles et les chaînes trop longues sont refusés. Chaque parent doit lui-même être valide. Les objets sont fusionnés récursivement ; les tableaux sont remplacés intégralement. Une redéfinition de langues doit donc aussi adapter les alias dont les langues ne sont plus déclarées.

Le schéma valide la configuration résolue après héritage. Un manifeste enfant peut ne fournir que `extends` et les champs qu'il remplace. Les identifiants et espaces de noms doivent rester uniques dans un registre découvert.

La priorité est : parent, manifeste enfant, puis surcharges explicites. Les surcharges d'exécution concernent uniquement `parameters` et `severities` :

```js
const adjusted = loadProfile('/racine/profiles/example/profile.json', {
  rootDirectory: '/racine',
  parameters: {limits: {sample: 20}},
  severities: {'event-type': 'warning'}
});
```

Les surcharges de sévérité doivent désigner une règle existante. Les paramètres sont exposés à l'appelant ; ils ne reconfigurent pas automatiquement l'atlas ou les algorithmes ALNOP. Les résultats sont des objets gelés et indépendants, sans cache global partagé entre profils.

## Compatibilité et limites

Le contrat de chargement utilise la version de compatibilité `3.0.0`. La propriété `framework` accepte une plage bornée de la forme `>=3.0.0 <4.0.0` ; les expressions SemVer plus complexes ne sont pas prises en charge. Une version de schéma inconnue ou une plage incompatible provoque une erreur explicite. Cette version de contrat ne signifie pas que toutes les capacités d'une plateforme v3 sont disponibles.

Ce composant prend actuellement en charge le calendrier grégorien, les jours ISO de `0001` à `9999`, les bornes ouvertes ou inconnues dans les intervalles et le référentiel `EPSG:4326`. Un calendrier ou un CRS non pris en charge est refusé ; aucune conversion silencieuse n'est réalisée. Le contrôle du CRS du profil ne remplace pas une validation géométrique.

## Validation configurable

```js
const {createValidator} = require('./src/framework/validation');
const validator = createValidator(profile, {
  taxonomies: {
    event_types: ['type déclaré'],
    territorial_units: ['territoire déclaré']
  }
});
const result = validator.validate({
  id: 'EXAMPLE_1',
  start_date: {earliest: null, latest: null},
  event_type: ['type déclaré'],
  territory_ids: []
});
```

Les valeurs des taxonomies sont fournies par l'appelant. Le noyau ne lit pas de données métier et n'importe pas le profil ALNOP. Trois types de règles sont disponibles :

| Type | Contrôle |
|---|---|
| `required` | Valeur présente et non vide |
| `date_range` | Jours valides, bornes ordonnées et respect de la fenêtre du profil |
| `vocabulary` | Valeur ou liste de valeurs appartenant à une taxonomie fournie |

Les sévérités sont `error`, `warning` et `info`. Seuls les diagnostics `error` rendent `valid` faux. Chaque diagnostic conserve un code, le champ concerné et l'identifiant de règle. Un champ facultatif absent n'est pas rendu obligatoire par une autre règle ; utiliser `required` lorsque nécessaire. Les chemins de champs sont des propriétés explicites séparées par des points, sans exécution de code ni parcours des prototypes.

Les alias de vocabulaire doivent être déclarés avec langue, valeur et cible canonique. Leur correspondance est exacte ; les graphies originales ne sont pas modifiées. Une cible absente ou un alias ambigu est refusé. Ce mécanisme n'établit aucune identité de personne ou de lieu et ne traduit aucun texte.

Ces contrôles complètent les schémas et règles canoniques existants. Un résultat valide ne certifie ni la provenance documentaire ni la vérité d'un fait historique.

## Interface d'adaptateur

`defineAdapter` vérifie une interface composée de `id`, `formats`, `parse` et `serialize`. Il conserve les fonctions fournies et fige les métadonnées. Il n'implémente pas à lui seul une ingestion CSV/GeoJSON, une quarantaine ou une publication. Les adaptateurs doivent déclarer leurs limites et être testés séparément.

## Erreurs et compatibilité ALNOP

Les erreurs de configuration utilisent `ProfileError` avec `code`, `message` et `details`. Les codes distinguent notamment schéma invalide, incompatibilité de version, calendrier non pris en charge, chemin interdit, héritage cyclique et taxonomie absente.

L'adaptateur `src/profiles/alnop.js` projette les champs utiles pour ces règles sans modifier les objets d'origine. Le validateur Python historique lit désormais sa fenêtre annuelle depuis le même profil. Les chemins d'exports et les routes API v1/v2 restent identiques. Aucun nouvel endpoint TEMPORA n'est annoncé par ce guide.
