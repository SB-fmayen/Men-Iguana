import { MenuHeader } from '@/components/menu-header';
import { Footer } from '@/components/footer';
import { Gift, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { PageTransition } from '@/components/page-transition';

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  color: string;
  terms: string[];
}

const promotions: Promotion[] = [
  {
    id: 1,
    title: '2x1 en Pizzas',
    description: 'Compra una pizza mediana y lleva otra gratis',
    discount: '50% OFF',
    validUntil: 'Hasta el 31 de Enero',
    color: 'from-orange-500 to-orange-600',
    terms: [
      'Válido solo en pizzas medianas',
      'No acumulable con otras promociones',
      'Disponible de lunes a viernes'
    ]
  },
  {
    id: 2,
    title: 'Combo Familiar',
    description: '2 Pizzas grandes + 1 orden de alitas + bebida',
    discount: '$150',
    validUntil: 'Hasta el 28 de Enero',
    color: 'from-red-500 to-red-600',
    terms: [
      'Incluye 2 pizzas grandes de tu elección',
      '10 alitas con aderezo',
      'Bebida de 2 litros'
    ]
  },
  {
    id: 3,
    title: 'Martes de Shukos',
    description: 'Todos los shukos con 30% de descuento',
    discount: '30% OFF',
    validUntil: 'Todos los Martes',
    color: 'from-yellow-500 to-orange-500',
    terms: [
      'Válido solo los martes',
      'Aplica para todos los shukos del menú',
      'No aplica en días festivos'
    ]
  },
  {
    id: 4,
    title: 'Envío Gratis',
    description: 'A partir de $200 de compra',
    discount: 'GRATIS',
    validUntil: 'Válido todo el mes',
    color: 'from-green-500 to-green-600',
    terms: [
      'Pedido mínimo de $200',
      'Aplica en zona de cobertura',
      'No aplica en horario pico'
    ]
  },
  {
    id: 5,
    title: 'Happy Hour',
    description: '20% de descuento en todas las bebidas',
    discount: '20% OFF',
    validUntil: 'De 3pm a 6pm',
    color: 'from-blue-500 to-blue-600',
    terms: [
      'Válido de lunes a viernes',
      'De 3:00 PM a 6:00 PM',
      'Todas las bebidas incluidas'
    ]
  },
  {
    id: 6,
    title: 'Estudiante',
    description: 'Descuento especial presentando credencial',
    discount: '15% OFF',
    validUntil: 'Todo el año',
    color: 'from-purple-500 to-purple-600',
    terms: [
      'Presentar credencial vigente',
      'Solo para estudiantes',
      'Válido de lunes a jueves'
    ]
  }
];

export default function PromotionsPage() {
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

        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Promociones Especiales
          </h1>
          <p className="text-lg text-gray-600">
            Aprovecha nuestras mejores ofertas y descuentos
          </p>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16 md:pb-24">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className={`bg-gradient-to-br ${promo.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group`}
            >
              {/* Decorative background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white blur-2xl"></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                    <Gift className="h-8 w-8" />
                  </div>
                  <span className="bg-white/30 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm">
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

                {/* Terms */}
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm mb-4">
                  <p className="text-xs font-semibold mb-2">Términos y condiciones:</p>
                  <ul className="text-xs space-y-1">
                    {promo.terms.map((term, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-white/60">•</span>
                        <span className="text-white/80">{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold transition-colors duration-200">
                  Aplicar Promoción
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
