import { NextResponse } from 'next/server';
import { getCurrentAdminSession, getAdminConfig } from '@/lib/admin-auth';

export async function GET() {
  try {
    const [config, session] = await Promise.all([getAdminConfig(), getCurrentAdminSession()]);

    return NextResponse.json({
      hasAdmin: !!config,
      isAuthenticated: !!session,
      isOwner: !!session,
      ready: true,
    });
  } catch (error) {
    console.error('Admin status error:', error);
    return NextResponse.json({
      hasAdmin: false,
      isAuthenticated: false,
      isOwner: false,
      ready: false,
      error:
        'Configura FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL y FIREBASE_ADMIN_PRIVATE_KEY en el servidor.',
    });
  }
}
