import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getCurrentAdminSession } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const deletedRef = adminDb.collection('deleted_menu_items').doc(id);
    const deletedSnapshot = await deletedRef.get();

    if (!deletedSnapshot.exists) {
      return NextResponse.json({ error: 'Producto no encontrado en papelería' }, { status: 404 });
    }

    const deletedData = deletedSnapshot.data() as Record<string, unknown>;
    const originalId = typeof deletedData.originalId === 'string' ? deletedData.originalId : id;

    const { deletedAt, deletedBy, originalId: _originalId, ...restoredData } = deletedData;

    await adminDb.collection('menu_items').doc(originalId).set({
      ...restoredData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await deletedRef.delete();

    return NextResponse.json({ ok: true, id: originalId });
  } catch (error) {
    console.error('Error restoring paper bin item:', error);
    return NextResponse.json({ error: 'Error al restaurar el producto' }, { status: 500 });
  }
}
