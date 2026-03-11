import { NextRequest, NextResponse } from 'next/server';
import {
  createAdminSessionCookie,
  ensureSingleAdmin,
} from '@/lib/admin-auth';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE } from '@/lib/admin-constants';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { idToken?: string };
    const idToken = body?.idToken;

    if (!idToken) {
      return NextResponse.json({ error: 'Falta idToken.' }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken, true);
    const email = decoded.email;

    if (!email) {
      return NextResponse.json({ error: 'Tu cuenta de Google no tiene email verificable.' }, { status: 403 });
    }

    const result = await ensureSingleAdmin(decoded.uid, email);

    if (!result.allowed) {
      return NextResponse.json(
        { error: 'Esta aplicación ya tiene un administrador diferente.' },
        { status: 403 }
      );
    }

    const sessionCookie = await createAdminSessionCookie(idToken);
    const response = NextResponse.json({ ok: true, created: result.created });

    response.cookies.set(ADMIN_SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error('Admin session error:', error);

    const errorMessage =
      error instanceof Error &&
      (error.message.toLowerCase().includes('default credentials') ||
        error.message.toLowerCase().includes('private key') ||
        error.message.toLowerCase().includes('service account'))
        ? 'Falta configurar credenciales del servidor (Admin SDK).'
        : 'No se pudo iniciar la sesión admin.';

    return NextResponse.json({ error: errorMessage }, { status: 401 });
  }
}
