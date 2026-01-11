import { MenuHeader } from '@/components/menu-header';
import { QrCode } from '@/components/qr-code';

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      <MenuHeader />
      {children}
      <footer className="w-full">
        <QrCode />
      </footer>
    </div>
  );
}
