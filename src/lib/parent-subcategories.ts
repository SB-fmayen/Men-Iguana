import {
  type ParentMenuSlug,
  getParentSlugsFromCategory,
  getSubcategoryMeta,
} from '@/lib/subcategory-routing';

export interface ParentSubcategorySource<TSource = unknown> {
  id: string;
  name: string;
  parentCategory?: string;
  subcategory?: string;
  order: number;
  itemCount: number;
  routeName: string;
  source: TSource;
}

export interface ParentSubcategoryCard<TSource = unknown> {
  id: string;
  subcategorySlug: string;
  routeName: string;
  itemCount: number;
  label: string;
  sortOrder: number;
  sourceOrder: number;
  source: TSource;
}

export function buildParentSubcategoryCards<TSource>(
  categories: ParentSubcategorySource<TSource>[],
  parentSlug: ParentMenuSlug
): ParentSubcategoryCard<TSource>[] {
  const cardsBySubcategory = new Map<
    string,
    {
      source: TSource;
      routeName: string;
      itemCount: number;
      label: string;
      sortOrder: number;
      sourceOrder: number;
      hasExplicitSubcategory: boolean;
    }
  >();

  categories.forEach((category) => {
    const parentSlugs = getParentSlugsFromCategory(category.name, category.parentCategory);
    if (!parentSlugs.includes(parentSlug)) {
      return;
    }

    const subcategoryMeta = getSubcategoryMeta(category.name, parentSlug, category.subcategory, category.parentCategory);
    if (!subcategoryMeta) {
      return;
    }

    const isExplicit = !!category.subcategory?.trim();

    const existing = cardsBySubcategory.get(subcategoryMeta.key);
    if (!existing) {
      cardsBySubcategory.set(subcategoryMeta.key, {
        source: category.source,
        routeName: category.routeName,
        itemCount: category.itemCount,
        label: subcategoryMeta.label,
        sortOrder: subcategoryMeta.sortOrder,
        sourceOrder: category.order,
        hasExplicitSubcategory: isExplicit,
      });
      return;
    }

    // Prefer the source from a category with an explicit subcategory field
    const shouldReplaceSource = isExplicit && !existing.hasExplicitSubcategory;

    cardsBySubcategory.set(subcategoryMeta.key, {
      ...existing,
      source: shouldReplaceSource ? category.source : existing.source,
      routeName: shouldReplaceSource ? category.routeName : existing.routeName,
      hasExplicitSubcategory: existing.hasExplicitSubcategory || isExplicit,
      itemCount: existing.itemCount + category.itemCount,
    });
  });

  return Array.from(cardsBySubcategory.entries())
    .map(([subcategorySlug, entry]) => ({
      id: `${parentSlug}-${subcategorySlug}`,
      subcategorySlug,
      routeName: entry.routeName,
      itemCount: entry.itemCount,
      label: entry.label,
      sortOrder: entry.sortOrder,
      sourceOrder: entry.sourceOrder,
      source: entry.source,
    }))
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }

      return a.sourceOrder - b.sourceOrder;
    });
}
