/**
 * ALNOP REST API v1 — Automated Test Suite
 * Tests handler contracts, filtering, pagination, and regressions (ALNOP-001, ALNOP-002, ALNOP-003).
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

// Handlers
const operationsHandler = require('../api/v1/operations.js');
const singleOpHandler = require('../api/v1/operations/[id].js');
const statsHandler = require('../api/v1/stats.js');
const wilayasHandler = require('../api/v1/wilayas.js');

/**
 * Helper to create a mock HTTP Response object.
 */
function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    end(data) {
      this.body = data || null;
      return this;
    }
  };
}

describe('ALNOP API v1 — Regression & Contract Test Suite', () => {

  describe('ALNOP-001 Regression: Single operation via query param (?id=)', () => {
    test('GET /api/v1/operations?id=OP_1954_001 returns 200 and valid operation object (not 500)', () => {
      const req = { method: 'GET', query: { id: 'OP_1954_001' } };
      const res = createMockRes();

      operationsHandler(req, res);

      assert.equal(res.statusCode, 200, 'Expected HTTP 200 OK');
      assert.ok(res.body, 'Expected a non-empty response body');
      assert.equal(res.body.meta?.status, 'success');
      assert.equal(res.body.meta?.total, 1);
      assert.equal(res.body.meta?.count, 1);
      assert.ok(res.body.data, 'Expected data payload');
      assert.equal(res.body.data.id, 'OP_1954_001');
      assert.equal(res.body.meta?.applied_filters?.id, 'OP_1954_001');
    });

    test('GET /api/v1/operations?id=UNKNOWN_ID returns 404 Not Found', () => {
      const req = { method: 'GET', query: { id: 'OP_9999_999' } };
      const res = createMockRes();

      operationsHandler(req, res);

      assert.equal(res.statusCode, 404, 'Expected HTTP 404 Not Found');
      assert.equal(res.body?.status, 'error');
    });

    test('GET /api/v1/operations?id=aln-1954-001 handles aliases/normalization smoothly', () => {
      const req = { method: 'GET', query: { id: 'aln-1954-001' } };
      const res = createMockRes();

      operationsHandler(req, res);

      assert.equal(res.statusCode, 200, 'Expected HTTP 200 OK for normalized alias');
      assert.equal(res.body?.data?.id, 'OP_1954_001');
    });

    test('GET /api/v1/operations/:id via direct handler returns 200 and matches query route', () => {
      const req = { method: 'GET', query: { id: 'OP_1954_001' } };
      const res = createMockRes();

      singleOpHandler(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body?.data?.id, 'OP_1954_001');
      assert.equal(res.body?.data?.wilaya_code, 'W1');
    });

    test('GET /api/v1/operations/:id with missing ID returns 400 Bad Request', () => {
      const req = { method: 'GET', query: {} };
      const res = createMockRes();

      singleOpHandler(req, res);

      assert.equal(res.statusCode, 400);
      assert.equal(res.body?.status, 'error');
    });
  });

  describe('Operations Collection & Filtering', () => {
    test('GET /api/v1/operations returns full collection with default pagination', () => {
      const req = { method: 'GET', query: {} };
      const res = createMockRes();

      operationsHandler(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.meta?.status, 'success');
      assert.equal(res.body.meta?.total, 263, 'Dataset should contain 263 total operations');
      assert.equal(res.body.meta?.page, 1);
      assert.equal(res.body.meta?.limit, 50);
      assert.equal(res.body.data.length, 50);
    });

    test('GET /api/v1/operations?year=1954 filters accurately', () => {
      const req = { method: 'GET', query: { year: '1954' } };
      const res = createMockRes();

      operationsHandler(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.meta?.total, 11, 'Year 1954 should have 11 operations');
      assert.equal(res.body.data.length, 11);
      assert.ok(res.body.data.every(op => op.annee === 1954 || (op.date_debut && op.date_debut.startsWith('1954'))));
    });

    test('GET /api/v1/operations?format=geojson returns GeoJSON FeatureCollection', () => {
      const req = { method: 'GET', query: { format: 'geojson' } };
      const res = createMockRes();

      operationsHandler(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.headers['content-type'], 'application/geo+json; charset=utf-8');
      assert.equal(res.body.type, 'FeatureCollection');
      assert.ok(Array.isArray(res.body.features));
      assert.equal(res.body.features.length, 263);
    });
  });

  describe('Stats & Wilayas Endpoints', () => {
    test('GET /api/v1/stats returns computed statistics matching total dataset count', () => {
      const req = { method: 'GET', query: {} };
      const res = createMockRes();

      statsHandler(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.meta?.status, 'success');
      assert.equal(res.body.data?.total_operations, 263);
      assert.ok(res.body.data?.by_year);
      assert.ok(res.body.data?.by_wilaya);
    });

    test('GET /api/v1/wilayas returns 10 historical wilayas & autonomous zones', () => {
      const req = { method: 'GET', query: {} };
      const res = createMockRes();

      wilayasHandler(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.meta?.status, 'success');
      assert.equal(res.body.meta?.total, 10);
      assert.equal(res.body.data?.length, 10);
    });
  });

  describe('HTTP Protocol & Methods', () => {
    test('OPTIONS request returns 204 No Content with CORS headers', () => {
      const req = { method: 'OPTIONS' };
      const res = createMockRes();

      operationsHandler(req, res);

      assert.equal(res.statusCode, 204);
      assert.equal(res.headers['access-control-allow-origin'], '*');
    });

    test('POST request returns 405 Method Not Allowed', () => {
      const req = { method: 'POST' };
      const res = createMockRes();

      operationsHandler(req, res);

      assert.equal(res.statusCode, 405);
      assert.equal(res.body?.status, 'error');
    });
  });

});
