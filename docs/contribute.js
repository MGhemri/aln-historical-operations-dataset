/* Public proposals only: no token, no write API, no submission claim. */
(() => {
  const $=id=>document.getElementById(id);
  let lang;
  try {lang=localStorage.getItem('aln_lang')==='ar'?'ar':'fr';} catch {lang='fr';}
  const t=key=>I18N_CONTRIBUTE[lang][key];
  let markdown='';
  function translate(){
    document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
    document.title=t('heading')+' · ALNOP';
    document.querySelectorAll('[data-t]').forEach(el=>el.textContent=t(el.dataset.t));
    $('language').textContent=lang==='fr'?'العربية':'Français';
    $('error').textContent='';$('review').hidden=true;
  }
  $('language').addEventListener('click',()=>{lang=lang==='fr'?'ar':'fr';try{localStorage.setItem('aln_lang',lang);}catch{}translate();});
  $('proposal').addEventListener('input',()=>{$('review').hidden=true;});
  const value=id=>$(id).value.trim();
  $('proposal').addEventListener('submit',event=>{
    event.preventDefault();
    if (!value('citation') && !value('missing')) {
      $('error').textContent=t('sourceRequired');$('error').focus();return;
    }
    $('error').textContent='';
    const labels=I18N_CONTRIBUTE[lang];
    markdown=`# ${value('title')}\n\n`+
      `${labels.kind}: ${value('kind')}\n\n${labels.operation}: ${value('operation')}\n\n`+
      `${labels.description}\n${value('description')}\n\n${labels.citation}\n${value('citation')}\n\n`+
      `${labels.missing}\n${value('missing')}\n\n`+
      `${labels.proposedStatus}\n${value('citation')?labels.reviewRequired:labels.sourcesRequired}\n\n${labels.consent}\n`;
    $('summary').textContent=markdown;
    const url=new URL('https://github.com/MGhemri/aln-historical-operations-dataset/issues/new');
    url.searchParams.set('title',value('title'));url.searchParams.set('body',markdown);
    // Generic issue: structured issue templates are available separately on GitHub.
    const tooLong=url.href.length>7500;
    $('github').hidden=tooLong;$('long-note').hidden=!tooLong;
    if(tooLong)$('github').removeAttribute('href');else $('github').href=url.href;
    $('review').hidden=false;$('review-heading').tabIndex=-1;$('review-heading').focus();
  });
  $('download').addEventListener('click',()=>{
    const objectURL=URL.createObjectURL(new Blob([markdown],{type:'text/markdown;charset=utf-8'}));
    const link=document.createElement('a');link.href=objectURL;link.download='alnop-proposition.md';link.click();
    setTimeout(()=>URL.revokeObjectURL(objectURL),1000);
  });
  const parameters=new URLSearchParams(location.search);
  const id=parameters.get('id');if(id && /^[A-Za-z0-9_, -]{1,200}$/.test(id)){$('operation').value=id;$('kind').value='correction';}
  translate();
})();
