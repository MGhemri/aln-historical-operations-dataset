# Contribuer à ALNOP / المساهمة في ALNOP

Le corpus est incomplet et en enrichissement. Ne jamais compléter un fait historique par supposition.

## Proposer

Utiliser `contribute.html` dans l'atlas ou choisir un formulaire dans les Issues GitHub. Une proposition est publique ; le pseudonyme et l'historique peuvent rester visibles. Aucun compte ALNOP, adresse électronique ou identité civile n'est demandé.

Sans compte GitHub : télécharger la proposition Markdown puis la transmettre au mainteneur par un canal choisi par vous. Le téléchargement ne constitue pas un envoi. Aucune proposition n'est enregistrée sur le serveur par le formulaire.

Donner les IDs concernés, les valeurs proposées et divergentes, les incertitudes et une référence précise (titre, auteur, date, page ou cote et URL éventuelle). Sans source, justifier son absence ; cela ne permet pas une publication directe. Ne pas téléverser un document protégé sans autorisation.

## Passer d'une Issue à une publication

1. Un mainteneur examine la proposition et demande les informations manquantes.
2. Une PR distincte présente les changements canoniques et leurs preuves, sans écraser les assertions contradictoires.
3. Exécuter `npm ci`, `npm test` et `npm run check:canonical`. Pour l'interface : `npx playwright install chromium` puis `npm run test:browser`.
4. Un mainteneur habilité documente sa décision et valide avant fusion. Les modifications historiques substantielles doivent demander une seconde lecture lorsque possible ; la règle finale reste à décider.
5. Vérifier la génération des exports et le déploiement après fusion. Le système actuel reste en prévisualisation canonique : ne pas annoncer une publication automatique de la PR.

Les brouillons et Issues non validées n'entrent pas dans les données publiques. Aucun script ne modifie le corpus depuis une Issue.

## العربية

المتن غير شامل وقيد الإثراء. لا تُكمل الوقائع بالافتراض. استخدم صفحة المساهمة أو نماذج GitHub، مع ذكر معرّفات البطاقات والمراجع الدقيقة ومواضع عدم اليقين. دون حساب، نزّل المقترح وأرسله بنفسك إلى المشرف؛ التنزيل ليس إرسالاً. غياب المصدر يوقف النشر. تخضع التغييرات لمراجعة بشرية موثقة قبل الدمج، ولا تُضاف المقترحات غير المعتمدة إلى البيانات المنشورة.

## Champs selon le type de proposition

- Nouvelle opération : aucun identifiant à créer ; le mainteneur l'attribue après validation. Date/période et lieux facultatifs si inconnus ; conserver les incertitudes.
- Correction : sélectionner une fiche existante, indiquer le champ, la valeur actuelle et la correction justifiée.
- Source : sélectionner une fiche existante et fournir obligatoirement une référence.
- Doublon : sélectionner deux fiches différentes et expliquer les points communs et différences.
- Contradiction : sélectionner la fiche et détailler les affirmations divergentes et leurs références.
- Toponyme : indiquer le nom et sa variante ; association à une fiche existante facultative.

La liste défilante affiche un compteur et permet une recherche par nom FR/AR, identifiant, année ou lieu. Effacer la recherche réaffiche toutes les fiches ; l’intitulé complet de la sélection reste visible.

Le formulaire charge les fiches du corpus : il ne permet pas de saisir un nouvel ID dans le sélecteur. Les modèles GitHub demandent de copier les IDs existants ; la revue vérifie leur existence. Aucune proposition ne crée automatiquement de fiche ou d'identifiant.
