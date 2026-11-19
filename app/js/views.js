// Renders every view of the guide from the trophy data: the tracker list,
// the guide pane, the roadmap and the missables page. All text is set with
// textContent, never pasted as HTML, so trophy names stay exactly as listed.
import { isSpoilerHidden, matchesFilters, emptyMessage } from './filters.js';

const STAGE_INFO = {
  1: { title: 'Stage 1 — Play the story', blurb: 'Play the main story in order. Chapters 1–4 and the named story missions unlock by finishing them — nothing here can be missed, and nothing needs grinding.' },
  2: { title: 'Stage 2 — Side strands', blurb: 'Side characters with their own mission strands. Finish each strand’s final mission, plus 8 stranger strands across Leonida and Bret’s hunt.' },
  3: { title: 'Stage 3 — Collectibles', blurb: 'The long collections. Start early and chip away while travelling: card sets, WAiNK spots, meditation spots, vehicles, areas and garages.' },
  4: { title: 'Stage 4 — Activities and feats', blurb: 'Activities, races, robberies and one-off feats. Most are repeatable in free roam; the six possible missables are flagged on the Missables tab.' },
  5: { title: 'Stage 5 — Endgame and platinum', blurb: 'Finish the final mission, reach 100% completion, and the platinum unlocks by itself.' },
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function gradeTag(trophy) {
  return el('span', `tag grade-${trophy.grade}`, trophy.grade);
}

function countTag(trophy) {
  if (trophy.psn_count === null || trophy.psn_count === undefined) return null;
  const label = trophy.psn_count >= 1000 ? `$${trophy.psn_count.toLocaleString('en-US')}` : `0/${trophy.psn_count}`;
  return el('span', 'tag count-tag', `count ${label}`);
}

// Header progress: earned count, percent, and per-grade tallies.
export function updateProgress(doc, earned) {
  const total = doc.trophies.length;
  const done = doc.trophies.filter((t) => earned.has(t.name)).length;
  document.getElementById('progress-text').textContent = `${done} of ${total} earned`;
  document.getElementById('progress-pct').textContent = `${Math.round((done / total) * 100)}%`;
  document.getElementById('progress-fill').style.width = `${(done / total) * 100}%`;
  const byGrade = {};
  for (const t of doc.trophies) {
    if (!byGrade[t.grade]) byGrade[t.grade] = [0, 0];
    byGrade[t.grade][1] += 1;
    if (earned.has(t.name)) byGrade[t.grade][0] += 1;
  }
  const parts = ['platinum', 'gold', 'silver', 'bronze']
    .filter((g) => byGrade[g])
    .map((g) => `${byGrade[g][0]}/${byGrade[g][1]} ${g}`);
  document.getElementById('progress-grades').textContent = parts.join(' · ');
}

// Tracker list: one row per matching trophy with a tick box and a guide button.
export function renderList(doc, filters, earned, selectedName, onToggle, onSelect) {
  const list = document.getElementById('trophy-list');
  const hint = document.getElementById('list-hint');
  const empty = document.getElementById('empty-state');
  list.replaceChildren();
  const shown = doc.trophies.filter((t) => matchesFilters(t, filters, earned));
  const earnedShown = shown.filter((t) => earned.has(t.name)).length;
  hint.textContent = `Showing ${shown.length} of ${doc.trophies.length} trophies (${earnedShown} earned)`;
  if (shown.length === 0) {
    empty.hidden = false;
    empty.textContent = emptyMessage(filters);
    return;
  }
  empty.hidden = true;
  for (const t of shown) {
    const hidden = isSpoilerHidden(t, filters, earned);
    const row = el('li', 'trophy-row' + (earned.has(t.name) ? ' earned' : '') + (t.name === selectedName ? ' selected' : ''));
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Earned: ${t.name}`);
    box.addEventListener('change', () => onToggle(t.name));
    const body = el('div');
    body.append(
      el('div', 'trophy-name', hidden ? 'Hidden story trophy' : t.name),
      el('div', 'trophy-desc', hidden ? 'Hidden until earned — finish the story to reveal it.' : t.description),
    );
    const meta = el('div', 'trophy-meta');
    meta.append(gradeTag(t));
    if (t.kind) meta.append(el('span', 'tag', t.kind));
    if (t.missable) meta.append(el('span', 'tag missable-tag', 'possible missable'));
    const count = countTag(t);
    if (count) meta.append(count);
    if (t.psn_rarity) meta.append(el('span', 'tag rarity-tag', `PSN ${t.psn_rarity}`));
    body.append(meta);
    const actions = el('div', 'trophy-actions');
    const guideBtn = el('button', 'guide-btn', 'Guide');
    guideBtn.type = 'button';
    guideBtn.addEventListener('click', () => onSelect(t.name));
    actions.append(guideBtn);
    if (earned.has(t.name)) actions.append(el('span', 'earned-mark', '✓ Earned'));
    row.append(box, body, actions);
    list.append(row);
  }
}

// Guide pane: the selected trophy's guide, its sources as links, and its
// missable basis when it has one.
export function renderDetail(doc, trophy, filters, earned, onToggle) {
  const pane = document.getElementById('detail-pane');
  pane.replaceChildren();
  if (!trophy) {
    pane.append(el('p', 'pane-empty', 'Select a trophy to read its guide — the checklist, the official description, and the sources behind each step.'));
    return;
  }
  const hidden = isSpoilerHidden(trophy, filters, earned);
  pane.append(el('h2', null, hidden ? 'Hidden story trophy' : trophy.name));
  const meta = el('div', 'trophy-meta');
  meta.append(gradeTag(trophy));
  if (trophy.kind) meta.append(el('span', 'tag', trophy.kind));
  if (trophy.missable) meta.append(el('span', 'tag missable-tag', 'possible missable'));
  const count = countTag(trophy);
  if (count) meta.append(count);
  pane.append(meta);
  pane.append(el('p', 'trophy-desc', hidden ? 'Hidden until earned — finish the story to reveal it.' : trophy.description));
  if (hidden) {
    pane.append(el('p', 'pane-empty', 'Turn off “Hide story spoilers”, or tick this trophy as earned, to read its guide.'));
  } else {
    pane.append(el('p', 'guide-label', 'Guide'));
    pane.append(el('p', 'guide-text', trophy.guide));
    if (trophy.missable && trophy.missable_basis) {
      const note = el('p', 'missable-note');
      note.append(el('strong', null, 'Possible missable — '));
      note.append(document.createTextNode(trophy.missable_basis));
      pane.append(note);
    }
    if (Array.isArray(trophy.sources) && trophy.sources.length > 0) {
      pane.append(el('p', 'sources-label', 'Sources'));
      const list = el('ul', 'source-list');
      for (const s of trophy.sources) {
        const item = el('li');
        const link = document.createElement('a');
        link.href = s.url;
        link.textContent = s.name;
        link.target = '_blank';
        link.rel = 'noopener';
        item.append(link);
        list.append(item);
      }
      pane.append(list);
    }
  }
  const check = el('div', 'pane-check');
  const label = el('label');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.addEventListener('change', () => onToggle(trophy.name));
  label.append(box, document.createTextNode('I have earned this trophy'));
  check.append(label);
  pane.append(check);
}

// Roadmap: five stages built only from the official descriptions (the
// stage number each trophy carries in the data file).
export function renderRoadmap(doc, earned) {
  const host = document.getElementById('roadmap-stages');
  host.replaceChildren();
  for (const stage of [1, 2, 3, 4, 5]) {
    const members = doc.trophies.filter((t) => t.stage === stage);
    if (members.length === 0) continue;
    const info = STAGE_INFO[stage];
    const box = el('section', 'stage');
    box.append(el('h3', null, info.title));
    box.append(el('div', 'stage-count', `${members.length} trophies · ${members.filter((t) => earned.has(t.name)).length} earned`));
    box.append(el('p', null, info.blurb));
    const list = el('ul');
    for (const t of members) {
      const item = el('li', earned.has(t.name) ? 'earned' : null);
      item.append(document.createTextNode(`${earned.has(t.name) ? '✓ ' : ''}${t.name} — `));
      item.append(el('span', 'grade-dot', t.grade));
      list.append(item);
    }
    box.append(list);
    host.append(box);
  }
}

// About page: the two list sources, rendered from the data file so the
// source links live in one place (trophies.json) and nowhere else.
export function renderAboutSources(doc) {
  const host = document.getElementById('about-sources');
  host.replaceChildren();
  for (const s of doc.sources || []) {
    const item = el('li');
    const link = document.createElement('a');
    link.href = s.url;
    link.textContent = s.name;
    link.target = '_blank';
    link.rel = 'noopener';
    item.append(link);
    host.append(item);
  }
}

// Missables: the flagged candidates with the basis for each flag, plus a
// grouped summary of why the rest are expected safe.
export function renderMissables(doc) {
  const host = document.getElementById('missable-list');
  host.replaceChildren();
  for (const t of doc.trophies.filter((x) => x.missable)) {
    const card = el('article', 'missable-card');
    card.append(el('h3', null, `${t.name} — possible missable`));
    card.append(el('p', null, t.description));
    card.append(el('p', 'basis', t.missable_basis || ''));
    host.append(card);
  }
  const safe = document.getElementById('safe-list');
  safe.replaceChildren();
  const story = doc.trophies.filter((t) => !t.missable && t.kind === 'story').length;
  const counted = doc.trophies.filter((t) => !t.missable && t.psn_count !== null).length;
  const rest = doc.trophies.filter((t) => !t.missable && t.kind !== 'story' && t.psn_count === null).length;
  safe.append(
    el('li', null, `${story} story trophies (chapters and named missions) unlock by finishing that content — completing the mission is the trophy.`),
    el('li', null, `${counted} count trophies can be worked on at any time; nothing in their descriptions limits them to one moment.`),
    el('li', null, `${rest} repeatable activities and feats take place in free roam and can be retried as often as needed.`),
  );
}
