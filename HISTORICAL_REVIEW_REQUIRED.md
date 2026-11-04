# 📜 ALNOP — Registre des Points de Vigilance et Révision Historique (ALNOP-020)

**Corpus :** Base de données historique et cartographie des opérations de l'ALN (1954–1962)  
**Version du corpus :** `1.0.0` (263 opérations documentées)  
**Date d'établissement :** 4 novembre 2026  
**Auteur du corpus & Responsable scientifique :** Ghemri M.  
**Auditeur technique :** Algorithme de Contrôle et Validation Déterministe (ALNOP Audit Engine v1.0)  
**Statut méthodologique :** À destination exclusive des historiens, universitaires et chercheurs qualifiés.

---

## ⚠️ Avertissement Méthodologique Fondamental (Règle d'Intégrité Scientifique)

Conformément à la charte déontologique de recherche et aux règles de l'audit technique :
1. **Aucun fait historique n'a été modifié, inventé, déduit ou interpolé de façon unilatérale ou par traitement automatisé non validé.**
2. Les 263 fiches composant ce corpus sont préservées dans leur intégralité textuelle, chronologique, géographique et bibliographique d'origine.
3. Le présent registre documente les **ambiguïtés structurelles, incertitudes géospatiales et interactions inter-wilayas** identifiées lors de l'audit informatique, afin de les soumettre à un protocole de revue par les pairs (*peer review*) par des historiens spécialisés de la Guerre de Libération nationale algérienne.

---

## 1. Opérations à Portée Inter-Wilayas & Multi-Affiliations Territoriales

Dans le découpage militaire de la Révolution (avant et après le Congrès de la Soummam du 20 août 1956), plusieurs actions militaires majeures ont impliqué simultanément plusieurs wilayas, zones autonomes ou commandements extérieurs.

Le système informatique classe chaque opération dans une `primary_affiliation` (pour compatibilité API v1) tout en exposant désormais `territorial_affiliations[]` (ALNOP-007).

### Cas emblématiques nécessitant une expertise historiographique :

| Identifiant | Date début | Intitulé de l'opération | Wilaya concernée (donnée source) | Points de vigilance pour les historiens |
| :--- | :---: | :--- | :--- | :--- |
| **`OP_1954_001`** | 1954-11-01 | Déclenchement du 1er Novembre 1954 (« Toussaint rouge ») | Toutes les zones historiques (Zones I à V : Aurès, Nord-Constantinois, Kabylie, Algérois, Oranie) | Action nationale synchronisée. Actuellement rattachée à W1 (Aurès) pour des raisons de préséance chronologique de déclenchement. Doit-elle avoir un statut `NATIONAL` distinct ? |
| **`OP_1954_006`** | 1954-11-07 | Attaque de la mine de Nador et opérations Guelma - Souk Ahras | Zone II / Confins Base de l'Est (Secteur de Guelma - Hammam N'Baïls - Souk Ahras) | Transition territoriale pré-Soummam entre la Zone II et la future Base de l'Est. |
| **`OP_1955_010`** | 1955-04-16 | Embuscades des gorges d'El Kantara | Zone I / Future Wilaya VI (Porte du Sahara - El Kantara / Biskra) | Zone charnière entre l'Aurès (W1) et la future Wilaya VI créée sous le commandement de Si Chérif et Ali Mellah. |
| **`OP_1956_002`** | 1956-02-14 | Sabotages et attaques coordonnées de la région algéroise | Zone IV (future Wilaya IV - Algérois) et Zone autonome d'Alger | Actions mixtes périphérie/centre urbain précédant la formalisation de la ZAA. |
| **`OP_1957_002`** | 1957-01-28 | Grève des 8 jours et coordination opérationnelle nationale | Zone autonome d'Alger (ZAA) et ensemble des Wilayas (I à VI) | Déclenchée à l'appel du CCE à Alger, mais répercutée militairement sur l'ensemble du territoire et à l'étranger. |
| **`OP_1957_049`** | 1957-11-15 | Combats des confins Jijel - Mila | Wilaya II / Wilaya III (Confins de Jijel et Mila - Sidi Maârouf) | Engagement sur la ligne de démarcation entre les unités de Lakhdar Bentobbal (W2) et Mohammedi Said / Amirouche (W3). |
| **`OP_1959_001`** | 1959-03-01 | Réunions inter-wilayas et embuscades de diversion | Wilaya III (Kabylie) et états-majors des Wilayas IV et VI | Coordination stratégique au sommet des Wilayas III, IV et VI au cœur du Plan Challe. |
| **`OP_1959_002`** | 1959-03-28 | Bataille de Djebel Tamer (mort des colonels Amirouche et Si El Haouès) | Wilaya IV (Ouarsenis), Wilaya V et Wilaya VI (Djebel Tamer) | Action majeure survenue en Wilaya VI (près de Boussaâda) impliquant les dirigeants des Wilayas III et VI en transit vers Tunis. |
| **`OP_1959_014`** | 1959-06-12 | Franchissement des barrages Challe et Morice | Base de l'Est / Wilaya I (Secteur frontalier d'El Meridj - Ouenza - Tébessa) | Opération conjointe Armée des Frontières et maquis de l'intérieur (Wilaya I). |
| **`OP_1960_002`** | 1960-12-11 | Manifestations de Décembre 1960 et protection des cortèges | Zone autonome d'Alger (ZAA reconstituée) et Wilayas II, IV et V | Mouvement populaire urbain encadré par les réseaux clandestins du FLN dans plusieurs métropoles algériennes. |
| **`OP_1962_001`** | 1962-03-19 | Cessez-le-feu du 19 mars 1962 et consolidation des positions | Wilaya II, Wilaya IV, Zone autonome d'Alger (ZAA) et Zone Autonome d'Oran (ZAO) | Entrée en vigueur des accords d'Évian, déploiement des unités de l'ALN et sécurisation face aux commandos de l'OAS. |

