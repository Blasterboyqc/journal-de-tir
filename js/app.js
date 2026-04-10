/**
 * app.js — Journal de Tir PLB
 * Main application logic: state, journal management, UI, settings
 */

import { parsePDFText } from './parser.js';
import { generateSchematic, getSchemaParams } from './schematic.js';
import { importPDFFile, initPDFJS } from './pdf-import.js';

// ============================================================
// APP STATE
// ============================================================
let settings = {};
let journals = []; // completed
let drafts = [];   // in-progress
let currentDraft = null;
let autoSaveTimer = null;
let _currentParsed = null;
let _lastParsed = null;

// ============================================================
// UTILS
// ============================================================
function genId() {
  return 'JT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2,6).toUpperCase();
}
function genSessionId() {
  return 'S-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
}
function now() { return new Date().toISOString(); }

function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('fr-CA'); } catch(e) { return d; }
}
function fmtDt(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleString('fr-CA'); } catch(e) { return d; }
}
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function calcChecksum(data) {
  try {
    const enc = new TextEncoder().encode(JSON.stringify(data));
    const hash = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('').slice(0,16) + '…';
  } catch(e) { return 'N/A'; }
}

// ============================================================
// DATA PERSISTENCE
// ============================================================
function loadData() {
  try {
    settings = JSON.parse(localStorage.getItem('jt_settings') || '{}');
    journals = JSON.parse(localStorage.getItem('jt_journals') || '[]');
    drafts = JSON.parse(localStorage.getItem('jt_drafts') || '[]');
  } catch(e) { settings = {}; journals = []; drafts = []; }
}

function saveData() {
  localStorage.setItem('jt_settings', JSON.stringify(settings));
  localStorage.setItem('jt_journals', JSON.stringify(journals));
  localStorage.setItem('jt_drafts', JSON.stringify(drafts));
}

// ============================================================
// SETTINGS
// ============================================================
function saveSettings() {
  settings = {
    first: document.getElementById('s-first').value,
    last: document.getElementById('s-last').value,
    sq: document.getElementById('s-sq').value,
    ccq: document.getElementById('s-ccq').value,
    employer: document.getElementById('s-employer').value,
    project: document.getElementById('s-project').value,
    contractor: document.getElementById('s-contractor').value,
    owner: document.getElementById('s-owner').value,
    autosave: parseInt(document.getElementById('s-autosave').value) || 30,
  };
  localStorage.setItem('jt_settings', JSON.stringify(settings));
  document.getElementById('header-project').textContent = settings.project || 'PLB';
  showToast('✅ Réglages sauvegardés');
}

function loadSettings() {
  ['first','last','sq','ccq','employer','project','contractor','owner','autosave'].forEach(k => {
    const el = document.getElementById('s-' + k);
    if (el && settings[k] != null) el.value = settings[k];
  });
  document.getElementById('header-project').textContent = settings.project || 'PLB';
}

// ============================================================
// ONBOARDING
// ============================================================
function completeOnboarding() {
  const first = document.getElementById('ob-first').value.trim();
  const last = document.getElementById('ob-last').value.trim();
  const sq = document.getElementById('ob-sq').value.trim();
  if (!first || !last || !sq) { showToast('⚠️ Prénom, nom et permis SQ requis'); return; }
  settings = {
    first, last, sq,
    ccq: document.getElementById('ob-ccq').value.trim(),
    employer: document.getElementById('ob-employer').value.trim(),
    project: document.getElementById('ob-project').value.trim(),
    owner: document.getElementById('ob-owner').value.trim(),
  };
  localStorage.setItem('jt_settings', JSON.stringify(settings));
  localStorage.setItem('jt_setup_done', '1');
  document.getElementById('onboarding').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  loadSettings();
  initApp();
}

// ============================================================
// JOURNAL FORM
// ============================================================
function newJournal() {
  currentDraft = {
    id: genId(),
    sessionId: genSessionId(),
    createdAt: now(),
    modifiedAt: now(),
    finalized: false,
    data: {}
  };
  resetForm();
  // Pre-fill from settings
  const fullName = [settings.first, settings.last].filter(Boolean).join(' ');
  if (fullName) document.getElementById('j-blaster-name').value = fullName;
  if (settings.sq) document.getElementById('j-blaster-sq').value = settings.sq;
  if (settings.ccq) document.getElementById('j-blaster-ccq').value = settings.ccq;
  if (settings.contractor) document.getElementById('j-contractor').value = settings.contractor;
  if (settings.owner) document.getElementById('j-owner').value = settings.owner;
  // Set today's date
  const today = new Date();
  document.getElementById('j-date').value = today.toISOString().slice(0,10);
  // Update audit
  document.getElementById('aud-id').textContent = currentDraft.id;
  document.getElementById('aud-session').textContent = currentDraft.sessionId;
  document.getElementById('aud-created').textContent = fmtDt(currentDraft.createdAt);
  document.getElementById('aud-modified').textContent = fmtDt(currentDraft.modifiedAt);
  document.getElementById('aud-device').textContent = navigator.userAgent.slice(0,60);
  document.getElementById('j-entry-id-display').textContent = currentDraft.id;
  document.getElementById('j-status-display').textContent = 'Brouillon · non finalisé';
  _currentParsed = null;
  switchTab('journal');
  showToast('📝 Nouveau journal créé');
}

