export interface Ship {
  id: string;
  name: string;
  code: string | null;
  type: string | null;
  typeShipId?: number | null;
  typeShipName?: string | null;
  flag: string | null;
  company: string | null;
  captainName: string | null;
  capacity: number | null;
  cargoType: string | null;
  typeLoadId?: number | null;
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
  dockId?: number | null;
  dockName?: string | null;
  maximalTanki?: number | null;
  sampleCount?: number;
  isActive?: boolean;
  canAddSamples?: boolean;
  daysUntilArrival?: number | null;
  isOverdue?: boolean;
  allowedStatusTransitions?: string[];
  createdAt?: string;
  updatedAt?: string;
  isQCCompleted?: boolean | null;
}

export interface CreateShipPayload {
  kodeKapal: string;
  namaKapal: string;
  status: string;
  typeLoadId: number;
  typeShipId: number;
  bendera: string;
  perusahaan: string;
  namaKapten: string;
  kapasitasMT: number;
  maximalTanki?: number;
  tanggalKedatangan: string;
  waktuSelesaiOperasi?: string;
  dockId: number;
  contactPerson: string;
  telepon: string;
  email: string;
  pelabuhanAsal: string;
  pelabuhanTujuan: string;
  catatan?: string;
}

export interface ShipListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  typeShipId?: number;
  typeLoadId?: number;
}

export interface ShipApiEnvelope<T> {
  status?: boolean;
  success?: boolean;
  message?: string;
  data?: T;
  meta?: unknown;
  [key: string]: unknown;
}

export interface ShipListPagination {
  page: number;
  perPage: number;
  totalData: number;
  totalPage: number;
}

export interface ShipListEnvelope {
  data: Ship[];
  pagination: ShipListPagination;
  message?: string;
  status?: boolean;
}

export interface ShipTypeReference {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShipCargoTypeReference {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DockReference {
  id: number;
  name: string;
  description?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
  updatedAt?: string;
}
