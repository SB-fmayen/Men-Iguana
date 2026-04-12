import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = (await request.json()) as { name: string; parentCategory?: string; subcategory?: string };
    const { name, parentCategory, subcategory } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'El nombre de la categoría es requerido' }, { status: 400 });
    }

    // Get all existing categories to calculate order
    const categoriesSnapshot = await adminDb.collection('categories').get();
    const maxOrder = categoriesSnapshot.docs.reduce((max, doc) => {
      return Math.max(max, (doc.data().order ?? 0) as number);
    }, -1);

    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]/g, '');

    const newCategoryData: Record<string, unknown> = {
      name,
      slug,
      order: maxOrder + 1,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (parentCategory?.trim()) {
      newCategoryData.parentCategory = parentCategory.trim();
    }

    if (subcategory?.trim()) {
      newCategoryData.subcategory = subcategory.trim();
    }

    const docRef = await adminDb.collection('categories').add(newCategoryData);

    return NextResponse.json({
      ok: true,
      id: docRef.id,
      name,
      slug,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Error al crear la categoría' },
      { status: 500 }
    );
  }
}
