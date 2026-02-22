'use client';

import { useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MessageCircle, ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem, useCart } from '@/components/cart/cart-context';
import { WHATSAPP_NUMBER } from '@/lib/whatsapp';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(price);
};

const formatWhatsAppPrice = (price: number) => {
  return `Q ${price.toFixed(2)}`;
};

const getCategoryNameFromId = (itemId: string) => {
  const parts = itemId.split('::');
  if (parts.length === 2) {
    return parts[0];
  }
  if (parts.length >= 3) {
    return parts[1];
  }
  return '';
};

const formatProductName = (categoryName: string) => {
  if (categoryName === 'Shukos' || categoryName.startsWith('Shukos -')) {
    return 'Shuko';
  }
  return categoryName || 'Producto no especificado';
};

const buildWhatsAppMessage = (items: CartItem[], total: number) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';
  const lines = items
    .map(
      (item) =>
        `${item.quantity}x - ${item.name}\nProducto: ${formatProductName(getCategoryNameFromId(item.id))}\nPrecio: ${formatWhatsAppPrice(item.price)}\nSubtotal: ${formatWhatsAppPrice(item.price * item.quantity)}`
    )
    .join('\n\n');

  return [
    `${greeting}, deseo ordenar:`,
    '',
    lines,
    '',
    `Total: ${formatWhatsAppPrice(total)} Gracias`,
  ].join('\n');
};

export function CartSheet() {
  const { items, total, itemCount, increment, decrement, removeItem, clear } = useCart();

  const message = useMemo(() => buildWhatsAppMessage(items, total), [items, total]);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const hasItems = items.length > 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-gray-800">
          <ShoppingCart className="h-5 w-5" />
          <span className="sr-only">Abrir carrito</span>
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full bg-orange-500 text-xs font-bold text-white flex items-center justify-center px-1">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full flex-col sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Tu carrito</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex-1 overflow-y-auto">
          {!hasItems ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center">
              <p className="text-sm font-medium text-gray-700">Tu carrito está vacío.</p>
              <p className="mt-1 text-sm text-muted-foreground">Agrega productos para continuar con tu pedido.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label={`Quitar ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => decrement(item.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => increment(item.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {hasItems && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="mt-4 grid gap-2">
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  Ordenar por WhatsApp
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={clear}
              >
                Vaciar carrito
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
