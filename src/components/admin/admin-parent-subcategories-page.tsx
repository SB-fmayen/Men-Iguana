'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { useMenuCollections } from '@/hooks/use-menu-collections';
import type { FirestoreMenuCategory, FirestoreMenuItem } from '@/lib/menu-firestore';
import { buildParentSubcategoryCards } from '@/lib/parent-subcategories';
import { getItemsByCategoryIdCount, getSortedCategories } from '@/repositories/menu-repository';
import {
  type ParentMenuSlug,
  PARENT_MENU_CONFIG,
} from '@/lib/subcategory-routing';

export function AdminParentSubcategoriesPage({ parentSlug }: { parentSlug: ParentMenuSlug }) {
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
  const { categories, items, isLoading } = useMenuCollections(firestore);

  const itemsByCategory = useMemo(() => {
    return getItemsByCategoryIdCount(items, { onlyActive: true });
  }, [items]);

  const subcategoryCards = useMemo(() => {
    const sortedCategories = getSortedCategories(categories);

    return buildParentSubcategoryCards(
      sortedCategories
        .map((category) => ({
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

  const handleToggleActive = async (category: FirestoreMenuCategory) => {
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !category.isActive,
        }),
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
    try {
      const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingName,
        }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(error?.error ?? 'Error al editar la categoría');
      }

      setEditingCategory(null);
      setEditingName('');
    } catch (error) {
      console.error('Error editing category:', error);
      alert(error instanceof Error ? error.message : 'Error al editar la categoría');
    } finally {
      setIsEditing(false);
    }
  };

  const handleCreateSubcategory = async () => {
    if (!newSubcategoryName.trim()) {
      return;
    }

    const formattedName = `${parentTitle} - ${newSubcategoryName.trim()}`;

    setIsCreating(true);
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formattedName,
        }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(error?.error ?? 'Error al crear la subcategoría');
      }

      setNewSubcategoryName('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating subcategory:', error);
      alert(error instanceof Error ? error.message : 'Error al crear la subcategoría');
    } finally {
      setIsCreating(false);
    }
  };

  const parentTitle = parentTitles[parentSlug] ?? PARENT_MENU_CONFIG[parentSlug].title;

  useEffect(() => {
    let mounted = true;

    const loadParentTitles = async () => {
      try {
        const response = await fetch('/api/admin/parent-menu-titles', { cache: 'no-store' });
        const payload = (await response.json()) as { titles?: Record<string, string> };

        if (!response.ok || !mounted) {
          return;
        }

        setParentTitles(payload.titles ?? {});
      } catch {
        if (mounted) {
          setParentTitles({});
        }
      }
    };

    void loadParentTitles();

    return () => {
      mounted = false;
    };
  }, []);

  const handleEditParentTitle = async () => {
    if (!parentTitleDraft.trim()) {
      return;
    }

    setIsSavingParentTitle(true);
    try {
      const response = await fetch(`/api/admin/parent-menu-titles/${parentSlug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
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
                <Link href={`/admin/${encodeURIComponent(entry.source.name)}?parent=${parentSlug}`} className="group flex-grow mb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base sm:text-lg">{`${parentTitle} ${entry.label}`}</h3>
                      <button
                        onClick={(event) => {
                          event.preventDefault();
                          setEditingCategory(entry.source);
                          setEditingName(entry.source.name);
                        }}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
                        title="Editar título"
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
                </Link>

                <div className="flex items-center gap-2 sm:gap-3 border-t pt-3 sm:pt-4">
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

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar subcategoría</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-subcategory-name">Nombre de la subcategoría</Label>
              <Input
                id="new-subcategory-name"
                placeholder="ej: Tradicionales"
                value={newSubcategoryName}
                onChange={(event) => setNewSubcategoryName(event.target.value)}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') {
                    handleCreateSubcategory();
                  }
                }}
              />
              <p className="text-xs text-gray-500">Se creará como: {parentTitle} - {newSubcategoryName.trim() || '...'}</p>
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

      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar categoría</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">Nombre de la categoría</Label>
              <Input
                id="edit-category-name"
                placeholder="ej: Pizzas Premium"
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') {
                    handleEditCategory();
                  }
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
                  if (event.key === 'Enter') {
                    handleEditParentTitle();
                  }
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
