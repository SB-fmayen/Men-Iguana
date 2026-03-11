'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminRecord {
  uid: string;
  email: string;
}

interface AdminsPayload {
  owner: AdminRecord;
  additional: AdminRecord[];
}

export function AdminManagers({ currentEmail }: { currentEmail: string }) {
  const [admins, setAdmins] = useState<AdminsPayload | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingUid, setRemovingUid] = useState<string | null>(null);

  const loadAdmins = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/admins', { cache: 'no-store' });
      const payload = (await response.json()) as { admins?: AdminsPayload; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Error al cargar administradores');
      }

      setAdmins(payload.admins ?? null);
    } catch (error) {
      console.error('Error loading admins:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  const isOwner = useMemo(() => {
    return !!admins?.owner?.email && admins.owner.email.toLowerCase() === currentEmail.toLowerCase();
  }, [admins, currentEmail]);

  const handleAddAdmin = async () => {
    if (!newEmail.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newEmail.trim() }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Error al agregar administrador');
      }

      setNewEmail('');
      await loadAdmins();
    } catch (error) {
      console.error('Error adding admin:', error);
      alert(error instanceof Error ? error.message : 'Error al agregar administrador');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAdmin = async (uid: string, email: string) => {
    if (!confirm(`¿Eliminar a ${email || uid} como administrador adicional?`)) {
      return;
    }

    setRemovingUid(uid);
    try {
      const response = await fetch('/api/admin/admins', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Error al eliminar administrador');
      }

      await loadAdmins();
    } catch (error) {
      console.error('Error removing admin:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar administrador');
    } finally {
      setRemovingUid(null);
    }
  };

  return (
    <section className="mx-auto max-w-5xl space-y-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <h2 className="text-xl font-bold">Administradores</h2>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando administradores...</p>
      ) : (
        <div className="space-y-3 text-sm">
          <p>
            <strong>Admin principal:</strong> {admins?.owner?.email ?? 'No disponible'}
          </p>
          <div>
            <p className="font-semibold mb-1">Admins adicionales:</p>
            {admins?.additional?.length ? (
              <ul className="space-y-2">
                {admins.additional.map((admin) => (
                  <li key={admin.uid} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                    <span>{admin.email || admin.uid}</span>
                    {isOwner ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveAdmin(admin.uid, admin.email)}
                        disabled={removingUid === admin.uid}
                      >
                        {removingUid === admin.uid ? 'Eliminando...' : 'Eliminar'}
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No hay admins adicionales.</p>
            )}
          </div>
        </div>
      )}

      {isOwner ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="email"
            placeholder="correo@ejemplo.com"
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
          />
          <Button
            onClick={handleAddAdmin}
            disabled={isSubmitting || !newEmail.trim()}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSubmitting ? 'Agregando...' : 'Agregar administrador'}
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Solo el admin principal puede agregar nuevos administradores.</p>
      )}
    </section>
  );
}
