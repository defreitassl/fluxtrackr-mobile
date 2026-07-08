export type AccessTokenPayload = {
  email?: string;
  sub?: string;
};

export function decodeAccessToken(token: string): AccessTokenPayload | null {
  const [, payload] = token.split('.');

  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = globalThis.atob(normalized);

    return JSON.parse(decoded) as AccessTokenPayload;
  } catch {
    return null;
  }
}
