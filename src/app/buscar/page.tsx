'use client';

import { MenuHeader } from '@/components/menu-header';
import { Footer } from '@/components/footer';
import { MenuItemCard } from '@/components/menu-item-card';
import { menuData } from '@/lib/menu-data';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Search } from 'lucide-react';
import { PageTransition } from '@/components/page-transition';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  // Buscar en todos los productos de todas las categorías
  const searchResults = menuData
    .map((category) => ({
      category: category.name,
      items: category.items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(query.toLowerCase())) ||
        category.name.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((result) => result.items.length > 0);

  const totalResults = searchResults.reduce((acc, result) => acc + result.items.length, 0);

  return (
    <PageTransition>
      <div className="bg-background min-h-screen">
        <MenuHeader />
      
      <main className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold mb-8">
          <ChevronLeft className="h-5 w-5" />
          Volver al inicio
        </Link>

        {/* Search Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-10 h-10 text-orange-600" strokeWidth={2.5} />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Resultados de búsqueda
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            {totalResults > 0 ? (
              <>
                Se encontraron <span className="font-bold text-orange-600">{totalResults}</span> resultados para "{query}"
              </>
            ) : (
              <>No se encontraron resultados para "{query}"</>
            )}
          </p>
        </div>

        {/* Results */}
        {totalResults > 0 ? (
          <div className="space-y-12">
            {searchResults.map((result) => (
              <section key={result.category}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-gray-200 pb-2">
                  {result.category}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({result.items.length} {result.items.length === 1 ? 'resultado' : 'resultados'})
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {result.items.map((item) => (
                    <MenuItemCard key={item.name} item={item} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No encontramos resultados</h3>
            <p className="text-gray-600 mb-6">Intenta buscar con otras palabras o revisa la ortografía</p>
            <Link href="/" className="text-orange-600 hover:text-orange-700 font-bold">
              Ver todo el menú
            </Link>
          </div>
        )}
      </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
