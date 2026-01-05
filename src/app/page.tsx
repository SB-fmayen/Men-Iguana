import { menuData } from '@/lib/menu-data';
import { MenuItemCard } from '@/components/menu-item-card';
import { QrCode } from '@/components/qr-code';

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <header className="py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-headline font-bold italic text-5xl md:text-7xl tracking-tighter">
            Iguana Menu
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">Fresh from the jungle kitchen</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 pb-16 md:pb-24">
        <div className="space-y-16">
          {menuData.map((category) => (
            <section key={category.name} aria-labelledby={`category-${category.name}`}>
              <div className="flex items-center gap-4 mb-8">
                <category.icon className="w-8 h-8 md:w-10 md:h-10 text-primary" strokeWidth={2.5} />
                <h2 id={`category-${category.name}`} className="font-headline font-bold text-3xl md:text-4xl text-black">
                  {category.name}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {category.items.map((item) => (
                  <MenuItemCard key={item.name} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="w-full">
        <QrCode />
      </footer>
    </div>
  );
}
