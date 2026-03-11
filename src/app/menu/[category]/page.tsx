'use client';

import { useMemo } from 'react';
import { MenuItemCard } from '@/components/molecules/menu-item-card';
import { menuData } from '@/lib/menu-data';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { PageTransition } from '@/components/atoms/page-transition';
import { ScrollReveal } from '@/components/atoms/scroll-reveal';
import { useFirestore } from '@/firebase';
import { useMenuCollections } from '@/hooks/use-menu-collections';
import { getPublicCategoryWithItemsByName } from '@/repositories/menu-repository';
import {
  PARENT_MENU_CONFIG,
  getParentSlugsFromCategory,
  getSubcategoryMeta,
  isParentMenuSlug,
} from '@/lib/subcategory-routing';

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryName = decodeURIComponent(params.category as string);
  const firestore = useFirestore();
  const { categories, items } = useMenuCollections(firestore);

  const categoryFromFirestore = useMemo(() => {
    return getPublicCategoryWithItemsByName(categories, items, categoryName);
  }, [categories, items, categoryName]);

  const category = categoryFromFirestore ?? menuData.find((cat) => cat.name === categoryName);

  const requestedParent = searchParams.get('parent');
  const requestedParentConfig =
    requestedParent && isParentMenuSlug(requestedParent)
      ? PARENT_MENU_CONFIG[requestedParent]
      : null;

  const inferredParentSlug = category
    ? getParentSlugsFromCategory(category.name, category.parentCategory)[0]
    : undefined;

  const inferredParentConfig = inferredParentSlug ? PARENT_MENU_CONFIG[inferredParentSlug] : null;
  const backHref = requestedParentConfig?.href ?? inferredParentConfig?.href ?? '/';
  const backLabel = requestedParentConfig?.title ?? inferredParentConfig?.title ?? 'inicio';

  const selectedParentSlug =
    requestedParent && isParentMenuSlug(requestedParent)
      ? requestedParent
      : inferredParentSlug;

  const displayCategoryLabel = useMemo(() => {
    if (!category || !selectedParentSlug) {
      return category?.name;
    }

    const subcategoryMeta = getSubcategoryMeta(
      category.name,
      selectedParentSlug,
      category.subcategory
    );

    if (!subcategoryMeta) {
      return category.name;
    }

    return `${PARENT_MENU_CONFIG[selectedParentSlug].title} ${subcategoryMeta.label}`;
  }, [category, selectedParentSlug]);

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Categoría no encontrada</h1>
        <Link href="/">
          <Button className="bg-orange-600 hover:bg-orange-700">
            Volver al inicio
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <PageTransition>
      <main className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Link href={backHref} className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold mb-8">
        <ChevronLeft className="h-5 w-5" />
        {`Volver a ${backLabel}`}
      </Link>

      {/* Category Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {category.name}
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          {category.items.length} productos disponibles
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-16 md:pb-24">
        {category.items.map((item, index) => (
          <ScrollReveal key={item.name} delay={index * 0.05} direction="up">
            <MenuItemCard item={item} categoryName={category.name} categoryLabel={displayCategoryLabel} />
          </ScrollReveal>
        ))}
      </div>
    </main>
    </PageTransition>
  );
}
