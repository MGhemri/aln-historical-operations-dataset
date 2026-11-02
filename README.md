# FLN/ALN Historical Military Operations Dataset (1954–1962)

[![License: MIT](https://shields.io)](https://opensource.org)
[![Format: JSON](https://shields.io)](#structure-du-schéma-de-données)
[![Historiography](https://shields.io)](#démarche-académique-et-méthodologie)

Ce dépôt héberge un corpus de données structuré en accès libre documentant, qualifiant et géolocalisant les actions militaires, embuscades, sabotages et opérations de guérilla menés par le Front de libération nationale (FLN) et l'Armée de libération nationale (ALN) durant la guerre d'indépendance algérienne (1954–1962).

---

## 1. Démarche académique et méthodologie

S'inscrivant dans le champ des **humanités numériques** (*digital humanities*) et de l'histoire quantitative des conflits asymétriques, ce projet répond à l'absence de base de données unifiée, interrogeable et cartographiable sur les actions de l'ALN.

### Principes méthodologiques :

* **Croisement historiographique critique :** Chaque enregistrement est issu d'une confrontation rigoureuse entre :
  * Les fonds d'archives militaires et institutionnels (Service historique de la Défense - SHD, Archives nationales d'outre-mer - ANOM, Centre de recherche de la Gendarmerie nationale - CRGN).
  * Les revues universitaires et publications à comité de lecture (Cairn.info, OpenEdition Journals, Revue Insaniyat / CRASC, ASJP).
  * Les mémoires, récits de chefs de wilayas et documents historiques de l'ALN.
* **Traitement objectif des controverses et neutralité documentaire :**
  * La guerre d'Algérie se caractérisant par des divergences statistiques structurelles, le champ `bilan_et_pertes` distingue systématiquement les estimations des archives françaises, de l'historiographie algérienne et des travaux d'historiens indépendants.
  * Les faits sont restitués sans qualification partisane, en respectant la chronologie factuelle des engagements.
* **Représentativité territoriale et décentralisation :**
  * Volonté explicite d'échapper au seul prisme des opérations ultra-médiatisées (Bataille d'Alger, 20 août 1955).
  * Indexation approfondie des actions locales de terrain à travers les six wilayas historiques de l'intérieur (Wilaya I Aurès-Nemencha, Wilaya II Nord-Constantinois, Wilaya III Kabylie, Wilaya IV Algérois/Ouarsenis, Wilaya V Oranie/Front Sud, Wilaya VI Sahara), la Base de l'Est et la Fédération de France du FLN (la « 7e Wilaya »).

---

## 2. Structure du schéma de données

L'ensemble des faits est indexé dans le fichier `operations_fln_1954_1962.json` (encodé en UTF-8 strict). Le schéma répond à la structure suivante :

```json
{
  "dataset_metadata": {
    "title": "Opérations et actions militaires offensives du FLN/ALN (1954-1962)",
    "description": "Recueil documenté des principales actions militaires offensives, embuscades, batailles et campagnes de guérilla de la guerre d'indépendance algérienne...",
    "generated_at": "AAAA-MM-JJ",
    "total_records": 112
  },
  "operations": [
    {
      "id": "OP_YYYY_XXX",
      "nom_operation": "Dénomination historique ou conventionnelle",
      "date_debut": "AAAA-MM-JJ",
      "date_fin": "AAAA-MM-JJ ou null",
      "wilaya_concernee": "Zone ou Wilaya historique concernée",
      "localisation": {
        "region_ou_ville": "Toponyme actuel et historique (douar, djebel, commune)",
        "coordonnees_approximatives": {
          "latitude": 35.0000,
          "longitude": -1.0000
        }
      },
      "commandement_aln": ["Noms des responsables et officiers locaux"],
      "type_action": "Offensive coordonnée | Embuscade | Attentat ciblé | Sabotage | Guérilla urbaine",
      "description": "Synthèse factuelle et déroulement de l'opération",
      "bilan_et_pertes": {
        "aln": "Estimation chiffrée selon les sources",
        "forces_francaises": "Estimation chiffrée selon les sources",
        "civils": "Estimation chiffrée le cas échéant"
      },
      "impact_strategique": "Conséquences militaires, politiques et diplomatiques",
      "sources": [
        {
          "titre": "Intitulé du document, article ou notice d'archive",
          "url": "https://...",
          "type_source": "Archive | Ouvrage académique | Article | Autre"
        }
      ]
    }
  ]
}
```

---

## 3. Cas d'usage et réutilisation scientifique

Ce jeu de données a été modélisé pour permettre :
* **La cartographie SIG et spatio-temporelle :** Visualisation de l'évolution des fronts, des couloirs logistiques d'acheminement d'armes et de l'intensité des combats (QGIS, Mapbox, Leaflet, GeoJSON).
* **L'analyse statistique et quantitative :** Étude de la périodisation du conflit, de la typologie des actions (guérilla de montagne vs guérilla urbaine vs sabotages industriels) et de l'activité par commandement de wilaya.
* **L'ingénierie logicielle et IA :** Ingestion dans des bases relationnelles (PostgreSQL/PostGIS, SQLite), graphes de connaissances (Neo4j) ou moteurs de recherche vectoriels pour des applications de recherche historique.

---

## 4. Licence et citation

Ce projet est distribué sous **licence MIT**. Vous êtes libre de réutiliser, modifier et redistribuer ces données sous réserve de conserver la notice de copyright d'origine.

Pour citer ce jeu de données dans un travail académique :

```bibtex
@dataset{fln_aln_military_operations_2026,
  author = {Ghemri, M.},
  title = {FLN/ALN Historical Military Operations Dataset (1954–1962)},
  year = {2026},
  publisher = {GitHub},
  howpublished \(= {\url{https://github.com}} \)}
```

---

## 5. Contributions

Les contributions visant à enrichir la base, à corriger des toponymes ou à ajouter des sources primaires vérifiables sont bienvenues via **Pull Request** ou via l'onglet **Issues**.
