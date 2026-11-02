/**
 * Atlas Historique de l'ALN (1954-1962)
 * Application web interactive - Leaflet & moteur de recherche
 */

// Global State
const state = {
  operations: [],
  filteredOperations: [],
  selectedOpId: null,
  filters: {
    search: '',
    wilayas: new Set(),
    year: 'all',
    actionType: 'all'
  },
  charts: {
    years: null,
    wilayas: null,
    actions: null
  }
};

// Wilaya Definitions & Color Palette
const WILAYAS = [
  { id: 'W1', label: 'Wilaya I (Aurès)', color: '#c0392b', pattern: /Wilaya I|Zone I|Aurès|Nemencha/i },
  { id: 'W2', label: 'Wilaya II (Nord-Const.)', color: '#2c3e50', pattern: /Wilaya II|Zone II|Nord-Constantinois/i },
  { id: 'W3', label: 'Wilaya III (Kabylie)', color: '#27ae60', pattern: /Wilaya III|Zone III|Kabylie/i },
  { id: 'W4', label: 'Wilaya IV (Algérois)', color: '#16a085', pattern: /Wilaya IV|Zone IV|Algérois|Ouarsenis/i },
  { id: 'ZAA', label: 'Zone Autonome d\'Alger', color: '#e74c3c', pattern: /Zone autonome d'Alger|ZAA/i },
  { id: 'W5', label: 'Wilaya V (Oranie)', color: '#2980b9', pattern: /Wilaya V|Zone V|Oranie|ZAO/i },
  { id: 'W6', label: 'Wilaya VI (Sahara)', color: '#f39c12', pattern: /Wilaya VI|Zone VI|Sahara/i },
  { id: 'EMG', label: 'Base de l\'Est & EMG', color: '#d35400', pattern: /Base de l'Est|Armée des Frontières|EMG/i },
  { id: 'W7', label: '7e Wilaya (France)', color: '#8e44ad', pattern: /VII|7e|France|Fédération de France/i }
];

// Helper: Normalize string for search (removes accents & lowercases)
function normalizeString(str) {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Helper: Determine operation color & category
function getOperationCategory(op) {
  const w = op.wilaya_concernee || '';
  const r = (op.localisation && op.localisation.region_ou_ville) || '';

  if (/VII|7e|France|Fédération de France/i.test(w) || /France/i.test(r)) {
    return WILAYAS.find(item => item.id === 'W7');
  }
  if (/Zone autonome d'Alger|ZAA/i.test(w)) {
    return WILAYAS.find(item => item.id === 'ZAA');
  }
  if (/Base de l'Est|Armée des Frontières|EMG/i.test(w)) {
    return WILAYAS.find(item => item.id === 'EMG');
  }
  if (/Wilaya I\b|Zone I\b|Aurès|Nemencha/i.test(w)) {
    return WILAYAS.find(item => item.id === 'W1');
  }
  if (/Wilaya II\b|Zone II\b|Nord-Constantinois/i.test(w)) {
    return WILAYAS.find(item => item.id === 'W2');
  }
  if (/Wilaya III\b|Zone III\b|Kabylie/i.test(w)) {
    return WILAYAS.find(item => item.id === 'W3');
  }
  if (/Wilaya IV\b|Zone IV\b|Algérois|Ouarsenis/i.test(w)) {
    return WILAYAS.find(item => item.id === 'W4');
  }
  if (/Wilaya V\b|Zone V\b|Oranie|ZAO/i.test(w)) {
    return WILAYAS.find(item => item.id === 'W5');
  }
  if (/Wilaya VI\b|Zone VI\b|Sahara/i.test(w)) {
    return WILAYAS.find(item => item.id === 'W6');
  }
  return { id: 'OTHER', label: op.wilaya_concernee || 'Autre', color: '#c0392b' };
}

// --------------------------------------------------------------------------
// Leaflet Map Initialization & 100% Free Basemaps (No API Key Required)
// --------------------------------------------------------------------------
let map;
let markerClusterGroup;
const markerMap = new Map(); // opId -> L.Marker

const BASEMAP_CONFIGS = {
  osm: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      className: 'osm-tiles',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxZoom: 19
    }
  },
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    options: {
      className: 'topo-tiles',
      subdomains: 'abc',
      attribution: 'Relief: &copy; <a href="https://opentopomap.org" target="_blank">OpenTopoMap</a> (&copy; OSM, SRTM)',
      maxZoom: 17
    }
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      className: 'satellite-tiles',
      attribution: 'Imagerie &copy; <a href="https://www.esri.com" target="_blank">Esri</a>, USGS, Maxar',
      maxZoom: 18
    }
  }
};

