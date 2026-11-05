const fs=require('node:fs');
const path=require('node:path');
const md=require('markdown-it')({html:false,linkify:false});
const root=path.join(__dirname,'..');
const pages={methodology:['METHODOLOGIE.md','Méthodologie'],api:['API.md','API REST v1'],
  contributing:['CONTRIBUTING.md','Contribuer'],editorial:['EDITORIAL_POLICY.md','Politique éditoriale'],
  conduct:['CODE_OF_CONDUCT.md','Code de conduite'],dictionary:['DATA_DICTIONARY.md','Dictionnaire des données'],publication:['docs/ADR/002-canonical-publication.md','Publication des données'],
  provenance:['PROVENANCE_POLICY.md','Assertions et contradictions'],progress:['docs/CDC_STATUS.md','Avancement du cahier des charges'],
  entities:['ENTITY_REVIEW_GUIDE.md','Référentiels, revue et doublons candidats'],'api-v2':['API_V2.md','API REST v2 et provenance']};
const navigation='<nav><a href="../index.html">Atlas · الأطلس</a><a href="../contribute.html">Contribuer · ساهم</a><a href="index.html">Documentation · الوثائق</a></nav>';
const shell=(title,body)=>`<!doctype html>\n<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · ALNOP</title><script>const base=document.createElement('base');base.href=location.pathname.split('/documentation')[0].replace(/\\/api\\/docs$/,'')+'/documentation/';document.head.append(base);</script><link rel="stylesheet" href="documentation.css"><script src="../site-context.js?v=4.2"></script></head><body><main>${navigation}${body}</main></body></html>\n`;
const generated={'index.html':shell('Documentation','<h1>Documentation · الوثائق</h1><p>Guides accessibles directement sur ce site. Documents de référence en français ; guide de contribution également en arabe.</p><ul>'+Object.entries(pages).map(([slug,[,title]])=>`<li><a href="${slug}.html">${title}</a></li>`).join('')+'</ul>')};
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
