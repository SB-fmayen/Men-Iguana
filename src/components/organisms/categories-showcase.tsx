'use client';

import { useMemo } from 'react';
import { menuData } from '@/lib/menu-data';
import Link from 'next/link';
import { ScrollReveal } from '@/components/atoms/scroll-reveal';
import { useFirestore } from '@/firebase';
import { useMenuCollections } from '@/hooks/use-menu-collections';
import { buildCategoriesWithItemCount } from '@/repositories/menu-repository';
import { PARENT_MENU_CONFIG, getParentSlugsFromCategory } from '@/lib/subcategory-routing';

export function CategoriesShowcase() {
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
    menuData.map((category) => {
      return {
        id: category.name,
        name: category.name,
        routeName: category.name,
        parentCategory: category.parentCategory,
        itemCount: category.items.length,
      };
    });

  const cardsToRender = useMemo(() => {
    const parentCards = new Map<string, { id: string; name: string; routeName: string; itemCount: number }>();
    const orderedCards: Array<{ id: string; name: string; routeName: string; itemCount: number }> = [];

    categoriesToRender.forEach((category) => {
      const parentSlugs = getParentSlugsFromCategory(category.name, category.parentCategory);

      if (parentSlugs.length === 0) {
        orderedCards.push({
          id: category.id,
          name: category.name,
          routeName: `/menu/${encodeURIComponent(category.routeName)}`,
          itemCount: category.itemCount,
        });
        return;
      }

      parentSlugs.forEach((parentSlug) => {
        const parentConfig = PARENT_MENU_CONFIG[parentSlug];
        const existing = parentCards.get(parentSlug);

        if (!existing) {
          const parentCard = {
            id: `parent-${parentSlug}`,
            name: parentConfig.title,
            routeName: parentConfig.href,
            itemCount: category.itemCount,
          };
          parentCards.set(parentSlug, parentCard);
          orderedCards.push(parentCard);
          return;
        }

        existing.itemCount += category.itemCount;
      });
    });

    return orderedCards;
  }, [categoriesToRender]);

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-black-700">
              MENÚ
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardsToRender.map((category, index) => (
            <ScrollReveal key={category.id} delay={index * 0.05} direction="up">
              <Link href={category.routeName}>
                <div className="flex flex-col h-full rounded-2xl border-4 border-black shadow-md hover:shadow-lg transition-all duration-200 bg-white overflow-hidden cursor-pointer group">
                  <div className="flex gap-4 p-6">
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="font-bold text-lg text-black mb-1">{category.name.toUpperCase()}</h3>
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
