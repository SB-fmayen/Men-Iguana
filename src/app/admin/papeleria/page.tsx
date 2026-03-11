'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DeletedMenuItem {
  id: string;
  originalId: string;
  name: string;
  categoryName: string;
  price: number;
  deletedAt: string | null;
}

type PaperBinIntervalUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';

interface PaperBinSchedule {
  enabled: boolean;
  intervalValue: number;
  intervalUnit: PaperBinIntervalUnit;
  nextRunAt: string | null;
  lastRunAt?: string | null;
  lastRunDeletedCount?: number;
}

const formatPrice = (price: number) => `Q ${price.toFixed(2)}`;

export default function AdminPapeleriaPage() {
  const [items, setItems] = useState<DeletedMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [isEmptying, setIsEmptying] = useState(false);
  const [schedule, setSchedule] = useState<PaperBinSchedule | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [scheduleIntervalValue, setScheduleIntervalValue] = useState('1');
  const [scheduleIntervalUnit, setScheduleIntervalUnit] = useState<PaperBinIntervalUnit>('weeks');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/papeleria/menu-items', { cache: 'no-store' });
      const payload = (await response.json()) as {
        error?: string;
        items?: DeletedMenuItem[];
        scheduledExecution?: {
          executed: boolean;
          deletedCount: number;
        };
      };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Error al cargar la papelería');
      }

      setItems(payload.items ?? []);

      if (payload.scheduledExecution?.executed && payload.scheduledExecution.deletedCount > 0) {
        alert(`Se vació automáticamente la papelería (${payload.scheduledExecution.deletedCount} productos).`);
      }
    } catch (error) {
      console.error('Error loading paper bin:', error);
      alert(error instanceof Error ? error.message : 'Error al cargar la papelería');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const loadSchedule = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/papeleria/schedule', { cache: 'no-store' });
      const payload = (await response.json()) as { error?: string; schedule?: PaperBinSchedule };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Error al cargar la programación');
      }

      if (!payload.schedule) {
        return;
      }

      setSchedule(payload.schedule);
      setScheduleEnabled(payload.schedule.enabled);
      setScheduleIntervalValue(String(payload.schedule.intervalValue));
      setScheduleIntervalUnit(payload.schedule.intervalUnit);
    } catch (error) {
      console.error('Error loading schedule:', error);
    }
  }, []);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      const response = await fetch(`/api/admin/papeleria/menu-items/${id}/restore`, {
        method: 'POST',
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Error al restaurar el producto');
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error restoring item:', error);
      alert(error instanceof Error ? error.message : 'Error al restaurar el producto');
    } finally {
      setRestoringId(null);
    }
  };

  const handleEmptyPaperBin = async () => {
    if (!confirm('¿Seguro que deseas vaciar toda la papelería? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsEmptying(true);
    try {
      const response = await fetch('/api/admin/papeleria/empty', {
        method: 'POST',
      });

      const payload = (await response.json().catch(() => null)) as { error?: string; deletedCount?: number } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Error al vaciar la papelería');
      }

      const deletedCount = payload?.deletedCount ?? 0;
      setItems([]);
      alert(`Papelería vaciada correctamente (${deletedCount} productos).`);
    } catch (error) {
      console.error('Error emptying paper bin:', error);
      alert(error instanceof Error ? error.message : 'Error al vaciar la papelería');
    } finally {
      setIsEmptying(false);
    }
  };

  const handleSaveSchedule = async () => {
    const intervalValue = Number(scheduleIntervalValue);

    if (scheduleEnabled && (!Number.isFinite(intervalValue) || intervalValue <= 0)) {
      alert('Ingresa un intervalo válido mayor que 0.');
      return;
    }

    setIsSavingSchedule(true);
    try {
      const response = await fetch('/api/admin/papeleria/schedule', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: scheduleEnabled,
          intervalValue,
          intervalUnit: scheduleIntervalUnit,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        schedule?: PaperBinSchedule;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Error al guardar la programación');
      }

      if (payload?.schedule) {
        setSchedule(payload.schedule);
      }

      setIsScheduleDialogOpen(false);
      await loadItems();
      alert(scheduleEnabled ? 'Programación guardada.' : 'Programación desactivada.');
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar la programación');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const totalDeleted = useMemo(() => items.length, [items]);

  const nextRunLabel = schedule?.nextRunAt
    ? new Date(schedule.nextRunAt).toLocaleString('es-GT')
    : 'No programado';

  return (
    <main className="container mx-auto px-4 py-10 space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold">
        <ChevronLeft className="h-5 w-5" />
        Volver al admin
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Papelería</h1>
        <p className="text-sm text-gray-600 mt-1">{totalDeleted} productos eliminados</p>
        <p className="text-xs text-gray-500 mt-1">
          Próximo vaciado automático: {schedule?.enabled ? nextRunLabel : 'Desactivado'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={handleEmptyPaperBin}
          disabled={isEmptying || totalDeleted === 0}
          className="bg-red-600 hover:bg-red-700"
        >
          {isEmptying ? 'Vaciando...' : 'Vaciar papelería'}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setScheduleEnabled(schedule?.enabled ?? true);
            setScheduleIntervalValue(String(schedule?.intervalValue ?? 1));
            setScheduleIntervalUnit(schedule?.intervalUnit ?? 'weeks');
            setIsScheduleDialogOpen(true);
          }}
        >
          Programar vaciado
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando papelería...</p>
      ) : items.length === 0 ? (
        <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700">
          No hay productos eliminados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {items.map((item) => (
            <Card
              key={item.id}
              className="rounded-lg border-2 border-black p-4 sm:p-6 shadow-[6px_6px_0_#000] bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-base sm:text-lg">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.categoryName}</p>
                </div>
                <Trash2 className="h-4 w-4 text-gray-500" />
              </div>

              <div className="mt-4 space-y-1 text-sm text-gray-700">
                <p>Precio: {formatPrice(item.price)}</p>
                <p>
                  Eliminado:{' '}
                  {item.deletedAt
                    ? new Date(item.deletedAt).toLocaleString('es-GT')
                    : 'Sin fecha'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t flex justify-end">
                <Button
                  onClick={() => handleRestore(item.id)}
                  disabled={restoringId === item.id}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {restoringId === item.id ? 'Restaurando...' : 'Restaurar'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Programar vaciado de papelería</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-mode">Modo</Label>
              <select
                id="schedule-mode"
                value={scheduleEnabled ? 'enabled' : 'disabled'}
                onChange={(event) => setScheduleEnabled(event.target.value === 'enabled')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="enabled">Activar vaciado automático</option>
                <option value="disabled">Desactivar programación</option>
              </select>
            </div>

            {scheduleEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="interval-value">Cada cuánto tiempo</Label>
                  <Input
                    id="interval-value"
                    type="number"
                    min={1}
                    step={1}
                    value={scheduleIntervalValue}
                    onChange={(event) => setScheduleIntervalValue(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interval-unit">Unidad</Label>
                  <select
                    id="interval-unit"
                    value={scheduleIntervalUnit}
                    onChange={(event) => setScheduleIntervalUnit(event.target.value as PaperBinIntervalUnit)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="minutes">Minutos</option>
                    <option value="hours">Horas</option>
                    <option value="days">Días</option>
                    <option value="weeks">Semanas</option>
                    <option value="months">Meses</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsScheduleDialogOpen(false)}
                disabled={isSavingSchedule}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveSchedule}
                disabled={isSavingSchedule}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSavingSchedule ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
