import { menuData, type MenuCategory, type MenuItem } from '@/lib/menu-data';

/**
 * Servicio para manejar operaciones relacionadas con el menú
 */
export const menuService = {
  /**
   * Obtiene todas las categorías del menú
   */
  getAllCategories(): MenuCategory[] {
    return menuData;
  },

  /**
   * Obtiene una categoría específica por nombre
   */
  getCategoryByName(categoryName: string): MenuCategory | undefined {
    return menuData.find((cat) => cat.name === categoryName);
  },

  /**
   * Obtiene todos los items de una categoría
   */
  getCategoryItems(categoryName: string): MenuItem[] {
    const category = this.getCategoryByName(categoryName);
    return category?.items || [];
  },

  /**
   * Obtiene un item específico de una categoría
   */
  getMenuItem(categoryName: string, itemName: string): MenuItem | undefined {
    const items = this.getCategoryItems(categoryName);
    return items.find((item) => item.name === itemName);
  },

  /**
   * Calcula el precio total con opciones seleccionadas
   */
  calculatePrice(basePrice: number, selectedOptions?: string[]): number {
    // Aquí puedes agregar lógica adicional para calcular precios con opciones
    return basePrice;
  },

  /**
   * Busca items por nombre en todas las categorías
   */
  searchItems(query: string): MenuItem[] {
    const results: MenuItem[] = [];
    menuData.forEach((category) => {
      category.items.forEach((item) => {
        if (item.name.toLowerCase().includes(query.toLowerCase())) {
          results.push(item);
        }
      });
    });
    return results;
  },

  /**
   * Obtiene items dentro de un rango de precio
   */
  getItemsByPriceRange(minPrice: number, maxPrice: number): MenuItem[] {
    const results: MenuItem[] = [];
    menuData.forEach((category) => {
      category.items.forEach((item) => {
        if (item.price >= minPrice && item.price <= maxPrice) {
          results.push(item);
        }
      });
    });
    return results;
  },
};
