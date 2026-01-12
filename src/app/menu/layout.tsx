import { MenuHeader } from '@/components/menu-header';
import { Footer } from '@/components/footer';

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      <MenuHeader />
      {children}
      <Footer />
    </div>
  );
}
