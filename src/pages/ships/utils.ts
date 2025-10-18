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

  return {
    name: values.name.trim(),
    code: values.code.trim(),
    type: values.type,
    flag: values.flag.trim(),
    company: values.company.trim(),
    captainName: values.captainName.trim(),
    capacity: Number(values.capacity),
    cargoType: values.cargoType,
    arrivalDate: values.arrivalDate.toISOString(),
    operationCompletionTime: toIsoString(values.operationCompletionTime),
    portLocation: values.portLocation,
    status: values.status,
    contactPerson: values.contactPerson.trim(),
    phone: values.phone.trim(),
    email: values.email.trim(),
    originPort: values.originPort.trim(),
    destinationPort: values.destinationPort.trim(),
    notes: normalizeText(values.notes),
  };
};

export const deriveShipSummary = (ships: Ship[]): ShipSummary => {
  return ships.reduce<ShipSummary>(
    (summary, ship) => {
      summary.total += 1;

      switch (ship.status) {
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
