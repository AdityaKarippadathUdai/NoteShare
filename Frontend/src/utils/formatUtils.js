/**
 * Normalizes user input for drop codes by removing dashes, spaces,
 * and converting to uppercase.
 * Example: '7kq-92p' => '7KQ92P'
 * 
 * @param {string} input 
 * @returns {string}
 */
export function normalizeCode(input) {
  if (!input) return '';
  return input.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/**
 * Formats a raw drop code into a spaced / hyphenated readable format.
 * Example: '7KQ92P' => '7KQ-92P'
 * 
 * @param {string} code 
 * @returns {string}
 */
export function formatCode(code) {
  if (!code) return '';
  const clean = normalizeCode(code);
  if (clean.length === 6) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  if (clean.length === 8) {
    return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  }
  return clean;
}

/**
 * Formats an ISO date string into a localized readable date/time.
 * 
 * @param {string} isoString 
 * @returns {string}
 */
export function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return '—';
  }
}

/**
 * Generates an unambiguous random 6-character drop code for local testing.
 * Omits easily confused characters like 0/O, 1/I.
 * 
 * @returns {string}
 */
export function generateRandomCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
