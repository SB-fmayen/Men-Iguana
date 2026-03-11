# Men-Iguana

Aplicación web de menú digital con panel administrativo, construida con Next.js + Firebase.

## 1) Resumen del proyecto

- **Tipo de proyecto:** Web App full-stack (frontend + API routes server-side)
- **Framework principal:** Next.js (App Router)
- **Lenguaje:** TypeScript
- **Base de datos:** Cloud Firestore
- **Autenticación admin:** Google Sign-In + sesión por cookie (Firebase Admin SDK)
- **UI pública:** Menú por categorías/subcategorías + búsqueda + carrito + pedido por WhatsApp
- **UI admin:** Gestión de categorías, subcategorías, productos, papelería y administradores

---

## 2) Stack tecnológico

### Frontend
- **React 19**
- **Next.js 15**
- **Tailwind CSS**
- **Radix UI** (componentes base)
- **Framer Motion** (transiciones)
- **Lucide React** (íconos)

### Backend (dentro de Next)
- **Route Handlers de Next.js** en `src/app/api/**`
- **Firebase Admin SDK** para operaciones seguras de administración

### Datos y servicios
- **Firebase Firestore**
- **Firebase Auth**

### Extras
- **Genkit** configurado en `src/ai/**`

---

## 3) Arquitectura y organización

El proyecto sigue una organización basada en **Atomic Design** para UI (`atoms`, `molecules`, `organisms`) y separación de responsabilidades entre:

- **`src/app`**: rutas (públicas, admin y API)
- **`src/components`**: componentes visuales y de interacción
- **`src/lib`**: utilidades de dominio, auth admin, modelos y mapeos
- **`src/firebase`**: inicialización SDK cliente y hooks Firestore
- **`src/services`**: lógica reutilizable de negocio

### Rutas principales

#### Público
- `/` Inicio del menú
- `/menu/[category]` Vista de categoría
- `/menu/<parent-slug>` Vista de subcategorías padre (p.ej. pizzas grandes)
- `/buscar` Búsqueda
- `/promociones`

#### Admin
- `/admin/login` Login con Google
- `/admin` Dashboard admin
- `/admin/[category]` Gestión de productos por categoría
- `/admin/<parent-slug>` Gestión de subcategorías de una categoría padre
- `/admin/papeleria` Restauración de productos eliminados

---

## 4) Dónde está cada cosa (mapa rápido)

### Layout y navegación
- `src/app/layout.tsx` layout raíz
- `src/app/menu/layout.tsx` layout de vistas de menú público
- `src/components/organisms/menu-header.tsx` header
- `src/components/organisms/footer.tsx` footer

### Cliente (menú público)
- `src/app/page.tsx` home
- `src/components/organisms/categories-showcase.tsx` tarjetas de categorías
- `src/components/organisms/parent-subcategories-page.tsx` subcategorías públicas
- `src/app/menu/[category]/page.tsx` detalle de categoría
- `src/components/molecules/menu-item-card.tsx` card de producto
- `src/components/cart/cart-context.tsx` estado del carrito
- `src/components/organisms/cart-sheet.tsx` carrito + mensaje WhatsApp

### Admin (panel)
- `src/app/admin/page.tsx` entrada principal del admin
- `src/components/admin/admin-page-content.tsx` composición del dashboard
- `src/components/admin/admin-menu-viewer.tsx` gestión de categorías
- `src/components/admin/admin-parent-subcategories-page.tsx` gestión de subcategorías
- `src/app/admin/[category]/page.tsx` gestión de productos
- `src/app/admin/papeleria/page.tsx` papelería
- `src/components/admin/admin-managers.tsx` gestión de administradores

### Auth y seguridad admin
- `middleware.ts` protección de rutas `/admin/*`
- `src/lib/admin-auth.ts` reglas de autorización y sesión
- `src/lib/firebase-admin.ts` inicialización Admin SDK
- `src/app/api/admin/session/route.ts` creación de sesión admin
- `src/app/api/admin/status/route.ts` estado de sesión/admin
- `src/app/api/admin/logout/route.ts` cierre de sesión

### Catálogo y modelos
- `src/lib/menu-data.ts` seed/catálogo base
- `src/lib/menu-firestore.ts` tipos Firestore y mapeo
- `src/lib/subcategory-routing.ts` reglas de categorías padre/subcategorías

---

## 5) Modelo de datos (Firestore)

Colecciones principales:

- `categories`
	- `name`, `slug`, `parentCategory`, `subcategory`, `order`, `isActive`, `createdAt`, `updatedAt`
