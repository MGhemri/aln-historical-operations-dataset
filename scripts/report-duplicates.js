const fs=require('node:fs'),path=require('node:path');
const {readCorpus,validateCorpus,root,stable}=require('../src/canonical');
const {duplicateReport}=require('../src/duplicates');
function run(){
  const corpus=readCorpus(),validation=validateCorpus(corpus);
  if(validation.errors.length)throw Error(validation.errors.join('\n'));
  const report=duplicateReport(corpus.operations);
  const directory=path.join(root,'work');fs.mkdirSync(directory,{recursive:true});
  fs.writeFileSync(path.join(directory,'duplicate-candidates.json'),stable(report));
  fs.writeFileSync(path.join(directory,'duplicate-candidates.md'),'# Correspondances possibles à examiner\n\n'+report.notice+'\n\n'+
    report.candidates.map(c=>`- ${c.ids.join(' / ')} : similarité du titre ${c.factors.title_trigram_similarity} ; chevauchement des dates ${c.factors.start_intervals_overlap??'inconnu'} ; sites revus ${c.factors.reviewed_site_distance_km??'non comparables'} km`).join('\n')+'\n');
  console.log(`${report.candidates.length} candidate pairs; no records changed. Reports: work/duplicate-candidates.{json,md}`);
  return report;
}
if(require.main===module){try{run();}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={run};
