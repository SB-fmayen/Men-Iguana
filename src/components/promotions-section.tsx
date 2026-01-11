'use client';

import { Gift, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/scroll-reveal';

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  color: string;
  icon: React.ReactNode;
}

const promotions: Promotion[] = [
  {
    id: 1,
    title: '2x1 en Pizzas',
    description: 'Compra una pizza mediana y lleva otra gratis',
    discount: '50% OFF',
    validUntil: 'Hasta el 31 de Enero',
    color: 'from-orange-500 to-orange-600',
    icon: <Gift className="h-8 w-8" />
  },
  {
    id: 2,
    title: 'Combo Familiar',
    description: '2 Pizzas grandes + 1 orden de alitas + bebida',
    discount: '$150',
    validUntil: 'Hasta el 28 de Enero',
    color: 'from-red-500 to-red-600',
    icon: <Gift className="h-8 w-8" />
  },
  {
    id: 3,
    title: 'Martes de Shukos',
    description: 'Todos los shukos con 30% de descuento',
    discount: '30% OFF',
    validUntil: 'Todos los Martes',
    color: 'from-yellow-500 to-orange-500',
    icon: <Gift className="h-8 w-8" />
  },
  {
    id: 4,
    title: 'Envío Gratis',
    description: 'A partir de $200 de compra',
    discount: 'GRATIS',
    validUntil: 'Válido todo el mes',
    color: 'from-green-500 to-green-600',
    icon: <Gift className="h-8 w-8" />
  }
];

export function PromotionsSection() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Promociones Especiales
            </h2>
            <p className="text-lg text-gray-600">
              No te pierdas nuestras mejores ofertas y descuentos
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {promotions.map((promo, index) => (
            <ScrollReveal key={promo.id} delay={index * 0.1} direction="up">
              <div
                className={`bg-gradient-to-br ${promo.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group h-full`}
              >
              {/* Decorative background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white blur-2xl"></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                    {promo.icon}
                  </div>
                  <span className="bg-white/30 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                    {promo.discount}
                  </span>
                </div>

                <h3 className="text-2xl font-bold mb-2">
                  {promo.title}
                </h3>

                <p className="text-sm text-white/90 mb-4">
                  {promo.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-white/80 mb-6">
                  <Clock className="h-4 w-4" />
                  {promo.validUntil}
                </div>

                <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold transition-colors duration-200">
                  Ver Detalles
                </Button>
              </div>
            </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
