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
      <div className="bg-background min-h-screen">
        <MenuHeader />
        
        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Categories Showcase */}
        <CategoriesShowcase />

        <Footer />
      </div>
    </PageTransition>
  );
}
