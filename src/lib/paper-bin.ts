import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';

export type PaperBinIntervalUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';

export interface PaperBinScheduleConfig {
  enabled: boolean;
  intervalValue: number;
  intervalUnit: PaperBinIntervalUnit;
  nextRunAt: Date | null;
  lastRunAt: Date | null;
  lastRunDeletedCount: number;
}

const PAPER_BIN_SCHEDULE_PATH = adminDb.collection('system').doc('paper_bin_schedule');
const DELETE_BATCH_SIZE = 400;

function sanitizeIntervalValue(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(Math.max(Math.floor(value), 1), 10000);
}

export function calculateNextRunAt(baseDate: Date, intervalValue: number, intervalUnit: PaperBinIntervalUnit) {
  const nextDate = new Date(baseDate);

  if (intervalUnit === 'minutes') {
    nextDate.setMinutes(nextDate.getMinutes() + intervalValue);
    return nextDate;
  }

  if (intervalUnit === 'hours') {
    nextDate.setHours(nextDate.getHours() + intervalValue);
    return nextDate;
  }

  if (intervalUnit === 'days') {
    nextDate.setDate(nextDate.getDate() + intervalValue);
    return nextDate;
  }

  if (intervalUnit === 'weeks') {
    nextDate.setDate(nextDate.getDate() + intervalValue * 7);
    return nextDate;
  }

  nextDate.setMonth(nextDate.getMonth() + intervalValue);
  return nextDate;
}

export async function emptyPaperBinCollection() {
  let deletedCount = 0;

  while (true) {
    const snapshot = await adminDb.collection('deleted_menu_items').limit(DELETE_BATCH_SIZE).get();

    if (snapshot.empty) {
      break;
    }

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    deletedCount += snapshot.size;

    if (snapshot.size < DELETE_BATCH_SIZE) {
      break;
    }
  }

  return deletedCount;
}

export async function getPaperBinScheduleConfig(): Promise<PaperBinScheduleConfig> {
  const snapshot = await PAPER_BIN_SCHEDULE_PATH.get();

  if (!snapshot.exists) {
    return {
      enabled: false,
      intervalValue: 1,
      intervalUnit: 'weeks',
      nextRunAt: null,
      lastRunAt: null,
      lastRunDeletedCount: 0,
    };
  }

  const data = snapshot.data() as {
    enabled?: boolean;
    intervalValue?: number;
    intervalUnit?: PaperBinIntervalUnit;
    nextRunAt?: Timestamp;
    lastRunAt?: Timestamp;
    lastRunDeletedCount?: number;
  };

  return {
    enabled: data.enabled === true,
    intervalValue: sanitizeIntervalValue(data.intervalValue ?? 1),
    intervalUnit: data.intervalUnit ?? 'weeks',
    nextRunAt: data.nextRunAt?.toDate?.() ?? null,
    lastRunAt: data.lastRunAt?.toDate?.() ?? null,
    lastRunDeletedCount:
      typeof data.lastRunDeletedCount === 'number' && Number.isFinite(data.lastRunDeletedCount)
        ? data.lastRunDeletedCount
        : 0,
  };
}

export async function updatePaperBinScheduleConfig(input: {
  enabled: boolean;
  intervalValue: number;
  intervalUnit: PaperBinIntervalUnit;
  updatedBy: string;
}) {
  const now = new Date();
  const intervalValue = sanitizeIntervalValue(input.intervalValue);
  const nextRunAt = input.enabled
    ? calculateNextRunAt(now, intervalValue, input.intervalUnit)
    : null;

  await PAPER_BIN_SCHEDULE_PATH.set(
    {
      enabled: input.enabled,
      intervalValue,
      intervalUnit: input.intervalUnit,
      nextRunAt: nextRunAt ? Timestamp.fromDate(nextRunAt) : null,
      updatedBy: input.updatedBy,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return {
    enabled: input.enabled,
    intervalValue,
    intervalUnit: input.intervalUnit,
    nextRunAt,
  };
}

export async function runScheduledPaperBinCleanupIfDue(currentUid: string) {
  const config = await getPaperBinScheduleConfig();

  if (!config.enabled || !config.nextRunAt) {
    return { executed: false, deletedCount: 0, nextRunAt: config.nextRunAt };
  }

  const now = new Date();
  if (config.nextRunAt > now) {
    return { executed: false, deletedCount: 0, nextRunAt: config.nextRunAt };
  }

  const deletedCount = await emptyPaperBinCollection();
  const nextRunAt = calculateNextRunAt(now, config.intervalValue, config.intervalUnit);

  await PAPER_BIN_SCHEDULE_PATH.set(
    {
      nextRunAt: Timestamp.fromDate(nextRunAt),
      lastRunAt: FieldValue.serverTimestamp(),
      lastRunDeletedCount: deletedCount,
      updatedBy: currentUid,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { executed: true, deletedCount, nextRunAt };
}
