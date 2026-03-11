'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Edit2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { PageTransition } from '@/components/atoms/page-transition';
import { ScrollReveal } from '@/components/atoms/scroll-reveal';
import { useFirestore } from '@/firebase';
import { useMenuCollections } from '@/hooks/use-menu-collections';
import type { FirestoreMenuCategory, FirestoreMenuItem } from '@/lib/menu-firestore';
import { getCategoryWithItemsByName } from '@/repositories/menu-repository';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PARENT_MENU_CONFIG,
  getParentSlugsFromCategory,
  isParentMenuSlug,
} from '@/lib/subcategory-routing';

export default function AdminCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryName = decodeURIComponent(params.category as string);
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<FirestoreMenuItem | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPrice, setEditingPrice] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingCategoryTitle, setIsEditingCategoryTitle] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categoryTitleDraft, setCategoryTitleDraft] = useState('');
  const { categories, items, isLoading } = useMenuCollections(firestore);

  const categoryData = useMemo(() => {
    return getCategoryWithItemsByName(categories, items, categoryName);
  }, [categories, items, categoryName]);

  const requestedParent = searchParams.get('parent');
  const requestedParentConfig =
    requestedParent && isParentMenuSlug(requestedParent)
      ? PARENT_MENU_CONFIG[requestedParent]
      : null;

  const inferredParentSlug = categoryData
    ? getParentSlugsFromCategory(categoryData.name, categoryData.parentCategory)[0]
    : undefined;

  const inferredParentConfig = inferredParentSlug ? PARENT_MENU_CONFIG[inferredParentSlug] : null;
  const backHref = requestedParentConfig?.adminHref ?? inferredParentConfig?.adminHref ?? '/admin';
  const backLabel = requestedParentConfig?.title ?? inferredParentConfig?.title ?? 'menú';

  const activeItemsCount = useMemo(
    () => categoryData?.items.filter((item) => item.isActive !== false).length ?? 0,
    [categoryData]
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Categoría no encontrada</h1>
        <Link href="/admin">
          <Button className="bg-orange-600 hover:bg-orange-700">
            Volver al menú
          </Button>
        </Link>
      </div>
    );
  }

  const handleCreateItem = async () => {
    if (!newItemName.trim() || !newItemPrice.trim()) return;

    const priceValue = Number(newItemPrice);
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      alert('Ingresa un precio valido.');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/admin/menu-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newItemName.trim(),
          price: priceValue,
          description: newItemDescription.trim(),
          categoryId: categoryData.id,
          categoryName: categoryData.name,
          categorySlug: categoryData.slug,
        }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(error?.error ?? 'Error al crear el producto');
      }

      setNewItemName('');
      setNewItemPrice('');
      setNewItemDescription('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating item:', error);
      alert(error instanceof Error ? error.message : 'Error al crear el producto');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditItem = async () => {
    if (!editingItem || !editingName.trim() || !editingPrice.trim()) return;

    const priceValue = Number(editingPrice);
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      alert('Ingresa un precio valido.');
      return;
    }

    setIsEditing(true);
    try {
      const response = await fetch(`/api/admin/menu-items/${editingItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingName.trim(),
          price: priceValue,
          description: editingDescription.trim(),
        }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(error?.error ?? 'Error al editar el producto');
      }

      setEditingItem(null);
    } catch (error) {
      console.error('Error editing item:', error);
      alert(error instanceof Error ? error.message : 'Error al editar el producto');
    } finally {
      setIsEditing(false);
    }
  };

  const handleToggleActive = async (item: FirestoreMenuItem) => {
    try {
      const response = await fetch(`/api/admin/menu-items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !item.isActive }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(error?.error ?? 'Error al actualizar el producto');
      }
    } catch (error) {
      console.error('Error toggling item:', error);
      alert(error instanceof Error ? error.message : 'Error al actualizar el producto');
    }
  };

  const handleDeleteItem = async (item: FirestoreMenuItem) => {
    if (item.isActive !== false) {
      alert('Primero desactiva el producto para poder eliminarlo.');
      return;
    }

    if (!confirm(`Eliminar "${item.name}"? Esta accion no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/menu-items/${item.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(error?.error ?? 'Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar el producto');
    }
  };

  const handleEditCategoryTitle = async () => {
    if (!categoryData || !categoryTitleDraft.trim()) {
      return;
    }

    setIsEditingCategoryTitle(true);
    try {
      const response = await fetch(`/api/admin/categories/${categoryData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: categoryTitleDraft.trim(),
        }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(error?.error ?? 'Error al editar el título de la categoría');
      }

      const nextParentQuery = searchParams.get('parent');
      const nextQuery = nextParentQuery ? `?parent=${encodeURIComponent(nextParentQuery)}` : '';
      setIsCategoryDialogOpen(false);
      router.replace(`/admin/${encodeURIComponent(categoryTitleDraft.trim())}${nextQuery}`);
      router.refresh();
    } catch (error) {
      console.error('Error editing category title:', error);
      alert(error instanceof Error ? error.message : 'Error al editar el título de la categoría');
    } finally {
      setIsEditingCategoryTitle(false);
    }
  };

  return (
    <PageTransition>
      <main className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold mb-8"
        >
          <ChevronLeft className="h-5 w-5" />
          {`Volver a ${backLabel}`}
        </Link>

        {/* Category Header */}
        <div className="mb-12 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                {categoryData.name}
              </h1>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  setCategoryTitleDraft(categoryData.name);
                  setIsCategoryDialogOpen(true);
                }}
                title="Editar título"
                className="border-gray-300"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Agregar producto
            </Button>
          </div>
          <p className="text-lg text-gray-600">
            {activeItemsCount} activos de {categoryData.items.length} productos
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-16 md:pb-24">
          {categoryData.items.map((item, index) => (
            <ScrollReveal key={item.id} delay={index * 0.05} direction="up">
              <Card
                className={`flex flex-col h-full rounded-lg border-2 border-black shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000] transition-all duration-200 bg-white ${
                  item.isActive === false ? 'opacity-60 bg-gray-50' : ''
                }`}
              >
                <CardHeader className="flex-grow pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="font-bold text-lg">{item.name}</CardTitle>
                    {item.isActive === false && (
                      <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded whitespace-nowrap">
                        Desactivado
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  {item.description && <CardDescription>{item.description}</CardDescription>}
                  {item.options && item.options.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Opciones
                      </h4>
                      <ul className="space-y-1">
                        {item.options.map((option) => (
                          <li key={option.name} className="flex justify-between text-sm">
                            <span>{option.name}</span>
                            <span className="font-medium text-muted-foreground">
                              +Q {option.price.toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
                <div className="p-4 pt-0 mt-auto">
                  <div className="bg-primary rounded-md text-center py-2">
                    <p className="text-xl font-bold text-primary-foreground">
                      Q {item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 border-t pt-3 mt-4">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setEditingName(item.name);
                        setEditingPrice(String(item.price));
                        setEditingDescription(item.description ?? '');
                      }}
                      className="p-2 rounded hover:bg-gray-100 transition-colors"
                      title="Editar producto"
                    >
                      <Edit2 className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="p-2 rounded hover:bg-red-50 transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                    <label className="flex items-center gap-2 cursor-pointer ml-auto">
                      <Checkbox
                        checked={item.isActive !== false}
                        onCheckedChange={() => handleToggleActive(item)}
                      />
                      <span className="text-sm text-gray-600">Activo</span>
                    </label>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        {/* Create Product Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Agregar producto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Nombre del producto</Label>
                <Input
                  id="product-name"
                  placeholder="ej: Pizza especial"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-price">Precio</Label>
                <Input
                  id="product-price"
                  placeholder="ej: 45"
                  inputMode="decimal"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-description">Descripcion (opcional)</Label>
                <Textarea
                  id="product-description"
                  placeholder="Descripcion del producto"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateItem}
                  disabled={isCreating || !newItemName.trim() || !newItemPrice.trim()}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isCreating ? 'Creando...' : 'Crear'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar producto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-product-name">Nombre del producto</Label>
                <Input
                  id="edit-product-name"
                  placeholder="ej: Pizza especial"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-product-price">Precio</Label>
                <Input
                  id="edit-product-price"
                  placeholder="ej: 45"
                  inputMode="decimal"
                  value={editingPrice}
                  onChange={(e) => setEditingPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-product-description">Descripcion (opcional)</Label>
                <Textarea
                  id="edit-product-description"
                  placeholder="Descripcion del producto"
                  value={editingDescription}
                  onChange={(e) => setEditingDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                  disabled={isEditing}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditItem}
                  disabled={isEditing || !editingName.trim() || !editingPrice.trim()}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isEditing ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar título de categoría</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category-title">Título</Label>
                <Input
                  id="edit-category-title"
                  value={categoryTitleDraft}
                  onChange={(event) => setCategoryTitleDraft(event.target.value)}
                  onKeyPress={(event) => {
                    if (event.key === 'Enter') {
                      handleEditCategoryTitle();
                    }
                  }}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsCategoryDialogOpen(false)}
                  disabled={isEditingCategoryTitle}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditCategoryTitle}
                  disabled={isEditingCategoryTitle || !categoryTitleDraft.trim()}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isEditingCategoryTitle ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </PageTransition>
  );
}