function resetForm() {
  const fields = ['j-shot-id','j-date','j-shift','j-station','j-zone-type','j-chainage',
    'j-dwg','j-rev','j-contractor','j-owner',
    'j-blaster-name','j-blaster-sq','j-blaster-ccq','j-coordinator','j-supervisor',
    'j-concu-par','j-dessine-par',
    'j-diam-mm','j-prof-foree','j-avance','j-sous-forage','j-espacement','j-fardeau',
    'j-collet','j-trous-masse','j-trous-bouchon','j-trous-satellite','j-trous-perim',
    'j-trous-lifter','j-trous-alesage','j-trous-tampon','j-trous-total',
    'j-superficie','j-volume','j-hauteur-banc',
    'j-firing-sys','j-nb-det','j-lot-det','j-blast-box','j-delay-min','j-delay-max',
    'j-charge-totale','j-facteur-charg','j-matelas','j-continuity',
    'j-time-planned-fire','j-time-fire','j-time-end','j-time-reopen',
    'j-temp','j-humidity','j-vent-flow','j-eau','j-cond-obs',
    'j-ppv-max','j-ppv-limit','j-freq','j-airblast',
    'j-result','j-misfire-count','j-misfire-holes','j-misfire-actions',
    'j-co','j-no2','j-vent-time','j-advance-real','j-frag','j-scalage','j-soutenement',
    'j-post-obs','j-sig-blaster-name','j-sig-super-name'];
  fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  // Clear radio opts
  document.querySelectorAll('.radio-opt').forEach(r => r.classList.remove('selected'));
  // Clear dynamic lists
  document.getElementById('assistants-list').innerHTML = '';
  document.getElementById('exp-tbody').innerHTML = '';
  document.getElementById('seismo-list').innerHTML = '';
  // Clear sig canvases
  clearSig('sig-blaster'); clearSig('sig-super');
  // Hide misfire
  document.getElementById('misfire-section').style.display = 'none';
  // Clear checklist
  document.querySelectorAll('#pretir-checklist .check-item').forEach(el => el.classList.remove('checked'));
  updateChecklistHint();
}

function collectCurrentData() {
  const gv = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  const data = {
    shotId: gv('j-shot-id'), date: gv('j-date'), shift: gv('j-shift'),
    station: gv('j-station'), zoneType: gv('j-zone-type'), chainage: gv('j-chainage'),
    dwg: gv('j-dwg'), rev: gv('j-rev'), contractor: gv('j-contractor'), owner: gv('j-owner'),
    blasterName: gv('j-blaster-name'), blasterSq: gv('j-blaster-sq'), blasterCcq: gv('j-blaster-ccq'),
    coordinator: gv('j-coordinator'), supervisor: gv('j-supervisor'),
    concuPar: gv('j-concu-par'), dessinePar: gv('j-dessine-par'),
    diamMm: gv('j-diam-mm'), profForee: gv('j-prof-foree'), avance: gv('j-avance'),
    sousForage: gv('j-sous-forage'), espacement: gv('j-espacement'), fardeau: gv('j-fardeau'),
    collet: gv('j-collet'),
    trousMasse: gv('j-trous-masse'), trousBouchon: gv('j-trous-bouchon'),
    trousSatellite: gv('j-trous-satellite'), trousPerim: gv('j-trous-perim'),
    trousLifter: gv('j-trous-lifter'), trousAlésage: gv('j-trous-alesage'),
    trousTampon: gv('j-trous-tampon'), totalTrous: gv('j-trous-total'),
    superficie: gv('j-superficie'), volume: gv('j-volume'), hauteurBanc: gv('j-hauteur-banc'),
    firingSys: gv('j-firing-sys'), nbDet: gv('j-nb-det'), lotDet: gv('j-lot-det'),
    blastBox: gv('j-blast-box'), delayMin: gv('j-delay-min'), delayMax: gv('j-delay-max'),
    chargeTotale: gv('j-charge-totale'), facteurCharg: gv('j-facteur-charg'),
    matelas: gv('j-matelas'), continuity: gv('j-continuity'),
    timePlannedFire: gv('j-time-planned-fire'), timeFire: gv('j-time-fire'),
    timeEnd: gv('j-time-end'), timeReopen: gv('j-time-reopen'),
    temp: gv('j-temp'), humidity: gv('j-humidity'), ventFlow: gv('j-vent-flow'),
    eau: gv('j-eau'), condObs: gv('j-cond-obs'),
    ppvMax: gv('j-ppv-max'), ppvLimit: gv('j-ppv-limit'), freq: gv('j-freq'), airblast: gv('j-airblast'),
    result: gv('j-result'), misfireCount: gv('j-misfire-count'),
    misfireHoles: gv('j-misfire-holes'), misfireActions: gv('j-misfire-actions'),
    co: gv('j-co'), no2: gv('j-no2'), ventTime: gv('j-vent-time'),
    advanceReal: gv('j-advance-real'), frag: gv('j-frag'),
    scalage: gv('j-scalage'), soutenement: gv('j-soutenement'), postObs: gv('j-post-obs'),
    sigBlasterName: gv('j-sig-blaster-name'), sigSuperName: gv('j-sig-super-name'),
    assistants: getListItems('assistants-list'),
    seismos: getSeismoList(),
    explosifs: getExplosifTable(),
    checklist: getChecklistState(),
    sigBlaster: getSigData('sig-blaster'),
    sigSuper: getSigData('sig-super'),
  };
  // Carry parsed data for schematic
  if (_currentParsed) {
    data.zone = _currentParsed.zone;
    data.trousMasseN = _currentParsed.trousMasse;
    data.trousBouchonN = _currentParsed.trousBouchon;
    data.trousTamponN = _currentParsed.trousTampon;
    data.trousPerimN = _currentParsed.trousPerim;
    data.trousLifterN = _currentParsed.trousLifter;
    data.trousAlésageN = _currentParsed.trousAlésage;
    data.espacement = _currentParsed.espacement || data.espacement;
    data.fardeau = _currentParsed.fardeau || data.fardeau;
    data.longueur = _currentParsed.longueur;
    data.largeur = _currentParsed.largeur;
    data.dessinNo = _currentParsed.dessinNo;
    data.projet = _currentParsed.projet;
  }
  return data;
}

function getListItems(containerId) {
  const items = [];
  document.querySelectorAll(`#${containerId} .list-item-content`).forEach(el => items.push(el.textContent));
  return items;
}

function getSeismoList() {
  const items = [];
  document.querySelectorAll('#seismo-list .seismo-item').forEach(el => {
    items.push({ loc: el.dataset.loc, ppv: el.dataset.ppv });
  });
  return items;
}

function getExplosifTable() {
  const rows = [];
  document.querySelectorAll('#exp-tbody tr').forEach(tr => {
    const inputs = tr.querySelectorAll('input, select');
    if (inputs.length >= 5) {
      rows.push({ produit: inputs[0].value, lot: inputs[1].value, recu: inputs[2].value,
                  utilise: inputs[3].value, retourne: inputs[4].value, unite: inputs[5]?.value || 'kg' });
    }
  });
  return rows;
}

