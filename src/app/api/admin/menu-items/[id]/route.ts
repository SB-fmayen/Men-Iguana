import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = (await request.json()) as {
      name?: string;
      price?: number;
      description?: string;
      isActive?: boolean;
    };

    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (body.name !== undefined) {
      if (!body.name || !body.name.trim()) {
        return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
      }
      updateData.name = body.name.trim();
    }

    if (body.price !== undefined) {
      const priceValue = Number(body.price);
      if (Number.isNaN(priceValue) || priceValue <= 0) {
        return NextResponse.json({ error: 'Precio invalido' }, { status: 400 });
      }
      updateData.price = priceValue;
    }

    if (body.description !== undefined) {
      updateData.description = body.description.trim();
    }

    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive;
    }

    await adminDb.collection('menu_items').doc(id).update(updateData);

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ error: 'Error al actualizar el producto' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const itemRef = adminDb.collection('menu_items').doc(id);
    const itemSnapshot = await itemRef.get();

    if (!itemSnapshot.exists) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    const itemData = itemSnapshot.data();

    if (itemData?.isActive !== false) {
      return NextResponse.json(
        { error: 'Debes desactivar el producto antes de eliminarlo' },
        { status: 400 }
      );
    }

    await adminDb.collection('deleted_menu_items').doc(id).set({
      ...itemData,
      originalId: id,
      deletedBy: session.uid,
      deletedAt: FieldValue.serverTimestamp(),
    });

    await itemRef.delete();

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: 'Error al eliminar el producto' }, { status: 500 });
  }
}
