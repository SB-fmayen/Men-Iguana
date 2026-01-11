import { menuData } from '@/lib/menu-data';
import { MenuItemCard } from '@/components/menu-item-card';
import { QrCode } from '@/components/qr-code';
import { MenuHeader } from '@/components/menu-header';
import { BannerCarousel } from '@/components/banner-carousel';
import { PromotionsSection } from '@/components/promotions-section';
import { CategoriesShowcase } from '@/components/categories-showcase';
import { PageTransition } from '@/components/page-transition';

export default function Home() {
  return (
    <PageTransition>
      <div className="bg-background min-h-screen">
        <MenuHeader />
        
        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Promotions Section */}
        <PromotionsSection />

        {/* Categories Showcase */}
        <CategoriesShowcase />

        <footer className="w-full">
          <QrCode />
        </footer>
      </div>
    </PageTransition>
  );
}