function getChecklistState() {
  const state = {};
  document.querySelectorAll('#pretir-checklist .check-item').forEach(el => {
    state[el.id] = el.classList.contains('checked');
  });
  return state;
}

function getSigData(canvasId) {
  try {
    const canvas = document.getElementById(canvasId);
    return canvas ? canvas.toDataURL() : null;
  } catch(e) { return null; }
}

function autoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(saveDraft, (settings.autosave || 30) * 1000);
}

function saveDraft() {
  if (!currentDraft) newJournal();
  currentDraft.data = collectCurrentData();
  currentDraft.modifiedAt = now();
  const idx = drafts.findIndex(d => d.id === currentDraft.id);
  if (idx >= 0) drafts[idx] = currentDraft;
  else drafts.push(currentDraft);
  saveData();
  document.getElementById('aud-modified').textContent = fmtDt(currentDraft.modifiedAt);
  showToast('💾 Brouillon sauvegardé');
  renderDrafts();
  updateDashStats();
}

function finalizeJournal() {
  const shotId = document.getElementById('j-shot-id').value.trim();
  const date = document.getElementById('j-date').value;
  const blasterName = document.getElementById('j-blaster-name').value.trim();
  const blasterSq = document.getElementById('j-blaster-sq').value.trim();
  if (!shotId || !date || !blasterName || !blasterSq) {
    showToast('⚠️ Champs requis manquants: No tir, date, boutefeu, permis SQ');
    return;
  }
  showConfirm('Finaliser le journal?', `Tir: ${shotId} | Date: ${date}\n\nCe journal sera archivé comme finalisé.`, () => {
    if (!currentDraft) return;
    currentDraft.data = collectCurrentData();
    currentDraft.modifiedAt = now();
    currentDraft.finalized = true;
    drafts = drafts.filter(d => d.id !== currentDraft.id);
    journals.unshift(currentDraft);
    saveData();
    renderHistory();
    renderDrafts();
    updateDashStats();
    document.getElementById('j-status-display').textContent = '✅ Finalisé · ' + fmtDate(date);
    showToast('✅ Journal finalisé et archivé');
    switchTab('history');
  });
}

function loadDraft(id) {
  const draft = drafts.find(d => d.id === id);
  if (!draft) return;
  currentDraft = draft;
  fillForm(draft.data);
  document.getElementById('j-entry-id-display').textContent = draft.id;
  document.getElementById('j-status-display').textContent = 'Brouillon · modifié ' + fmtDt(draft.modifiedAt);
  document.getElementById('aud-id').textContent = draft.id;
  document.getElementById('aud-session').textContent = draft.sessionId || '—';
  document.getElementById('aud-created').textContent = fmtDt(draft.createdAt);
  document.getElementById('aud-modified').textContent = fmtDt(draft.modifiedAt);
  document.getElementById('aud-device').textContent = navigator.userAgent.slice(0,60);
  switchTab('journal');
  showToast('📋 Brouillon chargé');
}

function deleteDraft(id) {
  showConfirm('Supprimer ce brouillon?', 'Cette action est irréversible.', () => {
    drafts = drafts.filter(d => d.id !== id);
    if (currentDraft && currentDraft.id === id) currentDraft = null;
    saveData(); renderDrafts(); updateDashStats();
    showToast('🗑 Brouillon supprimé');
  });
}

function deleteJournal(id) {
  showConfirm('Supprimer ce journal finalisé?', 'Cette action est irréversible.', () => {
    journals = journals.filter(j => j.id !== id);
    saveData(); renderHistory(); updateDashStats();
    showToast('🗑 Journal supprimé');
  });
}

function viewJournal(id) {
  const j = journals.find(j => j.id === id);
  if (!j) return;
  currentDraft = j;
  fillForm(j.data);
  document.getElementById('j-entry-id-display').textContent = j.id;
  document.getElementById('j-status-display').textContent = '✅ Finalisé · ' + fmtDt(j.modifiedAt);
  document.getElementById('aud-id').textContent = j.id;
  document.getElementById('aud-created').textContent = fmtDt(j.createdAt);
  document.getElementById('aud-modified').textContent = fmtDt(j.modifiedAt);
  switchTab('journal');
}

