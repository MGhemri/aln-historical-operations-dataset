/**
 * FLN/ALN Operations Dataset (1954–1962)
 * Application web interactive - Leaflet, moteur de recherche & support bilingue (FR / العربية)
 */

// Global State
const state = {
  lang: localStorage.getItem('aln_lang') || 'fr',
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
  { id: 'ZAO', label: 'Zone Autonome d\'Oran (ZAO)', color: '#0ea5e9', pattern: /Zone Autonome d'Oran|ZAO/i },
  { id: 'W5', label: 'Wilaya V (Oranie)', color: '#2980b9', pattern: /Wilaya V|Zone V|Oranie/i },
  { id: 'W6', label: 'Wilaya VI (Sahara)', color: '#f39c12', pattern: /Wilaya VI|Zone VI|Sahara/i },
  { id: 'EMG', label: 'Base de l\'Est & EMG', color: '#d35400', pattern: /Base de l'Est|Armée des Frontières|EMG/i },
  { id: 'W7', label: '7e Wilaya (France)', color: '#8e44ad', pattern: /Fédération de France|7e Wilaya|Wilaya VII\b/i }
];

// --------------------------------------------------------------------------
// Localization & Translation Helpers
// --------------------------------------------------------------------------
function t(key, ...args) {
  if (typeof I18N_UI !== 'undefined' && I18N_UI[state.lang] && I18N_UI[state.lang][key] !== undefined) {
    const val = I18N_UI[state.lang][key];
    return typeof val === 'function' ? val(...args) : val;
  }
  if (typeof I18N_UI !== 'undefined' && I18N_UI.fr && I18N_UI.fr[key] !== undefined) {
    const val = I18N_UI.fr[key];
    return typeof val === 'function' ? val(...args) : val;
  }
  return '';
}

function getWilayaLabel(catId) {
  if (typeof I18N_WILAYAS !== 'undefined' && I18N_WILAYAS[catId]) {
    return state.lang === 'ar' ? I18N_WILAYAS[catId].ar : I18N_WILAYAS[catId].fr;
  }
  const w = WILAYAS.find(item => item.id === catId);
  return w ? w.label : catId;
}

function getOpTitle(op) {
  if (state.lang === 'ar' && typeof I18N_TITLES_AR !== 'undefined' && I18N_TITLES_AR[op.id]) {
    return I18N_TITLES_AR[op.id];
  }
  return op.nom_operation;
}

function getActionLabel(act) {
  if (!act) return state.lang === 'ar' ? 'غير مصنف' : 'Non qualifié';
  const trimmed = act.trim();
  if (state.lang === 'ar' && typeof I18N_ACTIONS !== 'undefined' && I18N_ACTIONS[trimmed]) {
    return I18N_ACTIONS[trimmed];
  }
  return trimmed;
}

function getSourceTypeLabel(st) {
  if (!st) return state.lang === 'ar' ? 'وثيقة / رابط' : 'Archive/Lien';
  const trimmed = st.trim();
  if (state.lang === 'ar' && typeof I18N_SOURCE_TYPES !== 'undefined' && I18N_SOURCE_TYPES[trimmed]) {
    return I18N_SOURCE_TYPES[trimmed];
  }
  return trimmed;
}

// Normalize string for search (removes French accents, Arabic diacritics, unifies alef/ya)
function normalizeString(str) {
  if (!str) return '';
  return str
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[يى]/g, 'ي')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Helper: Determine operation color & category
function getOperationCategory(op) {
  const w = op.wilaya_concernee || '';
  const r = (op.localisation && op.localisation.region_ou_ville) || '';

  let catId = 'OTHER';
  let color = '#c0392b';

  // 1. 7e Wilaya (Fédération de France) - strictly metropolitan France
  if (/Fédération de France|7e Wilaya|Wilaya VII\b/i.test(w) || (/France métropolitaine/i.test(r) && !/Algérie|Wilaya/i.test(w))) {
    catId = 'W7';
  } else if (/Zone Autonome d'Oran|\bZAO\b/i.test(w)) {
    catId = 'ZAO';
  } else if (/Zone autonome d'Alger|\bZAA\b/i.test(w)) {
    catId = 'ZAA';
  } else if (/^Armée des Frontières|^Base de l'Est/i.test(w)) {
    catId = 'EMG';
  } else if (/Wilaya I\b|Zone I\b|Aurès|Nemencha/i.test(w) && !/Wilaya II|Wilaya III|Wilaya IV|Wilaya V|Wilaya VI/i.test(w)) {
    catId = 'W1';
  } else if (/Wilaya II\b|Zone II\b|Nord-Constantinois|Constantine/i.test(w) && !/Wilaya I\b|Wilaya III\b|Wilaya IV\b|Wilaya V/i.test(w)) {
    catId = 'W2';
  } else if (/Wilaya III\b|Zone III\b|Kabylie/i.test(w) && !/Wilaya I\b|Wilaya II\b|Wilaya IV\b|Wilaya V/i.test(w)) {
    catId = 'W3';
  } else if (/Wilaya IV\b|Zone IV\b|Algérois|Ouarsenis/i.test(w) && !/Wilaya I\b|Wilaya II\b|Wilaya III\b|Wilaya V/i.test(w)) {
    catId = 'W4';
  } else if (/Wilaya V\b|Zone V\b|Oranie/i.test(w) && !/Wilaya I\b|Wilaya II\b|Wilaya III\b|Wilaya IV\b|Wilaya VI/i.test(w)) {
    catId = 'W5';
  } else if (/Wilaya VI\b|Zone VI\b|Sahara/i.test(w) && !/Wilaya I\b|Wilaya II\b|Wilaya III\b|Wilaya IV\b|Wilaya V/i.test(w)) {
    catId = 'W6';
  } else if (/Base de l'Est|Armée des Frontières|EMG/i.test(w)) {
    catId = 'EMG';
  } else if (/Wilaya I\b|Zone I\b/i.test(w)) {
    catId = 'W1';
  } else if (/Wilaya II\b|Zone II\b|Constantine/i.test(w)) {
    catId = 'W2';
  } else if (/Wilaya III\b|Zone III\b/i.test(w)) {
    catId = 'W3';
  } else if (/Wilaya IV\b|Zone IV\b/i.test(w)) {
    catId = 'W4';
  } else if (/Wilaya V\b|Zone V\b/i.test(w)) {
    catId = 'W5';
  } else if (/Wilaya VI\b|Zone VI\b/i.test(w)) {
    catId = 'W6';
  }

  const def = WILAYAS.find(item => item.id === catId);
  if (def) color = def.color;

  return {
    id: catId,
    label: getWilayaLabel(catId),
    color: color
  };
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
  map = L.map('map', {
    center: [34.5, 3.5],
    zoom: 6,
    minZoom: 3,
    maxZoom: 18,
    zoomControl: false
  });

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  setBasemap(currentBasemap);

  markerClusterGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 38,
    spiderfyOnMaxZoom: true,
    disableClusteringAtZoom: 14
  });
  map.addLayer(markerClusterGroup);

  setTimeout(() => map.invalidateSize(), 50);
  setTimeout(() => map.invalidateSize(), 300);
  setTimeout(() => map.invalidateSize(), 1000);
}

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

  const isAr = state.lang === 'ar';

  state.filteredOperations.forEach(op => {
    const coords = op.localisation && op.localisation.coordonnees_approximatives;
    if (!coords || coords.latitude == null || coords.longitude == null) return;

    const cat = getOperationCategory(op);
    const color = cat.color;
    const title = getOpTitle(op);
    const consultBtnText = isAr ? 'عرض البطاقة التفصيلية' : 'Consulter la fiche';

    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div class="custom-pin-marker" style="background-color: ${color};" title="${escapeHtml(title)}"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    const marker = L.marker([coords.latitude, coords.longitude], { icon: customIcon });

    const popupContent = `
      <div style="font-family: ${isAr ? 'Cairo, sans-serif' : 'Inter, sans-serif'}; min-width: 200px; text-align: ${isAr ? 'right' : 'left'}; direction: ${isAr ? 'rtl' : 'ltr'};">
        <span style="font-size: 11px; font-weight: 700; color: ${color}; text-transform: uppercase;">${escapeHtml(cat.label)}</span>
        <h4 style="margin: 4px 0 6px 0; font-size: 13px; font-weight: 700; line-height: 1.3;">${escapeHtml(title)}</h4>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">📅 ${escapeHtml(op.date_debut || '')}</div>
        <button onclick="window.selectOperation('${op.id}')" style="background:${color}; color:#fff; border:none; border-radius:4px; padding:4px 8px; font-size:11px; font-weight:600; cursor:pointer; width:100%; font-family:inherit;">${consultBtnText}</button>
      </div>
    `;
    marker.bindPopup(popupContent);

    marker.on('click', () => {
      selectOperation(op.id, false);
    });

    markerMap.set(op.id, marker);
    markerClusterGroup.addLayer(marker);
  });

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
    setLanguage(state.lang); // Sync bilingual labels and render everything
    setupCharts();

    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 200);
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    document.getElementById('results-count').innerHTML = `<span style="color:#ef4444;">${t('loadError') || 'Erreur de chargement des données.'}</span>`;
  }
}

