// Boots the Leonida Trophy Guide: loads the data, wires the toolbar, tabs
// and deep links, and re-renders on every change. Progress lives in
// localStorage through store.js; nothing is fetched at run time except the
// data file inside app/ itself.
import { loadTrophies, findTrophy } from './data.js';
import { loadEarned, saveEarned, exportEarned, importEarned, DEMO_EARNED } from './store.js';
import { freshFilters } from './filters.js';
import { updateProgress, renderList, renderDetail, renderRoadmap, renderMissables, renderAboutSources } from './views.js';

const doc = await loadTrophies();
const filters = freshFilters();
const params = new URLSearchParams(location.search);
let earned = loadEarned();
let selectedName = null;

// ?demo=1 seeds 13 earned trophies for screenshots (see store.js). It only
// applies when this browser has no saved progress of its own.
if (params.get('demo') === '1' && earned.size === 0) {
  earned = new Set(DEMO_EARNED.filter((n) => doc.trophies.some((t) => t.name === n)));
  saveEarned(earned);
}
// ?spoilers=1 turns the spoiler setting on at load; ?kind= and ?grade=
// preselect a filter, so a link can open the guide already filtered.
if (params.get('spoilers') === '1') filters.spoilers = true;
if (params.get('kind')) filters.kind = params.get('kind');
if (params.get('grade')) filters.grade = params.get('grade');

const VIEWS = ['tracker', 'roadmap', 'missables', 'about'];

function showView(name) {
  if (!VIEWS.includes(name)) name = 'tracker';
  for (const v of VIEWS) {
    document.getElementById(`view-${v}`).classList.toggle('active', v === name);
    document.getElementById(`tab-${v}`).classList.toggle('active', v === name);
  }
}

// Deep links: #trophy=<official name> opens that trophy's guide,
// #roadmap / #missables / #about switch sections.
function readHash() {
  const hash = location.hash.replace(/^#/, '');
  if (hash.startsWith('trophy=')) {
    const trophy = findTrophy(doc, decodeURIComponent(hash.slice('trophy='.length)));
    if (trophy) {
      selectedName = trophy.name;
      showView('tracker');
      return;
    }
  }
  if (VIEWS.includes(hash)) showView(hash);
  else if (hash === '') showView('tracker');
}

function renderAll() {
  updateProgress(doc, earned);
  renderList(doc, filters, earned, selectedName, toggleEarned, selectTrophy);
  renderDetail(doc, selectedName ? findTrophy(doc, selectedName) : null, filters, earned, toggleEarned);
  renderRoadmap(doc, earned);
  renderMissables(doc);
  renderAboutSources(doc);
}

function toggleEarned(name) {
  if (earned.has(name)) earned.delete(name);
  else earned.add(name);
  saveEarned(earned);
  renderAll();
}

function selectTrophy(name) {
  selectedName = name;
  renderAll();
  document.getElementById('detail-pane').scrollIntoView({ block: 'nearest' });
  if (location.hash !== `#trophy=${encodeURIComponent(name)}`) {
    history.replaceState(null, '', `#trophy=${encodeURIComponent(name)}`);
  }
}

document.getElementById('search').addEventListener('input', (e) => {
  filters.query = e.target.value;
  renderList(doc, filters, earned, selectedName, toggleEarned, selectTrophy);
});
document.getElementById('grade').addEventListener('change', (e) => {
  filters.grade = e.target.value;
  renderList(doc, filters, earned, selectedName, toggleEarned, selectTrophy);
});
document.getElementById('spoilers').addEventListener('change', (e) => {
  filters.spoilers = e.target.checked;
  renderAll();
});
document.getElementById('earned-only').addEventListener('change', (e) => {
  filters.earnedOnly = e.target.checked;
  renderList(doc, filters, earned, selectedName, toggleEarned, selectTrophy);
});
for (const btn of document.querySelectorAll('#kind-filters .kind-btn')) {
  btn.addEventListener('click', () => {
    filters.kind = btn.dataset.kind;
    for (const other of document.querySelectorAll('#kind-filters .kind-btn')) {
      other.classList.toggle('active', other === btn);
    }
    renderList(doc, filters, earned, selectedName, toggleEarned, selectTrophy);
  });
}
for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => {
    showView(tab.dataset.view);
    history.replaceState(null, '', `#${tab.dataset.view === 'tracker' ? '' : tab.dataset.view}`);
  });
}
document.getElementById('export').addEventListener('click', () => exportEarned(earned));
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const next = await importEarned(file);
  if (next) {
    earned = new Set([...next].filter((n) => doc.trophies.some((t) => t.name === n)));
    saveEarned(earned);
    renderAll();
  }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  earned = new Set();
  saveEarned(earned);
  renderAll();
});

// Apply the query params to the toolbar controls, then render.
document.getElementById('spoilers').checked = filters.spoilers;
document.getElementById('grade').value = ['all', 'platinum', 'gold', 'silver', 'bronze'].includes(filters.grade) ? filters.grade : 'all';
for (const btn of document.querySelectorAll('#kind-filters .kind-btn')) {
  btn.classList.toggle('active', btn.dataset.kind === filters.kind);
}
window.addEventListener('hashchange', () => {
  readHash();
  renderAll();
});
readHash();
renderAll();
