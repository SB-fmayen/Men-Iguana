import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession, transferAdminOwnership } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentAdminSession();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const body = (await request.json()) as { newAdminEmail?: string };
    const newAdminEmail = body?.newAdminEmail?.trim();

    if (!newAdminEmail) {
      return NextResponse.json({ error: 'Debes enviar el correo del nuevo admin.' }, { status: 400 });
    }

    const result = await transferAdminOwnership(session.uid, newAdminEmail);

    return NextResponse.json({
      ok: true,
      changed: result.changed,
      newOwnerEmail: result.newOwnerEmail,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo transferir el administrador.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
