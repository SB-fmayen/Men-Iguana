import { NextRequest, NextResponse } from 'next/server';
import { addAdditionalAdmin, getAdminConfig, getAllAdmins, getCurrentAdminSession, removeAdditionalAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const admins = await getAllAdmins();

    return NextResponse.json({ ok: true, admins });
  } catch (error) {
    console.error('Error getting admins:', error);
    return NextResponse.json({ error: 'Error al cargar administradores' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const config = await getAdminConfig();
    if (!config || config.ownerUid !== session.uid) {
      return NextResponse.json({ error: 'Solo el admin principal puede agregar administradores' }, { status: 403 });
    }

    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim();

    if (!email) {
      return NextResponse.json({ error: 'Debes enviar el correo del administrador' }, { status: 400 });
    }

    const result = await addAdditionalAdmin(session.uid, email);

    return NextResponse.json({
      ok: true,
      added: result.added,
      email: result.email,
      uid: result.uid,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al agregar administrador';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const config = await getAdminConfig();
    if (!config || config.ownerUid !== session.uid) {
      return NextResponse.json({ error: 'Solo el admin principal puede eliminar administradores' }, { status: 403 });
    }

    const body = (await request.json()) as { uid?: string };
    const uid = body.uid?.trim();

    if (!uid) {
      return NextResponse.json({ error: 'Debes enviar el uid del administrador' }, { status: 400 });
    }

    const result = await removeAdditionalAdmin(session.uid, uid);

    return NextResponse.json({
      ok: true,
      removed: result.removed,
      uid: result.uid,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al eliminar administrador';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
