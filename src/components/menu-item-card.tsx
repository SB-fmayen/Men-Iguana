import type { MenuItem } from '@/lib/menu-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MenuItemCardProps {
  item: MenuItem;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export function MenuItemCard({ item }: MenuItemCardProps) {
  return (
    <Card className="flex flex-col h-full rounded-lg border-2 border-black shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000] transition-all duration-200 bg-white">
      <CardHeader className="flex-grow">
        <CardTitle className="font-headline font-bold text-xl">{item.name}</CardTitle>
      </CardHeader>
      {item.options && item.options.length > 0 && (
        <CardContent className="pt-0 pb-4 flex-grow-0">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Extras</h4>
            <ul className="space-y-1">
              {item.options.map((option) => (
                <li key={option.name} className="flex justify-between text-sm">
                  <span>{option.name}</span>
                  <span className="font-medium text-muted-foreground">+{formatPrice(option.price)}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
      <div className="p-4 pt-0 mt-auto">
        <div className="bg-primary rounded-md text-center py-2">
            <p className="text-xl font-bold font-headline text-primary-foreground">{formatPrice(item.price)}</p>
        </div>
      </div>
    </Card>
  );
}
