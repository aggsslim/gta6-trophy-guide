// Saved progress for the guide: which trophies are earned, kept in
// localStorage, with export to a JSON file and import back from one.
// Nothing here leaves the browser except the file the reader downloads.
const KEY = 'leonida-trophy-progress-v1';

// Demo seed used only for screenshots: ?demo=1 in the address bar ticks these
// 13 story trophies so a screenshot shows a half-filled tracker. It is
// screenshot seeding only — it never runs for a normal reader.
export const DEMO_EARNED = [
  'Just Like Paradise',
  'Paradise Lost',
  'T**s Ass Drug Money',
  'Vice City, Baby!',
  'Top Of The World, Ma',
  'Trust',
  'Break the Bank',
  'Family Matters',
  'DWNFALL',
  'Hi-Jacked',
  'Snow Storm',
  'Baited My Tackle',
  'Stick Fiddler',
];

export function loadEarned() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const list = JSON.parse(raw);
    return new Set(Array.isArray(list) ? list.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...earned]));
  } catch {
    // Storage may be full or blocked; the in-memory set still works.
  }
}

// Downloads the earned names as a JSON file the reader can keep.
export function exportEarned(earned) {
  const blob = new Blob([JSON.stringify([...earned], null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Reads a progress file back into an earned set. Returns null when the
// file is not a JSON list of trophy names.
export async function importEarned(file) {
  try {
    const parsed = JSON.parse(await file.text());
    if (!Array.isArray(parsed)) return null;
    return new Set(parsed.filter((n) => typeof n === 'string'));
  } catch {
    return null;
  }
}
