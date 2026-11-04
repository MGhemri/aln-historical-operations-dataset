/* Public proposals only: no token, no write API, no submission claim. */
(() => {
  const $=id=>document.getElementById(id);
  let lang;
  try {lang=localStorage.getItem('aln_lang')==='ar'?'ar':'fr';} catch {lang='fr';}
  const t=key=>I18N_CONTRIBUTE[lang][key];
  let markdown='';
  let operations=new Map();
  let loadFailed=false;
  const types={
    'new-operation':{help:'newHelp',description:'description',event:true},
    correction:{help:'correctionHelp',description:'correctionDescription',operation:true},
    'new-source':{help:'sourceHelp',description:'sourceDescription',operation:true,source:true},
    duplicate:{help:'duplicateHelp',description:'duplicateDescription',operation:true,second:true},
    'historical-dispute':{help:'disputeHelp',description:'disputeDescription',operation:true},
    'place-name':{help:'placeHelp',description:'placeDescription',optional:true,place:true}
  };
  function adapt(){
    const config=types[$('kind').value];
    const show=(group,fields,visible,required=false)=>{
      $(group).hidden=!visible;
      for(const id of fields){$(id).disabled=!visible;$(id).required=visible && required;}
    };
    show('operation-group',['operation'],!!(config.operation||config.optional),!!config.operation);
    show('second-operation-group',['second-operation'],!!config.second,!!config.second);
    show('event-group',['event-date','event-place'],!!config.event);
    show('place-group',['place-name'],!!config.place,!!config.place);
    $('citation').required=!!config.source;
    $('missing').disabled=!!config.source;$('missing').hidden=!!config.source;
    document.querySelector('label[for="missing"]').hidden=!!config.source;
    $('operation-label').textContent=t(config.optional?'optionalOperation':'relatedOperation');
    $('kind-help').textContent=t(config.help);
    document.querySelector('label[for="description"]').textContent=t(config.description);
    for(const id of ['operation','second-operation']) {
      $(id).options[0].textContent=t('chooseOperation');
      for(const option of Array.from($(id).options).slice(1)) {
        const op=operations.get(option.value);
        const name=lang==='ar' && typeof I18N_TITLES_AR!=='undefined' && I18N_TITLES_AR[op.id]
          ? I18N_TITLES_AR[op.id] : op.nom_operation;
        option.textContent=`${op.id} — ${name}`;
      }
    }
    $('error').textContent=loadFailed && (config.operation||config.optional)?t('loadError'):'';
    $('review').hidden=true;markdown='';
  }
  function translate(){
    document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
    document.title=t('heading')+' · ALNOP';
    document.querySelectorAll('[data-t]').forEach(el=>el.textContent=t(el.dataset.t));
    $('language').textContent=lang==='fr'?'العربية':'Français';
    adapt();
  }
  $('language').addEventListener('click',()=>{lang=lang==='fr'?'ar':'fr';try{localStorage.setItem('aln_lang',lang);}catch{}translate();});
  $('proposal').addEventListener('input',()=>{$('review').hidden=true;});
  $('kind').addEventListener('change',adapt);
  const value=id=>$(id).value.trim();
  $('proposal').addEventListener('submit',event=>{
    event.preventDefault();
    const config=types[value('kind')];
    const fail=key=>{$('error').textContent=t(key);$('error').focus();};
    if((config.operation||config.optional) && (loadFailed ||
      (value('operation') && !operations.has(value('operation'))) || (config.operation && !value('operation'))))
      return fail(loadFailed?'loadError':'invalidOperation');
    if(config.second && !operations.has(value('second-operation')))return fail('invalidOperation');
    if(config.second && value('operation')===value('second-operation'))return fail('sameOperation');
    if(config.source && !value('citation'))return fail('sourceOnlyRequired');
    if (!value('citation') && !value('missing')) {
      $('error').textContent=t('sourceRequired');$('error').focus();return;
    }
    $('error').textContent='';
    const labels=I18N_CONTRIBUTE[lang];
    const fields=[];
    if((config.operation||config.optional) && value('operation'))fields.push(`${labels.relatedOperation}: ${value('operation')}`);
    if(config.second)fields.push(`${labels.secondOperation}: ${value('second-operation')}`);
    if(config.event){
      fields.push(labels.newHelp);
      if(value('event-date'))fields.push(`${labels.eventDate}: ${value('event-date')}`);
      if(value('event-place'))fields.push(`${labels.eventPlace}: ${value('event-place')}`);
    }
    if(config.place)fields.push(`${labels.placeName}: ${value('place-name')}`);
    markdown=`# ${value('title')}\n\n`+
      `${labels.kind}: ${$('kind').selectedOptions[0].textContent}\n\n${fields.join('\n\n')}\n\n`+
      `${labels[config.description]}\n${value('description')}\n\n${labels.citation}\n${value('citation')}\n\n`+
      (config.source?'':`${labels.missing}\n${value('missing')}\n\n`)+
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
  const id=parameters.get('id');
  translate();
  fetch('data/operations_fln_1954_1962.json').then(response=>{
    if(!response.ok)throw new Error('Dataset unavailable');return response.json();
  }).then(dataset=>{
    if(!Array.isArray(dataset.operations))throw new Error('Invalid dataset');
    operations=new Map(dataset.operations.map(op=>[op.id,op]));
    for(const op of dataset.operations)for(const select of [$('operation'),$('second-operation')]){
      const option=document.createElement('option');option.value=op.id;
      option.textContent=`${op.id} — ${op.nom_operation}`;select.append(option);
    }
    if(id && operations.has(id)){$('operation').value=id;$('kind').value='correction';}
    adapt();
  }).catch(()=>{loadFailed=true;adapt();});
})();
