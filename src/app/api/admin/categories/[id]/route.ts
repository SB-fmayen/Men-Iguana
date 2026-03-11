import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;

    // Verify admin session
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const body = (await request.json()) as {
      name?: string;
      isActive?: boolean;
    };

    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Update name if provided
    if (body.name !== undefined) {
      if (!body.name || !body.name.trim()) {
        return NextResponse.json(
          { error: 'El nombre de la categoría es requerido' },
          { status: 400 }
        );
      }

      const slug = body.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '');

      updateData.name = body.name;
      updateData.slug = slug;
    }

    // Update isActive if provided
    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive;
    }

    const categoryRef = adminDb.collection('categories').doc(categoryId);
    await categoryRef.update(updateData);

    return NextResponse.json({
      ok: true,
      id: categoryId,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la categoría' },
      { status: 500 }
    );
  }
}
