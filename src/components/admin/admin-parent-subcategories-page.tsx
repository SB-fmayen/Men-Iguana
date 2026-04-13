'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Edit2, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { useMenuCollections } from '@/hooks/use-menu-collections';
import type { FirestoreMenuCategory } from '@/lib/menu-firestore';
import { buildParentSubcategoryCards } from '@/lib/parent-subcategories';
import { getItemsByCategoryIdCount, getSortedCategories } from '@/repositories/menu-repository';
import {
  type ParentMenuSlug,
  PARENT_MENU_CONFIG,
} from '@/lib/subcategory-routing';

export function AdminParentSubcategoriesPage({ parentSlug }: { parentSlug: ParentMenuSlug }) {
  const router = useRouter();
  const firestore = useFirestore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [parentTitles, setParentTitles] = useState<Record<string, string>>({});
  const [isParentTitleDialogOpen, setIsParentTitleDialogOpen] = useState(false);
  const [parentTitleDraft, setParentTitleDraft] = useState('');
  const [isSavingParentTitle, setIsSavingParentTitle] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FirestoreMenuCategory | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<FirestoreMenuCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { categories, items, isLoading } = useMenuCollections(firestore);

  const itemsByCategory = useMemo(() => {
    return getItemsByCategoryIdCount(items, { onlyActive: true });
  }, [items]);

  const subcategoryCards = useMemo(() => {
    const sortedCategories = getSortedCategories(categories);

    return buildParentSubcategoryCards(
      sortedCategories.map((category) => ({
        id: category.id,
        name: category.name,
        parentCategory: category.parentCategory,
        subcategory: category.subcategory,
        order: category.order ?? 0,
        itemCount: itemsByCategory[category.id] ?? 0,
        routeName: category.name,
        source: category,
      })),
      parentSlug
    );
  }, [categories, itemsByCategory, parentSlug]);

  const parentTitle = parentTitles[parentSlug] ?? PARENT_MENU_CONFIG[parentSlug].title;

  useEffect(() => {
    let mounted = true;

    const loadParentTitles = async () => {
      try {
        const response = await fetch('/api/admin/parent-menu-titles', { cache: 'no-store' });
        const payload = (await response.json()) as { titles?: Record<string, string> };

        if (!response.ok || !mounted) return;

        setParentTitles(payload.titles ?? {});
      } catch {
        if (mounted) setParentTitles({});
      }
    };

    void loadParentTitles();
    return () => { mounted = false; };
  }, []);

  const handleToggleActive = async (category: FirestoreMenuCategory) => {
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !category.isActive }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(error?.error ?? 'Error al actualizar la categoría');
      }
    } catch (error) {
      console.error('Error toggling category:', error);
      alert(error instanceof Error ? error.message : 'Error al actualizar la categoría');
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !editingName.trim()) return;

    setIsEditing(true);

    // Derivar la nueva etiqueta de subcategoría quitando el prefijo del título padre
    const trimmedName = editingName.trim();
    const prefixRegex = new RegExp(`^${parentTitle}\\s*[-–]?\\s*`, 'i');
    const newSubcategory = trimmedName.replace(prefixRegex, '').trim() || trimmedName;

    try {
      const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, subcategory: newSubcategory }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(error?.error ?? 'Error al editar la subcategoría');
      }

      setEditingCategory(null);
      setEditingName('');
      router.refresh();
    } catch (error) {
      console.error('Error editing category:', error);
      alert(error instanceof Error ? error.message : 'Error al editar la subcategoría');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/categories/${deletingCategory.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(error?.error ?? 'Error al eliminar la subcategoría');
      }

      setDeletingCategory(null);
      router.refresh();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar la subcategoría');
    } finally {
      setIsDeleting(false);
    }
  };

  // Crea la subcategoría con el nombre exacto que el admin escribió.
  const handleCreateSubcategory = async () => {
    if (!newSubcategoryName.trim()) return;

    const name = newSubcategoryName.trim();
    const parentCategoryTitle = PARENT_MENU_CONFIG[parentSlug].title;

    setIsCreating(true);
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          parentCategory: parentCategoryTitle,
          subcategory: name,
        }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(error?.error ?? 'Error al crear la subcategoría');
      }

      setNewSubcategoryName('');
      setIsCreateDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error creating subcategory:', error);
      alert(error instanceof Error ? error.message : 'Error al crear la subcategoría');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditParentTitle = async () => {
    if (!parentTitleDraft.trim()) return;

    setIsSavingParentTitle(true);
    try {
      const response = await fetch(`/api/admin/parent-menu-titles/${parentSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: parentTitleDraft.trim() }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Error al editar título');
      }

      setParentTitles((prev) => ({ ...prev, [parentSlug]: parentTitleDraft.trim() }));
      setIsParentTitleDialogOpen(false);
    } catch (error) {
      console.error('Error editing parent title:', error);
      alert(error instanceof Error ? error.message : 'Error al editar título');
    } finally {
      setIsSavingParentTitle(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando menú...</p>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8 space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold">
        <ChevronLeft className="h-5 w-5" />
        Volver al menú
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold">{parentTitle}</h2>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                setParentTitleDraft(parentTitle);
                setIsParentTitleDialogOpen(true);
              }}
              title="Editar título"
              className="border-gray-300"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">Subcategorías</p>
        </div>

        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
        >
          Agregar subcategoría
        </Button>
      </div>

      {subcategoryCards.length === 0 ? (
        <p className="rounded-md bg-blue-50 p-3 text-center text-sm text-blue-700">
          No hay subcategorías disponibles para {parentTitle}.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {subcategoryCards.map((entry) => (
            <div key={entry.id}>
              <Card
                className={`h-full min-h-[190px] rounded-lg border-2 border-black p-4 sm:p-6 shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000] transition-all duration-200 bg-white flex flex-col ${
                  entry.source.isActive === false ? 'opacity-60 bg-gray-50' : ''
                }`}
              >
                <div className="flex-grow mb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/${encodeURIComponent(entry.source.name)}?parent=${parentSlug}`}
                        className="font-bold text-base sm:text-lg hover:underline"
                      >
                        {entry.source.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(entry.source);
                          setEditingName(entry.source.name);
                        }}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
                        title="Editar nombre"
                      >
                        <Edit2 className="h-4 w-4 text-gray-700" />
                      </button>
                    </div>
                    {entry.source.isActive === false && (
                      <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                        Desactivada
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {entry.itemCount} {entry.itemCount === 1 ? 'producto disponible' : 'productos disponibles'}
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 border-t pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => setDeletingCategory(entry.source)}
                    className="p-1.5 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                    title="Eliminar subcategoría"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                  <label className="flex items-center gap-2 cursor-pointer ml-auto">
                    <Checkbox
                      checked={entry.source.isActive !== false}
                      onCheckedChange={() => handleToggleActive(entry.source)}
                      onClick={(event) => event.stopPropagation()}
                    />
                    <span className="text-xs sm:text-sm text-gray-600">Activa</span>
                  </label>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Crear subcategoría */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar subcategoría</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-subcategory-name">Nombre</Label>
              <Input
                id="new-subcategory-name"
                placeholder="ej: Especialidades"
                value={newSubcategoryName}
                onChange={(event) => setNewSubcategoryName(event.target.value)}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') handleCreateSubcategory();
                }}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateSubcategory}
                disabled={isCreating || !newSubcategoryName.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isCreating ? 'Creando...' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Editar subcategoría */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar subcategoría</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">Nombre</Label>
              <Input
                id="edit-category-name"
                placeholder="ej: Especialidades"
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') handleEditCategory();
                }}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setEditingCategory(null)} disabled={isEditing}>
                Cancelar
              </Button>
              <Button
                onClick={handleEditCategory}
                disabled={isEditing || !editingName.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isEditing ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Eliminar subcategoría */}
      <Dialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar subcategoría</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              ¿Estás seguro de que deseas eliminar{' '}
              <span className="font-semibold">{deletingCategory?.name}</span>?
            </p>
            {deletingCategory?.isActive !== false && (
              <p className="text-sm text-amber-600 bg-amber-50 rounded p-2">
                Debes desactivar la subcategoría antes de eliminarla.
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeletingCategory(null)} disabled={isDeleting}>
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteCategory}
                disabled={isDeleting || deletingCategory?.isActive !== false}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Editar título del padre */}
      <Dialog open={isParentTitleDialogOpen} onOpenChange={setIsParentTitleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar título de categoría</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-parent-title">Título</Label>
              <Input
                id="edit-parent-title"
                value={parentTitleDraft}
                onChange={(event) => setParentTitleDraft(event.target.value)}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') handleEditParentTitle();
                }}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsParentTitleDialogOpen(false)}
                disabled={isSavingParentTitle}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEditParentTitle}
                disabled={isSavingParentTitle || !parentTitleDraft.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSavingParentTitle ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