function fillForm(data) {
  if (!data) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el && val != null) el.value = val; };
  const fieldMap = {
    shotId:'j-shot-id', date:'j-date', shift:'j-shift', station:'j-station',
    zoneType:'j-zone-type', chainage:'j-chainage', dwg:'j-dwg', rev:'j-rev',
    contractor:'j-contractor', owner:'j-owner',
    blasterName:'j-blaster-name', blasterSq:'j-blaster-sq', blasterCcq:'j-blaster-ccq',
    coordinator:'j-coordinator', supervisor:'j-supervisor',
    concuPar:'j-concu-par', dessinePar:'j-dessine-par',
    diamMm:'j-diam-mm', profForee:'j-prof-foree', avance:'j-avance',
    sousForage:'j-sous-forage', espacement:'j-espacement', fardeau:'j-fardeau', collet:'j-collet',
    trousMasse:'j-trous-masse', trousBouchon:'j-trous-bouchon', trousSatellite:'j-trous-satellite',
    trousPerim:'j-trous-perim', trousLifter:'j-trous-lifter', trousAlésage:'j-trous-alesage',
    trousTampon:'j-trous-tampon', totalTrous:'j-trous-total',
    superficie:'j-superficie', volume:'j-volume', hauteurBanc:'j-hauteur-banc',
    firingSys:'j-firing-sys', nbDet:'j-nb-det', lotDet:'j-lot-det',
    blastBox:'j-blast-box', delayMin:'j-delay-min', delayMax:'j-delay-max',
    chargeTotale:'j-charge-totale', facteurCharg:'j-facteur-charg',
    matelas:'j-matelas', continuity:'j-continuity',
    timePlannedFire:'j-time-planned-fire', timeFire:'j-time-fire',
    timeEnd:'j-time-end', timeReopen:'j-time-reopen',
    temp:'j-temp', humidity:'j-humidity', ventFlow:'j-vent-flow',
    eau:'j-eau', condObs:'j-cond-obs',
    ppvMax:'j-ppv-max', ppvLimit:'j-ppv-limit', freq:'j-freq', airblast:'j-airblast',
    result:'j-result', misfireCount:'j-misfire-count', misfireHoles:'j-misfire-holes',
    misfireActions:'j-misfire-actions', co:'j-co', no2:'j-no2', ventTime:'j-vent-time',
    advanceReal:'j-advance-real', frag:'j-frag', scalage:'j-scalage',
    soutenement:'j-soutenement', postObs:'j-post-obs',
    sigBlasterName:'j-sig-blaster-name', sigSuperName:'j-sig-super-name',
  };
  Object.entries(data).forEach(([k, v]) => {
    if (fieldMap[k]) set(fieldMap[k], v);
  });
  // Restore radio selections
  ['j-firing-sys','j-matelas','j-continuity','j-result','j-eau','j-scalage','j-soutenement'].forEach(hidId => {
    const val = document.getElementById(hidId)?.value;
    if (val) {
      document.querySelectorAll(`[name="${hidId.replace('j-','')}"]`).forEach(radio => {
        const opt = radio.closest('.radio-opt');
        if (opt && radio.value === val) opt.classList.add('selected');
      });
    }
  });
  // Restore lists
  if (data.assistants) {
    document.getElementById('assistants-list').innerHTML = '';
    data.assistants.forEach(a => addListItem('assistants-list', a));
  }
  if (data.seismos) {
    document.getElementById('seismo-list').innerHTML = '';
    data.seismos.forEach(s => addSeismoEntry(s.loc, s.ppv));
  }
  if (data.explosifs) {
    document.getElementById('exp-tbody').innerHTML = '';
    data.explosifs.forEach(e => addExplosifRowWithData(e.produit, e.lot, e.recu, e.utilise, e.retourne, e.unite));
  }
  if (data.checklist) {
    Object.entries(data.checklist).forEach(([id, checked]) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('checked', checked);
    });
  }
  if (data.result === 'rates') document.getElementById('misfire-section').style.display = 'block';
  updateTotalHoles();
  updateChecklistHint();
}

// ============================================================
// UI HELPERS
// ============================================================
function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  const btn = document.getElementById('tab-btn-' + name);
  const pane = document.getElementById('pane-' + name);
  if (btn) btn.classList.add('active');
  if (pane) pane.classList.add('active');
}

function toggleCard(bodyId, chevId) {
  const body = document.getElementById(bodyId);
  const chev = document.getElementById(chevId);
  body.classList.toggle('hidden');
  chev.classList.toggle('open');
  chev.classList.toggle('closed');
}

function toggleCheck(id) {
  const el = document.getElementById(id);
  el.classList.toggle('checked');
  updateChecklistHint();
  autoSave();
}

function updateChecklistHint() {
  const items = document.querySelectorAll('#pretir-checklist .check-item');
  const checked = document.querySelectorAll('#pretir-checklist .check-item.checked').length;
  const hint = document.getElementById('ch-F-hint');
  if (hint) hint.textContent = `${checked}/${items.length}`;
}

function selectRadio(hiddenId, value, optEl) {
  const hidEl = document.getElementById(hiddenId);
  if (hidEl) hidEl.value = value;
  const group = optEl.closest('.radio-group');
  if (group) group.querySelectorAll('.radio-opt').forEach(r => r.classList.remove('selected'));
  optEl.classList.add('selected');
  if (hiddenId === 'j-result') {
    document.getElementById('misfire-section').style.display = value === 'rates' ? 'block' : 'none';
  }
  autoSave();
}

function updateTotalHoles() {
  const ids = ['j-trous-masse','j-trous-bouchon','j-trous-satellite','j-trous-perim','j-trous-lifter','j-trous-alesage','j-trous-tampon'];
  let total = 0;
  ids.forEach(id => { const v = parseInt(document.getElementById(id)?.value || 0); if (!isNaN(v)) total += v; });
  const el = document.getElementById('j-trous-total');
  if (el) el.value = total || '';
}

// ── DYNAMIC LISTS ──
function addListItem(containerId, text) {
  if (!text) return;
  const div = document.createElement('div');
  div.className = 'list-item';
  div.innerHTML = `<span class="list-item-content">${escHtml(text)}</span><button class="del-btn" onclick="this.closest('.list-item').remove();window.appAutoSave()" title="Supprimer">✕</button>`;
  document.getElementById(containerId).appendChild(div);
}

function addAssistant() {
  const inp = document.getElementById('assistant-input');
  const val = inp.value.trim();
  if (!val) return;
  addListItem('assistants-list', val);
  inp.value = ''; autoSave();
}

function addSeismo() {
  const loc = document.getElementById('seismo-loc-input').value.trim();
  const ppv = document.getElementById('seismo-ppv-input').value;
  if (!loc) return;
  addSeismoEntry(loc, ppv);
  document.getElementById('seismo-loc-input').value = '';
  document.getElementById('seismo-ppv-input').value = '';
  autoSave();
}

function addSeismoEntry(loc, ppv) {
  const div = document.createElement('div');
  div.className = 'list-item seismo-item';
  div.dataset.loc = loc; div.dataset.ppv = ppv || '';
  const ppvBadge = ppv ? `<span class="badge badge-blue" style="margin-right:6px">${ppv} mm/s</span>` : '';
  div.innerHTML = `<span class="list-item-content">${escHtml(loc)}${ppvBadge ? ' — ' + ppvBadge : ''}</span><button class="del-btn" onclick="this.closest('.list-item').remove();window.appAutoSave()" title="Supprimer">✕</button>`;
  document.getElementById('seismo-list').appendChild(div);
}

// ── EXPLOSIVE TABLE ──
function addExplosifRow() {
  addExplosifRowWithData('', '', '', '', '', 'kg');
}

