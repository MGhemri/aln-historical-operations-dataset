// Phase 0: explicit reference capture. Never run automatically to accept a regression.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
const files = ['operations_fln_1954_1962.json', 'operations_fln_1954_1962.geojson',
  'docs/data/operations_fln_1954_1962.json', 'docs/data/operations_fln_1954_1962.geojson'];
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const cases = [
  ['operations', {}], ['operations', {page:'2', limit:'20'}],
  ['operations', {year:'1954'}], ['operations', {wilaya:'W3'}],
  ['operations', {q:'Kabylie'}], ['operations', {format:'geojson'}],
  ['operations', {id:'OP_1954_001'}], ['operations', {id:'UNKNOWN'}],
  ['operations', {page:'0'}], ['operations', {limit:'301'}],
  ['operations', {date_from:'1962', date_to:'1954'}],
  ['operations', {sort:'invalid'}], ['operations', {format:'xml'}],
  ['operations', {q:'NO_MATCH_SYNTHETIC_938273'}],
  ['operations/[id]', {id:'OP_1954_001'}], ['operations/[id]', {}],
  ['stats', {}], ['wilayas', {}], ['index', {}],
  ['operations', {}, 'OPTIONS'], ['operations', {}, 'POST']
];
function capture(handler, query, method = 'GET') {
  const res = {statusCode:200, headers:{}, body:null,
    status(code) {this.statusCode=code; return this;},
    setHeader(key,value) {this.headers[key.toLowerCase()]=value;},
    json(body) {this.body=body; return this;},
    end(body) {this.body=body ?? null; return this;}};
  require(path.join(root, 'api/v1', handler))({method,query},res);
  // Only known volatile envelope fields; preserve historical dataset timestamps.
  if (res.body?.meta) delete res.body.meta.timestamp;
  if (res.body?.properties) delete res.body.properties.generated_at;
  return {status:res.statusCode, headers:res.headers, body_sha256:digest(JSON.stringify(res.body))};
}
function snapshot() {
  const dataset = JSON.parse(fs.readFileSync(path.join(root,files[0]),'utf8'));
  // Git may convert line endings on Windows; compare content with LF everywhere.
  return {files:Object.fromEntries(files.map(file=>[file,digest(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n')))])),
    ids:dataset.operations.map(op=>op.id),
    contracts:cases.map(([handler,query,method='GET'])=>({handler,query,method,...capture(handler,query,method)}))};
}
if (require.main === module) fs.writeFileSync(path.join(root,'tests/baselines/v1.json'),JSON.stringify(snapshot(),null,2)+'\n');
module.exports = {snapshot,capture};