let currentBasemap = 'osm';
let currentTileLayer = null;

function setBasemap(type) {
  if (!BASEMAP_CONFIGS[type]) type = 'osm';
  currentBasemap = type;

  if (currentTileLayer && map) {
    map.removeLayer(currentTileLayer);
  }

  const config = BASEMAP_CONFIGS[type];
  currentTileLayer = L.tileLayer(config.url, config.options);
  if (map) {
    currentTileLayer.addTo(map);
    currentTileLayer.bringToBack();
  }
}

function initMap() {
  // Center roughly on Algeria
  map = L.map('map', {
    center: [34.5, 3.5],
    zoom: 6,
    minZoom: 3,
    maxZoom: 18,
    zoomControl: false
  });

  // Zoom control at bottom right to avoid clutter
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // Load default free basemap (OpenStreetMap)
  setBasemap(currentBasemap);

  // Marker Cluster Group
  markerClusterGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 38,
    spiderfyOnMaxZoom: true,
    disableClusteringAtZoom: 14
  });
  map.addLayer(markerClusterGroup);

  // Force map invalidation to ensure tiles render immediately
  setTimeout(() => map.invalidateSize(), 50);
  setTimeout(() => map.invalidateSize(), 300);
  setTimeout(() => map.invalidateSize(), 1000);
}

// Update Map on Theme Switch (CSS filters handle tiles instantly)
function updateMapTheme() {
  if (map) {
    map.invalidateSize();
  }
}

// --------------------------------------------------------------------------
// Render Markers on Map
// --------------------------------------------------------------------------
function updateMapMarkers() {
  markerClusterGroup.clearLayers();
  markerMap.clear();

  state.filteredOperations.forEach(op => {
    const coords = op.localisation && op.localisation.coordonnees_approximatives;
    if (!coords || coords.latitude == null || coords.longitude == null) return;

    const cat = getOperationCategory(op);
    const color = cat.color;

    // Custom HTML Marker Icon
    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div class="custom-pin-marker" style="background-color: ${color};" title="${escapeHtml(op.nom_operation)}"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    const marker = L.marker([coords.latitude, coords.longitude], { icon: customIcon });

    // Marker Popup
    const popupContent = `
      <div style="font-family: Inter, sans-serif; min-width: 200px;">
        <span style="font-size: 11px; font-weight: 700; color: ${color}; text-transform: uppercase;">${escapeHtml(cat.label)}</span>
        <h4 style="margin: 4px 0 6px 0; font-size: 13px; font-weight: 700; line-height: 1.3;">${escapeHtml(op.nom_operation)}</h4>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">📅 ${op.date_debut || ''}</div>
        <button onclick="window.selectOperation('${op.id}')" style="background:${color}; color:#fff; border:none; border-radius:4px; padding:4px 8px; font-size:11px; font-weight:600; cursor:pointer; width:100%;">Consulter la fiche</button>
      </div>
    `;
    marker.bindPopup(popupContent);

    marker.on('click', () => {
      selectOperation(op.id, false);
    });

    markerMap.set(op.id, marker);
    markerClusterGroup.addLayer(marker);
  });

  // Invalidate map size after markers are updated
  if (map) {
    map.invalidateSize();
  }
}

