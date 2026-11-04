/**
 * ALNOP Dataset Deterministic Synchronization & Build Script (ALNOP-013)
 * Takes canonical operations_fln_1954_1962.json as the single source of truth,
 * generates standard GeoJSON RFC 7946, and synchronizes docs/data/ copies.
 */

const fs = require('fs');
const path = require('path');
const { toGeoJSON } = require('../api/v1/data-service');

const rootDir = path.join(__dirname, '..');
const canonicalJsonPath = path.join(rootDir, 'operations_fln_1954_1962.json');
const canonicalGeoJsonPath = path.join(rootDir, 'operations_fln_1954_1962.geojson');
const docsJsonPath = path.join(rootDir, 'docs/data/operations_fln_1954_1962.json');
const docsGeoJsonPath = path.join(rootDir, 'docs/data/operations_fln_1954_1962.geojson');

function syncDataset() {
  console.log('🔄 Commencing deterministic dataset synchronization...');

  if (!fs.existsSync(canonicalJsonPath)) {
    console.error(`❌ Error: Canonical JSON file not found at ${canonicalJsonPath}`);
    process.exit(1);
  }

  // 1. Read and parse canonical JSON
  const rawJson = fs.readFileSync(canonicalJsonPath, 'utf8');
  const parsed = JSON.parse(rawJson);
  const operations = Array.isArray(parsed) ? parsed : (parsed.operations || []);

  console.log(`✅ Loaded canonical source: ${operations.length} operations.`);

  // Canonical pretty formatting (2 spaces indentation, trailing newline)
  const canonicalFormattedJson = JSON.stringify(parsed, null, 2) + '\n';

  // 2. Generate deterministic GeoJSON RFC 7946
  const geojsonObj = toGeoJSON(operations);
  // Freeze generated_at timestamp to ensure deterministic byte-for-byte reproducibility
  geojsonObj.properties.generated_at = "1954-1962 (Historical Corpus Publication)";
  const formattedGeoJson = JSON.stringify(geojsonObj, null, 2) + '\n';

  // 3. Write GeoJSON at root
  fs.writeFileSync(canonicalGeoJsonPath, formattedGeoJson, 'utf8');
  console.log(`✅ Regenerated canonical GeoJSON: ${canonicalGeoJsonPath}`);

  // 4. Ensure docs/data directory exists
  const docsDataDir = path.join(rootDir, 'docs/data');
  if (!fs.existsSync(docsDataDir)) {
    fs.mkdirSync(docsDataDir, { recursive: true });
  }

  // 5. Synchronize docs/data copies
  fs.writeFileSync(docsJsonPath, canonicalFormattedJson, 'utf8');
  fs.writeFileSync(docsGeoJsonPath, formattedGeoJson, 'utf8');
  console.log(`✅ Synchronized mirror copy: ${docsJsonPath}`);
  console.log(`✅ Synchronized mirror copy: ${docsGeoJsonPath}`);

  console.log('🎉 Deterministic synchronization completed successfully (4/4 files aligned).');
}

if (require.main === module) {
  syncDataset();
}

module.exports = { syncDataset };
