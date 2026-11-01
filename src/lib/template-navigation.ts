export type NavigationTarget =
  | { kind: 'internal'; path: string }
  | { kind: 'external'; href: string }
  | { kind: 'fragment'; fragment: string }
  | { kind: 'blocked' };

/** Normalize a link before SvelteKit resolves it, without applying the base twice. */
export function navigationTarget(href: string | null | undefined, base: string): NavigationTarget {
  if (!href) return { kind: 'blocked' };
  if (href.startsWith('#')) return { kind: 'fragment', fragment: href.slice(1) };
  if (/^(https?:|mailto:|tel:|blob:)/i.test(href) || href.startsWith('//')) {
    return { kind: 'external', href };
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.includes('\\')) return { kind: 'blocked' };
  let path = href.startsWith('/') ? href : '/' + href;
  if (base && (path === base || path.startsWith(base + '/') || path.startsWith(base + '?') || path.startsWith(base + '#'))) {
    path = path.slice(base.length) || '/';
    if (!path.startsWith('/')) path = '/' + path;
  }
  try {
    const pathname = path.split(/[?#]/, 1)[0];
    for (const part of pathname.split('/')) {
      const decoded = decodeURIComponent(part);
      if (decoded === '.' || decoded === '..' || /[/\\]/.test(decoded)) return { kind: 'blocked' };
    }
  } catch {
    return { kind: 'blocked' };
  }
  return { kind: 'internal', path };
}
