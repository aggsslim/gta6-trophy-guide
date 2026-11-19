// Filter state for the tracker: kind, grade, text search, spoiler mode and
// the earned-only switch. One job: decide whether a trophy is shown.
export const KIND_LABELS = {
  all: 'All trophies',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

export function freshFilters() {
  return { kind: 'all', grade: 'all', query: '', spoilers: false, earnedOnly: false };
}

// A story trophy whose name is still hidden by the spoiler setting.
export function isSpoilerHidden(trophy, filters, earned) {
  return filters.spoilers && trophy.kind === 'story' && !earned.has(trophy.name);
}

export function matchesFilters(trophy, filters, earned) {
  if (filters.earnedOnly && !earned.has(trophy.name)) return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (filters.kind === 'online') {
    // The official list has no online trophies: this filter always matches
    // nothing, and the tracker shows an honest empty state for it.
    return false;
  } else if (filters.kind !== 'all' && trophy.kind !== filters.kind) {
    return false;
  }
  if (filters.query) {
    const hay = `${trophy.name} ${trophy.description}`.toLowerCase();
    if (!hay.includes(filters.query.toLowerCase())) return false;
  }
  return true;
}

// Message shown when a filter leaves the list empty.
export function emptyMessage(filters) {
  if (filters.kind === 'online') {
    return 'No online trophies: the official PlayStation list has no trophy that needs online play, so this filter is empty on purpose.';
  }
  if (filters.earnedOnly) return 'Nothing earned under this filter yet — tick a trophy off or clear the Earned only switch.';
  return 'No trophies match this filter. Try clearing the search or choosing another kind.';
}
