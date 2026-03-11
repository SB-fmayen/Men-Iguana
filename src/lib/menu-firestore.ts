import type { MenuItem } from '@/lib/menu-data';

export interface FirestoreMenuCategory {
  id: string;
  name: string;
  slug: string;
  parentCategory?: string;
  subcategory?: string;
  order: number;
  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FirestoreMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  options?: { name: string; price: number }[];
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  order: number;
  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export function slugifyCategoryName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function toMenuItem(item: FirestoreMenuItem): MenuItem {
  return {
    name: item.name,
    price: item.price,
    description: item.description,
    options: item.options,
  };
}
