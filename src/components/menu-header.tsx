'use client';

import { useState } from 'react';
import { menuData } from '@/lib/menu-data';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export function MenuHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <a href="#" className="font-headline font-bold italic text-xl tracking-tighter">
          Menú Tecinteca
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4">
          {menuData.map((category) => (
            <a
              key={category.name}
              href={`#category-${category.name}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {category.name}
            </a>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium mt-8">
                <a href="#" className="font-headline font-bold italic text-2xl tracking-tighter mb-4" onClick={handleLinkClick}>
                  Menú Tecinteca
                </a>
                {menuData.map((category) => (
                  <a
                    key={category.name}
                    href={`#category-${category.name}`}
                    className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                    onClick={handleLinkClick}
                  >
                    <category.icon className="h-5 w-5" />
                    {category.name}
                  </a>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
