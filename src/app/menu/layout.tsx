import { MenuHeader } from '@/components/organisms/menu-header';
import { Footer } from '@/components/organisms/footer';

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen min-h-dvh flex flex-col bg-black">
      <MenuHeader />
      <div className="flex-1 bg-background">
        {children}
      </div>
      <Footer />
    </div>
  );
}