---

## 2. Précision Géospatiale et Coordonnées GPS

Toutes les coordonnées fournies dans le corpus portent le label `coordonnees_approximatives` dans le schéma de données :
- **Zones urbaines (Alger, Oran, Constantine, Batna, Biskra) :** Précision kilométrique satisfaisante (points calés sur des édifices, rues ou gares historiques identifiés dans les sources).
- **Zones montagneuses et djebels (Aurès, Djurdjura, Dahra, Ouarsenis, Ksour, Nemencha) :** Les points GPS représentent généralement le centroïde d'un massif, d'un col ou d'un douar, et non le lieu d'un accrochage tactique précis au mètre près.
- **Recommandation pour les SIG :** Ne jamais représenter ces points comme des coordonnées topographiques d'artillerie, mais appliquer un cercle d'incertitude ou une zone d'action (buffer de 5 à 15 km selon le relief).

---

## 3. Granularité Chronologique et Datation

- La totalité des 263 opérations du corpus dispose d'une date de début au format complet `YYYY-MM-DD`.
- **Durée des combats :** Pour les batailles de longue durée (ex: *Bataille d'El Djorf*, *Bataille de Souk Ahras*, *Opérations Jumelles*), `date_fin` a été renseignée.
- **Point à vérifier :** Confirmer auprès des archives si certaines dates reflètent le premier jour d'une offensive ou le point culminant des affrontements (exemple : offensives du 20 août 1955 vs combats s'étendant jusqu'au 24 août).

---

## 4. Appareil Critique & Sources Bibliographiques

Le corpus s'appuie sur :
1. **Revues scientifiques académiques et portail ASJP (Algérie) :**
   - *Revue d'histoire maghrébine*
   - *Insaniyat* (CRASC / OpenEdition)
   - *Revue d'études historiques* (Université d'Alger)
2. **Mémoires et témoignages d'acteurs de premier plan :**
   - Mémoires de Lakhdar Bentobbal, Chadli Bendjedid, Ali Kafi, Benyoucef Benkhedda, Commandant Azzedine.
3. **Monographies et travaux d'historiens reconnus :**
   - Mahfoud Kaddache, Mohammed Harbi, Gilbert Meynier, Charles-Robert Ageron, Daho Djerbal.
4. **Sources institutionnelles :**
   - Ministère des Moudjahidine et des Ayants-droit (Algérie).

---

## 5. Protocole de Validation Humaine pour les Évolutions Futures

Toute future révision ou enrichissement du corpus devra impérativement suivre le protocole suivant :
1. **Proposition motivée :** Numéro de fiche, champ ciblé, valeur actuelle, valeur proposée.
2. **Attribution de source primaire ou académique cotée :** Titre, auteur, page, cote d'archive ou lien pérenne (DOI / ASJP).
3. **Double revue :** Accord formel d'au moins deux historiens ou du comité scientifique ALNOP.
4. **Journalisation :** Inscription de la modification dans le changelog officiel avec date et identité du relecteur.
