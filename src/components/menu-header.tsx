'use client';

import { useState } from 'react';
import { menuData } from '@/lib/menu-data';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function MenuHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const router = useRouter();

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black backdrop-blur-xl border-b border-gray-800 shadow-lg">
      <div className="container flex h-auto max-w-screen-2xl items-center justify-center px-4 gap-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group flex-shrink-0">
          <img 
            src="/iconoIguana.png" 
            alt="La Iguana Logo" 
            className="h-32 w-32 object-contain group-hover:scale-105 transition-transform"
          />
          <div>
            
          </div>
        </a>

        {/* Menu Button (Desktop) */}
        <button 
          onClick={() => setMenuDialogOpen(true)}
          className="hidden md:block text-white font-bold text-lg hover:text-orange-500 transition-colors cursor-pointer"
        >
          Menú
        </button>

        {/* Promotions Link (Desktop) */}
        <Link href="/promociones">
          <button className="hidden md:block text-white font-bold text-lg hover:text-orange-500 transition-colors cursor-pointer">
            Promociones
          </button>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md">
          <form onSubmit={handleSearch} className="w-full flex items-center">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar platillo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Search and Menu */}
        <div className="flex items-center gap-2 md:hidden flex-1">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <Search className="h-3 w-3" />
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              <nav className="grid gap-4 mt-8">
                <a href="/" className="flex items-center gap-2.5 mb-4" onClick={handleLinkClick}>
                  <img 
                    src="/iconoIguana.png" 
                    alt="La Iguana Logo" 
                    className="h-10 w-10 object-contain"
                  />
                  <span className="font-bold text-lg text-gray-900">
                    Shukos y Pizza La Iguana
                  </span>
                </a>
                <button
                  onClick={() => {
                    setMenuDialogOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-3 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-bold text-orange-600"
                >
                  Ver Menú
                </button>
                <Link href="/promociones" onClick={handleLinkClick}>
                  <button className="w-full text-left px-3 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-bold text-orange-600">
                    Ver Promociones
                  </button>
                </Link>
                {menuData.map((category) => (
                  <Link
                    key={category.name}
                    href={`/menu/${encodeURIComponent(category.name)}`}
                    onClick={handleLinkClick}
                  >
                    <button className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <category.icon className="h-5 w-5" />
                      {category.name}
                    </button>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Menu Dialog with Categories */}
        <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-gray-900">Menú</DialogTitle>
            </DialogHeader>
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuData.map((category) => (
                  <Link
                    key={category.name}
                    href={`/menu/${encodeURIComponent(category.name)}`}
                    onClick={() => setMenuDialogOpen(false)}
                  >
                    <div className="flex flex-col h-full rounded-2xl border-4 border-black shadow-md hover:shadow-lg transition-all duration-200 bg-white overflow-hidden cursor-pointer group">
                      {/* Content */}
                      <div className="flex gap-4 p-6">
                        {/* Icon */}
                        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                          <category.icon className="h-10 w-10 text-gray-400" strokeWidth={1.5} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 className="font-bold text-lg text-black mb-1">
                            {category.name.toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {category.items.length} opciones disponibles
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
