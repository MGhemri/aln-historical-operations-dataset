const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const stable = value => JSON.stringify(value, null, 2) + '\n';
const root = path.join(__dirname, '..');
const ajv = new Ajv({allErrors:true, strict:true});
addFormats(ajv);
const validateSchema = ajv.compile(require('../schemas/operation.schema.json'));
const validateSource = ajv.compile(require('../schemas/source.schema.json'));
const validateTerritory = ajv.compile(require('../schemas/territorial-unit.schema.json'));
const validateDataset = ajv.compile(require('../schemas/dataset.schema.json'));
const validateVocabulary = ajv.compile(require('../schemas/vocabularies.schema.json'));

function dateBounds(raw) {
  if (!raw) return {earliest:null,latest:null,precision:'unknown',certainty:'unknown'};
  if (!/^\d{4}(-\d{2}){0,2}$/.test(raw)) throw new Error(`Invalid legacy date: ${raw}`);
  const parts=raw.split('-');
  const [y,m,d] = parts.map(Number);
  if((parts.length>=2 && (m<1||m>12)) || (parts.length===3 && (d<1||d>31)))throw new Error(`Invalid date: ${raw}`);
  const precision = d ? 'day' : m ? 'month' : 'year';
  const first = `${y}-${String(m || 1).padStart(2,'0')}-${String(d || 1).padStart(2,'0')}`;
  const lastDay = new Date(Date.UTC(y,m || 12,0)).getUTCDate();
  const last = d ? first : `${y}-${String(m || 12).padStart(2,'0')}-${lastDay}`;
  if (new Date(first).toISOString().slice(0,10) !== first) throw new Error(`Invalid date: ${raw}`);
  return {earliest:first,latest:last,precision,certainty:'unknown'};
}
function migrate(document, sourceCommit) {
  const sources = new Map();
  const seen = new Set();
  const operations = document.operations.map(op => {
    if (!/^[A-Za-z0-9_-]+$/.test(op.id) || seen.has(op.id)) throw new Error(`Unsafe or duplicate ID: ${op.id}`);
    seen.add(op.id);
    const source_ids = (op.sources || []).map(source => {
      // Exact objects only: no bibliographical identity inferred from similar URLs/names.
      const source_id = `SRC_${hash(JSON.stringify(source)).slice(0,24)}`;
      sources.set(source_id,{source_id,title:source.titre || null,legacy:source,review_status:'needs_review'});
      return source_id;
    });
    const coords = op.localisation?.coordonnees_approximatives;
    const geometry = coords?.longitude != null && coords?.latitude != null
      ? {type:'Point',coordinates:[coords.longitude,coords.latitude]} : null;
    return {id:op.id,schema_version:'2.0.0',title:{fr:op.nom_operation,ar:null},
      start_date:dateBounds(op.date_debut),end_date:dateBounds(op.date_fin),
      locations:[{label:op.localisation?.region_ou_ville || null,geometry,
        geometry_role:geometry ? 'representative_point' : 'unknown',review_status:'needs_review'}],
      territorial_assignments:[], legacy_territorial_label:op.wilaya_concernee || null,
      source_ids:[...new Set(source_ids)], editorial_status:'published',
      quality_flags:['legacy_import_needs_review','territorial_assignment_needs_review',
        ...(geometry ? ['representative_location_needs_review'] : ['uncertain_location']),
        ...(source_ids.length ? [] : ['missing_source'])],
      provenance:{source_commit:sourceCommit,publication_basis:'previously_public_legacy_corpus',
        human_review_recorded:false},legacy:op};
  });
  const territorial_units=require('../api/v1/data-service').WILAYAS.map(w=>({id:w.id,names:{fr:w.label_fr,ar:w.label_ar},
    type:'editorial_category',valid_from:null,valid_to:null,source_ids:[],review_status:'needs_review'})).sort((a,b)=>a.id.localeCompare(b.id));
  return {operations,sources:[...sources.values()].sort((a,b)=>a.source_id.localeCompare(b.source_id)),territorial_units,
    vocabularies:{event_types:[...new Set(document.operations.map(op=>op.type_action))].sort()},
    metadata:{schema_version:'2.0.0',source_commit:sourceCommit,dataset_metadata:document.dataset_metadata,
      legacy_order:document.operations.map(op=>op.id)}};
}
function validateCorpus(corpus) {
  const errors=[], warnings=[], ids=new Set(), sourceIds=new Set(),territoryIds=new Set();
  if(!validateDataset(corpus.metadata))errors.push(`Dataset metadata: ${ajv.errorsText(validateDataset.errors)}`);
  if(!validateVocabulary(corpus.vocabularies))errors.push(`Vocabularies: ${ajv.errorsText(validateVocabulary.errors)}`);
  for (const s of corpus.sources) {
    if (!validateSource(s)) {errors.push(`Source ${s?.source_id}: ${ajv.errorsText(validateSource.errors)}`);continue;}
    if (!s.source_id || sourceIds.has(s.source_id)) errors.push(`Duplicate/missing source: ${s.source_id}`);
    sourceIds.add(s.source_id);
    const url=s.url||s.legacy?.url;
    if(url){try{if(!['http:','https:'].includes(new URL(url).protocol))errors.push(`${s.source_id}: unsafe source URL`);}catch{errors.push(`${s.source_id}: invalid source URL`);}}
  }
  for(const t of corpus.territorial_units||[]){
    if(!validateTerritory(t)){errors.push(`Territory ${t?.id}: ${ajv.errorsText(validateTerritory.errors)}`);continue;}
    if(territoryIds.has(t.id))errors.push(`Duplicate territory: ${t.id}`);territoryIds.add(t.id);
    for(const id of t.source_ids||[])if(!sourceIds.has(id))errors.push(`${t.id}: missing source ${id}`);
    if(t.valid_from && t.valid_to && t.valid_from>t.valid_to)errors.push(`${t.id}: inverted validity`);
  }
  for (const op of corpus.operations) {
    if (!validateSchema(op)) {
      errors.push(`${op?.id}: ${ajv.errorsText(validateSchema.errors)}`);
      continue;
    }
    if (ids.has(op.id)) errors.push(`Duplicate operation: ${op.id}`);
    ids.add(op.id);
    if(op.legacy && op.legacy.id!==op.id)errors.push(`${op.id}: legacy identity mismatch`);
    for (const id of op.source_ids || []) if (!sourceIds.has(id)) errors.push(`${op.id}: missing source ${id}`);
    for(const t of op.territorial_assignments){
      if(!territoryIds.has(t.territory_id))errors.push(`${op.id}: unknown territory ${t.territory_id}`);
      for(const id of t.source_ids)if(!op.source_ids.includes(id))errors.push(`${op.id}: territorial evidence not among operation sources`);
    }
    if(op.territorial_assignments.filter(t=>t.role==='primary').length>1)errors.push(`${op.id}: multiple primary territories`);
    if(op.provenance.publication_basis==='previously_public_legacy_corpus'){
      try{
        const expected=migrate({dataset_metadata:{},operations:[op.legacy]},op.provenance.source_commit).operations[0];
        for(const key of ['title','start_date','end_date','locations','territorial_assignments','source_ids','legacy_territorial_label'])
          if(JSON.stringify(op[key])!==JSON.stringify(expected[key]))errors.push(`${op.id}: ${key} changed without a reviewed revision`);
      }catch{errors.push(`${op.id}: invalid legacy evidence`);}
      if(op.provenance.human_review_recorded)errors.push(`${op.id}: legacy import cannot claim a new review`);
    }else{
      for(const type of op.event_type)if(!Array.isArray(corpus.vocabularies?.event_types)||!corpus.vocabularies.event_types.includes(type))errors.push(`${op.id}: unknown event type ${type}`);
      if(op.editorial_status==='published' && (!op.provenance.human_review_recorded ||
          op.review_history.at(-1)?.decision!=='approved' || !op.source_ids.length))
        errors.push(`${op.id}: publication requires sources and an explicit approved review`);
      if(op.editorial_status==='published'&&!op.event_type.length)errors.push(`${op.id}: publication requires an event type from the controlled vocabulary`);
      if(op.editorial_status==='published'&&(!op.title.fr?.trim()||!op.description.fr?.trim()))errors.push(`${op.id}: publication through v1 requires reviewed French title and description`);
      if(op.editorial_status==='published')for(const id of op.source_ids){
        const source=corpus.sources.find(s=>s?.source_id===id);
        if(!source?.title?.trim())errors.push(`${op.id}: source ${id} needs a bibliographic title before publication`);
      }
      if(op.created_at>op.updated_at)errors.push(`${op.id}: inverted editorial timestamps`);
    }
    if (op.start_date?.earliest && op.end_date?.latest && op.start_date.earliest > op.end_date.latest)
      errors.push(`${op.id}: inverted dates`);
    for (const date of [op.start_date,op.end_date]) {
      if ((date.earliest===null)!==(date.latest===null) ||
          (date.earliest && date.latest && date.earliest>date.latest) ||
          (date.precision==='unknown' && (date.earliest!==null || date.latest!==null)))
        errors.push(`${op.id}: inconsistent date bounds`);
      if(date.precision!=='unknown' && !date.earliest)errors.push(`${op.id}: missing date bounds`);
      if(date.earliest && ['year','month','day'].includes(date.precision)){
        const raw=date.earliest.slice(0,date.precision==='year'?4:date.precision==='month'?7:10);
        const expected=dateBounds(raw);
        if(expected.earliest!==date.earliest || expected.latest!==date.latest)errors.push(`${op.id}: bounds disagree with date precision`);
      }
    }
    for (const location of op.locations || []) {
      const c=location.geometry?.coordinates;
      if((!c && location.geometry_role!=='unknown')||(c && location.geometry_role==='unknown'))errors.push(`${op.id}: geometry and role disagree`);
      if (c && (c.length!==2 || !c.every(Number.isFinite) || Math.abs(c[0])>180 || Math.abs(c[1])>90))
        errors.push(`${op.id}: invalid WGS84 coordinates`);
    }
    for (const flag of op.quality_flags || []) warnings.push({id:op.id,code:flag});
  }
  return {errors,warnings};
}
function restoreLegacy(corpus) {
  const byId = new Map(corpus.operations.map(op=>[op.id,op]));
  return {dataset_metadata:corpus.metadata.dataset_metadata,
    operations:corpus.metadata.legacy_order.map(id=>{
      if (!byId.has(id)) throw new Error(`Missing original ID: ${id}`);
      return byId.get(id).legacy;
    })};
}
function readCorpus(directory=path.join(root,'data')) {
  const read = name => JSON.parse(fs.readFileSync(path.join(directory,name),'utf8'));
  const entries = (name,key='id') => fs.readdirSync(path.join(directory,name)).filter(n=>n.endsWith('.json')).sort()
    .map(n=>{const value=read(path.join(name,n));if(value[key]!==n.slice(0,-5))throw new Error(`Filename must equal ${key}: ${name}/${n}`);return value;});
  return {metadata:read('dataset.json'),operations:entries('operations'),sources:entries('sources','source_id'),
    territorial_units:entries('territorial-units'),vocabularies:read('vocabularies.json')};
}
module.exports = {migrate,dateBounds,validateCorpus,restoreLegacy,readCorpus,stable,hash,root};