// --------------------------------------------------------------------------
// UI Setup: Filter Controls
// --------------------------------------------------------------------------
function setupWilayaChips() {
  const wilayaContainer = document.getElementById('wilaya-chips');
  if (!wilayaContainer) return;
  wilayaContainer.innerHTML = '';

  WILAYAS.forEach(w => {
    const chip = document.createElement('button');
    chip.className = `chip ${state.filters.wilayas.has(w.id) ? 'active' : ''}`;
    chip.dataset.wilayaId = w.id;
    chip.innerHTML = `<span class="chip-dot" style="background:${w.color};"></span>${escapeHtml(getWilayaLabel(w.id))}`;
    
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
}

function updateActionTypeSelectOptions() {
  const actionSelect = document.getElementById('action-type-select');
  if (!actionSelect) return;
  const currentVal = state.filters.actionType;

  const actionTypesSet = new Set();
  state.operations.forEach(op => {
    if (op.type_action) {
      actionTypesSet.add(op.type_action.trim());
    }
  });

  const sortedActions = Array.from(actionTypesSet).sort();
  actionSelect.innerHTML = `<option value="all">${escapeHtml(t('allActionTypes'))}</option>`;
  sortedActions.forEach(act => {
    const opt = document.createElement('option');
    opt.value = act;
    opt.textContent = getActionLabel(act);
    if (act === currentVal) opt.selected = true;
    actionSelect.appendChild(opt);
  });
}

function setupFiltersUI() {
  setupWilayaChips();

  // Year Selector
  const yearButtons = document.querySelectorAll('.year-btn');
  yearButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      yearButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filters.year = btn.dataset.year;
      applyFilters();
    });
  });

  // Action Types Select
  const actionSelect = document.getElementById('action-type-select');
  updateActionTypeSelectOptions();

  actionSelect.addEventListener('change', (e) => {
    state.filters.actionType = e.target.value;
    applyFilters();
  });

  // Live Search Input
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

  // Reset Filters Button
  document.getElementById('reset-filters-btn').addEventListener('click', resetAllFilters);
}

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
    // 1. Full-text search (matches both French and Arabic terminology)
    if (normSearch) {
      const matchNameFr = normalizeString(op.nom_operation).includes(normSearch);
      const arTitle = (typeof I18N_TITLES_AR !== 'undefined' && I18N_TITLES_AR[op.id]) ? I18N_TITLES_AR[op.id] : '';
      const matchNameAr = normalizeString(arTitle).includes(normSearch);
      const matchDesc = normalizeString(op.description).includes(normSearch);
      const matchLieu = normalizeString(op.localisation && op.localisation.region_ou_ville).includes(normSearch);
      const matchImpact = normalizeString(op.impact_strategique).includes(normSearch);
      const matchCmd = Array.isArray(op.commandement_aln) && 
        op.commandement_aln.some(c => normalizeString(c).includes(normSearch));
      const matchId = normalizeString(op.id).includes(normSearch);

      if (!matchNameFr && !matchNameAr && !matchDesc && !matchLieu && !matchImpact && !matchCmd && !matchId) {
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

function updateResultsCount() {
  const countEl = document.getElementById('results-count');
  const mobileCountEl = document.getElementById('mobile-count');
  const total = state.operations.length;
  const filtered = state.filteredOperations.length;

  if (countEl) {
    if (filtered === 0) {
      countEl.textContent = t('resultsCountZero');
    } else {
      countEl.textContent = t('resultsCount', filtered, total);
    }
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

  const isAr = state.lang === 'ar';

  if (state.filteredOperations.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="8"/></svg>
        <h4>${isAr ? 'لم يتم العثور على أي عملية' : 'Aucune opération trouvée'}</h4>
        <p>${isAr ? 'يرجى تعديل معايير البحث أو إعادة ضبط خيارات التصفية.' : 'Ajustez vos filtres de recherche ou réinitialisez la sélection.'}</p>
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
    const title = getOpTitle(op);
    const actionLabel = getActionLabel(op.type_action);

    card.innerHTML = `
      <div class="card-top">
        <span class="card-id">${escapeHtml(op.id)}</span>
        <span class="card-badge" style="background-color: ${cat.color};">${escapeHtml(cat.label)}</span>
      </div>
      <div class="card-title">${escapeHtml(title)}</div>
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
      ${op.type_action ? `<span class="card-action-type">${escapeHtml(actionLabel)}</span>` : ''}
    `;

    card.addEventListener('click', () => {
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

  const isAr = state.lang === 'ar';
  const title = getOpTitle(op);

  drawerId.textContent = op.id;
  drawerWilaya.textContent = cat.label;
  drawerWilaya.style.backgroundColor = cat.color;

  const loc = op.localisation || {};
  const coords = loc.coordonnees_approximatives || {};
  const hasCoords = coords.latitude != null && coords.longitude != null;
  const notSpecified = isAr ? 'غير محدد' : 'Non renseignées';
  const coordsStr = hasCoords ? `${coords.latitude.toFixed(4)}°N, ${coords.longitude.toFixed(4)}°E` : notSpecified;
  const osmUrl = hasCoords ? `https://www.openstreetmap.org/?mlat=${coords.latitude}&mlon=${coords.longitude}#map=13/${coords.latitude}/${coords.longitude}` : '#';

  const commanders = Array.isArray(op.commandement_aln) && op.commandement_aln.length > 0
    ? op.commandement_aln.join(', ')
    : (isAr ? 'غير محدد في الأرشيف' : 'Non précisé');

  const losses = op.bilan_et_pertes || {};
  const actionLabel = getActionLabel(op.type_action);

  const sourcesCount = Array.isArray(op.sources) ? op.sources.length : 0;
  const sourcesList = sourcesCount > 0
    ? op.sources.map(s => `
        <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" class="source-item" title="${escapeHtml(s.titre || s.url)}">
          <div>
            <div class="source-title">${escapeHtml(s.titre || s.url)}</div>
          </div>
          <span class="source-badge">${escapeHtml(getSourceTypeLabel(s.type_source))} ↗</span>
        </a>
      `).join('')
    : `<p style="font-size:0.85rem; color:var(--text-dim);">${isAr ? 'مصادر وثائقية مسجلة في سجل الأرشيف الوطني.' : 'Sources documentaires compilées dans l\'inventaire d\'archive.'}</p>`;

  // Field Labels Localized
  const lblStartDate = isAr ? 'تاريخ البداية' : 'Date de début';
  const lblEndDate = isAr ? 'تاريخ النهاية' : 'Date de fin';
  const lblLoc = isAr ? 'الموقع الجغرافي' : 'Localisation';
  const lblGps = isAr ? 'إحداثيات GPS' : 'Coordonnées GPS';
  const lblCmd = isAr ? 'قيادة جيش التحرير' : 'Commandement ALN';
  const lblAction = isAr ? 'صنف العمل العسكري' : 'Type d\'action militaire';
  const valActionPonctuelle = isAr ? 'عملية محددة بيوم واحد' : 'Action ponctuelle';
  const valUnknownDate = isAr ? 'غير محدد' : 'Inconnue';

  const lblSecDesc = isAr ? 'السياق التاريخي ومجريات المعركة' : 'Description historique & déroulement';
  const lblSecImpact = isAr ? 'الأثر الاستراتيجي والسياسي' : 'Portée & impact stratégique';
  const lblSecLosses = isAr ? 'الحصيلة البشرية والخسائر التقديرية' : 'Bilan humain & pertes estimées';
  const lblSecSources = isAr ? `المصادر والمراجع التوثيقية (${sourcesCount})` : `Sources & références historiographiques (${sourcesCount})`;

  const thParty = isAr ? 'الطرف' : 'Partie';
  const thLosses = isAr ? 'الحصيلة / الخسائر' : 'Bilan / Pertes';
  const partyAln = isAr ? 'جيش التحرير الوطني (المجاهدون)' : 'ALN (Moudjahidine)';
  const partyFr = isAr ? 'القوات الاستعمارية الفرنسية' : 'Forces coloniales';
  const partyCiv = isAr ? 'الضحايا والمدنيون' : 'Civils';
  const unquantified = isAr ? 'غير مدرج بالأرقام' : 'Non chiffré';

  drawerContent.innerHTML = `
    <h2 class="drawer-title">${escapeHtml(title)}</h2>

    <div class="drawer-meta-grid">
      <div class="meta-block">
        <span class="meta-block-label">${lblStartDate}</span>
        <span class="meta-block-value">📅 ${escapeHtml(op.date_debut || valUnknownDate)}</span>
      </div>
      <div class="meta-block">
        <span class="meta-block-label">${lblEndDate}</span>
        <span class="meta-block-value">${op.date_fin ? '📅 ' + escapeHtml(op.date_fin) : valActionPonctuelle}</span>
      </div>
      <div class="meta-block">
        <span class="meta-block-label">${lblLoc}</span>
        <span class="meta-block-value">📍 ${escapeHtml(loc.region_ou_ville || notSpecified)}</span>
      </div>
      <div class="meta-block">
        <span class="meta-block-label">${lblGps}</span>
        <span class="meta-block-value">
          ${hasCoords ? `<a href="${osmUrl}" target="_blank" rel="noopener" style="color:var(--accent-blue); text-decoration:none;">${coordsStr} ↗</a>` : coordsStr}
        </span>
      </div>
      <div class="meta-block" style="grid-column: span 2;">
        <span class="meta-block-label">${lblCmd}</span>
        <span class="meta-block-value">🎖️ ${escapeHtml(commanders)}</span>
      </div>
      <div class="meta-block" style="grid-column: span 2;">
        <span class="meta-block-label">${lblAction}</span>
        <span class="meta-block-value"><span class="card-action-type">${escapeHtml(actionLabel)}</span></span>
      </div>
    </div>

    <div>
      <div class="section-label">
        <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        ${lblSecDesc}
      </div>
      <div class="description-text">${escapeHtml(op.description || (isAr ? 'جاري توثيق الوصف التاريخي الكامل.' : 'Description détaillée en cours de documentation.'))}</div>
    </div>

    ${op.impact_strategique ? `
      <div>
        <div class="section-label">
          <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          ${lblSecImpact}
        </div>
        <div class="impact-box">${escapeHtml(op.impact_strategique)}</div>
      </div>
    ` : ''}

    <div>
      <div class="section-label">
        <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
        ${lblSecLosses}
      </div>
      <table class="losses-table">
        <tr><th>${thParty}</th><th>${thLosses}</th></tr>
        <tr><td><strong>${partyAln}</strong></td><td>${escapeHtml(losses.aln || unquantified)}</td></tr>
        <tr><td><strong>${partyFr}</strong></td><td>${escapeHtml(losses.forces_francaises || unquantified)}</td></tr>
        <tr><td><strong>${partyCiv}</strong></td><td>${escapeHtml(losses.civils || unquantified)}</td></tr>
      </table>
    </div>

    <div>
      <div class="section-label">
        <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        ${lblSecSources}
      </div>
      <div class="sources-list">${sourcesList}</div>
    </div>
  `;

  drawer.classList.add('open');
  document.body.classList.add('drawer-open');

  if (zoomToMap && hasCoords) {
    map.setView([coords.latitude, coords.longitude], 11, { animate: true, duration: 0.8 });
    const marker = markerMap.get(op.id);
    if (marker) {
      setTimeout(() => marker.openPopup(), 400);
    }
  }
}
window.selectOperation = selectOperation;

function closeDrawer() {
  const drawer = document.getElementById('detail-drawer');
  if (drawer) drawer.classList.remove('open');
  document.body.classList.remove('drawer-open');
  state.selectedOpId = null;
  document.querySelectorAll('.op-card').forEach(c => c.classList.remove('selected'));
}

// --------------------------------------------------------------------------
// Statistics Modal & Chart.js Integration
// --------------------------------------------------------------------------
function setupCharts() {
  const ctxYearsEl = document.getElementById('chart-years');
  const ctxWilayasEl = document.getElementById('chart-wilayas');
  const ctxActionsEl = document.getElementById('chart-actions');

  if (!ctxYearsEl || !ctxWilayasEl || !ctxActionsEl) return;

  const ctxYears = ctxYearsEl.getContext('2d');
  const ctxWilayas = ctxWilayasEl.getContext('2d');
  const ctxActions = ctxActionsEl.getContext('2d');

  const isAr = state.lang === 'ar';

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
        label: isAr ? 'العمليات العسكرية' : 'Opérations',
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
      labels: WILAYAS.map(w => getWilayaLabel(w.id)),
      datasets: [{
        data: WILAYAS.map(w => wilayaCounts[w.id] || 0),
        backgroundColor: WILAYAS.map(w => w.color),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: { 
        legend: { 
          position: isAr ? 'left' : 'right', 
          labels: { 
            boxWidth: 10, 
            font: { size: 10, family: isAr ? 'Cairo, sans-serif' : 'Inter, sans-serif' } 
          } 
        } 
      }
    }
  });

  // 3. Data per Action Type (Top 7)
  const actionCounts = {};
  state.operations.forEach(op => {
    const act = (op.type_action || 'Non qualifié').trim();
    actionCounts[act] = (actionCounts[act] || 0) + 1;
  });

  const sortedActions = Object.entries(actionCounts).sort((a,b) => b[1] - a[1]).slice(0, 7);

  state.charts.actions = new Chart(ctxActions, {
    type: 'bar',
    data: {
      labels: sortedActions.map(s => getActionLabel(s[0])),
      datasets: [{
        label: isAr ? 'عدد العمليات' : 'Nombre d\'actions',
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
        y: { 
          grid: { display: false }, 
          ticks: { font: { size: 10, family: isAr ? 'Cairo, sans-serif' : 'Inter, sans-serif' } } 
        }
      }
    }
  });
}

function updateCharts() {
  if (!state.charts.years || !state.charts.wilayas || !state.charts.actions) return;

  const isAr = state.lang === 'ar';

  // Update Years
  const yearCounts = { '1954': 0, '1955': 0, '1956': 0, '1957': 0, '1958': 0, '1959': 0, '1960': 0, '1961': 0, '1962': 0 };
  state.filteredOperations.forEach(op => {
    const y = (op.date_debut || '').substring(0, 4);
    if (yearCounts[y] !== undefined) yearCounts[y]++;
  });
  state.charts.years.data.datasets[0].data = Object.values(yearCounts);
  state.charts.years.data.datasets[0].label = isAr ? 'العمليات العسكرية' : 'Opérations';
  state.charts.years.update();

  // Update Wilayas
  const wilayaCounts = {};
  WILAYAS.forEach(w => { wilayaCounts[w.id] = 0; });
  state.filteredOperations.forEach(op => {
    const cat = getOperationCategory(op);
    if (wilayaCounts[cat.id] !== undefined) wilayaCounts[cat.id]++;
  });
  state.charts.wilayas.data.labels = WILAYAS.map(w => getWilayaLabel(w.id));
  state.charts.wilayas.data.datasets[0].data = WILAYAS.map(w => wilayaCounts[w.id] || 0);
  state.charts.wilayas.options.plugins.legend.position = isAr ? 'left' : 'right';
  state.charts.wilayas.options.plugins.legend.labels.font.family = isAr ? 'Cairo, sans-serif' : 'Inter, sans-serif';
  state.charts.wilayas.update();

  // Update Actions
  const actionCounts = {};
  state.filteredOperations.forEach(op => {
    const act = (op.type_action || 'Non qualifié').trim();
    actionCounts[act] = (actionCounts[act] || 0) + 1;
  });
  const sortedActions = Object.entries(actionCounts).sort((a,b) => b[1] - a[1]).slice(0, 7);
  state.charts.actions.data.labels = sortedActions.map(s => getActionLabel(s[0]));
  state.charts.actions.data.datasets[0].data = sortedActions.map(s => s[1]);
  state.charts.actions.data.datasets[0].label = isAr ? 'عدد العمليات' : 'Nombre d\'actions';
  state.charts.actions.options.scales.y.ticks.font.family = isAr ? 'Cairo, sans-serif' : 'Inter, sans-serif';
  state.charts.actions.update();
}

function renderStatsModalTexts() {
  const isAr = state.lang === 'ar';
  const modalTitle = document.querySelector('#stats-modal .modal-title');
  if (modalTitle) modalTitle.textContent = isAr ? 'لوحة المؤشرات الإحصائية' : 'Tableau de bord statistique';

  const kpiLabels = document.querySelectorAll('#stats-modal .kpi-label');
  if (kpiLabels[0]) kpiLabels[0].textContent = isAr ? 'عملية عسكرية موثقة' : 'Opérations documentées';
  if (kpiLabels[1]) kpiLabels[1].textContent = isAr ? 'سنوات كفاح مسلح (1954–1962)' : 'Années de guerre (1954–1962)';
  if (kpiLabels[2]) kpiLabels[2].textContent = isAr ? 'ولايات تاريخية ومنطقتان مستقلتان' : 'Wilayas & Zones Autonomes (ZAA, ZAO)';
  if (kpiLabels[3]) kpiLabels[3].textContent = isAr ? 'مصادر متقاطعة ومحددة جغرافياً' : 'Sources croisées & géolocalisées';

  const chartTitles = document.querySelectorAll('#stats-modal .chart-title');
  if (chartTitles[0]) chartTitles[0].textContent = isAr ? 'التوزيع الزمني للعمليات العسكرية (1954–1962)' : 'Ventilation chronologique des opérations (1954–1962)';
  if (chartTitles[1]) chartTitles[1].textContent = isAr ? 'التوزيع حسب الولاية التاريخية / الجبهة' : 'Répartition par Wilaya historique';
  if (chartTitles[2]) chartTitles[2].textContent = isAr ? 'تصنيف العمليات العسكرية الهجومية' : 'Typologie des actions militaires offensives';
}

function renderMethodologyModal() {
  const isAr = state.lang === 'ar';
  const modalTitle = document.querySelector('#methodology-modal .modal-title');
  if (modalTitle) modalTitle.textContent = isAr ? 'المنهجية التاريخية والدقة العلمية للبحث' : 'Démarche Académique & Rigueur Méthodologique';

  const body = document.querySelector('#methodology-modal .methodology-body');
  if (!body) return;

  if (isAr) {
    body.innerHTML = `
      <div class="methodology-banner">
        <p class="methodology-lead">
          مشروع في إطار <strong>الإنسانيات الرقمية (Digital Humanities)</strong> يرصد، يصنف، ويوثق جغرافياً <strong>263 عملية عسكرية كبرى</strong> لجيش التحرير الوطني الجزائري (1954–1962). ترتكز المنهجية على التوثيق التاريخي الصارم، مقاطعة المصادر الأرشيفية والأكاديمية، والشفافية الجغرافية.
        </p>
      </div>

      <div class="methodology-grid">
        <div class="methodology-card">
          <div class="card-icon-title">
            <span class="step-num">1</span>
            <h3>من المناطق إلى الولايات التاريخية (1954–1962)</h3>
          </div>
          <p>تطور التنظيم الإقليمي للثورة عبر مراحل تاريخية رئيسية تحترمها قاعدة البيانات دون إسقاطات رجعية :</p>
          <ul class="methodology-list">
            <li><strong>نوفمبر 1954 :</strong> التقسيم الأولي إلى 5 مناطق تاريخية (الأوراس، الشمال القسنطيني، القبائل، العاصمة والوسط، الغرب الوهراني). تم إدراج أحداث ما قبل 20 أوت 1956 وفق مناطق الانطلاق.</li>
            <li><strong>أوت 1956 (مؤتمر الصومام) :</strong> مأسسة الولايات التاريخية الست وإنشاء <em>المنطقة المستقلة للعاصمة (ZAA)</em>.</li>
            <li><strong>1958–1960 :</strong> هيكلة فيدرالية جبهة التحرير بفرنسا (الولاية السابعة) والقواعد الخلفية (قاعدة الشرق وقاعدة الغرب).</li>
            <li><strong>ربيع 1962 :</strong> تأسيس <em>المنطقة المستقلة لوهران (ZAO)</em> تحت قيادة الرائد سي بختي لحماية الأحياء الجزائرية ومواجهة إرهاب المنظمة السرية (OAS) وتأمين الاستقلال.</li>
          </ul>
        </div>

        <div class="methodology-card">
          <div class="card-icon-title">
            <span class="step-num">2</span>
            <h3>المواقع المرجعية مقابل المواقع التكتيكية</h3>
          </div>
          <p>في سياق حرب عصابات ومناوشات غير متناظرة، تستند الإحداثيات الجغرافية إلى ميثاق علمي دقيق :</p>
          <ul class="methodology-list">
            <li><strong>تثبيت مكاني موثق :</strong> ترتبط كل نقطة GPS بمعلم بلدي، ممر جبلي (ثنية)، واد، أو جبل شاهق، دون ادعاء قياس متري مصطنع لكل اشتباك.</li>
            <li><strong>الحياد في الصحراء :</strong> رفض ترسيم حدود هندسية وهمية في الجنوب الكبير؛ عمليات تيميمون، ورقلة، تقرت، وجانت محددة بدقة متناهية وفق المراجع التاريخية.</li>
          </ul>
        </div>

        <div class="methodology-card">
          <div class="card-icon-title">
            <span class="step-num">3</span>
            <h3>وحدة التحليل والاحتياطات النقدية</h3>
          </div>
          <p>لتفادي المغالطات الإحصائية الشائعة في القوائم غير المعالجة :</p>
          <ul class="methodology-list">
            <li><strong>الوحدة التوثيقية :</strong> تمثل كل بطاقة وحدة تحليل تاريخية وقد تجمع عدة اشتباكات متتالية في نفس مسرح العمليات.</li>
            <li><strong>توحيد التسميات الطوبونيمية :</strong> توحيد الصيغ المختلفة للموقع نفسه (مثل معركة الغوالم وسيدي غالم في بطاقة موحدة).</li>
            <li><strong>الشفافية في تباين الروايات :</strong> توضيح أي تباين في التواريخ بين التقارير العسكرية ومذكرات قادة الثورة (مثل فلاوسن، بو عتروس، المرجى).</li>
          </ul>
        </div>

        <div class="methodology-card">
          <div class="card-icon-title">
            <span class="step-num">4</span>
            <h3>المقاطعة المنهجية للمصادر الأكاديمية</h3>
          </div>
          <p>تحتوي كافة العمليات (100%) على روابط مباشرة نحو مراجع علمية موثقة :</p>
          <ul class="methodology-list">
            <li><strong>المجلات الجامعية المحكّمة (ASJP / CERIST) :</strong> دراسات وبحوث تاريخية معمقة (معركة السكك الحديدية، حرب العصابات، واللوجستيك).</li>
            <li><strong>مركز البحث (CRASC) ومجلة إنسانيات :</strong> دراسات مرجعية حول التعبئة الحضرية والمنطقة المستقلة لوهران.</li>
            <li><strong>الأرشيف الوطني ومذكرات صناع الثورة :</strong> برقيات وكالة الأنباء الجزائرية التاريخية، شهادات مجاهدي الثورة، وتقارير مصلحة التاريخ العسكري (SHD).</li>
          </ul>
        </div>
      </div>

      <div class="methodology-footer-callout">
        <div class="callout-content">
          <h4>📖 التوثيق العلمي والمنهجي الكامل</h4>
          <p>راجع الوثيقة الشاملة <a href="https://github.com/MGhemri/aln-historical-operations-dataset/blob/main/METHODOLOGIE.md" target="_blank" rel="noopener">METHODOLOGIE.md</a> على GitHub للاطلاع على بروتوكولات الإسناد الجغرافي، المراجع البيبليوغرافية الشاملة، ودليل الاقتباس الأكاديمي.</p>
        </div>
        <a href="https://github.com/MGhemri/aln-historical-operations-dataset/blob/main/METHODOLOGIE.md" target="_blank" rel="noopener" class="btn-primary" style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.5rem 1rem; border-radius:6px; background:var(--accent-blue); color:#fff; text-decoration:none; font-size:0.85rem; font-weight:600;">تصفح METHODOLOGIE.md ↗</a>
      </div>
    `;
  } else {
    body.innerHTML = `
      <div class="methodology-banner">
        <p class="methodology-lead">
          Ce projet en <strong>humanités numériques</strong> recense, qualifie et géolocalise <strong>263 actions militaires</strong> de l'Armée de Libération Nationale (1954–1962). La démarche repose sur une stricte contextualisation historiographique, un croisement critique des sources et la transparence cartographique.
        </p>
      </div>

      <div class="methodology-grid">
        <div class="methodology-card">
          <div class="card-icon-title">
            <span class="step-num">1</span>
            <h3>Des Zones aux Wilayas (1954–1962)</h3>
          </div>
          <p>L'organisation territoriale de la Révolution a évolué en plusieurs phases distinctes que la base de données respecte sans anachronisme :</p>
          <ul class="methodology-list">
            <li><strong>Novembre 1954 :</strong> Découpage originel en 5 zones (Aurès, Nord-Constantinois, Kabylie, Algérois, Oranie). Les événements antérieurs au 20 août 1956 sont indexés dans leur zone de départ.</li>
            <li><strong>Août 1956 (Soummam) :</strong> Institutionnalisation des 6 Wilayas historiques et création de la <em>Zone Autonome d'Alger (ZAA)</em>.</li>
            <li><strong>1958–1960 :</strong> Structuration de la Fédération de France du FLN (la « 7e Wilaya ») et des bases frontalières (Base de l'Est / Base de l'Ouest).</li>
            <li><strong>Printemps 1962 :</strong> Création de la <em>Zone Autonome d'Oran (ZAO)</em> sous le commandement du capitaine Bakhti pour protéger les faubourgs algériens face à l'OAS et sécuriser l'autodétermination.</li>
          </ul>
        </div>

        <div class="methodology-card">
          <div class="card-icon-title">
            <span class="step-num">2</span>
            <h3>Lieux Repères vs Positions Tactiques</h3>
          </div>
          <p>Dans une guerre de maquis et d'embuscades asymétriques, les coordonnées géographiques répondent à une charte scientifique claire :</p>
          <ul class="methodology-list">
            <li><strong>Ancrage spatial vérifié :</strong> Chaque point GPS correspond à un repère communal, un col (<em>teniet</em>), un oued ou un massif montagneux (<em>djebel</em>), sans prétendre à un relevé métrique artificiel de chaque tiraillement.</li>
            <li><strong>Neutralité sur le Sahara :</strong> Refus d'extrapoler des frontières géométriques imaginaires dans le Grand Sud. Les actions de Timimoun, Ouargla, Touggourt ou Djanet sont géolocalisées avec précision et rattachées selon les sources historiques.</li>
          </ul>
        </div>

        <div class="methodology-card">
          <div class="card-icon-title">
            <span class="step-num">3</span>
            <h3>Corpus & Précautions Critiques</h3>
          </div>
          <p>Pour éviter les décomptes trompeurs propres aux listes brutes :</p>
          <ul class="methodology-list">
            <li><strong>Unité documentaire :</strong> Une notice représente une unité d'analyse documentaire et peut regrouper plusieurs engagements successifs sur un même théâtre d'opération.</li>
            <li><strong>Unification toponymique :</strong> Les variantes graphiques courantes sont unifiées (ex : la <em>Bataille des Ghoualem</em> et de <em>Sidi Ghalem</em> réunies en une seule fiche synthétique).</li>
            <li><strong>Transparence des divergences :</strong> Les écarts de datation entre rapports militaires et mémoires d'acteurs (ex : Fellaoucene, Bou Atrous, El Merdja) sont explicités dans les fiches.</li>
          </ul>
        </div>

        <div class="methodology-card">
          <div class="card-icon-title">
            <span class="step-num">4</span>
            <h3>Croisement Systématique des Sources</h3>
          </div>
          <p>100% des opérations intègrent des liens cliquables vers des publications vérifiables :</p>
          <ul class="methodology-list">
            <li><strong>Revues universitaires ASJP / CERIST :</strong> Articles à comité de lecture (<em>Revue d'histoire maghrébine</em>, études sur la bataille du rail, logistique militaire).</li>
            <li><strong>CRASC & Revue <em>Insaniyat</em> :</strong> Études de référence (Saddek Benkada sur la ZAO, sociologie des mobilisations urbaines).</li>
            <li><strong>Archives institutionnelles :</strong> Dépêches d'archives de l'APS, mémoires d'acteurs de la Révolution, rapports du SHD (Service Historique de la Défense).</li>
          </ul>
        </div>
      </div>

      <div class="methodology-footer-callout">
        <div class="callout-content">
          <h4>📖 Documentation scientifique complète</h4>
          <p>Consultez le document intégral <a href="https://github.com/MGhemri/aln-historical-operations-dataset/blob/main/METHODOLOGIE.md" target="_blank" rel="noopener">METHODOLOGIE.md</a> sur GitHub pour les protocoles de géoréférencement, les références bibliographiques complètes et le guide de citation.</p>
        </div>
        <a href="https://github.com/MGhemri/aln-historical-operations-dataset/blob/main/METHODOLOGIE.md" target="_blank" rel="noopener" class="btn-primary" style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.5rem 1rem; border-radius:6px; background:var(--accent-blue); color:#fff; text-decoration:none; font-size:0.85rem; font-weight:600;">Consulter METHODOLOGIE.md ↗</a>
      </div>
    `;
  }

  // Remove GitHub methodology callout on Vercel
  if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('vercel')) {
    const callout = body.querySelector('.methodology-footer-callout');
    if (callout) callout.remove();
  }
}

// --------------------------------------------------------------------------
// Language Switcher Function
// --------------------------------------------------------------------------
function setLanguage(lang) {
  state.lang = (lang === 'ar' ? 'ar' : 'fr');
  localStorage.setItem('aln_lang', state.lang);
  
  document.documentElement.lang = state.lang;
  document.documentElement.dir = (state.lang === 'ar' ? 'rtl' : 'ltr');

  // Update Language toggle button
  const langLabelEl = document.getElementById('lang-label');
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  if (langLabelEl) {
    langLabelEl.textContent = state.lang === 'ar' ? 'Français' : 'العربية';
  }
  if (langToggleBtn) {
    langToggleBtn.title = t('langToggleTitle');
  }

  // Update Header
  const brandTitleEl = document.querySelector('.brand-title');
  const brandSubtitleEl = document.querySelector('.brand-subtitle');
  if (brandTitleEl) {
    brandTitleEl.innerHTML = `${t('appTitle')} <span class="badge-version">${t('badgeYear')}</span>`;
  }
  if (brandSubtitleEl) {
    brandSubtitleEl.textContent = t('appSubtitle');
  }

  // Update Nav Buttons
  const methBtnSpan = document.querySelector('#methodology-btn span');
  if (methBtnSpan) methBtnSpan.textContent = t('navMethodology');
  const statsBtnSpan = document.querySelector('#stats-btn span');
  if (statsBtnSpan) statsBtnSpan.textContent = t('navStats');
  const exportBtnSpan = document.querySelector('#export-dropdown-btn span');
  if (exportBtnSpan) exportBtnSpan.textContent = t('navExport');

  // Update Mobile Tabs
  const tabMapBtn = document.getElementById('tab-map-btn');
  const tabListBtn = document.getElementById('tab-list-btn');
  if (tabMapBtn) tabMapBtn.textContent = t('tabMap');
  const drawerBackText = document.querySelector('.drawer-back-btn .back-text');
  if (drawerBackText) drawerBackText.textContent = state.lang === 'ar' ? 'الخريطة' : 'Carte';
  if (tabListBtn) tabListBtn.innerHTML = `${t('tabList')} (<span id="mobile-count">${state.filteredOperations.length}</span>)`;

  // Update Search
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.placeholder = t('searchPlaceholder');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  if (clearSearchBtn) clearSearchBtn.title = t('clearSearchTitle');

  // Update Reset Filters
  const resetBtn = document.getElementById('reset-filters-btn');
  if (resetBtn) resetBtn.textContent = t('resetFilters');

  // Update Filter Labels
  const filterLabels = document.querySelectorAll('.filters-container .filter-label');
  if (filterLabels[0]) filterLabels[0].textContent = t('filterWilaya');
  if (filterLabels[1]) filterLabels[1].textContent = t('filterChronology');
  if (filterLabels[2]) filterLabels[2].textContent = t('filterActionType');

  // Update Year 'all' button
  const yearAllBtn = document.querySelector('.year-btn[data-year="all"]');
  if (yearAllBtn) yearAllBtn.textContent = t('yearAll');

  // Update Action Types Select options
  updateActionTypeSelectOptions();

  // Update List Header
  const listTitle = document.querySelector('.list-title');
  if (listTitle) listTitle.textContent = state.lang === 'ar' ? 'العمليات المصفاة' : 'Résultats filtrés';
  const sortIndicator = document.getElementById('sort-indicator');
  if (sortIndicator) sortIndicator.textContent = state.lang === 'ar' ? 'ترتيب زمني' : 'Chronologique';

  // Update Map Controls
  const basemapSelect = document.getElementById('basemap-select');
  if (basemapSelect) {
    const curVal = basemapSelect.value;
    basemapSelect.innerHTML = `
      <option value="osm"${curVal === 'osm' ? ' selected' : ''}>${escapeHtml(t('basemapOsm'))}</option>
      <option value="topo"${curVal === 'topo' ? ' selected' : ''}>${escapeHtml(t('basemapTopo'))}</option>
      <option value="satellite"${curVal === 'satellite' ? ' selected' : ''}>${escapeHtml(t('basemapSatellite'))}</option>
    `;
  }
  const btnAlg = document.querySelector('#btn-recenter-algeria span');
  if (btnAlg) btnAlg.textContent = t('recenterAlgeria');
  const btnFr = document.querySelector('#btn-recenter-france span');
  if (btnFr) btnFr.textContent = t('recenterFrance');
  const btnLeg = document.querySelector('#btn-toggle-legend span');
  if (btnLeg) btnLeg.textContent = t('legendBtn');

  // Update Legend
  const legendHeaderStrong = document.querySelector('#map-legend .legend-header strong');
  if (legendHeaderStrong) legendHeaderStrong.textContent = t('legendTitle');
  const legendItemsContainer = document.querySelector('#map-legend .legend-items');
  if (legendItemsContainer) {
    legendItemsContainer.innerHTML = WILAYAS.map(w => `
      <div class="legend-item">
        <span class="color-dot" style="background:${w.color};"></span>
        ${escapeHtml(getWilayaLabel(w.id))}
      </div>
    `).join('');
  }

  // Update Methodology & Stats Modal Texts
  renderMethodologyModal();
  renderStatsModalTexts();

  // Re-render components
  setupWilayaChips();
  renderOperationsList();
  updateMapMarkers();
  updateResultsCount();
  updateCharts();

  if (state.selectedOpId) {
    selectOperation(state.selectedOpId, false);
  }
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
  // Remove GitHub button on Vercel deployment while preserving on GitHub Pages
  if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('vercel')) {
    document.querySelectorAll('.github-btn, #github-link-btn, .methodology-footer-callout').forEach(el => el.remove());
  }

  initMap();
  loadData();

  // Language Switcher Toggle
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      setLanguage(state.lang === 'fr' ? 'ar' : 'fr');
    });
  }

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
  document.getElementById('close-drawer-btn').addEventListener('click', closeDrawer);
  const closeDrawerBackBtn = document.getElementById('close-drawer-back-btn');
  if (closeDrawerBackBtn) closeDrawerBackBtn.addEventListener('click', closeDrawer);

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

  // Basemap Selector
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
    statsModal.classList.add('open'); document.body.classList.add('modal-open');
  });
  document.getElementById('close-stats-btn').addEventListener('click', () => {
    statsModal.classList.remove('open'); document.body.classList.remove('modal-open');
  });
  statsModal.addEventListener('click', (e) => {
    if (e.target === statsModal) statsModal.classList.remove('open'); document.body.classList.remove('modal-open');
  });

  // Methodology Modal
  const methModal = document.getElementById('methodology-modal');
  const methBtn = document.getElementById('methodology-btn');
  if (methBtn && methModal) {
    methBtn.addEventListener('click', () => {
      methModal.classList.add('open'); document.body.classList.add('modal-open');
    });
    const closeMethBtn = document.getElementById('close-methodology-btn');
    if (closeMethBtn) {
      closeMethBtn.addEventListener('click', () => {
        methModal.classList.remove('open'); document.body.classList.remove('modal-open');
      });
    }
    methModal.addEventListener('click', (e) => {
      if (e.target === methModal) methModal.classList.remove('open'); document.body.classList.remove('modal-open');
    });
  }

  // Global Escape key handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (statsModal) statsModal.classList.remove('open'); document.body.classList.remove('modal-open');
      if (methModal) methModal.classList.remove('open'); document.body.classList.remove('modal-open');
      closeDrawer();
    }
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

  // Resize handler
  window.addEventListener('resize', () => {
    if (map) map.invalidateSize();
  });
  window.addEventListener('load', () => {
    if (map) map.invalidateSize();
  });
});
