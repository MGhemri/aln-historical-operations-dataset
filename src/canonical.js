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

function dateBounds(raw) {
  if (!raw) return {earliest:null,latest:null,precision:'unknown',certainty:'unknown'};
  if (!/^\d{4}(-\d{2}){0,2}$/.test(raw)) throw new Error(`Invalid legacy date: ${raw}`);
  const [y,m,d] = raw.split('-').map(Number);
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
  return {operations,sources:[...sources.values()].sort((a,b)=>a.source_id.localeCompare(b.source_id)),
    metadata:{schema_version:'2.0.0',source_commit:sourceCommit,dataset_metadata:document.dataset_metadata,
      legacy_order:document.operations.map(op=>op.id)}};
}
function validateCorpus(corpus) {
  const errors=[], warnings=[], ids=new Set(), sourceIds=new Set();
  for (const s of corpus.sources) {
    if (!validateSource(s)) errors.push(`Source ${s.source_id}: ${ajv.errorsText(validateSource.errors)}`);
    if (!s.source_id || sourceIds.has(s.source_id)) errors.push(`Duplicate/missing source: ${s.source_id}`);
    sourceIds.add(s.source_id);
  }
  for (const op of corpus.operations) {
    if (!validateSchema(op)) {
      errors.push(`${op.id}: ${ajv.errorsText(validateSchema.errors)}`);
      continue;
    }
    if (ids.has(op.id)) errors.push(`Duplicate operation: ${op.id}`);
    ids.add(op.id);
    for (const id of op.source_ids || []) if (!sourceIds.has(id)) errors.push(`${op.id}: missing source ${id}`);
    if (op.start_date?.earliest && op.end_date?.latest && op.start_date.earliest > op.end_date.latest)
      errors.push(`${op.id}: inverted dates`);
    for (const date of [op.start_date,op.end_date]) {
      if ((date.earliest===null)!==(date.latest===null) ||
          (date.earliest && date.latest && date.earliest>date.latest) ||
          (date.precision==='unknown' && (date.earliest!==null || date.latest!==null)))
        errors.push(`${op.id}: inconsistent date bounds`);
    }
    for (const location of op.locations || []) {
      const c=location.geometry?.coordinates;
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
  const entries = name => fs.readdirSync(path.join(directory,name)).filter(n=>n.endsWith('.json')).sort()
    .map(n=>read(path.join(name,n)));
  return {metadata:read('dataset.json'),operations:entries('operations'),sources:entries('sources')};
}
module.exports = {migrate,dateBounds,validateCorpus,restoreLegacy,readCorpus,stable,hash,root};
