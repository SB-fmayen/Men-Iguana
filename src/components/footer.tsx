'use client';

import { Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black">
      <div className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Dirección */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-bold text-xl mb-2">Ubicación</h3>
            <p className="text-gray-300 text-lg">
              9na calle 03-20 Barrio San Antonio<br />
              Amatitlán
            </p>
          </div>

          {/* Facebook Link */}
          <div className="text-center md:text-right">
            <h3 className="text-white font-bold text-xl mb-4">Síguenos</h3>
            <a
              href="https://www.facebook.com/shukosypizzaslaiguana"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105"
              aria-label="Visita nuestro Facebook"
            >
              <Facebook className="w-6 h-6" />
              <span>Facebook</span>
            </a>
          </div>
        </div>

        {/* Bottom line */}
        <div className="border-t border-gray-700 mt-12 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Shukos y Pizzas La Iguana. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
