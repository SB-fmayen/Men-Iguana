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
      subcategory?: string;
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

    // Update subcategory if provided
    if (body.subcategory !== undefined) {
      updateData.subcategory = body.subcategory.trim() || null;
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;

    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const categoryRef = adminDb.collection('categories').doc(categoryId);
    const categorySnapshot = await categoryRef.get();

    if (!categorySnapshot.exists) {
      return NextResponse.json({ error: 'Subcategoría no encontrada' }, { status: 404 });
    }

    const categoryData = categorySnapshot.data();
    if (categoryData?.isActive !== false) {
      return NextResponse.json(
        { error: 'Debes desactivar la subcategoría antes de eliminarla' },
        { status: 400 }
      );
    }

    // Check there are no items in this category
    const itemsSnapshot = await adminDb
      .collection('menu_items')
      .where('categoryId', '==', categoryId)
      .limit(1)
      .get();

    if (!itemsSnapshot.empty) {
      return NextResponse.json(
        { error: 'No se puede eliminar una subcategoría que contiene productos' },
        { status: 400 }
      );
    }

    await categoryRef.delete();

    return NextResponse.json({ ok: true, id: categoryId });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la subcategoría' },
      { status: 500 }
    );
  }
}
