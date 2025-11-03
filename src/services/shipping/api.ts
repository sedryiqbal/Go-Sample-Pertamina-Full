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
