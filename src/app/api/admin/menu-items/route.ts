import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = (await request.json()) as {
      name: string;
      price: number;
      description?: string;
      categoryId: string;
      categoryName: string;
      categorySlug: string;
    };

    const { name, price, description, categoryId, categoryName, categorySlug } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    if (!categoryId || !categoryName || !categorySlug) {
      return NextResponse.json({ error: 'Categoria invalida' }, { status: 400 });
    }

    const priceValue = Number(price);
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      return NextResponse.json({ error: 'Precio invalido' }, { status: 400 });
    }

    const itemsSnapshot = await adminDb
      .collection('menu_items')
      .where('categoryId', '==', categoryId)
      .get();

    const maxOrder = itemsSnapshot.docs.reduce((max, doc) => {
      return Math.max(max, (doc.data().order ?? 0) as number);
    }, -1);

    const docRef = await adminDb.collection('menu_items').add({
      name: name.trim(),
      price: priceValue,
      description: description?.trim() ?? '',
      options: [],
      categoryId,
      categoryName,
      categorySlug,
      order: maxOrder + 1,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true, id: docRef.id });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Error al crear el producto' }, { status: 500 });
  }
}
