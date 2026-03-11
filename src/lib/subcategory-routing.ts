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
  explicitSubcategory?: string
): {
  key: string;
  label: string;
  sortOrder: number;
} | null {
  const normalizedName = normalizeText(name);
  const normalizedExplicit = explicitSubcategory ? normalizeText(explicitSubcategory) : '';

  const hasTradicional =
    normalizedName.includes('tradicional') ||
    normalizedName.includes('1 ingrediente') ||
    normalizedExplicit.includes('tradicional') ||
    normalizedExplicit.includes('1 ingrediente');
  const hasEspecial =
    normalizedName.includes('especial') ||
    normalizedExplicit.includes('especial');
  const hasPremium =
    normalizedName.includes('premium') ||
    normalizedExplicit.includes('premium');

  if (hasTradicional) {
    return { key: 'tradicionales', label: 'Tradicionales', sortOrder: 1 };
  }

  if (hasEspecial) {
    return { key: 'especialidades', label: 'Especialidades', sortOrder: 2 };
  }

  if (hasPremium) {
    return { key: 'premium', label: 'Premium', sortOrder: 3 };
  }

  if (parentSlug === 'tortillas-de-harina' || parentSlug === 'shukos') {
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
