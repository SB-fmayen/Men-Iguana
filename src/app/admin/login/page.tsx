'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';

interface AdminStatus {
  hasAdmin: boolean;
  isAuthenticated: boolean;
  isOwner: boolean;
  ready?: boolean;
  error?: string;
}

function AdminLoginContent() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => searchParams.get('next') || '/admin', [searchParams]);

  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadStatus = async () => {
      try {
        const response = await fetch('/api/admin/status', { cache: 'no-store' });
        const data = (await response.json()) as AdminStatus;

        if (!mounted) return;
        setStatus(data);

        if (data.error) {
          setErrorMessage(data.error);
        }

        if (data.isAuthenticated && data.isOwner) {
          router.replace(nextPath);
          router.refresh();
        }
      } catch {
        if (mounted) {
          setErrorMessage('No se pudo validar el estado de admin.');
        }
      } finally {
        if (mounted) {
          setIsLoadingStatus(false);
        }
      }
    };

    void loadStatus();

    return () => {
      mounted = false;
    };
  }, [nextPath, router]);

  const handleLoginWithGoogle = async () => {
    try {
      setErrorMessage(null);
      setIsSubmitting(true);

      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const idToken = await credential.user.getIdToken(true);

      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        await signOut(auth);
        throw new Error(payload?.error ?? 'No fue posible iniciar sesión como admin.');
      }

      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error inesperado durante el inicio de sesión.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-10">
      <section className="mx-auto max-w-md space-y-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-2xl font-bold">Acceso administrador</h1>

        {isLoadingStatus ? (
          <p className="text-sm text-muted-foreground">Validando acceso...</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {status?.hasAdmin
                ? 'Este panel está bloqueado para un único administrador.'
                : 'No existe administrador aún. La primera cuenta de Google que inicie sesión quedará registrada como admin único.'}
            </p>

            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

            <Button onClick={handleLoginWithGoogle} disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Validando...' : 'Continuar con Google'}
            </Button>
          </>
        )}
      </section>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="container mx-auto px-4 py-10"><p className="text-sm text-muted-foreground">Cargando...</p></main>}>
      <AdminLoginContent />
    </Suspense>
  );
}
