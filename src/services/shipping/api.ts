import { request } from '@umijs/max';

const AVAILABLE_FOR_PICKUP_ENDPOINT =
  '/api/SampleOrders/driver/available-for-pickup';

export interface AvailableForPickupOrder {
  id?: number | string;
  orderNo?: string | null;
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
  typeLoadId?: number | null;
  typeLoadName?: string | null;
  shipId?: number | null;
  shipName?: string | null;
  nomorTangki?: number | string | null;
  tankiName?: string | null;
  quantity?: number | null;
  satuanId?: number | null;
  satuanName?: string | null;
  priority?: string | null;
  status?: number | null;
  type?: string | null;
  createdAt?: string | null;
  sample?: {
    id?: number | string | null;
    shipName?: string | null;
    typeLoadName?: string | null;
    nomorTanki?: number | string | null;
    qty?: number | null;
    satuanName?: string | null;
    status?: string | null;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

interface AvailableForPickupResponse {
  code?: string;
  status?: boolean;
  message?: string;
  data?: AvailableForPickupOrder[];
  timestamp?: string;
  [key: string]: unknown;
}

export interface UpdateSampleOrderStatusPayload {
  status: number;
  driverId?: number | null;
  comment?: string | null;
}

export interface UpdateSampleOrderStatusResponse {
  code?: string;
  status?: boolean;
  message?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export const getAvailableForPickupOrders =
  async (): Promise<AvailableForPickupOrder[]> => {
    const response = await request<AvailableForPickupResponse>(
      AVAILABLE_FOR_PICKUP_ENDPOINT,
      {
        method: 'GET',
      },
    );

    return response?.data ?? [];
  };

export const updateSampleOrderStatus = async (
  id: string | number,
  payload: UpdateSampleOrderStatusPayload,
) => {
  return request<UpdateSampleOrderStatusResponse>(
    `/api/SampleOrders/${id}/status`,
    {
      method: 'PATCH',
      data: payload,
    },
  );
};

export interface CreateTransitLogPayload {
  sampleOrderId: number | string;
  comment?: string | null;
}

export interface CreateTransitLogResponse {
  code?: string;
  status?: boolean;
  message?: string;
  data?: unknown;
  timestamp?: string;
  [key: string]: unknown;
}

export const createTransitLog = async (
  payload: CreateTransitLogPayload,
) => {
  return request<CreateTransitLogResponse>(`/api/SampleOrders/transit-logs`, {
    method: 'POST',
    data: payload,
  });
};

export interface TransitLogRecord {
  id?: number | string;
  sampleOrderId?: number | string;
  sampleOrderNomorNpc?: string | null;
  driverId?: number | string | null;
  driverName?: string | null;
  comment?: string | null;
  createdAt?: string | null;
  [key: string]: unknown;
}

export interface InTransitSampleOrder {
  id?: number | string;
  orderNo?: string | null;
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
  typeLoadId?: number | null;
  typeLoadName?: string | null;
  shipId?: number | null;
  shipName?: string | null;
  nomorTangki?: number | string | null;
  tankiName?: string | null;
  quantity?: number | null;
  satuanId?: number | null;
  satuanName?: string | null;
  priority?: string | null;
  status?: number | string | null;
  driverId?: number | null;
  driverName?: string | null;
  type?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  transitLogs?: TransitLogRecord[];
  [key: string]: unknown;
}

interface InTransitOrdersResponse {
  code?: string;
  status?: boolean;
  message?: string;
  data?: InTransitSampleOrder[];
  timestamp?: string;
}

export const getInTransitOrders = async (): Promise<InTransitSampleOrder[]> => {
  const response = await request<InTransitOrdersResponse>(
    '/api/SampleOrders/driver/in-transit',
    {
      method: 'GET',
    },
  );

  return response?.data ?? [];
};
