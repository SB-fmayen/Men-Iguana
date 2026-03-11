import type { MenuItem } from '@/lib/menu-data';
import type { FirestoreMenuCategory, FirestoreMenuItem } from '@/lib/menu-firestore';
import { toMenuItem } from '@/lib/menu-firestore';

export interface CategoryWithItemCount {
  id: string;
  name: string;
  routeName: string;
  parentCategory?: string;
  subcategory?: string;
  order: number;
  isActive: boolean;
  itemCount: number;
}

export interface CategoryWithItems {
  id: string;
  slug: string;
  name: string;
  parentCategory?: string;
  subcategory?: string;
  items: FirestoreMenuItem[];
}

export interface PublicCategoryWithItems {
  name: string;
  parentCategory?: string;
  subcategory?: string;
  items: MenuItem[];
}

export function getSortedCategories(
  categoriesRaw: FirestoreMenuCategory[] | null | undefined,
  options?: { onlyActive?: boolean }
) {
  const onlyActive = options?.onlyActive ?? false;

  return (categoriesRaw ?? [])
    .filter((category) => (onlyActive ? category.isActive !== false : true))
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getItemsByCategoryIdCount(
  itemsRaw: FirestoreMenuItem[] | null | undefined,
  options?: { onlyActive?: boolean }
) {
  const onlyActive = options?.onlyActive ?? false;

  return (itemsRaw ?? []).reduce<Record<string, number>>((accumulator, item) => {
    if (onlyActive && item.isActive === false) {
      return accumulator;
    }

    accumulator[item.categoryId] = (accumulator[item.categoryId] ?? 0) + 1;
    return accumulator;
  }, {});
}

export function buildCategoriesWithItemCount(
  categoriesRaw: FirestoreMenuCategory[] | null | undefined,
  itemsRaw: FirestoreMenuItem[] | null | undefined,
  options?: { onlyActiveCategories?: boolean; onlyActiveItems?: boolean }
): CategoryWithItemCount[] {
  const categories = getSortedCategories(categoriesRaw, {
    onlyActive: options?.onlyActiveCategories ?? false,
  });
  const itemsByCategoryId = getItemsByCategoryIdCount(itemsRaw, {
    onlyActive: options?.onlyActiveItems ?? false,
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    routeName: category.name,
    parentCategory: category.parentCategory,
    subcategory: category.subcategory,
    order: category.order ?? 0,
    isActive: category.isActive !== false,
    itemCount: itemsByCategoryId[category.id] ?? 0,
  }));
}

export function getCategoryWithItemsByName(
  categoriesRaw: FirestoreMenuCategory[] | null | undefined,
  itemsRaw: FirestoreMenuItem[] | null | undefined,
  categoryName: string
): CategoryWithItems | null {
  const categories = categoriesRaw ?? [];
  const matchedCategory = categories.find((category) => category.name === categoryName);

  if (!matchedCategory) {
    return null;
  }

  const items = (itemsRaw ?? [])
    .filter((item) => item.categoryId === matchedCategory.id)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return {
    id: matchedCategory.id,
    slug: matchedCategory.slug,
    name: matchedCategory.name,
    parentCategory: matchedCategory.parentCategory,
    subcategory: matchedCategory.subcategory,
    items,
  };
}

export function getPublicCategoryWithItemsByName(
  categoriesRaw: FirestoreMenuCategory[] | null | undefined,
  itemsRaw: FirestoreMenuItem[] | null | undefined,
  categoryName: string
): PublicCategoryWithItems | null {
  const categories = getSortedCategories(categoriesRaw, { onlyActive: true });
  const matchedCategory = categories.find((category) => category.name === categoryName);

  if (!matchedCategory) {
    return null;
  }

  const items = (itemsRaw ?? [])
    .filter((item) => item.isActive !== false && item.categoryId === matchedCategory.id)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => toMenuItem(item));

  return {
    name: matchedCategory.name,
    parentCategory: matchedCategory.parentCategory,
    subcategory: matchedCategory.subcategory,
    items,
  };
}

export function buildSearchDataSource(
  categoriesRaw: FirestoreMenuCategory[] | null | undefined,
  itemsRaw: FirestoreMenuItem[] | null | undefined
) {
  const categories = getSortedCategories(categoriesRaw, { onlyActive: true });
  const items = (itemsRaw ?? []).filter((item) => item.isActive !== false);

  return categories.map((category) => ({
    category: category.name,
    items: items
      .filter((item) => item.categoryId === category.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((item) => toMenuItem(item)),
  }));
}
