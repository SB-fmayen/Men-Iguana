import { menuData } from '@/lib/menu-data';
import { MenuItemCard } from '@/components/molecules/menu-item-card';
import { Footer } from '@/components/organisms/footer';
import { MenuHeader } from '@/components/organisms/menu-header';
import { BannerCarousel } from '@/components/molecules/banner-carousel';
import { CategoriesShowcase } from '@/components/organisms/categories-showcase';
import { PageTransition } from '@/components/atoms/page-transition';

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
