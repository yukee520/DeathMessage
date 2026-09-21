import SHA256 from 'crypto-js/sha256';
import Hex from 'crypto-js/enc-hex';

export function computeSha256(content: string): string {
  return SHA256(content).toString(Hex);
}

export function verifyChecksum(content: string, expected: string): boolean {
  if (!expected) return true;
  try {
    const actual = computeSha256(content);
    const normalized = expected.replace(/^sha256-/i, '').toLowerCase().trim();
    return actual.toLowerCase() === normalized;
  } catch {
    return false;
  }
}