'use client';

import type { MenuItem } from '@/lib/menu-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart/cart-context';

interface MenuItemCardProps {
  item: MenuItem;
  categoryName: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(price);
};

export function MenuItemCard({ item, categoryName }: MenuItemCardProps) {
  const { addItem } = useCart();
  const itemId = `${categoryName}::${item.name}`;

  return (
    <Card className="flex flex-col h-full rounded-lg border-2 border-black shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000] transition-all duration-200 bg-white">
      <CardHeader className="flex-grow pb-2">
        <CardTitle className="font-headline font-bold text-xl">{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {item.description && (
          <CardDescription>{item.description}</CardDescription>
        )}
        {item.options && item.options.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Opciones</h4>
            <ul className="space-y-1">
              {item.options.map((option) => (
                <li key={option.name} className="flex justify-between text-sm">
                  <span>{option.name}</span>
                  <span className="font-medium text-muted-foreground">+{formatPrice(option.price)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <div className="bg-primary rounded-md text-center py-2">
          <p className="text-xl font-bold font-headline text-primary-foreground">{formatPrice(item.price)}</p>
        </div>
        <Button
          type="button"
          className="mt-3 w-full bg-orange-600 hover:bg-orange-700"
          onClick={() => addItem({ id: itemId, name: item.name, price: item.price })}
        >
          Agregar al carrito
        </Button>
      </div>
    </Card>
  );
}