function addExplosifRowWithData(produit, lot, recu, utilise, retourne, unite) {
  const tbody = document.getElementById('exp-tbody');
  const tr = document.createElement('tr');
  const prodOpts = ['','PowerDitch-32','PowerDitch-40','PowerFrac-25','PowerCord-200','DYNO INERT STEMMING SL','Autre'].map(o =>
    `<option value="${o}" ${o===produit?'selected':''}>${o||'—'}</option>`).join('');
  const uniteOpts = ['kg','m','un'].map(u => `<option value="${u}" ${u===(unite||'kg')?'selected':''}>${u}</option>`).join('');
  tr.innerHTML = `
    <td><select onchange="window.appAutoSave()">${prodOpts}</select></td>
    <td><input type="text" value="${escHtml(lot||'')}" placeholder="No lot" oninput="window.appAutoSave()"></td>
    <td><input type="number" value="${recu||''}" step="0.1" oninput="window.appAutoSave()"></td>
    <td><input type="number" value="${utilise||''}" step="0.1" oninput="window.appAutoSave()"></td>
    <td><input type="number" value="${retourne||''}" step="0.1" oninput="window.appAutoSave()"></td>
    <td><select onchange="window.appAutoSave()">${uniteOpts}</select></td>
    <td class="del-cell"><button onclick="this.closest('tr').remove();window.appAutoSave()" title="Supprimer">✕</button></td>`;
  tbody.appendChild(tr);
}

// ── SIGNATURE CANVAS ──
const sigStates = {};

function initSigCanvas(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth || 600;
  canvas.height = 120;
  sigStates[id] = { drawing: false, lastX: 0, lastY: 0 };
  ctx.strokeStyle = '#a0a8cc';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return [(touch.clientX - rect.left) * (canvas.width / rect.width),
            (touch.clientY - rect.top) * (canvas.height / rect.height)];
  };

  canvas.addEventListener('mousedown', e => { sigStates[id].drawing = true; [sigStates[id].lastX, sigStates[id].lastY] = getPos(e); });
  canvas.addEventListener('mousemove', e => {
    if (!sigStates[id].drawing) return;
    const [x, y] = getPos(e);
    ctx.beginPath(); ctx.moveTo(sigStates[id].lastX, sigStates[id].lastY);
    ctx.lineTo(x, y); ctx.stroke();
    sigStates[id].lastX = x; sigStates[id].lastY = y;
  });
  canvas.addEventListener('mouseup', () => { sigStates[id].drawing = false; autoSave(); });
  canvas.addEventListener('mouseleave', () => { sigStates[id].drawing = false; });
  canvas.addEventListener('touchstart', e => { e.preventDefault(); sigStates[id].drawing = true; [sigStates[id].lastX, sigStates[id].lastY] = getPos(e); }, {passive:false});
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!sigStates[id].drawing) return;
    const [x, y] = getPos(e);
    ctx.beginPath(); ctx.moveTo(sigStates[id].lastX, sigStates[id].lastY);
    ctx.lineTo(x, y); ctx.stroke();
    sigStates[id].lastX = x; sigStates[id].lastY = y;
  }, {passive:false});
  canvas.addEventListener('touchend', () => { sigStates[id].drawing = false; autoSave(); });
}

function clearSig(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ── MODALS ──
function openPDFImport() {
  const fi = document.getElementById('pdf-file-input');
  if (fi) fi.value = '';
  const ta = document.getElementById('pdf-paste-area');
  if (ta) ta.value = '';
  const pw = document.getElementById('pdf-paste-wrapper');
  if (pw) pw.style.display = 'none';
  const ti = document.getElementById('paste-toggle-icon');
  if (ti) ti.textContent = '▶';
  document.getElementById('pdf-drop-zone').style.display = '';
  document.getElementById('pdf-loading').style.display = 'none';
  document.getElementById('pdf-parse-result').style.display = 'none';
  document.getElementById('pdf-parse-error').style.display = 'none';
  document.getElementById('btn-apply-pdf').style.display = 'none';
  openModal('pdf-modal');
  // Pre-initialize PDF.js in background
  initPDFJS().catch(() => {});
}

function togglePDFPasteArea() {
  const wrapper = document.getElementById('pdf-paste-wrapper');
  const icon = document.getElementById('paste-toggle-icon');
  const open = wrapper.style.display === 'none' || wrapper.style.display === '';
  wrapper.style.display = open ? 'block' : 'none';
  icon.textContent = open ? '▼' : '▶';
}

function handlePDFDrop(event) {
  event.preventDefault();
  document.getElementById('pdf-drop-zone').classList.remove('drag-over');
  const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
  if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
    handlePDFFile(file);
  } else {
    showPDFParseError('Veuillez déposer un fichier PDF valide.');
  }
}

async function handlePDFFile(file) {
  if (!file) return;

  document.getElementById('pdf-drop-zone').style.display = 'none';
  document.getElementById('pdf-loading').style.display = 'block';
  document.getElementById('pdf-loading-msg').textContent = 'Chargement de PDF.js…';
  document.getElementById('pdf-parse-result').style.display = 'none';
  document.getElementById('pdf-parse-error').style.display = 'none';
  document.getElementById('btn-apply-pdf').style.display = 'none';

  try {
    const { text, result } = await importPDFFile(file, (msg) => {
      const el = document.getElementById('pdf-loading-msg');
      if (el) el.textContent = msg;
    });

    document.getElementById('pdf-loading').style.display = 'none';
    document.getElementById('pdf-drop-zone').style.display = '';

    // Fill paste area for transparency
    const ta = document.getElementById('pdf-paste-area');
    if (ta) ta.value = text;

    showPDFParseResults(result);

  } catch (err) {
    document.getElementById('pdf-loading').style.display = 'none';
    document.getElementById('pdf-drop-zone').style.display = '';
    showPDFParseError("Erreur lors de l'extraction : " + (err.message || err));
    console.error('PDF extraction error:', err);
  }
}

function showPDFParseError(msg) {
  document.getElementById('pdf-parse-error').style.display = 'block';
  document.getElementById('pdf-parse-error').textContent = msg;
  document.getElementById('pdf-parse-result').style.display = 'none';
  document.getElementById('btn-apply-pdf').style.display = 'none';
}

