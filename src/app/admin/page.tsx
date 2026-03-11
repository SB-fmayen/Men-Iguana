import { redirect } from 'next/navigation';
import { getCurrentAdminSession } from '@/lib/admin-auth';
import { AdminPageContent } from '@/components/admin/admin-page-content';

export default async function AdminPage() {
  const session = await getCurrentAdminSession();

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <AdminPageContent email={session.email ?? ''} />
    </main>
  );
}
