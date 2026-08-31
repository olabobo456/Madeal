/**
 * Deal IDs double as bearer tokens for the brand-facing portal link
 * (see getBrandPortalUrl in lib/cloudStore.ts) and Firestore rules rely
 * on them being unguessable — do not go back to sequential/timestamp IDs.
 */
export function generateSecureId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  // Fallback for older browsers without crypto.randomUUID
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${hex}`;
}