function showPDFParseResults(ext) {
  _lastParsed = ext;
  const errEl = document.getElementById('pdf-parse-error');
  errEl.style.display = 'none';
  const res = document.getElementById('pdf-parse-result');
  res.style.display = 'block';
  const fields = document.getElementById('pdf-detected-fields');
  const rows = [];
  const add = (label, val) => { if (val != null && val !== '' && val !== undefined) rows.push(`<div class="audit-row"><span>${label}</span><span>${val}</span></div>`); };
  add('Zone', ext.zone);
  add('No tir', ext.shotId);
  add('Projet', ext.projet);
  add('Dessin No', ext.dessinNo);
  add('Date', ext.date);
  add('Détonateur', ext.detonateur);
  add('Nb détonateurs', ext.nbDetonateurs);
  add('Charge totale', ext.chargeTotaleKg ? ext.chargeTotaleKg + ' kg' : null);
  add('Facteur charg.', ext.facteurTir ? ext.facteurTir + ' kg/m³' : null);
  add('Total trous', ext.totalTrous);
  add('Diamètre', ext.diametreMm ? ext.diametreMm + ' mm' : null);
  add('Prof. forée', ext.profForee ? ext.profForee + ' m' : null);
  add('Avance', ext.avance ? ext.avance + ' m' : null);
  add('Superficie', ext.superficie ? ext.superficie + ' m²' : null);
  add('Volume', ext.volume ? ext.volume + ' m³' : null);
  add('Explosifs', ext.explosifsDetectes ? ext.explosifsDetectes.join(', ') : null);
  add('PPV max', ext.ppvMax ? ext.ppvMax + ' mm/s' : null);
  add('Conçu par', ext.concuPar);
  add('Dessiné par', ext.dessinePar);
  fields.innerHTML = `<div class="audit-block" style="margin-top:8px">${rows.join('')}</div>`;
  document.getElementById('btn-apply-pdf').style.display = 'flex';
}

function applyPDFData() {
  if (!_lastParsed) return;
  const ext = _lastParsed;
  const set = (id, val) => { const el = document.getElementById(id); if (el && val != null && val !== '') el.value = val; };
  set('j-shot-id', ext.shotId);
  set('j-date', ext.date);
  set('j-dwg', ext.dessinNo);
  set('j-rev', ext.revision);
  if (ext.zone) {
    set('j-zone-type', ext.zone);
    const st = ext.projet;
    if (st) {
      const stMatch = st.match(/STATION\s+([\wÀ-ü\s]+)/i);
      if (stMatch) {
        const stName = stMatch[1].trim();
        const stSel = document.getElementById('j-station');
        let found = false;
        for (const opt of stSel.options) {
          if (opt.value && stName.toLowerCase().includes(opt.value.toLowerCase())) {
            stSel.value = opt.value; found = true; break;
          }
        }
      }
    }
  }
  set('j-trous-masse', ext.trousMasse);
  set('j-trous-bouchon', ext.trousBouchon);
  set('j-trous-satellite', ext.trousSatellite);
  set('j-trous-perim', ext.trousPerim);
  set('j-trous-lifter', ext.trousLifter);
  set('j-trous-alesage', ext.trousAlésage);
  set('j-trous-tampon', ext.trousTampon);
  set('j-trous-total', ext.totalTrous);
  set('j-diam-mm', ext.diametreMm);
  set('j-prof-foree', ext.profForee);
  set('j-avance', ext.avance);
  set('j-espacement', ext.espacement);
  set('j-fardeau', ext.fardeau);
  set('j-sous-forage', ext.sousFogage);
  set('j-superficie', ext.superficie);
  set('j-volume', ext.volume);
  set('j-hauteur-banc', ext.hauteurBanc);
  set('j-charge-totale', ext.chargeTotaleKg);
  set('j-facteur-charg', ext.facteurTir || ext.facteurChargement);
  set('j-nb-det', ext.nbDetonateurs);
  set('j-concu-par', ext.concuPar);
  set('j-dessine-par', ext.dessinePar);
  if (ext.ppvMax) set('j-ppv-max', ext.ppvMax);
  // Firing system
  if (ext.firingSys) {
    const hidEl = document.getElementById('j-firing-sys');
    if (hidEl) hidEl.value = ext.firingSys;
    document.querySelectorAll('#firing-sys-group .radio-opt').forEach(r => {
      r.classList.remove('selected');
      if (r.querySelector('input') && r.querySelector('input').value === ext.firingSys) r.classList.add('selected');
    });
  }
  // Add explosives
  if (ext.explosifsDetectes && ext.explosifsDetectes.length) {
    ext.explosifsDetectes.forEach(e => addExplosifRowWithData(e, '', '', '', '', 'kg'));
  }
  // Auto-add seismo from ppvValues
  if (ext.ppvValues && ext.ppvValues.length) {
    ext.ppvValues.forEach((v, i) => addSeismoEntry(`Capteur ${i+1}`, v));
  }
  updateTotalHoles();
  _currentParsed = ext;
  document.getElementById('schema-source-label').textContent = `Importé: ${ext.shotId || ext.dessinNo || 'Plan inconnu'}`;
  closeModal('pdf-modal');
  switchTab('journal');
  showToast('✅ Données du plan importées');
  autoSave();
  setTimeout(() => runGenerateSchematic(), 300);
}

// PDF paste area live parse
function handlePDFPaste() {
  const ta = document.getElementById('pdf-paste-area');
  if (!ta || ta.value.length < 100) return;
  const result = parsePDFText(ta.value);
  showPDFParseResults(result);
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function showConfirm(title, msg, onOk) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = msg;
  const okBtn = document.getElementById('confirm-ok');
  const newOk = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOk, okBtn);
  newOk.addEventListener('click', () => { closeModal('confirm-modal'); onOk(); });
  openModal('confirm-modal');
}

// ── TOAST ──
let toastTimer = null;
function showToast(msg, duration = 2500) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), duration);
}

