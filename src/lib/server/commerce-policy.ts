export const ownerKey = 'cocodingUserId';
export interface CommerceActor { id: string; email: string; name: string | null; stripeCustomerId?: string }
export class CommerceError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status=status; }
}
export function requireActor(actor: CommerceActor | null | undefined): CommerceActor {
  if (!actor || typeof actor.id !== 'string' || !actor.id.trim() || actor.id.length > 200) throw new CommerceError(401, 'Sign in to use the payment service.');
  return actor;
}
export function assertOwner(metadata: Record<string, string> | null | undefined, actor: CommerceActor) {
  requireActor(actor);
  if (!metadata || metadata[ownerKey] !== actor.id) throw new CommerceError(404, 'Record not found.');
}
export function recordId(value: unknown): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_]{1,200}$/.test(value)) throw new CommerceError(400, 'A valid record ID is required.');
  return value;
}
export function objectInput(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new CommerceError(400, 'A JSON object is required.');
  return value as Record<string, unknown>;
}
export type CatalogEntry = { kind: 'one-time'; name: string; unitAmount: number } | { kind: 'recurring'; priceId: string; trialDays?: number };
export type CommerceCatalog = Map<string, CatalogEntry>;
export function parseCatalog(raw: string | undefined): CommerceCatalog {
  if (!raw || raw.length > 32768) throw new CommerceError(501, 'The server price catalog is not configured.');
  let decoded: Record<string, unknown>;
  try { decoded = objectInput(JSON.parse(raw)); } catch { throw new CommerceError(501, 'The server price catalog is not configured correctly.'); }
  const entries = Object.entries(decoded);
  if (!entries.length || entries.length > 256) throw new CommerceError(501, 'The server price catalog is not configured correctly.');
  const catalog: CommerceCatalog = new Map();
  const planTrials = new Map<string, number | undefined>();
  for (const [key, value] of entries) {
    if (!key || key.length > 1600 || ['__proto__', 'constructor', 'prototype'].includes(key)) throw new CommerceError(501, 'The server price catalog is not configured correctly.');
    let item: Record<string, unknown>;
    try { item = objectInput(value); } catch { throw new CommerceError(501, 'The server price catalog is not configured correctly.'); }
    if (item.kind === 'one-time') {
      if (typeof item.name !== 'string' || !item.name.trim() || item.name.length > 120 || !Number.isSafeInteger(item.unitAmount) || (item.unitAmount as number) < 1 || (item.unitAmount as number) > 100_000_000) throw new CommerceError(501, 'The server price catalog is not configured correctly.');
      catalog.set(key, {kind:'one-time', name:item.name, unitAmount:item.unitAmount as number});
    } else if (item.kind === 'recurring') {
      if (typeof item.priceId !== 'string' || !/^price_[A-Za-z0-9_]{1,150}$/.test(item.priceId) || (item.trialDays !== undefined && (!Number.isSafeInteger(item.trialDays) || (item.trialDays as number) < 2 || (item.trialDays as number) > 30))) throw new CommerceError(501, 'The server price catalog is not configured correctly.');
      if (planTrials.has(item.priceId) && planTrials.get(item.priceId) !== item.trialDays) throw new CommerceError(501, 'Conflicting server plan configuration.');
      planTrials.set(item.priceId, item.trialDays as number | undefined);
      catalog.set(key, {kind:'recurring', priceId:item.priceId, trialDays:item.trialDays as number | undefined});
    } else throw new CommerceError(501, 'The server price catalog is not configured correctly.');
  }
  return catalog;
}
export function cartKey(item: Record<string, unknown>): string {
  if (!(typeof item.id === 'string' || (typeof item.id === 'number' && Number.isSafeInteger(item.id)))) throw new CommerceError(400, 'A valid product is required.');
  const values = [String(item.id), item.variant ?? '', item.size ?? '', item.color ?? ''];
  if (values.some(value => typeof value !== 'string' || value.length > 128 || value.includes('\0')) || !values[0]) throw new CommerceError(400, 'A valid product selection is required.');
  return (values as string[]).map(encodeURIComponent).join('|');
}
export function resolveCart(input: unknown, catalog: CommerceCatalog, mode: 'payment' | 'subscription') {
  if (!Array.isArray(input) || !input.length || input.length > 32) throw new CommerceError(400, 'Choose between 1 and 32 catalog items.');
  const selected = new Map<string, { key: string; quantity: number; product: CatalogEntry }>();
  for (const value of input) {
    const item = objectInput(value), key = cartKey(item), product = catalog.get(key);
    if (!product) throw new CommerceError(400, 'This product selection is not in the server catalog.');
    if ((mode === 'payment') !== (product.kind === 'one-time')) throw new CommerceError(400, 'The product does not support this checkout mode.');
    if (!Number.isSafeInteger(item.quantity) || (item.quantity as number) < 1 || (item.quantity as number) > 99) throw new CommerceError(400, 'Choose a quantity from 1 to 99.');
    const quantity = (selected.get(key)?.quantity ?? 0) + (item.quantity as number);
    if (quantity > 99) throw new CommerceError(400, 'The combined product quantity exceeds 99.');
    selected.set(key, {key, quantity, product});
  }
  return Array.from(selected.values());
}
export function paymentTotal(lines: ReturnType<typeof resolveCart>) {
  let amount = 0;
  for (const line of lines) {
    if (line.product.kind !== 'one-time') throw new CommerceError(400, 'A one-time product is required.');
    amount += line.product.unitAmount * line.quantity;
    if (!Number.isSafeInteger(amount) || amount > 100_000_000) throw new CommerceError(400, 'The order exceeds the supported amount.');
  }
  return amount;
}
export function configuredPlan(value: unknown, catalog: CommerceCatalog) {
  if (typeof value !== 'string') throw new CommerceError(400, 'A configured plan is required.');
  for (const product of catalog.values()) if (product.kind === 'recurring' && product.priceId === value) return product;
  throw new CommerceError(400, 'This plan is not in the server catalog.');
}
export function checkoutUrls(raw: string | undefined) {
  let base: URL;
  try { base = new URL(raw ?? ''); } catch { throw new CommerceError(501, 'The commerce return URL is not configured.'); }
  if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) throw new CommerceError(501, 'The commerce return URL is not configured correctly.');
  if (!base.pathname.endsWith('/')) base.pathname += '/';
  return {success:new URL('success', base).href, cancel:new URL('checkout', base).href};
}
