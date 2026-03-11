import { cookies } from 'next/headers';
import { DecodedIdToken } from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE } from '@/lib/admin-constants';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

interface AdminConfig {
  ownerUid: string;
  ownerEmail: string;
  additionalAdminUids?: string[];
  additionalAdminEmails?: string[];
  createdAt?: FirebaseFirestore.FieldValue;
  updatedAt?: FirebaseFirestore.FieldValue;
}

async function setAdminClaim(uid: string, isAdmin: boolean) {
  const user = await adminAuth.getUser(uid);
  const currentClaims = user.customClaims ?? {};

  if (isAdmin) {
    if (currentClaims.admin === true) {
      return;
    }

    await adminAuth.setCustomUserClaims(uid, {
      ...currentClaims,
      admin: true,
    });
    return;
  }

  if (currentClaims.admin !== true) {
    return;
  }

  const { admin: _admin, ...restClaims } = currentClaims;
  await adminAuth.setCustomUserClaims(uid, restClaims);
}

export async function getAdminConfig() {
  const docRef = adminDb.collection('system').doc('admin');
  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    return null;
  }

  return snapshot.data() as AdminConfig;
}

export async function ensureSingleAdmin(uid: string, email: string) {
  const docRef = adminDb.collection('system').doc('admin');
  let allowed = false;
  let created = false;

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(docRef);

    if (!snapshot.exists) {
      transaction.set(docRef, {
        ownerUid: uid,
        ownerEmail: email,
        additionalAdminUids: [],
        additionalAdminEmails: [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      allowed = true;
      created = true;
      return;
    }

    const data = snapshot.data() as AdminConfig;
    const additionalUids = data.additionalAdminUids ?? [];
    allowed = data.ownerUid === uid || additionalUids.includes(uid);

    if (allowed) {
      if (data.ownerUid === uid) {
        transaction.update(docRef, {
          ownerEmail: email,
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        const additionalEmails = Array.from(new Set([...(data.additionalAdminEmails ?? []), email]));
        transaction.update(docRef, {
          additionalAdminEmails: additionalEmails,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }
  });

  if (!allowed) {
    return { allowed: false, created: false };
  }

  const user = await adminAuth.getUser(uid);
  const currentClaims = user.customClaims ?? {};

  if (currentClaims.admin !== true) {
    await setAdminClaim(uid, true);
  }

  return { allowed: true, created };
}

export async function getAllAdmins() {
  const config = await getAdminConfig();
  if (!config) {
    return null;
  }

  return {
    owner: {
      uid: config.ownerUid,
      email: config.ownerEmail,
    },
    additional: (config.additionalAdminUids ?? []).map((uid, index) => ({
      uid,
      email: config.additionalAdminEmails?.[index] ?? '',
    })),
  };
}

export async function addAdditionalAdmin(currentUid: string, newAdminEmail: string) {
  const normalizedEmail = newAdminEmail.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error('Debes enviar un correo válido.');
  }

  const newAdmin = await adminAuth.getUserByEmail(normalizedEmail);
  const newAdminResolvedEmail = newAdmin.email ?? normalizedEmail;

  const docRef = adminDb.collection('system').doc('admin');
  let wasAdded = false;

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(docRef);

    if (!snapshot.exists) {
      throw new Error('No existe administrador configurado.');
    }

    const data = snapshot.data() as AdminConfig;

    if (data.ownerUid !== currentUid) {
      throw new Error('Solo el administrador principal puede agregar otros administradores.');
    }

    if (data.ownerUid === newAdmin.uid) {
      wasAdded = false;
      return;
    }

    const additionalUids = data.additionalAdminUids ?? [];
    const additionalEmails = data.additionalAdminEmails ?? [];

    if (additionalUids.includes(newAdmin.uid)) {
      wasAdded = false;
      return;
    }

    transaction.update(docRef, {
      additionalAdminUids: [...additionalUids, newAdmin.uid],
      additionalAdminEmails: [...additionalEmails, newAdminResolvedEmail],
      updatedAt: FieldValue.serverTimestamp(),
    });
    wasAdded = true;
  });

  await setAdminClaim(newAdmin.uid, true);

  return {
    added: wasAdded,
    email: newAdminResolvedEmail,
    uid: newAdmin.uid,
  };
}

export async function removeAdditionalAdmin(currentUid: string, targetUid: string) {
  if (!targetUid.trim()) {
    throw new Error('Debes enviar un administrador válido.');
  }

  const docRef = adminDb.collection('system').doc('admin');
  let wasRemoved = false;

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(docRef);

    if (!snapshot.exists) {
      throw new Error('No existe administrador configurado.');
    }

    const data = snapshot.data() as AdminConfig;

    if (data.ownerUid !== currentUid) {
      throw new Error('Solo el administrador principal puede eliminar administradores.');
    }

    if (data.ownerUid === targetUid) {
      throw new Error('No puedes eliminar al administrador principal desde aquí.');
    }

    const additionalUids = data.additionalAdminUids ?? [];
    const additionalEmails = data.additionalAdminEmails ?? [];
    const targetIndex = additionalUids.findIndex((uid) => uid === targetUid);

    if (targetIndex === -1) {
      wasRemoved = false;
      return;
    }

    const nextAdditionalUids = additionalUids.filter((uid) => uid !== targetUid);
    const nextAdditionalEmails = additionalEmails.filter((_, index) => index !== targetIndex);

    transaction.update(docRef, {
      additionalAdminUids: nextAdditionalUids,
      additionalAdminEmails: nextAdditionalEmails,
      updatedAt: FieldValue.serverTimestamp(),
    });

    wasRemoved = true;
  });

  if (wasRemoved) {
    await setAdminClaim(targetUid, false);
  }

  return { removed: wasRemoved, uid: targetUid };
}

export async function transferAdminOwnership(currentOwnerUid: string, newOwnerEmail: string) {
  const normalizedEmail = newOwnerEmail.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error('Debes enviar un correo válido.');
  }

  const newOwner = await adminAuth.getUserByEmail(normalizedEmail);
  const newOwnerResolvedEmail = newOwner.email ?? normalizedEmail;

  if (newOwner.uid === currentOwnerUid) {
    return {
      changed: false,
      newOwnerEmail: newOwnerResolvedEmail,
    };
  }

  const docRef = adminDb.collection('system').doc('admin');

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(docRef);

    if (!snapshot.exists) {
      throw new Error('No existe administrador configurado.');
    }

    const data = snapshot.data() as AdminConfig;

    if (data.ownerUid !== currentOwnerUid) {
      throw new Error('Solo el administrador actual puede transferir la cuenta.');
    }

    transaction.update(docRef, {
      ownerUid: newOwner.uid,
      ownerEmail: newOwnerResolvedEmail,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  await Promise.all([
    setAdminClaim(currentOwnerUid, false),
    setAdminClaim(newOwner.uid, true),
  ]);

  return {
    changed: true,
    newOwnerEmail: newOwnerResolvedEmail,
  };
}

export async function releaseAdminOwnership(currentOwnerUid: string) {
  const docRef = adminDb.collection('system').doc('admin');

  await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(docRef);

    if (!snapshot.exists) {
      return;
    }

    const data = snapshot.data() as AdminConfig;
    if (data.ownerUid !== currentOwnerUid) {
      throw new Error('Solo el administrador actual puede liberar la cuenta.');
    }

    transaction.delete(docRef);
  });

  await setAdminClaim(currentOwnerUid, false);
}

export async function createAdminSessionCookie(idToken: string) {
  return adminAuth.createSessionCookie(idToken, {
    expiresIn: ADMIN_SESSION_MAX_AGE * 1000,
  });
}

export async function verifyAdminSessionCookie(sessionCookie: string) {
  return adminAuth.verifySessionCookie(sessionCookie, true);
}

export async function getCurrentAdminSession(): Promise<DecodedIdToken | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = await verifyAdminSessionCookie(sessionCookie);
    const config = await getAdminConfig();

    if (!config) {
      return null;
    }

    const additionalUids = config.additionalAdminUids ?? [];
    const isAllowed = config.ownerUid === decoded.uid || additionalUids.includes(decoded.uid);

    if (!isAllowed) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}
