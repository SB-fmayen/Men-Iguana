'use client';

import { AdminMenuViewer } from '@/components/admin/admin-menu-viewer';
import { AdminLogoutButton } from '@/components/admin/admin-logout-button';
import { AdminManagers } from '@/components/admin/admin-managers';

export function AdminPageContent({ email }: { email: string }) {
  return (
    <div className="space-y-8">
      <section className="mx-auto max-w-5xl space-y-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-2xl font-bold">Panel de administrador</h1>
        <p className="text-sm text-muted-foreground">
          Sesión iniciada como <strong>{email}</strong>.
        </p>
        <AdminLogoutButton />
      </section>
      <section className="mx-auto max-w-5xl">
        <AdminMenuViewer />
      </section>
      <AdminManagers currentEmail={email} />
    </div>
  );
}
