import type { LucideIcon } from 'lucide-react';
import { Utensils, Soup, CakeSlice, GlassWater } from 'lucide-react';

export interface MenuItemOption {
  name: string;
  price: number;
}

export interface MenuItem {
  name: string;
  price: number;
  options?: MenuItemOption[];
}

export interface MenuCategory {
  name: string;
  icon: LucideIcon;
  items: MenuItem[];
}

export const menuData: MenuCategory[] = [
  {
    name: 'Appetizers',
    icon: Soup,
    items: [
      { name: 'Iguana Egg Rolls', price: 8.99, options: [{ name: 'Spicy Sauce', price: 1.00 }] },
      { name: 'Gecko Green Salad', price: 10.99 },
      { name: 'Swamp Dip & Chips', price: 9.99 },
      { name: 'Canopy-Copters', price: 11.99 },
    ],
  },
  {
    name: 'Main Courses',
    icon: Utensils,
    items: [
      { name: 'Grilled Iguana Steak', price: 24.99 },
      { name: 'Chameleon Chicken Curry', price: 18.99, options: [{ name: 'Extra Spice', price: 1.50 }, { name: 'Add Naan', price: 3.00 }] },
      { name: 'Lizard Tail Tacos', price: 16.99 },
      { name: 'Rainforest Risotto', price: 20.99 },
      { name: 'Python Pasta', price: 17.99 },
      { name: 'The Amazon Burger', price: 15.99 },
    ],
  },
  {
    name: 'Desserts',
    icon: CakeSlice,
    items: [
      { name: 'Lime Lava Cake', price: 7.99 },
      { name: 'Mango Mousse', price: 6.99 },
      { name: 'Jungle Jello', price: 5.99 },
    ],
  },
  {
    name: 'Drinks',
    icon: GlassWater,
    items: [
      { name: 'Pond Water Punch', price: 4.99 },
      { name: 'Creek Soda', price: 2.99 },
      { name: 'Jungle Juice', price: 5.99 },
    ],
  },
];