// --------------------------------------------------------------------------
// Data Loading & Setup
// --------------------------------------------------------------------------
async function loadData() {
  try {
    const response = await fetch('data/operations_fln_1954_1962.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    
    state.operations = data.operations || [];
    state.filteredOperations = [...state.operations];
    
    setupFiltersUI();
    renderOperationsList();
    updateMapMarkers();
    updateResultsCount();
    setupCharts();

    // Invalidate map again once data is fully ready
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 200);
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    document.getElementById('results-count').innerHTML = `<span style="color:#ef4444;">Erreur de chargement des données.</span>`;
  }
}

// --------------------------------------------------------------------------
// UI Setup: Filter Controls
// --------------------------------------------------------------------------
function setupFiltersUI() {
  // 1. Wilaya Chips
  const wilayaContainer = document.getElementById('wilaya-chips');
  wilayaContainer.innerHTML = '';

  WILAYAS.forEach(w => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.dataset.wilayaId = w.id;
    chip.innerHTML = `<span class="chip-dot" style="background:${w.color};"></span>${escapeHtml(w.label)}`;
    
    chip.addEventListener('click', () => {
      if (state.filters.wilayas.has(w.id)) {
        state.filters.wilayas.delete(w.id);
        chip.classList.remove('active');
      } else {
        state.filters.wilayas.add(w.id);
        chip.classList.add('active');
      }
      applyFilters();
    });

    wilayaContainer.appendChild(chip);
  });

  // 2. Year Selector
  const yearButtons = document.querySelectorAll('.year-btn');
  yearButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      yearButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filters.year = btn.dataset.year;
      applyFilters();
    });
  });

  // 3. Action Types Select
  const actionSelect = document.getElementById('action-type-select');
  const actionTypesSet = new Set();
  state.operations.forEach(op => {
    if (op.type_action) {
      actionTypesSet.add(op.type_action.trim());
    }
  });

  const sortedActions = Array.from(actionTypesSet).sort();
  sortedActions.forEach(act => {
    const opt = document.createElement('option');
    opt.value = act;
    opt.textContent = act;
    actionSelect.appendChild(opt);
  });

  actionSelect.addEventListener('change', (e) => {
    state.filters.actionType = e.target.value;
    applyFilters();
  });

  // 4. Live Search Input
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('clear-search-btn');

  searchInput.addEventListener('input', (e) => {
    state.filters.search = e.target.value.trim();
    if (state.filters.search.length > 0) {
      clearBtn.classList.add('visible');
    } else {
      clearBtn.classList.remove('visible');
    }
    applyFilters();
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.filters.search = '';
    clearBtn.classList.remove('visible');
    applyFilters();
  });

  // 5. Reset Filters Button
  document.getElementById('reset-filters-btn').addEventListener('click', resetAllFilters);
}

// Reset all filters to default
function resetAllFilters() {
  state.filters.search = '';
  state.filters.wilayas.clear();
  state.filters.year = 'all';
  state.filters.actionType = 'all';

  document.getElementById('search-input').value = '';
  document.getElementById('clear-search-btn').classList.remove('visible');
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.year-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.year === 'all');
  });
  document.getElementById('action-type-select').value = 'all';

  applyFilters();
}

// --------------------------------------------------------------------------
// Filter Logic
// --------------------------------------------------------------------------
function applyFilters() {
  const normSearch = normalizeString(state.filters.search);

  state.filteredOperations = state.operations.filter(op => {
    // 1. Full-text search
    if (normSearch) {
      const matchName = normalizeString(op.nom_operation).includes(normSearch);
      const matchDesc = normalizeString(op.description).includes(normSearch);
      const matchLieu = normalizeString(op.localisation && op.localisation.region_ou_ville).includes(normSearch);
      const matchImpact = normalizeString(op.impact_strategique).includes(normSearch);
      const matchCmd = Array.isArray(op.commandement_aln) && 
        op.commandement_aln.some(c => normalizeString(c).includes(normSearch));
      const matchId = normalizeString(op.id).includes(normSearch);

      if (!matchName && !matchDesc && !matchLieu && !matchImpact && !matchCmd && !matchId) {
        return false;
      }
    }

    // 2. Wilaya Filter
    if (state.filters.wilayas.size > 0) {
      const cat = getOperationCategory(op);
      if (!state.filters.wilayas.has(cat.id)) {
        return false;
      }
    }

    // 3. Year Filter
    if (state.filters.year !== 'all') {
      const opYear = (op.date_debut || '').substring(0, 4);
      if (opYear !== state.filters.year) {
        return false;
      }
    }

    // 4. Action Type Filter
    if (state.filters.actionType !== 'all') {
      if ((op.type_action || '').trim() !== state.filters.actionType) {
        return false;
      }
    }

    return true;
  });

  renderOperationsList();
  updateMapMarkers();
  updateResultsCount();
  updateCharts();
}

