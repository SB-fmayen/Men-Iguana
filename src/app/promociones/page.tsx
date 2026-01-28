import { MenuHeader } from '@/components/organisms/menu-header';
import { Footer } from '@/components/organisms/footer';
import { Gift, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { PageTransition } from '@/components/atoms/page-transition';

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  color: string;
  terms: string[];
}

const promotions: Promotion[] = [];

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

        {/* No promotions available message */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Por el momento no hay promociones disponibles
          </h1>
          <p className="text-lg text-gray-600">
            Vuelve pronto para descubrir nuevas ofertas.
          </p>
          <div className="mt-8">
            <Link href="/">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
