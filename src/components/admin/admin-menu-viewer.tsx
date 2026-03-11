'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useFirestore } from '@/firebase';
import { useMenuCollections } from '@/hooks/use-menu-collections';
import type { FirestoreMenuCategory } from '@/lib/menu-firestore';
import { getItemsByCategoryIdCount, getSortedCategories } from '@/repositories/menu-repository';
import { PARENT_MENU_CONFIG, getParentSlugsFromCategory } from '@/lib/subcategory-routing';
import Link from 'next/link';
import { Plus, Edit2 } from 'lucide-react';

export function AdminMenuViewer() {
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [parentTitles, setParentTitles] = useState<Record<string, string>>({});
  const { categories: categoriesRaw, items: itemsRaw, isLoading } = useMenuCollections(firestore);

  const categories = useMemo(
    () => getSortedCategories(categoriesRaw),
    [categoriesRaw]
  );

  const itemsByCategory = useMemo(() => {
    return getItemsByCategoryIdCount(itemsRaw);
  }, [categories, itemsRaw]);

  const routeParentCards = useMemo(() => {
    const parentCardsBySlug = new Map<
      string,
      {
        id: string;
        name: string;
        href: string;
        itemCount: number;
        categories: FirestoreMenuCategory[];
      }
    >();
    const regularCategories: FirestoreMenuCategory[] = [];

    categories.forEach((category) => {
      const parentSlugs = getParentSlugsFromCategory(category.name, category.parentCategory);

      if (parentSlugs.length === 0) {
        regularCategories.push(category);
        return;
      }

      parentSlugs.forEach((parentSlug) => {
        const config = PARENT_MENU_CONFIG[parentSlug];
        const existing = parentCardsBySlug.get(parentSlug);
        const parentTitle = parentTitles[parentSlug] ?? config.title;

        if (!existing) {
          parentCardsBySlug.set(parentSlug, {
            id: `parent-${parentSlug}`,
            name: parentTitle,
            href: config.adminHref,
            itemCount: itemsByCategory[category.id] ?? 0,
            categories: [category],
          });
          return;
        }

        existing.itemCount += itemsByCategory[category.id] ?? 0;
        existing.categories.push(category);
      });
    });

    return {
      parentCards: Array.from(parentCardsBySlug.values()),
      regularCategories,
    };
  }, [categories, itemsByCategory, parentTitles]);

  useEffect(() => {
    let mounted = true;

    const loadParentTitles = async () => {
      try {
        const response = await fetch('/api/admin/parent-menu-titles', { cache: 'no-store' });
        const payload = (await response.json()) as {
          titles?: Record<string, string>;
        };

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

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando menú...</p>;
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryName,
        }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(error?.error ?? 'Error al crear la categoría');
      }

      setNewCategoryName('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating category:', error);
      alert(error instanceof Error ? error.message : 'Error al crear la categoría');
    } finally {
      setIsCreating(false);
    }
  };

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

  const handleToggleParentActive = async (parentCategories: FirestoreMenuCategory[]) => {
    const allActive = parentCategories.every((category) => category.isActive !== false);
    const targetActiveState = !allActive;

    try {
      await Promise.all(
        parentCategories.map(async (category) => {
          const response = await fetch(`/api/admin/categories/${category.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              isActive: targetActiveState,
            }),
          });

          if (!response.ok) {
            const error = (await response.json().catch(() => null)) as { error?: string } | null;
            throw new Error(error?.error ?? `Error al actualizar la categoría ${category.name}`);
          }
        })
      );
    } catch (error) {
      console.error('Error toggling parent categories:', error);
      alert(error instanceof Error ? error.message : 'Error al actualizar las subcategorías');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">MENÚ</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link href="/admin/papeleria" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full border-gray-300 text-sm sm:text-base"
            >
              Papelería
            </Button>
          </Link>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Agregar categoría</span>
            <span className="sm:hidden">Agregar</span>
          </Button>
        </div>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-md bg-blue-50 p-3 text-center text-sm text-blue-700">
          No hay categorías disponibles. Usa "Agregar categoría" para crear tu menú.
        </p>
      ) : (
        <div className="space-y-8">
          {routeParentCards.parentCards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {routeParentCards.parentCards.map((parentCard) => (
                <div key={parentCard.id}>
                  <Card className="h-full rounded-lg border-2 border-black p-4 sm:p-6 shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000] transition-all duration-200 bg-white flex flex-col">
                    <div className="flex-grow mb-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Link href={parentCard.href} className="font-bold text-base sm:text-lg hover:underline">
                            {parentCard.name}
                          </Link>
                          <Link
                            href={parentCard.href}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
                            title="Editar título"
                          >
                            <Edit2 className="h-4 w-4 text-gray-700" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 border-t pt-3 sm:pt-4">

                      <label className="flex items-center gap-2 cursor-pointer ml-auto">
                        <Checkbox
                          checked={parentCard.categories.every((category) => category.isActive !== false)}
                          onCheckedChange={() => handleToggleParentActive(parentCard.categories)}
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

          {routeParentCards.regularCategories.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {routeParentCards.regularCategories.map((category) => {
                return (
                  <div key={category.id}>
                    <Card className={`h-full rounded-lg border-2 border-black p-4 sm:p-6 shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000] transition-all duration-200 bg-white flex flex-col ${
                      category.isActive === false ? 'opacity-60 bg-gray-50' : ''
                    }`}>
                      <div className="flex-grow mb-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/${encodeURIComponent(category.name)}`} className="font-bold text-base sm:text-lg hover:underline">
                              {category.name}
                            </Link>
                            <Link
                              href={`/admin/${encodeURIComponent(category.name)}`}
                              className="p-1.5 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
                              title="Editar título"
                            >
                              <Edit2 className="h-4 w-4 text-gray-700" />
                            </Link>
                          </div>
                          {category.isActive === false && (
                            <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                              Desactivada
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 border-t pt-3 sm:pt-4">
                        <label className="flex items-center gap-2 cursor-pointer ml-auto">
                          <Checkbox
                            checked={category.isActive !== false}
                            onCheckedChange={() => handleToggleActive(category)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-xs sm:text-sm text-gray-600">Activa</span>
                        </label>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar nueva categoría</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nombre de la categoría</Label>
              <Input
                id="category-name"
                placeholder="ej: Pizzas Premium"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateCategory();
                  }
                }}
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
                onClick={handleCreateCategory}
                disabled={isCreating || !newCategoryName.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isCreating ? 'Creando...' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
