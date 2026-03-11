import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const CATEGORIES = [
  'Lasaña',
  'Entradas',
  'Hamburguesas',
  'Pizzas Personales (1 Ingrediente)',
  'Pizzas Personales de Especialidad',
  'Pizzas Personales Premium',
  'Pizzas Grandes (1 Ingrediente)',
  'Pizzas Grandes de Especialidad',
  'Pizzas Grandes de Especialidad Premium',
  'Don Calzone - Tradicionales',
  'Don Calzone - Especialidades',
  'Don Calzone - Premium',
  'Enrollado - Tradicionales',
  'Enrollado - Especialidades',
  'Enrollado - Premium',
  'Cono Pizza - Tradicionales',
  'Cono Pizza - Especialidades',
  'Cono Pizza - Premium',
  'Tortillas de Harina',
  'Tortillas de Harina - Especialidad',
  'Shukos',
  'Shukos - Especialidades',
  'Extras',
  'Bebidas',
];

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Get existing categories
    const snapshot = await adminDb.collection('categories').get();
    const existingNames = new Set(snapshot.docs.map((doc) => doc.data().name));

    // Add missing categories
    const created = [];
    let maxOrder = -1;

    // Get max order from existing categories
    snapshot.docs.forEach((doc) => {
      const order = (doc.data().order ?? 0) as number;
      if (order > maxOrder) {
        maxOrder = order;
      }
    });

    for (const categoryName of CATEGORIES) {
      if (!existingNames.has(categoryName)) {
        const [parentCandidate, subcategoryCandidate] = categoryName.split(' - ');
        const isSubmenuCategory = parentCandidate === 'Don Calzone' || parentCandidate === 'Enrollado';

        const slug = categoryName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]/g, '');

        maxOrder++;

        await adminDb.collection('categories').add({
          name: categoryName,
          slug: slug,
          parentCategory: isSubmenuCategory ? parentCandidate : null,
          subcategory: isSubmenuCategory ? subcategoryCandidate : null,
          order: maxOrder,
          isActive: true,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        created.push(categoryName);
      }
    }

    return NextResponse.json({
      ok: true,
      restored: created,
      count: created.length,
    });
  } catch (error) {
    console.error('Error restoring categories:', error);
    return NextResponse.json(
      { error: 'Error al restaurar categorías' },
      { status: 500 }
    );
  }
}
