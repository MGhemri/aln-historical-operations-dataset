# Contribuer à ALNOP / المساهمة في ALNOP

Le corpus est incomplet et en enrichissement. Ne jamais compléter un fait historique par supposition.

## Proposer

Depuis `contribute.html`, remplir les champs adaptés au type de proposition, vérifier le récapitulatif, puis cliquer sur « Envoyer la proposition au mainteneur ». Le site transmet automatiquement le contenu par courriel, avec une copie Markdown jointe et une référence de suivi. Aucun compte ni nom n'est requis ; une adresse de réponse peut être fournie facultativement.

La confirmation signifie que le serveur SMTP a accepté le message pour le mainteneur. Elle ne constitue pas une validation historique ni une publication. En cas d'erreur, la proposition reste affichée et peut être réessayée ou téléchargée. Ne pas fermer la page avant de l'avoir envoyée ou sauvegardée.

Sur GitHub Pages, les Issues restent une alternative publique : le pseudonyme et l'historique peuvent être visibles. Le téléchargement seul n'est pas un envoi. Le parcours Vercel reste sur le site, sans lien de dépôt.

Donner les IDs concernés, les valeurs proposées et divergentes, les incertitudes et une référence précise (titre, auteur, date, page ou cote et URL éventuelle). Sans source, justifier son absence ; cela ne permet pas une publication directe. Ne pas téléverser un document protégé sans autorisation.

## Passer d’une proposition à une publication

1. Un mainteneur examine la proposition et demande les informations manquantes.
2. Une PR distincte présente les changements canoniques et leurs preuves, sans écraser les assertions contradictoires.
3. Exécuter `npm ci`, `npm test` et `npm run check:canonical`. Pour l'interface : `npx playwright install chromium` puis `npm run test:browser`.
4. Un mainteneur habilité documente sa décision et valide avant fusion. Les modifications historiques substantielles doivent demander une seconde lecture lorsque possible ; la règle finale reste à décider.
5. Vérifier la génération des exports et le déploiement après fusion. Le système actuel reste en prévisualisation canonique : ne pas annoncer une publication automatique de la PR.

Les brouillons et Issues non validées n'entrent pas dans les données publiques. Aucun script ne modifie le corpus depuis une Issue.

## العربية

المتن غير شامل وقيد الإثراء. لا تُكمل الوقائع بالافتراض. استخدم صفحة المساهمة أو نماذج GitHub، مع ذكر معرّفات البطاقات والمراجع الدقيقة ومواضع عدم اليقين. بعد مراجعة الملخص، اضغط إرسال المقترح ليرسل الموقع المحتوى بالبريد إلى المشرف. لا يلزم اسم أو حساب؛ عنوان الرد اختياري. يظهر التأكيد فقط بعد قبول خادم البريد للرسالة. عند الخطأ، أعد المحاولة أو نزّل الملف؛ التنزيل وحده ليس إرسالاً. غياب المصدر يوقف النشر. تخضع التغييرات لمراجعة بشرية موثقة قبل الدمج، ولا تُضاف المقترحات غير المعتمدة إلى البيانات المنشورة.

## Champs selon le type de proposition

- Nouvelle opération : aucun identifiant à créer ; le mainteneur l'attribue après validation. Date/période et lieux facultatifs si inconnus ; conserver les incertitudes.
- Correction : sélectionner une fiche existante, indiquer le champ, la valeur actuelle et la correction justifiée.
- Source : sélectionner une fiche existante et fournir obligatoirement une référence.
- Doublon : sélectionner deux fiches différentes et expliquer les points communs et différences.
- Contradiction : sélectionner la fiche et détailler les affirmations divergentes et leurs références.
- Toponyme : indiquer le nom et sa variante ; association à une fiche existante facultative.

La liste défilante affiche un compteur et permet une recherche par nom FR/AR, identifiant, année ou lieu. Effacer la recherche réaffiche toutes les fiches ; l’intitulé complet de la sélection reste visible.

Le formulaire charge les fiches du corpus : il ne permet pas de saisir un nouvel ID dans le sélecteur. Les modèles GitHub demandent de copier les IDs existants ; la revue vérifie leur existence. Aucune proposition ne crée automatiquement de fiche ou d'identifiant.

## Exploitation de la messagerie (mainteneur)

Configurer `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` et `CONTACT_DEST` dans les variables serveur Vercel. `CONTRIBUTION_DEST` est facultatif et remplace le destinataire pour les propositions. Aucun secret ne doit être commité. Les variables ajoutées nécessitent un nouveau déploiement.

`POST /api/contributions` valide les champs et les identifiants, n'accepte aucun destinataire fourni par le visiteur et n'écrit pas dans le corpus. Les limites anti-abus et la déduplication sont en mémoire par instance ; elles ne constituent pas une protection distribuée ni une garantie d'envoi exactement une fois. Une même tentative conserve sa référence et son Message-ID. La réception dans la boîte finale n'est pas vérifiée par le site.
