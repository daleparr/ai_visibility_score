// Safe URL helpers for client/server
export function safeHostname(input?: string | null) {
  try {
    if (!input) return null;
    const u = typeof window !== 'undefined'
      ? new URL(input, window.location.origin)
      : new URL(input);
    return u.hostname;
  } catch {
    return null;
  }
}

export function safeHref(input?: string | null) {
  try {
    if (!input) return null;
    return typeof window !== 'undefined'
      ? new URL(input, window.location.origin).toString()
      : input;
  } catch {
    return null;
  }
}

// Build base API URL: server uses absolute, browser uses relative
export const getApiBase = () =>
  typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000')
    : '';

export function apiUrl(path: string) {
  const base = getApiBase();
  return base ? `${base}${path}` : path;
}