// ── SCHEMATIC ──
function runGenerateSchematic() {
  const ext = _currentParsed || collectCurrentData();
  if (!ext || (!ext.totalTrous && !ext.trousMasse)) {
    showToast('⚠️ Aucune donnée de forage disponible');
    return;
  }
  switchTab('schema');
  document.getElementById('schema-empty').style.display = 'none';
  document.getElementById('schema-content').style.display = 'block';

  const svgData = generateSchematic(ext, collectCurrentData());
  if (!svgData) { showToast('⚠️ Impossible de générer le schéma'); return; }

  const svg = document.getElementById('schematic-svg');
  svg.setAttribute('viewBox', svgData.viewBox);
  svg.setAttribute('style', svgData.style);
  svg.innerHTML = svgData.innerHTML;

  // Legend
  const legend = document.getElementById('schema-legend');
  legend.innerHTML = svgData.legend.map(item => {
    const dotStyle = item.stroke
      ? `background:transparent;border:2px solid ${item.stroke};border-radius:50%`
      : `background:${item.color}`;
    return `<div class="legend-item"><div class="legend-dot" style="${dotStyle}"></div>${item.label}</div>`;
  }).join('');

  // Params table
  const params = getSchemaParams(ext);
  const table = document.getElementById('schema-params-table');
  table.innerHTML = `<div class="audit-block">${params.map(([k,v]) => `<div class="audit-row"><span>${k}</span><span>${v}</span></div>`).join('')}</div>`;
}

function exportSVG() {
  const svg = document.getElementById('schematic-svg');
  if (!svg.innerHTML) { showToast('Aucun schéma à exporter'); return; }
  const data = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([data], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `schema-tir-${Date.now()}.svg`; a.click();
  URL.revokeObjectURL(url);
}

// ── RENDER DRAFTS ──
function renderDrafts() {
  const list = document.getElementById('drafts-list');
  const empty = document.getElementById('drafts-empty');
  const badge = document.getElementById('badge-encours');
  if (!drafts.length) {
    list.innerHTML = '';
    empty.style.display = 'block';
    badge.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  badge.style.display = 'inline';
  badge.textContent = drafts.length;
  const sections = ['A','B','C','D','E','F','G','H','I','J'];
  list.innerHTML = drafts.map(d => {
    const data = d.data || {};
    const filled = sections.filter(s => {
      if (s === 'A') return data.shotId;
      if (s === 'B') return data.blasterName;
      if (s === 'C') return data.trousMasse || data.totalTrous;
      if (s === 'D') return data.chargeTotale || data.firingSys;
      if (s === 'E') return data.timeFire;
      if (s === 'F') return data.checklist && Object.values(data.checklist).some(Boolean);
      if (s === 'G') return data.temp || data.eau;
      if (s === 'H') return data.ppvMax;
      if (s === 'I') return data.result;
      if (s === 'J') return data.sigBlasterName;
      return false;
    });
    const pct = Math.round(filled.length / sections.length * 100);
    return `<div class="draft-card">
      <div class="dc-header">
        <div class="dc-id">${data.shotId || d.id}</div>
        <span class="badge badge-yellow">${pct}%</span>
        <div class="dc-date">${data.date || fmtDt(d.modifiedAt)}</div>
      </div>
      <div class="dc-progress">
        ${sections.map(s => `<span class="dc-section ${filled.includes(s) ? 'done' : ''}">${s}</span>`).join('')}
      </div>
      <div class="draft-btns">
        <button class="btn btn-primary btn-sm" onclick="window.app.loadDraft('${d.id}')">✏️ Reprendre</button>
        <button class="btn btn-danger btn-sm" onclick="window.app.deleteDraft('${d.id}')">🗑 Supprimer</button>
      </div>
    </div>`;
  }).join('');
}

// ── RENDER HISTORY ──
function renderHistory() {
  const list = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');
  const query = document.getElementById('hist-search')?.value?.toLowerCase() || '';
  const filtered = journals.filter(j => {
    if (!query) return true;
    const data = j.data || {};
    return [j.id, data.shotId, data.date, data.station, data.blasterName].some(v => v && v.toLowerCase().includes(query));
  });
  if (!filtered.length) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  list.innerHTML = filtered.map(j => {
    const data = j.data || {};
    const result = data.result;
    const badge = result === 'succes' ? '<span class="badge badge-green">✅ Succès</span>' :
                  result === 'partiel' ? '<span class="badge badge-yellow">⚠️ Partiel</span>' :
                  result === 'rates' ? '<span class="badge badge-red">❌ Ratés</span>' :
                  '<span class="badge badge-gray">—</span>';
    return `<div class="hist-card" id="hc-${j.id}">
      <div class="hist-header" onclick="window.app.toggleHistCard('${j.id}')">
        <div class="hist-title">
          <div class="ht-id">${data.shotId || j.id} ${badge}</div>
          <div class="ht-date">${fmtDate(data.date)} · ${data.station || ''} · ${data.zoneType || ''}</div>
        </div>
        <div class="hist-btns">
          <button class="hist-btn" onclick="event.stopPropagation();window.app.viewJournal('${j.id}')">Voir</button>
          <button class="hist-btn" onclick="event.stopPropagation();window.app.exportJournalJSON('${j.id}')">JSON</button>
          <button class="hist-btn" onclick="event.stopPropagation();window.app.printJournalById('${j.id}')">🖨️</button>
          <button class="hist-btn del" onclick="event.stopPropagation();window.app.deleteJournal('${j.id}')">🗑</button>
        </div>
      </div>
      <div class="hist-body">
        <div class="form-row" style="margin-bottom:8px">
          <div><div style="font-size:11px;color:var(--text3)">Boutefeu</div><div style="font-size:13px">${data.blasterName||'—'} (${data.blasterSq||'—'})</div></div>
          <div><div style="font-size:11px;color:var(--text3)">Charge totale</div><div style="font-size:13px">${data.chargeTotale||'—'} kg</div></div>
        </div>
        <div class="form-row">
          <div><div style="font-size:11px;color:var(--text3)">Total trous</div><div style="font-size:13px">${data.totalTrous||'—'}</div></div>
          <div><div style="font-size:11px;color:var(--text3)">PPV max</div><div style="font-size:13px">${data.ppvMax||'—'} mm/s</div></div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function toggleHistCard(id) {
  document.getElementById('hc-' + id)?.classList.toggle('expanded');
}

function filterHistory() { renderHistory(); }

// ── DASHBOARD ──
function updateDashStats() {
  document.getElementById('stat-total').textContent = journals.length;
  document.getElementById('stat-drafts').textContent = drafts.length;
  const nowDate = new Date();
  const weekAgo = new Date(nowDate - 7*24*3600*1000);
  const monthAgo = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);
  const thisWeek = journals.filter(j => new Date(j.modifiedAt) >= weekAgo).length;
  const thisMonth = journals.filter(j => new Date(j.modifiedAt) >= monthAgo).length;
  document.getElementById('stat-thisweek').textContent = thisWeek;
  document.getElementById('stat-thismonth').textContent = thisMonth;

  const recent = [...journals].slice(0, 3);
  const rec = document.getElementById('dash-recent');
  rec.innerHTML = recent.length ? `
    <div style="padding:10px 0 4px;font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px">Récents</div>
    ${recent.map(j => {
      const data = j.data || {};
      return `<div class="hist-card" style="margin-bottom:8px" onclick="window.app.viewJournal('${j.id}')">
        <div class="hist-header" style="padding:10px 12px">
          <div class="hist-title">
            <div class="ht-id">${data.shotId||j.id}</div>
            <div class="ht-date">${fmtDate(data.date)} · ${data.station||''}</div>
          </div>
          <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:var(--text3);fill:none;stroke-width:2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>`;
    }).join('')}` : '';

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour 👷';
    if (h < 18) return 'Bon après-midi 👷';
    return 'Bonsoir 👷';
  };
  const nameEl = document.getElementById('dash-greeting');
  if (nameEl) nameEl.textContent = greeting() + (settings.first ? `, ${settings.first}` : '');
  const dateEl = document.getElementById('dash-date-str');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('fr-CA', {weekday:'long',year:'numeric',month:'long',day:'numeric'});
}

// ── EXPORT / IMPORT ──
function exportCurrentJSON() {
  if (!currentDraft) { showToast('Aucun journal actif'); return; }
  currentDraft.data = collectCurrentData();
  const blob = new Blob([JSON.stringify(currentDraft, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `journal-tir-${currentDraft.data.shotId || currentDraft.id}-${currentDraft.data.date || 'draft'}.json`;
  a.click(); URL.revokeObjectURL(url);
}

function exportJournalJSON(id) {
  const j = journals.find(j => j.id === id);
  if (!j) return;
  const blob = new Blob([JSON.stringify(j, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `journal-${j.data?.shotId || j.id}.json`;
  a.click(); URL.revokeObjectURL(url);
}

function exportAllData() {
  const data = { version: '3.0', exported: now(), settings, journals, drafts };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `journal-tir-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click(); URL.revokeObjectURL(url);
  showToast('💾 Backup exporté');
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.journals) { journals = data.journals; }
      if (data.drafts) { drafts = [...drafts, ...data.drafts.filter(d => !drafts.find(x => x.id === d.id))]; }
      if (data.settings) { Object.assign(settings, data.settings); }
      saveData(); loadSettings(); renderHistory(); renderDrafts(); updateDashStats();
      showToast('✅ Importé avec succès');
    } catch(err) { showToast('❌ Fichier JSON invalide'); }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function clearAllData() {
  showConfirm('Effacer toutes les données?', 'Tous les journaux et brouillons seront perdus. Irréversible.', () => {
    journals = []; drafts = []; currentDraft = null;
    saveData(); renderHistory(); renderDrafts(); updateDashStats();
    showToast('🗑 Données effacées');
  });
}

function printJournal() {
  if (currentDraft) currentDraft.data = collectCurrentData();
  window.print();
}

function printJournalById(id) {
  const j = journals.find(j => j.id === id);
  if (!j) return;
  viewJournal(id);
  setTimeout(() => window.print(), 300);
}

// ============================================================
// INIT
// ============================================================
function initApp() {
  loadData();
  loadSettings();
  updateDashStats();
  renderDrafts();
  renderHistory();
  initSigCanvas('sig-blaster');
  initSigCanvas('sig-super');
  updateChecklistHint();
  // Autosave interval
  setInterval(() => {
    if (currentDraft) {
      currentDraft.data = collectCurrentData();
      currentDraft.modifiedAt = now();
      const idx = drafts.findIndex(d => d.id === currentDraft.id);
      if (idx >= 0) {
        drafts[idx] = currentDraft;
        saveData();
      }
    }
  }, (settings.autosave || 30) * 1000);

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      console.log('SW registered:', reg.scope);
    }).catch(err => {
      console.warn('SW registration failed:', err);
    });
  }
}

