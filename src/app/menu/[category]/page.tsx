'use client';

import { MenuItemCard } from '@/components/menu-item-card';
import { menuData } from '@/lib/menu-data';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { PageTransition } from '@/components/page-transition';
import { ScrollReveal } from '@/components/scroll-reveal';

export default function CategoryPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.category as string);

  const category = menuData.find(cat => cat.name === categoryName);

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Categoría no encontrada</h1>
        <Link href="/">
          <Button className="bg-orange-600 hover:bg-orange-700">
            Volver al inicio
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <PageTransition>
      <main className="container mx-auto px-4 py-12">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold mb-8">
        <ChevronLeft className="h-5 w-5" />
        Volver al inicio
      </Link>

      {/* Category Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <category.icon className="w-10 h-10 md:w-12 md:h-12 text-orange-600" strokeWidth={2.5} />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {category.name}
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          {category.items.length} productos disponibles
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-16 md:pb-24">
        {category.items.map((item, index) => (
          <ScrollReveal key={item.name} delay={index * 0.05} direction="up">
            <MenuItemCard item={item} />
          </ScrollReveal>
        ))}
      </div>
    </main>
    </PageTransition>
  );
}
