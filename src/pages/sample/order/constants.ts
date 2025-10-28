import type { SelectOption } from './types';

export const FALLBACK_PRODUCT_OPTIONS: SelectOption[] = [
  { label: 'JET-A1', value: 'JET-A1' },
  { label: 'Avgas', value: 'Avgas' },
  { label: 'Soft blended', value: 'Soft blended' },
];

export const FALLBACK_SHIP_OPTIONS: SelectOption[] = [
  { label: 'MT. Commodore One', value: 'MT. Commodore One' },
  { label: 'MT. Pioneer', value: 'MT. Pioneer' },
  { label: 'MT. Explorer', value: 'MT. Explorer' },
  { label: 'MT. Commodore Two', value: 'MT. Commodore Two' },
  { label: 'MT. Phoenix', value: 'MT. Phoenix' },
  { label: 'MT. Discovery', value: 'MT. Discovery' },
];

export const FALLBACK_TANK_OPTIONS: SelectOption[] = [
  { label: 'Tangki 101', value: 'Tangki 101' },
  { label: 'Tangki 102', value: 'Tangki 102' },
  { label: 'Tangki 103', value: 'Tangki 103' },
  { label: 'Tangki 104', value: 'Tangki 104' },
  { label: 'Tangki 105', value: 'Tangki 105' },
  { label: 'Tangki 106', value: 'Tangki 106' },
  { label: 'Tangki 107', value: 'Tangki 107' },
  { label: 'Tangki 108', value: 'Tangki 108' },
  { label: 'Tangki 109', value: 'Tangki 109' },
  { label: 'Tangki 110', value: 'Tangki 110' },
  { label: 'Single tank composite', value: 'Single tank composite' },
  { label: 'Multi tank composite', value: 'Multi tank composite' },
];

export const FALLBACK_UNIT_OPTIONS: SelectOption[] = [
  { label: 'Botol', value: 'botol' },
  { label: 'Liter', value: 'liter' },
  { label: 'kg', value: 'kg' },
  { label: 'ml', value: 'ml' },
];

export const FALLBACK_CATEGORY_TEST_OPTIONS: SelectOption[] = [
  { label: 'Short Test', value: 'Short Test' },
  { label: 'IBS', value: 'IBS' },
  { label: 'CoA', value: 'CoA' },
  { label: 'Soak Test', value: 'Soak Test' },
];

export const FALLBACK_LAB_OPTIONS: SelectOption[] = [
  {
    label: 'LPUJ - Priok',
    value: 'LPUJ - Priok',
    meta: { time: 1, description: 'Priok (1 jam)' },
  },
  {
    label: 'Lemigas - Jakarta',
    value: 'Lemigas - Jakarta',
    meta: { time: 1, description: 'Jakarta (1 jam)' },
  },
  {
    label: 'Balongan - Balongan',
    value: 'Balongan - Balongan',
    meta: { time: 6, description: 'Balongan (6 jam)' },
  },
  {
    label: 'Main Laboratory',
    value: 'Main Laboratory',
    meta: { time: 2, description: 'Default turnaround 2 jam' },
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
