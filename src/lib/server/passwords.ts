import { timingSafeEqual } from 'node:crypto';

const iterations = 600_000;
const maxPasswordBytes = 1024;
const prefix = `pbkdf2-sha256$${iterations}$`;
function passwordBytes(password: string): Uint8Array {
  if (typeof password !== 'string') throw new TypeError('Password must be text');
  const bytes = new TextEncoder().encode(password);
  if (!bytes.length || bytes.length > maxPasswordBytes) throw new RangeError('Password length is unsupported');
  return bytes;
}
async function derive(password: Uint8Array, salt: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', new Uint8Array(password), 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new Uint8Array(salt),iterations},key,256));
}
export async function hashPassword(password: string): Promise<string> {
  const bytes = passwordBytes(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await derive(bytes, salt);
  return prefix+Buffer.from(salt).toString('hex')+'$'+Buffer.from(key).toString('hex');
}
export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  if (typeof encoded !== 'string' || !encoded.startsWith(prefix)) return false;
  const parts = encoded.slice(prefix.length).split('$');
  if (parts.length !== 2 || !/^[0-9a-f]{32}$/.test(parts[0]) || !/^[0-9a-f]{64}$/.test(parts[1])) return false;
  let bytes: Uint8Array;
  try { bytes = passwordBytes(password); } catch { return false; }
  const key = await derive(bytes, new Uint8Array(Buffer.from(parts[0], 'hex')));
  return timingSafeEqual(Buffer.from(key), Buffer.from(parts[1], 'hex'));
}
