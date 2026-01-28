# Estructura del Proyecto - Atomic Design Pattern

## 📁 Organización de Componentes

El proyecto ahora sigue el patrón **Atomic Design** para organizar componentes de forma escalable y mantenible.

### Estructura de Carpetas

```
src/
├── components/
│   ├── atoms/              # Componentes pequeños y reutilizables
│   │   ├── page-transition.tsx
│   │   ├── scroll-reveal.tsx
│   │   ├── pizza-preloader.tsx
│   │   ├── whatsapp-button.tsx
│   │   └── FirebaseErrorListener.tsx
│   │
│   ├── molecules/          # Componentes medianos (conjuntos de átomos)
│   │   ├── menu-item-card.tsx
│   │   └── banner-carousel.tsx
│   │
│   ├── organisms/          # Componentes complejos (secciones completas)
│   │   ├── menu-header.tsx
│   │   ├── footer.tsx
│   │   ├── categories-showcase.tsx
│   │   └── promotions-section.tsx
│   │
│   └── ui/                 # Componentes de diseño (Radix UI)
│       └── [diversos componentes UI]
│
├── services/               # Lógica reutilizable
│   └── menuService.ts      # Servicio para operaciones del menú
│
├── app/                    # Rutas de Next.js
├── firebase/               # Configuración y utilidades de Firebase
├── hooks/                  # Hooks personalizados
├── lib/                    # Funciones auxiliares y datos
└── ...
```

## 🎯 Niveles de Componentes

### **Atoms** (Átomos)
Componentes básicos e indivisibles:
- Transiciones de página
- Efectos de scroll
- Precargadores
- Botones especiales
- Listeners de errores

**Características:**
- No dependen de otros componentes de negocio
- Altamente reutilizables
- Enfocados en un solo propósito

### **Molecules** (Moléculas)
Grupos pequeños de átomos que forman unidades funcionales:
- Cards de menú
- Carruseles de banners

**Características:**
- Combinan átomos para crear funcionalidad
- Pueden tener props y lógica simple
- Reutilizables en múltiples contextos

### **Organisms** (Organismos)
Componentes complejos que combinan moléculas y átomos:
- Encabezados del menú
- Pié de página
- Vitrinas de categorías
- Secciones de promociones

**Características:**
- Pueden contener lógica compleja
- Representan secciones completas de la página
- Pueden usar servicios y hooks

## 🛠️ Servicios

Los servicios contienen lógica reutilizable que puede ser compartida entre componentes:

### `menuService.ts`
Maneja todas las operaciones relacionadas con el menú:
- `getAllCategories()` - Obtiene todas las categorías
- `getCategoryByName(name)` - Busca una categoría específica
- `getCategoryItems(categoryName)` - Obtiene items de una categoría
- `getMenuItem(categoryName, itemName)` - Busca un item específico
- `calculatePrice()` - Calcula precios con opciones
- `searchItems(query)` - Busca items por nombre
- `getItemsByPriceRange()` - Filtra items por precio

**Uso:**
```typescript
import { menuService } from '@/services/menuService';

const categories = menuService.getAllCategories();
const lasagnaCategory = menuService.getCategoryByName('Lasaña');
const results = menuService.searchItems('pizza');
```

## 📦 Ventajas de esta Estructura

✅ **Claridad** - Sabe exactamente dónde encontrar cada componente  
✅ **Escalabilidad** - Fácil de agregar nuevos componentes  
✅ **Reutilización** - Componentes reutilizables sin duplicación  
✅ **Mantenimiento** - Cambios centralizados en servicios  
✅ **Testing** - Más fácil de testear componentes aislados  

## 🔄 Patrones Implementados

### 1. **Atomic Design**
Organización visual de componentes por complejidad

### 2. **Service Layer**
Lógica de negocio separada en servicios reutilizables

### 3. **Container/Presentational** (Próximamente)
- **Containers**: Manejan lógica y datos
- **Presentational**: Solo renderizan UI

## 🚀 Próximos Pasos

Cuando sea necesario:
1. Agregar más servicios (userService, promotionService, etc.)
2. Implementar estado global con Zustand o Context
3. Separar componentes en containers y presentational
4. Agregar tests unitarios
