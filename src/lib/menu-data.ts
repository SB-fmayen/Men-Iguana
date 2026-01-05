import type { LucideIcon } from 'lucide-react';
import { Utensils, Soup, CakeSlice, Pizza, Sandwich, Drumstick, HandPlatter, Wheat } from 'lucide-react';

export interface MenuItemOption {
  name: string;
  price: number;
}

export interface MenuItem {
  name: string;
  price: number;
  options?: MenuItemOption[];
  description?: string;
}

export interface MenuCategory {
  name: string;
  icon: LucideIcon;
  items: MenuItem[];
}

export const menuData: MenuCategory[] = [
  {
    name: 'Lasaña',
    icon: Utensils,
    items: [
      { name: 'Lasaña en salsa Alfredo (blanca)', price: 60.00, description: 'Incluye: Pan con ajo o mantequilla. Opciones: Pollo, tocino o champiñones.' },
      { name: 'Lasaña a la boloñesa', price: 50.00, description: 'Incluye: Pan con ajo o mantequilla. Opciones: Pollo, tocino o champiñones.' },
      { name: 'Porción extra de pan', price: 15.00 },
    ],
  },
  {
    name: 'Entradas',
    icon: Soup,
    items: [
      { name: 'Alitas (10 unidades)', price: 60.00, description: 'Aderezos: Ranch, barbacoa o cayenne' },
      { name: 'Cheese bread', price: 25.00 },
      { name: 'Parmesan bread', price: 25.00 },
      { name: 'Fundido de queso', price: 50.00 },
      { name: 'Chiles toreados', price: 35.00 },
    ],
  },
   {
    name: 'Hamburguesas',
    icon: Drumstick,
    items: [
      { name: 'Hamburguesa simple', price: 20.00 },
      { name: 'Quesoburguesa simple', price: 23.00 },
      { name: 'Torito simple', price: 28.00 },
      { name: 'Hamburguesa doble', price: 23.00 },
      { name: 'Quesoburguesa doble', price: 28.00 },
      { name: 'Torito doble', price: 35.00 },
      { name: 'Super torito', price: 40.00 },
      { name: 'Papas fritas', price: 15.00 },
      { name: 'Extra combo: Agrega papas + bebida', price: 15.00 },
    ],
  },
  {
    name: 'Pizzas Tradicionales',
    icon: Pizza,
    items: [
      { name: 'Pepperoni', price: 35.00 },
      { name: 'Jamón', price: 35.00 },
      { name: 'Salami', price: 35.00 },
      { name: 'Carne italiana', price: 35.00 },
      { name: 'Salchicha italiana', price: 35.00 },
      { name: 'Champiñones', price: 35.00 },
      { name: 'Chorizo', price: 35.00 },
    ],
  },
  {
    name: 'Pizzas Especialidades',
    icon: Pizza,
    items: [
        { name: 'Tocino', price: 40.00 },
        { name: '4 Quesos', price: 40.00 },
        { name: 'Hawaiana', price: 40.00 },
        { name: 'Jamón y Piña', price: 40.00 },
        { name: 'Americana', price: 40.00 },
        { name: 'Deluxe', price: 40.00 },
        { name: '5 Carnes', price: 40.00 },
        { name: 'Margarita', price: 40.00 },
        { name: 'Nacho Cheese', price: 40.00 },
        { name: 'Vegetariana', price: 40.00 },
    ],
  },
  {
    name: 'Pizzas Premium',
    icon: Pizza,
    items: [
        { name: 'Tecinteca Suprema', price: 50.00 },
        { name: '8 Carnes', price: 50.00 },
        { name: 'Deluxe Tecinteca', price: 50.00 },
        { name: '1+1', price: 50.00 },
    ],
  },
  {
    name: 'Tortillas de Harina',
    icon: Wheat,
    items: [
        { name: 'Pollo', price: 25.00 },
        { name: 'Carne', price: 25.00 },
        { name: 'Adobado', price: 25.00 },
        { name: 'Mixta', price: 40.00 },
        { name: 'Pollo con queso', price: 30.00 },
        { name: 'Carne con queso', price: 30.00 },
        { name: 'Adobado con queso', price: 30.00 },
        { name: 'Mixta con queso', price: 45.00 },
    ],
  },
    {
    name: 'Tortillas de Harina - Especialidad',
    icon: Wheat,
    items: [
        { name: 'Gringo', price: 45.00 },
        { name: 'Hawaiano', price: 45.00 },
        { name: 'Pizzero', price: 45.00 },
        { name: 'Mixta de embutidos', price: 45.00 },
        { name: 'Mixta de embutidos con queso', price: 50.00 },
    ],
  },
  {
    name: 'Shukos',
    icon: Sandwich,
    items: [
        { name: 'Chorizo (Pequeño 15 cm)', price: 10.00 },
        { name: 'Longaniza (Pequeño 15 cm)', price: 10.00 },
        { name: 'Salami (Pequeño 15 cm)', price: 10.00 },
        { name: 'Salchicha (Pequeño 15 cm)', price: 10.00 },
        { name: 'Tocino (Pequeño 15 cm)', price: 25.00 },
        { name: 'Carne (Pequeño 15 cm)', price: 25.00 },
        { name: 'Adobado (Pequeño 15 cm)', price: 25.00 },
        { name: 'Chorizo (Grande 30 cm)', price: 25.00 },
        { name: 'Longaniza (Grande 30 cm)', price: 25.00 },
        { name: 'Salami (Grande 30 cm)', price: 25.00 },
        { name: 'Salchicha (Grande 30 cm)', price: 25.00 },
        { name: 'Tocino (Grande 30 cm)', price: 40.00 },
        { name: 'Carne (Grande 30 cm)', price: 40.00 },
        { name: 'Adobado (Grande 30 cm)', price: 40.00 },
    ],
  },
  {
    name: 'Shukos - Especialidades',
    icon: Sandwich,
    items: [
        { name: 'Americano', price: 25.00, description: 'Pequeño Q25.00 | Grande Q40.00' },
        { name: 'Gringo', price: 25.00, description: 'Pequeño Q25.00 | Grande Q40.00' },
        { name: 'Hawaiano', price: 25.00, description: 'Pequeño Q25.00 | Grande Q40.00' },
        { name: 'Mixto', price: 25.00, description: 'Pequeño Q25.00 | Grande Q40.00' },
        { name: 'Mixta al pizzero', price: 25.00, description: 'Pequeño Q25.00 | Grande Q40.00' },
        { name: 'Al Pastor', price: 35.00, description: 'Pequeño Q35.00 | Grande Q65.00' },
        { name: 'Cheese Dog', price: 25.00, description: 'Pequeño Q25.00 | Grande Q40.00' },
        { name: 'Chilli Dog', price: 25.00, description: 'Pequeño Q25.00 | Grande Q40.00' },
        { name: 'Sándwich Italiano', price: 25.00, description: 'Pequeño Q25.00 | Grande Q40.00' },
    ],
  },
  {
    name: 'Extras',
    icon: HandPlatter,
    items: [
      { name: 'Pan extra (ajo o mantequilla)', price: 15.00 },
      { name: 'Picante de la casa', price: 15.00 },
    ],
  },
];
