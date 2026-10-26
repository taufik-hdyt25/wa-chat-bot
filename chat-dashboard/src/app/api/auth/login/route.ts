import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, generateSessionToken, getExpectedCredentials } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const { user: expectedUser, pass: expectedPass } = getExpectedCredentials();

    if (username === expectedUser && password === expectedPass) {
      const token = generateSessionToken(expectedUser, expectedPass);
      const res = NextResponse.json({ ok: true });

      res.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return res;
    }

    return NextResponse.json(
      { ok: false, error: 'Email / Username atau password tidak sesuai.' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: 'Terjadi kesalahan sistem: ' + err.message },
      { status: 500 }
    );
  }
}
