export function generateSecureId(prefix: string): string {
  const gCrypto = typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;
  if (gCrypto && typeof gCrypto.randomUUID === 'function') {
    return `${prefix}_${gCrypto.randomUUID()}`;
  }
  const bytes = new Uint8Array(16);
  if (gCrypto && typeof gCrypto.getRandomValues === 'function') {
    gCrypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${hex}`;
}
