import { NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/admin-auth';
import { emptyPaperBinCollection } from '@/lib/paper-bin';

export async function POST() {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const deletedCount = await emptyPaperBinCollection();

    return NextResponse.json({ ok: true, deletedCount });
  } catch (error) {
    console.error('Error emptying paper bin:', error);
    return NextResponse.json({ error: 'Error al vaciar la papelería' }, { status: 500 });
  }
}
