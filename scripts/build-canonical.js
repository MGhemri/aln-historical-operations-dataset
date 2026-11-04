const fs = require('node:fs');
const path = require('node:path');
const {readCorpus,validateCorpus,restoreLegacy,stable,hash,root} = require('../src/canonical');
function artifacts(corpus) {
  const report = validateCorpus(corpus);
  if (report.errors.length) throw new Error(report.errors.join('\n'));
  const published=corpus.operations.filter(o=>o.editorial_status==='published').sort((a,b)=>a.id.localeCompare(b.id));
  const geo = {type:'FeatureCollection',features:published.map(o=>({type:'Feature',id:o.id,
    geometry:o.locations[0].geometry,properties:{id:o.id,title:o.title,geometry_role:o.locations[0].geometry_role,
      quality_flags:o.quality_flags,source_ids:o.source_ids}}))};
  const csvCell = v => '"'+String(v ?? '').replace(/"/g,'""')+'"';
  const csv = [['id','title_fr','date_earliest','date_latest','date_precision','geometry_role','source_ids'],
    ...published.map(o=>[o.id,o.title.fr,o.start_date.earliest,o.start_date.latest,o.start_date.precision,
      o.locations[0].geometry_role,o.source_ids.join(';')])].map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n';
  const out={'operations.json':stable({schema_version:'2.0.0',corpus_is_incomplete:true,operations:published}),
    'legacy.json':stable(restoreLegacy(corpus)),'operations.geojson':stable(geo),'operations.csv':csv,
    'quality-report.json':stable(report),
    'quality-report.md':`# Qualité du corpus ALNOP\n\n${report.errors.length} erreurs bloquantes ; ${report.warnings.length} avertissements.\n\n`+
      report.warnings.map(w=>`- ${w.id}: ${w.code}`).join('\n')+'\n'};
  out['dataset-manifest.json']=stable({schema_version:'2.0.0',publication_status:'preview_not_a_release',
    source_commit:corpus.metadata.source_commit,corpus_is_incomplete:true,total:published.length,
    checksums:Object.fromEntries(Object.entries(out).map(([name,content])=>[name,hash(content)]))});
  return out;
}
function run(check=process.argv.includes('--check')) {
  const files=artifacts(readCorpus());
  const directory=path.join(root,'generated');
  if (!check) fs.mkdirSync(directory,{recursive:true});
  for (const [name,content] of Object.entries(files)) {
    const target=path.join(directory,name);
    if (check) {
      if (!fs.existsSync(target) || fs.readFileSync(target,'utf8')!==content) throw new Error(`Stale artifact: ${name}`);
    } else fs.writeFileSync(target,content);
  }
  console.log(check?'Canonical exports match.':'Canonical preview exports generated.');
}
if (require.main===module) run();
module.exports={artifacts,run};
