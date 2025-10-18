import type { Ship } from '@/services/ships/typings';

export const SHIP_TYPE_OPTIONS = [
  { label: 'Import', value: 'Import' },
  { label: 'Export', value: 'Export' },
  { label: 'Local', value: 'Local' },
  { label: 'Domestic', value: 'Domestic' },
];

export const SHIP_TYPE_COLOR_MAP: Record<string, string> = {
  Import: 'geekblue',
  Export: 'purple',
  Local: 'green',
  Domestic: 'green',
};

export const SHIP_STATUS_OPTIONS = [
  { label: 'Scheduled', value: 'Scheduled' },
  { label: 'In Transit', value: 'InTransit' },
  { label: 'Arrived', value: 'Arrived' },
  { label: 'Docked', value: 'Docked' },
  { label: 'Under Inspection', value: 'UnderInspection' },
  { label: 'Cleared', value: 'Cleared' },
  { label: 'Departed', value: 'Departed' },
  { label: 'Cancelled', value: 'Cancelled' },
];

export const SHIP_STATUS_LABEL_MAP = SHIP_STATUS_OPTIONS.reduce<
  Record<string, string>
>((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

export const SHIP_STATUS_BADGE_COLOR: Record<
  string,
  'success' | 'processing' | 'default' | 'warning' | 'error'
> = {
  Scheduled: 'processing',
  InTransit: 'processing',
  Arrived: 'success',
  Docked: 'warning',
  UnderInspection: 'warning',
  Cleared: 'success',
  Departed: 'default',
  Cancelled: 'error',
};

export const SHIP_CARGO_TYPE_OPTIONS = [
  { label: 'Avtur', value: 'Avtur' },
  { label: 'Diesel', value: 'Diesel' },
  { label: 'Gasoline', value: 'Gasoline' },
  { label: 'Crude Oil', value: 'Crude Oil' },
  { label: 'Chemicals', value: 'Chemicals' },
  { label: 'LPG', value: 'LPG' },
];

export const SHIP_PORT_OPTIONS = [
  { label: 'Tanjung Priok', value: 'Tanjung Priok' },
  { label: 'Balikpapan', value: 'Balikpapan' },
  { label: 'Batam', value: 'Batam' },
  { label: 'Belawan', value: 'Belawan' },
  { label: 'Surabaya', value: 'Surabaya' },
];

export const SHIP_FALLBACK_DATA: Ship[] = [
  {
    id: 'ship-001',
    name: 'MT Commodore One',
    code: 'CM0001',
    type: 'Import',
    flag: 'Singapore',
    company: 'Maritime Oil Corp',
    captainName: 'Captain Johnson',
    capacity: 50000,
    cargoType: 'Avtur',
    arrivalDate: '2025-10-10T08:00:00Z',
    operationCompletionTime: '2025-10-15T17:00:00Z',
    portLocation: 'Tanjung Priok',
    status: 'Scheduled',
    contactPerson: 'John Smith',
    phone: '+65-98765432',
    email: 'contact@company.com',
    originPort: 'Singapore',
    destinationPort: 'Batam',
    notes: 'Regular shipment of aviation fuel',
    createdAt: '2025-09-30T12:00:00Z',
  },
  {
    id: 'ship-002',
    name: 'MT Pioneer',
    code: 'PIO002',
    type: 'Import',
    flag: 'Malaysia',
    company: 'Southeast Shipping',
    captainName: 'Captain Ahmad',
    capacity: 35000,
    cargoType: 'Diesel',
    arrivalDate: '2025-10-08T14:00:00Z',
    operationCompletionTime: '2025-10-12T10:15:00Z',
    portLocation: 'Balikpapan',
    status: 'UnderInspection',
    contactPerson: 'Ahmad Rahman',
    phone: '+60-12345678',
    email: 'ahmad@southeast.com',
    originPort: 'Port Klang',
    destinationPort: 'Surabaya',
    notes: 'Priority discharge for refinery operations',
    createdAt: '2025-09-28T11:00:00Z',
  },
  {
    id: 'ship-003',
    name: 'MV Explorer',
    code: 'EXP003',
    type: 'Domestic',
    flag: 'Indonesia',
    company: 'Nusantara Shipping',
    captainName: 'Captain Budi',
    capacity: 25000,
    cargoType: 'Gasoline',
    arrivalDate: '2025-10-12T10:30:00Z',
    operationCompletionTime: '2025-10-13T21:00:00Z',
    portLocation: 'Surabaya',
    status: 'InTransit',
    contactPerson: 'Budi Santoso',
    phone: '+62-81234567890',
    email: 'budi@nusantara.co.id',
    originPort: 'Balikpapan',
    destinationPort: 'Makassar',
    createdAt: '2025-10-01T09:15:00Z',
  },
];
