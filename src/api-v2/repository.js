const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const files={operations:'operations.json',sources:'sources.json',places:'places.json',persons:'persons.json',organizations:'organizations.json',claims:'claims.json',territories:'territorial-units.json'};
// The HTTP service depends on this read interface, not on Git or a writable database.
class FileRepository {
  constructor(directory=path.join(process.cwd(),'docs/data/canonical')){this.directory=directory;this.snapshot=null;}
  load(){
    if(this.snapshot)return this.snapshot;
    const read=name=>fs.readFileSync(path.join(this.directory,name));
    const manifest=JSON.parse(read('dataset-manifest.json'));
    const snapshot={manifest};
    for(const [resource,name]of Object.entries(files)){
      const bytes=read(name);
      if(crypto.createHash('sha256').update(bytes).digest('hex')!==manifest.checksums[name])throw Error('Invalid published snapshot');
      const json=JSON.parse(bytes);
      snapshot[resource]=Array.isArray(json)?json:json.operations||json.entities||json.claims||json.territorial_units;
      if(!Array.isArray(snapshot[resource]))throw Error('Invalid collection');
    }
    this.snapshot=snapshot;return snapshot;
  }
}
module.exports={FileRepository};
