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
  ReceivedStartDate?: string;
  ReceivedEndDate?: string;
  SampleId?: number;
  ShipId?: number;
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

export interface SampleCalendarQuery {
  month: number;
  year: number;
  page?: number;
  pageSize?: number;
}

export interface SampleCalendarResponse {
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

export interface CreateSampleOrderPayload {
  estimasiSampleId?: number;
  tanggalOrder: string;
  nomorNpc: string;
  labId: number;
  categoryTestId: number;
  etaArival: string;
  pathPhotoSample?: string | null;
  pathMemo?: string | null;
  notes?: string | null;
  jenisProduct: string;
  typeLoadId: number;
  shipId: number;
  nomorTangki: number;
  quantity: number;
  satuanId: number;
  priority: string;
}

export interface SampleOrderApiRecord {
  id: number;
  estimasiSampleId?: number | null;
  unitId?: number | null;
  unitName?: string | null;
  tanggalOrder?: string | null;
  nomorNpc?: string | null;
  labId?: number | null;
  labName?: string | null;
  categoryTestId?: number | null;
  categoryTestName?: string | null;
  etaArival?: string | null;
  notes?: string | null;
  jenisProduct?: string | null;
  typeLoadId?: number | null;
  typeLoadName?: string | null;
  shipId?: number | null;
  shipName?: string | null;
  nomorTangki?: number | null;
  tankiName?: string | null;
  quantity?: number | null;
  satuanId?: number | null;
  satuanName?: string | null;
  status?: number | string | null;
  priority?: string | number | null;
  createdAt?: string | null;
  orderNo?: string | null;
  type?: string | null;
  pathPhotoSample?: string | null;
  pathMemo?: string | null;
  sample?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface SampleOrderListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface SampleOrderListResponse {
  data: SampleOrderApiRecord[];
  pagination: PaginationMeta;
}

export interface CategoryTest {
  id: number;
  name: string;
  isActive?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
}

export interface LabReference {
  id: number;
  nama: string;
  deskripsi?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
}
