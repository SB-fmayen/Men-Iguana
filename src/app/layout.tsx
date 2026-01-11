import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';
import { PizzaPreloader } from '@/components/pizza-preloader';

export const metadata: Metadata = {
  title: 'Menú Tecinteca',
  description: 'Un menú digital para el restaurante Tecinteca.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,400;0,700;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <PizzaPreloader />
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
