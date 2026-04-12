export type ParentMenuSlug =
  | 'don-calzone'
  | 'enrrollados'
  | 'cono-pizza'
  | 'pizzas-personales'
  | 'pizzas-grandes'
  | 'tortillas-de-harina'
  | 'shukos';

export type SubcategorySlug = 'tradicionales' | 'especialidades' | 'premium';

export const PARENT_MENU_CONFIG: Record<ParentMenuSlug, { title: string; href: string; adminHref: string }> = {
  'don-calzone': {
    title: 'Don Calzone',
    href: '/menu/don-calzone',
    adminHref: '/admin/don-calzone',
  },
  enrrollados: {
    title: 'Enrrollados',
    href: '/menu/enrrollados',
    adminHref: '/admin/enrrollados',
  },
  'cono-pizza': {
    title: 'Cono Pizza',
    href: '/menu/cono-pizza',
    adminHref: '/admin/cono-pizza',
  },
  'pizzas-personales': {
    title: 'Pizzas Personales',
    href: '/menu/pizzas-personales',
    adminHref: '/admin/pizzas-personales',
  },
  'pizzas-grandes': {
    title: 'Pizzas Grandes',
    href: '/menu/pizzas-grandes',
    adminHref: '/admin/pizzas-grandes',
  },
  'tortillas-de-harina': {
    title: 'Tortillas de Harina',
    href: '/menu/tortillas-de-harina',
    adminHref: '/admin/tortillas-de-harina',
  },
  shukos: {
    title: 'Shukos',
    href: '/menu/shukos',
    adminHref: '/admin/shukos',
  },
};

export function isParentMenuSlug(value: string): value is ParentMenuSlug {
  return value in PARENT_MENU_CONFIG;
}

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function getSubcategorySlug(value: string): SubcategorySlug | null {
  const normalized = normalizeText(value);

  if (normalized.includes('tradicional')) {
    return 'tradicionales';
  }

  if (normalized.includes('especial')) {
    return 'especialidades';
  }

  if (normalized.includes('premium')) {
    return 'premium';
  }

  return null;
}

export function getSubcategoryMeta(
  name: string,
  parentSlug: ParentMenuSlug,
  explicitSubcategory?: string,
  parentCategory?: string
): {
  key: string;
  label: string;
  sortOrder: number;
} | null {
  // El campo subcategory explícito tiene prioridad total.
  // Se usa su valor como label y se genera la key a partir de él.
  if (explicitSubcategory?.trim()) {
    const normalizedExplicit = normalizeText(explicitSubcategory);
    const cleanKey = normalizedExplicit.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (cleanKey) {
      // Mantener sortOrder canónico para las subcategorías estándar
      if (cleanKey === 'tradicionales') return { key: 'tradicionales', label: explicitSubcategory.trim(), sortOrder: 1 };
      if (cleanKey === 'especialidades') return { key: 'especialidades', label: explicitSubcategory.trim(), sortOrder: 2 };
      if (cleanKey === 'premium') return { key: 'premium', label: explicitSubcategory.trim(), sortOrder: 3 };
      return { key: cleanKey, label: explicitSubcategory.trim(), sortOrder: 10 };
    }
  }

  // Keyword matching solo para categorías legacy sin campo subcategory
  const normalizedName = normalizeText(name);

  if (normalizedName.includes('tradicional') || normalizedName.includes('1 ingrediente')) {
    return { key: 'tradicionales', label: 'Tradicionales', sortOrder: 1 };
  }

  if (normalizedName.includes('especial')) {
    return { key: 'especialidades', label: 'Especialidades', sortOrder: 2 };
  }

  if (normalizedName.includes('premium')) {
    return { key: 'premium', label: 'Premium', sortOrder: 3 };
  }

  // Fallback solo para categorías creadas desde el admin (tienen parentCategory explícito).
  // Categorías legacy sin parentCategory no aparecen como tarjetas de subcategoría.
  if (
    (parentSlug === 'tortillas-de-harina' || parentSlug === 'shukos') &&
    parentCategory?.trim()
  ) {
    return { key: 'tradicionales', label: 'Tradicionales', sortOrder: 1 };
  }

  return null;
}

export function getParentSlugsFromCategory(name: string, parentCategory?: string): ParentMenuSlug[] {
  const parentNormalized = parentCategory ? normalizeText(parentCategory) : '';
  if (parentNormalized === 'don calzone') {
    return ['don-calzone'];
  }

  if (
    parentNormalized === 'enrrollado' ||
    parentNormalized === 'enrrollados' ||
    parentNormalized === 'enrollado' ||
    parentNormalized === 'enrollados'
  ) {
    return ['enrrollados'];
  }

  if (parentNormalized === 'cono pizza') {
    return ['cono-pizza'];
  }

  if (parentNormalized === 'pizzas personales') {
    return ['pizzas-personales'];
  }

  if (parentNormalized === 'pizzas grandes') {
    return ['pizzas-grandes'];
  }

  if (parentNormalized === 'tortillas de harina') {
    return ['tortillas-de-harina'];
  }

  if (parentNormalized === 'shukos') {
    return ['shukos'];
  }

  const normalizedName = normalizeText(name);
  const hasCalzone = normalizedName.includes('don calzone');
  const hasEnrollado = normalizedName.includes('enrrollado') || normalizedName.includes('enrollado');

  if (hasCalzone && hasEnrollado) {
    return ['don-calzone', 'enrrollados'];
  }

  if (hasCalzone) {
    return ['don-calzone'];
  }

  if (hasEnrollado) {
    return ['enrrollados'];
  }

  if (normalizedName.startsWith('cono pizza')) {
    return ['cono-pizza'];
  }

  if (normalizedName.startsWith('pizzas personales')) {
    return ['pizzas-personales'];
  }

  if (normalizedName.startsWith('pizzas grandes')) {
    return ['pizzas-grandes'];
  }

  if (normalizedName.startsWith('tortillas de harina')) {
    return ['tortillas-de-harina'];
  }

  if (normalizedName.startsWith('shukos')) {
    return ['shukos'];
  }

  return [];
}
