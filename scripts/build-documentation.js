const fs=require('node:fs');
const path=require('node:path');
const md=require('markdown-it')({html:false,linkify:false});
const root=path.join(__dirname,'..');
const pages={framework:['FRAMEWORK.md','TEMPORA — Framework et profils'],alnop:['ALNOP.md','ALNOP — Profil historique'],methodology:['METHODOLOGIE.md','Méthodologie'],api:['API.md','API REST v1'],
  contributing:['CONTRIBUTING.md','Contribuer'],editorial:['EDITORIAL_POLICY.md','Politique éditoriale'],
  conduct:['CODE_OF_CONDUCT.md','Code de conduite'],dictionary:['DATA_DICTIONARY.md','Dictionnaire des données'],publication:['docs/ADR/002-canonical-publication.md','Publication des données'],
  provenance:['PROVENANCE_POLICY.md','Assertions et contradictions'],
  entities:['ENTITY_REVIEW_GUIDE.md','Référentiels, revue et doublons candidats'],'api-v2':['API_V2.md','API REST v2 et provenance'],releases:['RELEASE_POLICY.md','Versions du corpus et citation'],observatory:['OBSERVATORY.md','Observatoire documentaire'],assistance:['ASSISTANCE.md','Assistance à la revue scientifique']};
const navigation='<nav><a data-atlas-link href="../index.html">Atlas ALNOP · الأطلس</a><a href="../contribute.html">Contribuer · ساهم</a><a href="index.html">Documentation · الوثائق</a></nav>';
const shell=(title,body)=>`<!doctype html>\n<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · TEMPORA</title><script>const base=document.createElement('base');base.href=location.pathname.split('/documentation')[0].replace(/\\/api\\/docs$/,'')+'/documentation/';document.head.append(base);</script><link rel="stylesheet" href="documentation.css"><script src="../site-context.js?v=4.3"></script></head><body><main>${navigation}<p class="documentation-context"><span data-framework-presentation>TEMPORA — Framework pour les corpus historiques</span><span data-profile-presentation hidden>ALNOP — Profil du framework TEMPORA</span></p>${body}</main></body></html>\n`;
const alnopGuides=Object.entries(pages).filter(([slug])=>!['framework','alnop'].includes(slug)).map(([slug,[,title]])=>`<li><a href="${slug}.html">${title}</a></li>`).join('');
const generated={'index.html':shell('Documentation TEMPORA et profil ALNOP',`
<section data-framework-presentation><h1>Documentation TEMPORA</h1><p>Un framework pour structurer et valider des corpus historiques à l’aide de profils explicites. Les choix de période, de langues et de vocabulaire appartiennent aux profils.</p><h2>Le framework</h2><p><a href="framework.html">Architecture, configuration des profils et validation</a></p><h2>Les profils</h2><p><a href="alnop.html">ALNOP — Opérations du FLN/ALN, 1954–1962</a>. ALNOP est l’un des profils de TEMPORA et dispose de son application de consultation.</p></section>
<section data-profile-presentation hidden><h1>Documentation ALNOP</h1><p>ALNOP est un profil du framework TEMPORA consacré aux opérations du FLN/ALN (1954–1962).</p><p><a href="alnop.html">Comprendre le corpus et l’application ALNOP</a> · <a href="framework.html">Découvrir le framework TEMPORA</a></p></section>
<h2>Guides du profil ALNOP</h2><p>Ces documents décrivent le corpus ALNOP, ses méthodes et ses services. Les API v1/v2 concernent ce profil.</p><ul>${alnopGuides}</ul><p>Documents de référence en français ; guide de contribution également en arabe.</p>`) };
// Stable heading anchors for the existing API table of contents.
md.renderer.rules.heading_open=(tokens,index)=>{
  const text=tokens[index+1].content;
  const slug=text.toLowerCase().replace(/[^\p{L}\p{N}_ -]/gu,'').replace(/ /g,'-');
  return `<${tokens[index].tag} id="${md.utils.escapeHtml(slug)}">`;
};
md.renderer.rules.link_open=(tokens,index,options,env,self)=>{
  const token=tokens[index],href=token.attrGet('href')||'';
  if(!/^[a-z][a-z0-9+.-]*:/i.test(href)){
    const [file,fragment]=href.split('#');
    const page=Object.entries(pages).find(([,value])=>value[0].split('/').pop()===file.split('/').pop());
    if(page)token.attrSet('href',page[0]+'.html'+(fragment?'#'+fragment:''));
    if(['docs/atlas.html','docs/releases.html','docs/observatory.html','docs/compare.html','docs/entities.html'].includes(file))token.attrSet('href','../'+file.split('/').pop());
  }
  return self.renderToken(tokens,index,options);
};
function publicDocumentation(content){
  // Public site presentation: retain contact and scientific citation, without a personal name.
  // Original repository documentation and API v1 responses remain unchanged.
  return content.replace(/^\uFEFF/,'')
    .replace("l'auteur (**Ghemri M.**) est joignable à l'adresse suivante",'contactez-nous à l’adresse suivante')
    .replace(/^[ \t]*author[ \t]*=[ \t]*\{Ghemri, M\.\},?\r?\n/gm,'')
    .replace(/^[ \t]*"attribution": "Ghemri M\. \(ALN Historical Operations Dataset\)",\r?\n/gm,'')
    .replace(/Auteur : Ghemri M\. — /g,'')
    .replace(/Ghemri M\., /g,'');
}
for(const [slug,[file,title]] of Object.entries(pages)){
  const content=publicDocumentation(fs.readFileSync(path.join(root,file),'utf8'));
  if(/Ghemri/i.test(content))throw new Error(`Personal name remains in public documentation: ${file}`);
  generated[slug+'.html']=shell(title,md.render(content));
}
const directory=path.join(root,'docs/documentation');
const check=process.argv.includes('--check');
if(!check)fs.mkdirSync(directory,{recursive:true});
for(const [file,content] of Object.entries(generated)){
  const target=path.join(directory,file);
  if(check){if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==content)throw new Error(`Stale documentation: ${file}`);}
  else fs.writeFileSync(target,content);
}
console.log(check?'Documentation matches.':'Documentation generated.');

if(!check)fs.copyFileSync(path.join(root,'docs/index.html'),path.join(root,'docs/atlas.html'));
