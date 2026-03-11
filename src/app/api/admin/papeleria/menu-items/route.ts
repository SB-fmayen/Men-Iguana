import { NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import { runScheduledPaperBinCleanupIfDue } from '@/lib/paper-bin';

export async function GET() {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const scheduledExecution = await runScheduledPaperBinCleanupIfDue(session.uid);

    const snapshot = await adminDb
      .collection('deleted_menu_items')
      .orderBy('deletedAt', 'desc')
      .get();

    const items = snapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      const deletedAtRaw = data.deletedAt as { toDate?: () => Date } | undefined;
      const deletedAtDate = deletedAtRaw?.toDate?.();

      return {
        id: doc.id,
        originalId: typeof data.originalId === 'string' ? data.originalId : doc.id,
        name: typeof data.name === 'string' ? data.name : 'Sin nombre',
        categoryName: typeof data.categoryName === 'string' ? data.categoryName : 'Sin categoría',
        price: typeof data.price === 'number' ? data.price : 0,
        deletedAt: deletedAtDate ? deletedAtDate.toISOString() : null,
      };
    });

    return NextResponse.json({
      ok: true,
      items,
      scheduledExecution,
    });
  } catch (error) {
    console.error('Error getting paper bin items:', error);
    return NextResponse.json({ error: 'Error al cargar la papelería' }, { status: 500 });
  }
}
