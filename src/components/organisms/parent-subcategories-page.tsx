'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/atoms/page-transition';
import { ScrollReveal } from '@/components/atoms/scroll-reveal';
import { useFirestore } from '@/firebase';
import { menuData } from '@/lib/menu-data';
import { buildParentSubcategoryCards } from '@/lib/parent-subcategories';
import { useMenuCollections } from '@/hooks/use-menu-collections';
import { buildCategoriesWithItemCount } from '@/repositories/menu-repository';
import {
  type ParentMenuSlug,
  PARENT_MENU_CONFIG,
} from '@/lib/subcategory-routing';

export function ParentSubcategoriesPage({ parentSlug }: { parentSlug: ParentMenuSlug }) {
  const firestore = useFirestore();
  const { categories, items } = useMenuCollections(firestore);

  const categoriesFromFirestore = useMemo(() => {
    const categoriesWithCounts = buildCategoriesWithItemCount(categories, items, {
      onlyActiveCategories: true,
      onlyActiveItems: true,
    });

    if (categoriesWithCounts.length === 0) {
      return null;
    }

    return categoriesWithCounts;
  }, [categories, items]);

  const categoriesToRender =
    categoriesFromFirestore ??
    menuData.map((category) => ({
      id: category.name,
      name: category.name,
      parentCategory: category.parentCategory,
      subcategory: category.subcategory,
      order: 0,
      itemCount: category.items.length,
      routeName: category.name,
    }));

  const subcategoryCards = useMemo(() => {
    return buildParentSubcategoryCards(
      categoriesToRender.map((category) => ({
        ...category,
        source: null,
      })),
      parentSlug
    );
  }, [categoriesToRender, parentSlug]);

  const parentTitle = PARENT_MENU_CONFIG[parentSlug].title;

  return (
    <PageTransition>
      <main className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold mb-8">
          <ChevronLeft className="h-5 w-5" />
          Volver al inicio
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{parentTitle}</h1>
          <p className="text-lg text-gray-600">Selecciona una subcategoría</p>
        </div>

        {subcategoryCards.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 mb-6">No hay subcategorías disponibles.</p>
            <Link href="/">
              <Button className="bg-orange-600 hover:bg-orange-700">Volver al inicio</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-16 md:pb-24">
            {subcategoryCards.map((card, index) => (
              <ScrollReveal key={card.id} delay={index * 0.05} direction="up">
                <Link href={`/menu/${encodeURIComponent(card.routeName)}?parent=${parentSlug}`}>
                  <div className="flex flex-col h-full rounded-2xl border-4 border-black shadow-md hover:shadow-lg transition-all duration-200 bg-white overflow-hidden cursor-pointer group">
                    <div className="flex gap-4 p-6">
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-bold text-lg text-black mb-1">{`${parentTitle} ${card.label}`.toUpperCase()}</h3>
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </main>
    </PageTransition>
  );
}
