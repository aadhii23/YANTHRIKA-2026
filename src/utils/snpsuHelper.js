/* ─────────────────────────────────────────────────────────────
   SNPSU Helper — shared logic for detecting Sapthagiri NPS
   University registrations and applying per-event limits.
   Used by both frontend (RegistrationModal) and backend (API).
   ───────────────────────────────────────────────────────────── */

/**
 * Normalises a college name for comparison:
 * lowercases, strips extra whitespace/dots/punctuation.
 */
export function normalizeCollegeName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[.\-_,;:!?'"()]/g, '')   // strip punctuation
    .replace(/\s+/g, ' ')              // collapse whitespace
    .trim();
}

/**
 * Returns true if the college name matches any known
 * Sapthagiri NPS University variant.
 */
export function isSnpsu(collegeName) {
  const norm = normalizeCollegeName(collegeName).replace(/\s+/g, '');
  return (
    norm.includes('sapthagiri') ||
    norm.includes('snpsu') ||
    norm.includes('saptagiri')       // common misspelling
  );
}

/**
 * SNPSU registration limits per event.
 * - `snpsuLimit: <number>` → max SNPSU registrations for that event
 * - `snpsuLimit: null` + `unlimitedForAll: true` → no cap for anyone
 * - Events with a limit only block SNPSU students; other colleges are unlimited.
 */
export const SNPSU_EVENT_RULES = {
  'Brainware':              { snpsuLimit: 20 },
  'Verbal Wars':            { snpsuLimit: 8 },
  'Byte Build (Software)':  { snpsuLimit: 10 },
  'Byte Build (Hardware)':  { snpsuLimit: 5 },
  'Venture Verse':          { snpsuLimit: 10 },
  'Old Roll':               { snpsuLimit: 5 },
  'Frame & Fame':           { snpsuLimit: 10 },
  'Brainy Bunch':           { snpsuLimit: 30 },
  'Syntax Wars':            { snpsuLimit: 12 },
  'Decipher':               { snpsuLimit: null },
  'Squad Siege (BGMI)':     { snpsuLimit: null, unlimitedForAll: true },
  'Squad Siege (Free Fire)': { snpsuLimit: null, unlimitedForAll: true },
};

/**
 * Returns the SNPSU limit for a given event name, or null if unlimited.
 * Uses exact match first, then substring fallback.
 */
export function getSnpsuLimit(eventName) {
  // Exact match
  if (SNPSU_EVENT_RULES[eventName]) {
    const rule = SNPSU_EVENT_RULES[eventName];
    if (rule.unlimitedForAll) return null;
    return rule.snpsuLimit;
  }
  // Substring fallback
  const lower = eventName.toLowerCase();
  const key = Object.keys(SNPSU_EVENT_RULES).find(k => lower.includes(k.toLowerCase()));
  if (!key) return null;
  const rule = SNPSU_EVENT_RULES[key];
  if (rule.unlimitedForAll) return null;
  return rule.snpsuLimit;
}

/**
 * Returns true if the event has no registration cap for any college.
 */
export function isUnlimitedForAll(eventName) {
  const rule = SNPSU_EVENT_RULES[eventName];
  return rule?.unlimitedForAll === true;
}

/** The exact error message to show when SNPSU is full */
export const SNPSU_FULL_MESSAGE = 'Seat for SNPSU is packed, sorry. You cannot register for this event.';