// Update Result Count text
function updateResultsCount() {
  const countEl = document.getElementById('results-count');
  const mobileCountEl = document.getElementById('mobile-count');
  const total = state.operations.length;
  const filtered = state.filteredOperations.length;

  if (filtered === total) {
    countEl.textContent = `${total} opérations documentées`;
  } else {
    countEl.textContent = `${filtered} affichée${filtered > 1 ? 's' : ''} sur ${total}`;
  }

  if (mobileCountEl) {
    mobileCountEl.textContent = filtered;
  }
}

// --------------------------------------------------------------------------
// Render Operations List (Cards)
// --------------------------------------------------------------------------
function renderOperationsList() {
  const listContainer = document.getElementById('operations-list');
  listContainer.innerHTML = '';

  if (state.filteredOperations.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="8"/></svg>
        <h4>Aucune opération trouvée</h4>
        <p>Ajustez vos filtres de recherche ou réinitialisez la sélection.</p>
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();

  state.filteredOperations.forEach(op => {
    const cat = getOperationCategory(op);
    const card = document.createElement('div');
    card.className = `op-card ${state.selectedOpId === op.id ? 'selected' : ''}`;
    card.dataset.id = op.id;

    const region = (op.localisation && op.localisation.region_ou_ville) || '';
    const date = op.date_debut || '';

    card.innerHTML = `
      <div class="card-top">
        <span class="card-id">${escapeHtml(op.id)}</span>
        <span class="card-badge" style="background-color: ${cat.color};">${escapeHtml(cat.label)}</span>
      </div>
      <div class="card-title">${escapeHtml(op.nom_operation)}</div>
      <div class="card-meta">
        <span class="card-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${escapeHtml(date)}
        </span>
        ${region ? `
          <span class="card-meta-item" title="${escapeHtml(region)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${escapeHtml(region.length > 28 ? region.substring(0, 26) + '...' : region)}
          </span>
        ` : ''}
      </div>
      ${op.type_action ? `<span class="card-action-type">${escapeHtml(op.type_action)}</span>` : ''}
    `;

    card.addEventListener('click', () => {
      // If on mobile, switch to map view when card is clicked
      if (window.innerWidth <= 900) {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('mobile-open');
        document.getElementById('tab-map-btn').classList.add('active');
        document.getElementById('tab-list-btn').classList.remove('active');
      }
      selectOperation(op.id, true);
    });

    fragment.appendChild(card);
  });

  listContainer.appendChild(fragment);
}

// --------------------------------------------------------------------------
// Select Operation & Show Details Drawer
// --------------------------------------------------------------------------
function selectOperation(opId, zoomToMap = true) {
  state.selectedOpId = opId;

  document.querySelectorAll('.op-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.id === opId);
  });

  const op = state.operations.find(o => o.id === opId);
  if (!op) return;

  const cat = getOperationCategory(op);
  const drawer = document.getElementById('detail-drawer');
  const drawerContent = document.getElementById('drawer-content');
  const drawerId = document.getElementById('drawer-id');
  const drawerWilaya = document.getElementById('drawer-wilaya');

  drawerId.textContent = op.id;
  drawerWilaya.textContent = cat.label;
  drawerWilaya.style.backgroundColor = cat.color;

  const loc = op.localisation || {};
  const coords = loc.coordonnees_approximatives || {};
  const hasCoords = coords.latitude != null && coords.longitude != null;
  const coordsStr = hasCoords ? `${coords.latitude.toFixed(4)}°N, ${coords.longitude.toFixed(4)}°E` : 'Non renseignées';
  const osmUrl = hasCoords ? `https://www.openstreetmap.org/?mlat=${coords.latitude}&mlon=${coords.longitude}#map=13/${coords.latitude}/${coords.longitude}` : '#';

  const commanders = Array.isArray(op.commandement_aln) && op.commandement_aln.length > 0
    ? op.commandement_aln.join(', ')
    : 'Non précisé';

  const losses = op.bilan_et_pertes || {};

  const sourcesList = Array.isArray(op.sources) && op.sources.length > 0
    ? op.sources.map(s => `
        <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" class="source-item" title="Consulter la source">
          <div>
            <div class="source-title">${escapeHtml(s.titre || s.url)}</div>
          </div>
          <span class="source-badge">${escapeHtml(s.type_source || 'Archive/Lien')} ↗</span>
        </a>
      `).join('')
    : '<p style="font-size:0.85rem; color:var(--text-dim);">Sources documentaires compilées dans l\'inventaire d\'archive.</p>';

  drawerContent.innerHTML = `
    <h2 class="drawer-title">${escapeHtml(op.nom_operation)}</h2>

    <div class="drawer-meta-grid">
      <div class="meta-block">
        <span class="meta-block-label">Date de début</span>
        <span class="meta-block-value">📅 ${escapeHtml(op.date_debut || 'Inconnue')}</span>
      </div>
      <div class="meta-block">
        <span class="meta-block-label">Date de fin</span>
        <span class="meta-block-value">${op.date_fin ? '📅 ' + escapeHtml(op.date_fin) : 'Action ponctuelle'}</span>
      </div>
      <div class="meta-block">
        <span class="meta-block-label">Localisation</span>
        <span class="meta-block-value">📍 ${escapeHtml(loc.region_ou_ville || 'Non précisée')}</span>
      </div>
      <div class="meta-block">
        <span class="meta-block-label">Coordonnées GPS</span>
        <span class="meta-block-value">
          ${hasCoords ? `<a href="${osmUrl}" target="_blank" rel="noopener" style="color:var(--accent-blue); text-decoration:none;">${coordsStr} ↗</a>` : coordsStr}
        </span>
      </div>
      <div class="meta-block" style="grid-column: span 2;">
        <span class="meta-block-label">Commandement ALN</span>
        <span class="meta-block-value">🎖️ ${escapeHtml(commanders)}</span>
      </div>
      <div class="meta-block" style="grid-column: span 2;">
        <span class="meta-block-label">Type d'action militaire</span>
        <span class="meta-block-value"><span class="card-action-type">${escapeHtml(op.type_action || 'Non qualifié')}</span></span>
      </div>
    </div>

    <div>
      <div class="section-label">
        <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        Description historique & déroulement
      </div>
      <div class="description-text">${escapeHtml(op.description || 'Description détaillée en cours de documentation.')}</div>
    </div>

    ${op.impact_strategique ? `
      <div>
        <div class="section-label">
          <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Portée & impact stratégique
        </div>
        <div class="impact-box">${escapeHtml(op.impact_strategique)}</div>
      </div>
    ` : ''}

    <div>
      <div class="section-label">
        <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
        Bilan humain & pertes estimées
      </div>
      <table class="losses-table">
        <tr><th>Partie</th><th>Bilan / Pertes</th></tr>
        <tr><td><strong>ALN (Moudjahidine)</strong></td><td>${escapeHtml(losses.aln || 'Non chiffré')}</td></tr>
        <tr><td><strong>Forces coloniales</strong></td><td>${escapeHtml(losses.forces_francaises || 'Non chiffré')}</td></tr>
        <tr><td><strong>Civils</strong></td><td>${escapeHtml(losses.civils || 'Non chiffré')}</td></tr>
      </table>
    </div>

    <div>
      <div class="section-label">
        <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        Sources & références historiographiques (${Array.isArray(op.sources) ? op.sources.length : 0})
      </div>
      <div class="sources-list">${sourcesList}</div>
    </div>
  `;

  drawer.classList.add('open');

  // Zoom to Marker on Map if requested
  if (zoomToMap && hasCoords) {
    map.setView([coords.latitude, coords.longitude], 11, { animate: true, duration: 0.8 });
    const marker = markerMap.get(op.id);
    if (marker) {
      setTimeout(() => marker.openPopup(), 400);
    }
  }
}
window.selectOperation = selectOperation;

