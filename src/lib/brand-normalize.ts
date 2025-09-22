/**
 * Canonicalization helpers for brand URLs.
 * - canonicalHost: lowercases, strips protocol + www, returns only the host
 * - normalizeBrandUrl: returns https://<host> (no path, no trailing slash)
 * - normalizeCompetitorUrl: safer normalizer that preserves path for competitor lists
 */

export function canonicalHost(raw: string): string {
  try {
    const input = raw?.trim() || ''
    const url = input.startsWith('http') ? input : `https://${input}`
    const u = new URL(url)
    let host = u.host.toLowerCase()
    if (host.startsWith('www.')) host = host.slice(4)
    return host
  } catch {
    const s = String(raw || '').trim().toLowerCase()
    return s
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
  }
}

export function normalizeBrandUrl(raw: string): string {
  const host = canonicalHost(raw)
  // One brand per host (tenant/user scoped by DB unique index)
  return `https://${host}`
}

export function normalizeCompetitorUrl(raw: string): string {
  try {
    const input = raw?.trim() || ''
    const url = input.startsWith('http') ? input : `https://${input}`
    const u = new URL(url)
    // Preserve origin + path, trim trailing slash to stabilize hashes
    return u.origin + u.pathname.replace(/\/+$/, '')
  } catch {
    return `https://${canonicalHost(raw)}`
  }
}

export function ensureJsonArray<T = unknown>(val: any): T[] {
  return Array.isArray(val) ? val as T[] : []
}