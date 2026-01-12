import { menuData } from '@/lib/menu-data';
import { MenuItemCard } from '@/components/menu-item-card';
import { Footer } from '@/components/footer';
import { MenuHeader } from '@/components/menu-header';
import { BannerCarousel } from '@/components/banner-carousel';
import { CategoriesShowcase } from '@/components/categories-showcase';
import { PageTransition } from '@/components/page-transition';

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