// --------------------------------------------------------------------------
// Statistics Modal & Chart.js Integration
// --------------------------------------------------------------------------
function setupCharts() {
  const ctxYears = document.getElementById('chart-years').getContext('2d');
  const ctxWilayas = document.getElementById('chart-wilayas').getContext('2d');
  const ctxActions = document.getElementById('chart-actions').getContext('2d');

  // 1. Data per Year
  const yearCounts = { '1954': 0, '1955': 0, '1956': 0, '1957': 0, '1958': 0, '1959': 0, '1960': 0, '1961': 0, '1962': 0 };
  state.operations.forEach(op => {
    const y = (op.date_debut || '').substring(0, 4);
    if (yearCounts[y] !== undefined) yearCounts[y]++;
  });

  state.charts.years = new Chart(ctxYears, {
    type: 'bar',
    data: {
      labels: Object.keys(yearCounts),
      datasets: [{
        label: 'Opérations',
        data: Object.values(yearCounts),
        backgroundColor: '#3b82f6',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.06)' } }
      }
    }
  });

  // 2. Data per Wilaya
  const wilayaCounts = {};
  WILAYAS.forEach(w => { wilayaCounts[w.id] = 0; });
  state.operations.forEach(op => {
    const cat = getOperationCategory(op);
    if (wilayaCounts[cat.id] !== undefined) wilayaCounts[cat.id]++;
  });

  state.charts.wilayas = new Chart(ctxWilayas, {
    type: 'doughnut',
    data: {
      labels: WILAYAS.map(w => w.label),
      datasets: [{
        data: WILAYAS.map(w => wilayaCounts[w.id] || 0),
        backgroundColor: WILAYAS.map(w => w.color),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } } }
    }
  });

  // 3. Data per Action Type (Top 6)
  const actionCounts = {};
  state.operations.forEach(op => {
    const act = (op.type_action || 'Non qualifié').trim();
    actionCounts[act] = (actionCounts[act] || 0) + 1;
  });

  const sortedActions = Object.entries(actionCounts).sort((a,b) => b[1] - a[1]).slice(0, 7);

  state.charts.actions = new Chart(ctxActions, {
    type: 'bar',
    data: {
      labels: sortedActions.map(s => s[0]),
      datasets: [{
        label: 'Nombre d\'actions',
        data: sortedActions.map(s => s[1]),
        backgroundColor: '#06b6d4',
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.06)' } },
        y: { grid: { display: false }, ticks: { font: { size: 10 } } }
      }
    }
  });
}

