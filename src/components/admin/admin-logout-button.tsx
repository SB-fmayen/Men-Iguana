'use client';

import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';

export function AdminLogoutButton() {
  const auth = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await fetch('/api/admin/logout', { method: 'POST' });
      await signOut(auth);
      router.replace('/admin/login');
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleLogout} disabled={isLoading} variant="outline">
      {isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
    </Button>
  );
}
