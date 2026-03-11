import { NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const snapshot = await adminDb.collection('parent_menu_titles').get();
    const titles: Record<string, string> = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data() as { title?: string };
      if (data.title && data.title.trim()) {
        titles[doc.id] = data.title.trim();
      }
    });

    return NextResponse.json({ ok: true, titles });
  } catch (error) {
    console.error('Error loading parent menu titles:', error);
    return NextResponse.json({ error: 'Error al cargar títulos' }, { status: 500 });
  }
}
