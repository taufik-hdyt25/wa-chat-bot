export const AUTH_COOKIE_NAME = 'wa_dash_session';

export function getExpectedCredentials() {
  const user = process.env.DASHBOARD_USER || 'admin';
  const pass = process.env.DASHBOARD_PASS || 'admin';
  return { user, pass };
}

export function generateSessionToken(user: string, pass: string): string {
  return btoa(`session:${user}:${pass}`);
}

export function isValidSession(token: string | undefined | null): boolean {
  if (!token) return false;
  const { user, pass } = getExpectedCredentials();
  const expectedToken = generateSessionToken(user, pass);
  return token === expectedToken;
}
