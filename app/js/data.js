// Loads the trophy data file for the guide. One job: fetch and parse
// data/trophies.json (a file inside app/, so this works with the network off).
export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('could not load trophy data');
  const doc = await response.json();
  if (!doc || !Array.isArray(doc.trophies)) throw new Error('trophy data is not a list');
  return doc;
}

// Finds one trophy by its official name, ignoring case and extra spaces.
export function findTrophy(doc, name) {
  const wanted = String(name || '').trim().toLowerCase();
  return doc.trophies.find((t) => t.name.trim().toLowerCase() === wanted) || null;
}

// Counts trophies per grade, for the header progress line.
export function gradeCounts(doc) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of doc.trophies) {
    if (Object.prototype.hasOwnProperty.call(counts, t.grade)) counts[t.grade] += 1;
  }
  return counts;
}
