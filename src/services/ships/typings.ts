export interface Ship {
  id: string;
  name: string;
  code: string | null;
  type: string;
  flag: string | null;
  company: string | null;
  captainName: string | null;
  capacity: number | null;
  cargoType: string | null;
  arrivalDate: string | null;
  operationCompletionTime?: string | null;
  portLocation: string | null;
  status: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  originPort: string | null;
  destinationPort: string | null;
  notes?: string | null;
  unitId?: string | null;
  unitName?: string | null;
  sampleCount?: number;
  isActive?: boolean;
  canAddSamples?: boolean;
  daysUntilArrival?: number | null;
  isOverdue?: boolean;
  allowedStatusTransitions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateShipPayload {
  name: string;
  code: string;
  type: string;
  flag: string;
  company: string;
  captainName: string;
  capacity: number;
  cargoType: string;
  arrivalDate: string;
  operationCompletionTime?: string;
  portLocation: string;
  status: string;
  contactPerson: string;
  phone: string;
  email: string;
  originPort: string;
  destinationPort: string;
  notes?: string;
}

export interface ShipListQuery {
  page?: number;
  pageSize?: number;
  name?: string;
  status?: string;
  type?: string;
  arrivalDateFrom?: string;
  arrivalDateTo?: string;
}

export interface ShipApiEnvelope<T> {
  status?: boolean;
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}

export interface ShipListItems {
  data: Ship[];
  totalCount: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface ShipListEnvelope {
  message?: string;
  items?: ShipListItems;
}
