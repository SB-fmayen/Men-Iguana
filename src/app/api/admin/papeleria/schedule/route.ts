import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/admin-auth';
import {
  type PaperBinIntervalUnit,
  getPaperBinScheduleConfig,
  updatePaperBinScheduleConfig,
} from '@/lib/paper-bin';

const ALLOWED_INTERVAL_UNITS: PaperBinIntervalUnit[] = ['minutes', 'hours', 'days', 'weeks', 'months'];

export async function GET() {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const schedule = await getPaperBinScheduleConfig();

    return NextResponse.json({
      ok: true,
      schedule: {
        ...schedule,
        nextRunAt: schedule.nextRunAt?.toISOString() ?? null,
        lastRunAt: schedule.lastRunAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error('Error getting paper bin schedule:', error);
    return NextResponse.json({ error: 'Error al cargar la programación' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = (await request.json()) as {
      enabled?: boolean;
      intervalValue?: number;
      intervalUnit?: PaperBinIntervalUnit;
    };

    const enabled = body.enabled === true;
    const intervalValue = Number(body.intervalValue ?? 1);
    const intervalUnit = body.intervalUnit;

    if (enabled) {
      if (!ALLOWED_INTERVAL_UNITS.includes(intervalUnit as PaperBinIntervalUnit)) {
        return NextResponse.json({ error: 'Unidad de tiempo inválida' }, { status: 400 });
      }

      if (!Number.isFinite(intervalValue) || intervalValue <= 0) {
        return NextResponse.json({ error: 'Intervalo inválido' }, { status: 400 });
      }
    }

    const updated = await updatePaperBinScheduleConfig({
      enabled,
      intervalValue,
      intervalUnit: (intervalUnit as PaperBinIntervalUnit) ?? 'weeks',
      updatedBy: session.uid,
    });

    return NextResponse.json({
      ok: true,
      schedule: {
        ...updated,
        nextRunAt: updated.nextRunAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error('Error updating paper bin schedule:', error);
    return NextResponse.json({ error: 'Error al guardar la programación' }, { status: 500 });
  }
}
