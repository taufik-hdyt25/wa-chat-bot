import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, isValidSession } from '@/lib/auth';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static assets, images, and auth api routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico' ||
    pathname === '/logo.png'
  ) {
    return NextResponse.next();
  }

  const sessionToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = isValidSession(sessionToken);

  // If already logged in and visiting /login, redirect to /
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // If not authenticated, redirect to /login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|logo.png).*)'],
};
