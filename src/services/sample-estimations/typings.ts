export interface ApiEnvelope<T> {
  code?: string;
  status?: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
  timestamp?: string;
  [key: string]: unknown;
}

export interface PaginationMeta {
  page?: number;
  perPage?: number;
  totalData?: number;
  totalPage?: number;
}

export interface ProductType {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShipReference {
  id: number;
  namaKapal: string;
  kodeKapal?: string | null;
  typeShipId?: number | null;
  typeShipName?: string | null;
  typeLoadId?: number | null;
  typeLoadName?: string | null;
  tanggalKedatangan?: string | null;
  status?: string | null;
  [key: string]: unknown;
}

export interface TankReference {
  id: number;
  name: string;
  unitId?: number | null;
  unitName?: string | null;
  createdAt?: string | null;
  [key: string]: unknown;
}

export interface UnitReference {
  id: number;
  name: string;
  description?: string | null;
  status?: boolean | null;
  createdAt?: string | null;
  createdBy?: string | null;
  [key: string]: unknown;
}

export interface SampleEstimationRecord {
  id: number;
  typeLoadId: number | null;
  typeLoadName: string | null;
  shipId: number | null;
  shipName: string | null;
  shipKode?: string | null;
  nomorTanki: number | null;
  tankiName: string | null;
  qty: number | null;
  availableQty?: number | null;
  satuanId: number | null;
  satuanName: string | null;
  etaReceivedAt?: string | null;
  status?: string | null;
  note?: string | null;
  unitId?: number | null;
  unitName?: string | null;
  lokasi?: string | null;
  createdAt?: string | null;
  detailSample?: string | null;
  [key: string]: unknown;
}

export interface SampleEstimationListPayload {
  Page?: number;
  PageSize?: number;
  search?: string;
  [key: string]: unknown;
}

export interface SampleEstimationListResponseMeta {
  pagination?: PaginationMeta;
  [key: string]: unknown;
}

export interface SampleEstimationListResponse {
  data: SampleEstimationRecord[];
  pagination: PaginationMeta;
}

export interface SampleEstimationPayload {
  typeLoadId: number;
  nomorTanki: number;
  qty: number;
  satuanId: number;
  shipId: number;
  status: string;
  etaReceivedAt: string;
  note?: string;
}