// ============================================================
// GLOBAL EXPORTS — called from HTML onclick attributes
// ============================================================
window.app = {
  newJournal, saveDraft, finalizeJournal,
  loadDraft, deleteDraft, viewJournal, deleteJournal,
  toggleHistCard, filterHistory,
  switchTab, toggleCard, toggleCheck, selectRadio, updateTotalHoles,
  addAssistant, addSeismo, addExplosifRow,
  clearSig, openPDFImport, togglePDFPasteArea,
  handlePDFDrop, applyPDFData, handlePDFPaste,
  openModal, closeModal,
  runGenerateSchematic, exportSVG,
  saveSettings, exportCurrentJSON, exportAllData,
  exportJournalJSON, handleImport, clearAllData,
  printJournal, printJournalById,
  completeOnboarding,
};

// Also expose autoSave globally (used in dynamically-created HTML)
window.appAutoSave = autoSave;

// ── STARTUP ──
(function() {
  loadData();
  const setupDone = localStorage.getItem('jt_setup_done');
  if (setupDone) {
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    initApp();
  }
  // PDF paste area live parse
  document.addEventListener('DOMContentLoaded', () => {
    const ta = document.getElementById('pdf-paste-area');
    if (ta) {
      ta.addEventListener('paste', () => {
        setTimeout(() => handlePDFPaste(), 100);
      });
    }
  });
})();