function updateCharts() {
  if (!state.charts.years || !state.charts.wilayas || !state.charts.actions) return;
  const yearCounts = { '1954': 0, '1955': 0, '1956': 0, '1957': 0, '1958': 0, '1959': 0, '1960': 0, '1961': 0, '1962': 0 };
  state.filteredOperations.forEach(op => {
    const y = (op.date_debut || '').substring(0, 4);
    if (yearCounts[y] !== undefined) yearCounts[y]++;
  });
  state.charts.years.data.datasets[0].data = Object.values(yearCounts);
  state.charts.years.update();

  const wilayaCounts = {};
  WILAYAS.forEach(w => { wilayaCounts[w.id] = 0; });
  state.filteredOperations.forEach(op => {
    const cat = getOperationCategory(op);
    if (wilayaCounts[cat.id] !== undefined) wilayaCounts[cat.id]++;
  });
  state.charts.wilayas.data.datasets[0].data = WILAYAS.map(w => wilayaCounts[w.id] || 0);
  state.charts.wilayas.update();
}

// --------------------------------------------------------------------------
// Helper: HTML Escaping
// --------------------------------------------------------------------------
function escapeHtml(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --------------------------------------------------------------------------
// Event Listeners Initialization
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadData();

  // Desktop Sidebar Toggle
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggle-sidebar-btn');
  toggleBtn.addEventListener('click', () => {
    if (window.innerWidth <= 900) {
      sidebar.classList.toggle('mobile-open');
      const isMobileOpen = sidebar.classList.contains('mobile-open');
      document.getElementById('tab-list-btn').classList.toggle('active', isMobileOpen);
      document.getElementById('tab-map-btn').classList.toggle('active', !isMobileOpen);
    } else {
      sidebar.classList.toggle('collapsed');
    }
    setTimeout(() => map.invalidateSize(), 310);
  });

  // Mobile Tabs
  const tabMapBtn = document.getElementById('tab-map-btn');
  const tabListBtn = document.getElementById('tab-list-btn');

  if (tabMapBtn && tabListBtn) {
    tabMapBtn.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      tabMapBtn.classList.add('active');
      tabListBtn.classList.remove('active');
      setTimeout(() => map.invalidateSize(), 200);
    });

    tabListBtn.addEventListener('click', () => {
      sidebar.classList.add('mobile-open');
      tabListBtn.classList.add('active');
      tabMapBtn.classList.remove('active');
    });
  }

  // Drawer Close
  document.getElementById('close-drawer-btn').addEventListener('click', () => {
    document.getElementById('detail-drawer').classList.remove('open');
    state.selectedOpId = null;
    document.querySelectorAll('.op-card').forEach(c => c.classList.remove('selected'));
  });

  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('aln-dataset-theme', newTheme);
    updateMapTheme();
  });

  const savedTheme = localStorage.getItem('aln-dataset-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  // Basemap Selector (100% Free - No API Key Needed)
  const basemapSelect = document.getElementById('basemap-select');
  if (basemapSelect) {
    basemapSelect.addEventListener('change', (e) => {
      setBasemap(e.target.value);
    });
  }

  // Recenter Buttons
  document.getElementById('btn-recenter-algeria').addEventListener('click', () => {
    map.setView([34.5, 3.5], 6);
  });
  document.getElementById('btn-recenter-france').addEventListener('click', () => {
    map.setView([46.8, 2.5], 6);
  });

  // Legend Toggle
  const legend = document.getElementById('map-legend');
  document.getElementById('btn-toggle-legend').addEventListener('click', () => {
    legend.classList.toggle('hidden');
  });
  document.getElementById('close-legend-btn').addEventListener('click', () => {
    legend.classList.add('hidden');
  });

  // Stats Modal
  const statsModal = document.getElementById('stats-modal');
  document.getElementById('stats-btn').addEventListener('click', () => {
    statsModal.classList.add('open');
  });
  document.getElementById('close-stats-btn').addEventListener('click', () => {
    statsModal.classList.remove('open');
  });
  statsModal.addEventListener('click', (e) => {
    if (e.target === statsModal) statsModal.classList.remove('open');
  });

  // Export Dropdown Menu
  const exportBtn = document.getElementById('export-dropdown-btn');
  const exportMenu = document.getElementById('export-menu');
  exportBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    exportMenu.classList.toggle('show');
  });
  document.addEventListener('click', () => {
    exportMenu.classList.remove('show');
  });

  // Global window resize listener to keep map sharp
  window.addEventListener('resize', () => {
    if (map) map.invalidateSize();
  });
  window.addEventListener('load', () => {
    if (map) map.invalidateSize();
  });
});
