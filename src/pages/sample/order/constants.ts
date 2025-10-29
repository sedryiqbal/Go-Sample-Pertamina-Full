import type { SelectOption } from './types';

export const FALLBACK_PRODUCT_OPTIONS: SelectOption[] = [
  { label: 'JET-A1', value: 'JET-A1', meta: { id: 1 } },
  { label: 'Avgas', value: 'Avgas', meta: { id: 2 } },
  { label: 'Soft blended', value: 'Soft blended', meta: { id: 3 } },
];

export const FALLBACK_SHIP_OPTIONS: SelectOption[] = [
  { label: 'MT. Commodore One', value: 'MT. Commodore One', meta: { id: 1 } },
  { label: 'MT. Pioneer', value: 'MT. Pioneer', meta: { id: 2 } },
  { label: 'MT. Explorer', value: 'MT. Explorer', meta: { id: 3 } },
  { label: 'MT. Commodore Two', value: 'MT. Commodore Two', meta: { id: 4 } },
  { label: 'MT. Phoenix', value: 'MT. Phoenix', meta: { id: 5 } },
  { label: 'MT. Discovery', value: 'MT. Discovery', meta: { id: 6 } },
];

export const FALLBACK_TANK_OPTIONS: SelectOption[] = [
  { label: 'Tangki 101', value: 'Tangki 101', meta: { id: 101 } },
  { label: 'Tangki 102', value: 'Tangki 102', meta: { id: 102 } },
  { label: 'Tangki 103', value: 'Tangki 103', meta: { id: 103 } },
  { label: 'Tangki 104', value: 'Tangki 104', meta: { id: 104 } },
  { label: 'Tangki 105', value: 'Tangki 105', meta: { id: 105 } },
  { label: 'Tangki 106', value: 'Tangki 106', meta: { id: 106 } },
  { label: 'Tangki 107', value: 'Tangki 107', meta: { id: 107 } },
  { label: 'Tangki 108', value: 'Tangki 108', meta: { id: 108 } },
  { label: 'Tangki 109', value: 'Tangki 109', meta: { id: 109 } },
  { label: 'Tangki 110', value: 'Tangki 110', meta: { id: 110 } },
  {
    label: 'Single tank composite',
    value: 'Single tank composite',
    meta: { id: 201 },
  },
  {
    label: 'Multi tank composite',
    value: 'Multi tank composite',
    meta: { id: 202 },
  },
];

export const FALLBACK_UNIT_OPTIONS: SelectOption[] = [
  { label: 'Botol', value: 'botol', meta: { id: 1 } },
  { label: 'Liter', value: 'liter', meta: { id: 2 } },
  { label: 'kg', value: 'kg', meta: { id: 3 } },
  { label: 'ml', value: 'ml', meta: { id: 4 } },
];

export const FALLBACK_CATEGORY_TEST_OPTIONS: SelectOption[] = [
  { label: 'Short Test', value: 'Short Test', meta: { id: 3 } },
  { label: 'IBS', value: 'IBS', meta: { id: 4 } },
  { label: 'CoA', value: 'CoA', meta: { id: 5 } },
  { label: 'Soak Test', value: 'Soak Test', meta: { id: 6 } },
];

export const FALLBACK_LAB_OPTIONS: SelectOption[] = [
  {
    label: 'LPUJ - Priok',
    value: 'LPUJ - Priok',
    meta: { id: 1, time: 1, description: 'Priok (1 jam)' },
  },
  {
    label: 'Lemigas - Jakarta',
    value: 'Lemigas - Jakarta',
    meta: { id: 2, time: 1, description: 'Jakarta (1 jam)' },
  },
  {
    label: 'Balongan - Balongan',
    value: 'Balongan - Balongan',
    meta: { id: 3, time: 6, description: 'Balongan (6 jam)' },
  },
  {
    label: 'Main Laboratory',
    value: 'Main Laboratory',
    meta: { id: 4, time: 2, description: 'Default turnaround 2 jam' },
  },
];

export const PRIORITY_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Urgent', value: 'urgent' },
];

export const SAMPLE_CATEGORY_OPTIONS = [
  { label: 'Import Sample', value: 'import' },
  { label: 'Local Sample', value: 'local' },
  { label: 'Reference Sample', value: 'reference' },
];
