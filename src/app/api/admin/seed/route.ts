import { getCurrentAdminSession } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import { menuData } from '@/lib/menu-data';
import { FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Verify admin session
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Helper to generate slug from name
    const generateSlug = (name: string) => {
      return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '-')
        .replace(/-+/g, '-');
    };

    // Check if database is empty
    const categoriesSnapshot = await adminDb.collection('categories').get();

    // Only allow loading if categories collection is empty
    if (categoriesSnapshot.size > 0) {
      return NextResponse.json(
        {
          error:
            'La base de datos ya contiene datos. No se puede hacer una carga inicial de nuevo.',
          alreadyLoaded: true,
        },
        { status: 400 }
      );
    }

    let categoriesCreated = 0;
    let itemsCreated = 0;

    // Load all categories from menu-data
    for (let categoryIndex = 0; categoryIndex < menuData.length; categoryIndex++) {
      const category = menuData[categoryIndex];
      const slug = generateSlug(category.name);

      // Create category document
      const categoryRef = await adminDb.collection('categories').add({
        name: category.name,
        slug: slug,
        parentCategory: category.parentCategory ?? null,
        subcategory: category.subcategory ?? null,
        order: categoryIndex,
        isActive: true,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      categoriesCreated++;

      // Load menu items for this category
      if (category.items && Array.isArray(category.items)) {
        for (const item of category.items) {
          const menuItem: any = {
            name: item.name,
            price: item.price,
            categoryId: categoryRef.id,
            categoryName: category.name,
            isActive: true,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          };

          // Add optional fields if they exist
          if (item.description) {
            menuItem.description = item.description;
          }

          if (item.options && Array.isArray(item.options)) {
            menuItem.options = item.options;
          }

          await adminDb.collection('menu_items').add(menuItem);
          itemsCreated++;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      categoriesCreated,
      itemsCreated,
      message: `✅ Carga inicial completada: ${categoriesCreated} categorías y ${itemsCreated} items cargados exitosamente.`,
    });
  } catch (error) {
    console.error('Error en seed:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
