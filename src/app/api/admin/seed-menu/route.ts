import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getCurrentAdminSession } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import { menuData } from '@/lib/menu-data';
import { slugifyCategoryName } from '@/lib/menu-firestore';

export async function POST() {
  try {
    const session = await getCurrentAdminSession();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const batch = adminDb.batch();
    let categoriesCount = 0;
    let itemsCount = 0;

    menuData.forEach((category, categoryIndex) => {
      const categoryId = slugifyCategoryName(category.name);
      const categoryRef = adminDb.collection('categories').doc(categoryId);

      batch.set(
        categoryRef,
        {
          name: category.name,
          slug: categoryId,
          parentCategory: category.parentCategory ?? null,
          subcategory: category.subcategory ?? null,
          order: categoryIndex,
          isActive: true,
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      categoriesCount += 1;

      category.items.forEach((item, itemIndex) => {
        const itemId = `${categoryId}--${slugifyCategoryName(item.name)}--${itemIndex}`;
        const itemRef = adminDb.collection('menu_items').doc(itemId);

        batch.set(
          itemRef,
          {
            name: item.name,
            description: item.description ?? '',
            price: item.price,
            options: item.options ?? [],
            categoryId,
            categoryName: category.name,
            categorySlug: categoryId,
            order: itemIndex,
            isActive: true,
            updatedAt: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        itemsCount += 1;
      });
    });

    await batch.commit();

    return NextResponse.json({ ok: true, categoriesCount, itemsCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo importar el menú base.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
