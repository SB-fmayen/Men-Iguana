import { NextResponse } from 'next/server';
import { releaseAdminOwnership, getCurrentAdminSession } from '@/lib/admin-auth';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-constants';

export async function POST() {
  try {
    const session = await getCurrentAdminSession();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    await releaseAdminOwnership(session.uid);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo liberar el administrador.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
