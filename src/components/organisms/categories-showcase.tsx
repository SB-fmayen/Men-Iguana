'use client';

import { menuData } from '@/lib/menu-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ScrollReveal } from '@/components/atoms/scroll-reveal';

export function CategoriesShowcase() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-black-700">
              MENÚ
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuData.map((category, index) => (
            <ScrollReveal key={category.name} delay={index * 0.05} direction="up">
              <Link
                href={`/menu/${encodeURIComponent(category.name)}`}
              >
              <div className="flex flex-col h-full rounded-2xl border-4 border-black shadow-md hover:shadow-lg transition-all duration-200 bg-white overflow-hidden cursor-pointer group">
                {/* Content */}
                <div className="flex gap-4 p-6">
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-lg text-black mb-1">
                      {category.name.toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {category.items.length} opciones disponibles
                    </p>
                  </div>
                </div>
              </div>
            </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
