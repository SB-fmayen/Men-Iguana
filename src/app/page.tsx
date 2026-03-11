import { menuData } from '@/lib/menu-data';
import { MenuItemCard } from '@/components/molecules/menu-item-card';
import { Footer } from '@/components/organisms/footer';
import { MenuHeader } from '@/components/organisms/menu-header';
import { BannerCarousel } from '@/components/molecules/banner-carousel';
import { PageTransition } from '@/components/atoms/page-transition';
import dynamic from 'next/dynamic';

const CategoriesShowcase = dynamic(() => import('@/components/organisms/categories-showcase').then(mod => ({ default: mod.CategoriesShowcase })), {
  loading: () => <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />,
});

export default function Home() {
  return (
    <PageTransition>
      <div className="min-h-dvh flex flex-col bg-black">
        <MenuHeader />
        <div className="flex-1 bg-background">
          {/* Banner Carousel */}
          <BannerCarousel />

          {/* Categories Showcase */}
          <CategoriesShowcase />
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
