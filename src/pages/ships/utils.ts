import dayjs from 'dayjs';
import type { CreateShipPayload, Ship } from '@/services/ships/typings';
import type { ShipFormValues, ShipSummary } from './types';

const toIsoString = (value?: dayjs.Dayjs) =>
  value ? value.toISOString() : undefined;

const normalizeText = (value?: string) => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const toCreateShipPayload = (
  values: ShipFormValues,
): CreateShipPayload => {
  if (!values.arrivalDate) {
    throw new Error('Tanggal kedatangan wajib diisi');
  }

  if (values.capacity === undefined || values.capacity === null) {
    throw new Error('Kapasitas wajib diisi');
  }

  if (values.typeShipId === undefined || values.typeShipId === null) {
    throw new Error('Tipe kapal wajib dipilih');
  }

  if (values.typeLoadId === undefined || values.typeLoadId === null) {
    throw new Error('Jenis muatan wajib dipilih');
  }

  if (values.dockId === undefined || values.dockId === null) {
    throw new Error('Lokasi dermaga wajib dipilih');
  }

  const toNumberOrThrow = (input: number | string, fieldLabel: string) => {
    const numeric = Number(input);
    if (!Number.isFinite(numeric)) {
      throw new Error(`${fieldLabel} tidak valid`);
    }
    return numeric;
  };

  const maximalTanki =
    values.maximalTanki !== undefined && values.maximalTanki !== null
      ? Number(values.maximalTanki)
      : undefined;

  return {
    kodeKapal: values.code.trim(),
    namaKapal: values.name.trim(),
    status: values.status,
    typeLoadId: toNumberOrThrow(values.typeLoadId, 'Jenis muatan'),
    typeShipId: toNumberOrThrow(values.typeShipId, 'Tipe kapal'),
    bendera: values.flag.trim(),
    perusahaan: values.company.trim(),
    namaKapten: values.captainName.trim(),
    kapasitasMT: Number(values.capacity),
    maximalTanki,
    tanggalKedatangan: values.arrivalDate.toISOString(),
    waktuSelesaiOperasi: toIsoString(values.operationCompletionTime),
    dockId: toNumberOrThrow(values.dockId, 'Lokasi dermaga'),
    contactPerson: values.contactPerson.trim(),
    telepon: values.phone.trim(),
    email: values.email.trim(),
    pelabuhanAsal: values.originPort.trim(),
    pelabuhanTujuan: values.destinationPort.trim(),
    catatan: normalizeText(values.notes),
  };
};

export const deriveShipSummary = (ships: Ship[]): ShipSummary => {
  return ships.reduce<ShipSummary>(
    (summary, ship) => {
      summary.total += 1;

      switch (ship.status) {
        case 'active':
          summary.inOperation += 1;
          break;
        case 'inactive':
          summary.completed += 1;
          break;
        case 'Scheduled':
          summary.scheduled += 1;
          break;
        case 'Arrived':
          summary.arrived += 1;
          break;
        case 'InTransit':
        case 'Docked':
        case 'UnderInspection':
          summary.inOperation += 1;
          break;
        case 'Cleared':
        case 'Departed':
          summary.completed += 1;
          break;
        default:
          break;
      }

      return summary;
    },
    {
      total: 0,
      scheduled: 0,
      arrived: 0,
      inOperation: 0,
      completed: 0,
    },
  );
};

export const formatDateTime = (value?: string, format = 'DD/MM/YYYY HH:mm') =>
  value ? dayjs(value).format(format) : '-';

export const safeText = (value: unknown, fallback = '-'): string => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  return String(value);
};
