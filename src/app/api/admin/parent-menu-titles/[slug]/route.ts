import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getCurrentAdminSession } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import { isParentMenuSlug } from '@/lib/subcategory-routing';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { slug } = await params;
    if (!isParentMenuSlug(slug)) {
      return NextResponse.json({ error: 'Categoría inválida' }, { status: 400 });
    }

    const body = (await request.json()) as { title?: string };
    const title = body.title?.trim();

    if (!title) {
      return NextResponse.json({ error: 'El título es requerido' }, { status: 400 });
    }

    await adminDb.collection('parent_menu_titles').doc(slug).set({
      title,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: session.uid,
    }, { merge: true });

    return NextResponse.json({ ok: true, slug, title });
  } catch (error) {
    console.error('Error updating parent menu title:', error);
    return NextResponse.json({ error: 'Error al actualizar el título' }, { status: 500 });
  }
}
