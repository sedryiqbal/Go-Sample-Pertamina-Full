import type { Dayjs } from 'dayjs';
import type { Ship } from '@/services/ships/typings';

export type ShipTableRecord = Ship;

export interface ShipFormValues {
  name: string;
  code: string;
  typeShipId?: number;
  flag: string;
  company: string;
  captainName: string;
  capacity: number;
  maximalTanki?: number | null;
  typeLoadId?: number;
  arrivalDate?: Dayjs;
  operationCompletionTime?: Dayjs;
  dockId?: number;
  status: string;
  contactPerson: string;
  phone: string;
  email: string;
  originPort: string;
  destinationPort: string;
  notes?: string;
}

export interface ShipSummary {
  total: number;
  scheduled: number;
  arrived: number;
  inOperation: number;
  completed: number;
}
