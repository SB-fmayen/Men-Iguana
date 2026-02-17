'use client';

import { FirebaseClientProvider } from '@/firebase/client-provider';
import { CartProvider } from '@/components/cart/cart-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <CartProvider>{children}</CartProvider>
    </FirebaseClientProvider>
  );
}