- `menu_items`
	- `name`, `description`, `price`, `options`, `categoryId`, `categoryName`, `categorySlug`, `order`, `isActive`, `createdAt`, `updatedAt`
- `deleted_menu_items`
	- Papelería (soft delete de productos)
- `system/admin`
	- Config de admin principal y admins adicionales
- `parent_menu_titles`
	- Títulos editables para categorías padre

---

## 6) Flujos funcionales

## 6.1 Flujo cliente (menú)
1. El usuario navega categorías/subcategorías.
2. Visualiza productos activos.
3. Agrega al carrito.
4. Genera mensaje para WhatsApp desde el carrito.

## 6.2 Flujo login admin
1. Usuario entra a `/admin/login`.
2. Inicia sesión con Google.
3. Frontend obtiene `idToken` y lo envía a `/api/admin/session`.
4. Backend valida token, confirma permisos admin y emite cookie de sesión.
5. Middleware permite acceso a `/admin/*`.

## 6.3 Flujo gestión de menú (admin)
1. Admin crea/edita categorías y subcategorías.
2. Admin activa/desactiva categorías.
3. Admin crea/edita/desactiva productos.

## 6.4 Flujo eliminación y papelería
1. Solo se permite eliminar producto si **está desactivado**.
2. Al eliminar, pasa a `deleted_menu_items` (no se borra definitivamente).
3. Desde `/admin/papeleria`, el admin puede restaurarlo.

## 6.5 Flujo multi-admin
1. Existe un admin principal (owner).
2. El owner puede agregar admins adicionales por correo.
3. También puede eliminarlos.
4. Todos los admins autorizados pueden iniciar sesión con el mismo flujo Google.

---

## 7) API admin (resumen)

Base: `src/app/api/admin/**`

- `POST /api/admin/session` crear cookie de sesión admin
- `GET /api/admin/status` estado admin/sesión
- `POST /api/admin/logout` cerrar sesión
- `POST /api/admin/categories` crear categoría
- `PATCH /api/admin/categories/[id]` editar categoría
- `POST /api/admin/menu-items` crear producto
- `PATCH /api/admin/menu-items/[id]` editar producto
- `DELETE /api/admin/menu-items/[id]` mover a papelería (si está desactivado)
- `GET /api/admin/papeleria/menu-items` listar papelera
- `POST /api/admin/papeleria/menu-items/[id]/restore` restaurar producto
- `GET /api/admin/parent-menu-titles` listar títulos padre
- `PATCH /api/admin/parent-menu-titles/[slug]` editar título padre
- `GET /api/admin/admins` listar administradores
- `POST /api/admin/admins` agregar admin adicional
- `DELETE /api/admin/admins` eliminar admin adicional

---

## 8) Variables de entorno

Para funcionalidades admin server-side (cookies, claims y escritura segura):

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY` (con `\n` escapados)

Ejemplo `/.env.local`:

```env
FIREBASE_ADMIN_PROJECT_ID=tu-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@tu-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE\n-----END PRIVATE KEY-----\n"
```

> Nota: en entornos con **Application Default Credentials**, puede funcionar sin declarar estas variables.

---

## 9) Scripts disponibles

- `npm run dev` desarrollo (puerto 9002)
- `npm run build` build producción
- `npm run start` correr build en producción
- `npm run lint` lint
- `npm run typecheck` chequeo TypeScript
- `npm run genkit:dev` / `npm run genkit:watch` utilidades Genkit

---

## 10) Levantar proyecto localmente

1. Instalar dependencias:
```bash
npm install
```

2. Configurar `/.env.local` (si aplica Admin SDK por variables).

3. Ejecutar:
```bash
npm run dev
```

4. Abrir:
`http://localhost:9002`

---

## 11) Seguridad y reglas

- La app pública lee catálogo desde Firestore.
- El panel admin usa API server-side con Admin SDK para operaciones críticas.
- `middleware.ts` protege `/admin/*` con cookie de sesión.
- Las reglas Firestore están definidas en `firestore.rules`.

---

## 12) Estado actual del sistema

- ✅ Catálogo público por categorías/subcategorías
- ✅ Carrito y mensaje de pedido por WhatsApp
- ✅ Panel admin completo para menú
- ✅ Papelería con restauración de productos
- ✅ Multi-admin (owner + admins adicionales)
- ✅ Edición de títulos en categorías y subcategorías

---

## 13) Recomendaciones de mantenimiento

- Mantener `typecheck` y `lint` como parte del flujo de cambios.
- Evitar cambios directos de estructura de datos sin actualizar `menu-firestore.ts`.
- Probar flujos admin críticos (login, CRUD, papelería, admins) después de cambios en auth/API.

