import { request } from '@umijs/max';

export const SYRINGE_ENDPOINT = '/api/Syringe';

export interface SyringeStockItem {
  id: number | string;
  unitId?: number | string;
  unitName?: string;
  currentStock: number;
  maxCapacity: number;
  minThreshold: number;
  status: string;
  stockUnit?: string;
  stockPercentage?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface SyringeStockResponse {
  code: string;
  status: boolean;
  message: string;
  data?: SyringeStockItem[];
  timestamp?: string;
}

type SyringeStockPayload =
  | SyringeStockResponse
  | SyringeStockItem[]
  | SyringeStockItem
  | undefined;

const normalizeCode = (code?: string | number) => {
  if (typeof code === 'number') return String(code);
  return (code || '').trim();
};

const isSuccessPayload = (payload?: { code?: string | number; status?: boolean }) => {
  if (!payload) return false;
  const successCodes = new Set(['00', '0', '200', '201']);
  return Boolean(payload.status) || successCodes.has(normalizeCode(payload.code));
};

const normalizeResponse = (payload: SyringeStockPayload): SyringeStockResponse => {
  if (payload && typeof payload === 'object' && 'code' in payload && 'status' in payload) {
    return payload as SyringeStockResponse;
  }
  if (Array.isArray(payload)) {
    return { code: '00', status: true, message: 'OK', data: payload };
  }
  if (payload && typeof payload === 'object') {
    return { code: '00', status: true, message: 'OK', data: [payload as SyringeStockItem] };
  }
  return { code: '99', status: false, message: 'Response payload tidak valid', data: [] };
};

export const getSyringeStock = async (): Promise<SyringeStockItem> => {
  const response = await request<SyringeStockPayload>(SYRINGE_ENDPOINT, { method: 'GET' });
  const payload = normalizeResponse(response);
  const records = Array.isArray(payload.data) ? payload.data : payload.data ? [payload.data] : [];

  if (!isSuccessPayload(payload) || !records.length) {
    throw new Error(payload?.message || 'Gagal memuat data stock syringe');
  }

  const stock = records[0];
  if (!stock) {
    throw new Error('Data stock syringe tidak tersedia');
  }
  return stock;
};

export interface UpdateSyringeStockPayload {
  newStockAmount: number;
  notes?: string;
}

export const updateSyringeStockQuantity = async (
  syringeId: number | string,
  payload: UpdateSyringeStockPayload,
): Promise<void> => {
  if (syringeId === undefined || syringeId === null || syringeId === '') {
    throw new Error('Syringe ID tidak ditemukan');
  }

  const endpoint = `${SYRINGE_ENDPOINT}/${syringeId}/quantity`;
  const response = await request<
    SyringeStockPayload | { code?: string | number; status?: boolean; message?: string } | boolean | null
  >(endpoint, {
    method: 'PUT',
    data: payload,
  });

  if (response === undefined || response === null) return;
  if (typeof response === 'boolean') {
    if (!response) throw new Error('Gagal memperbarui stock syringe');
    return;
  }
  if (
    typeof response === 'object' &&
    response !== null &&
    ('code' in response || 'status' in response)
  ) {
    const envelope = response as { code?: string | number; status?: boolean; message?: string };
    if (!isSuccessPayload(envelope)) {
      throw new Error(envelope?.message || 'Gagal memperbarui stock syringe');
    }
  }
};

export interface SyringeAuditLog {
  id: number | string;
  syringeId?: number | string;
  action?: string;
  stockBefore?: number;
  stockAfter?: number;
  difference?: number;
  userId?: number | string;
  userName?: string;
  userRole?: string;
  notes?: string;
  createdAt?: string;
  formattedCreatedAt?: string;
}

export interface SyringeAuditLogPagination {
  page?: number;
  perPage?: number;
  totalData?: number;
  totalPage?: number;
}

interface SyringeAuditLogEnvelope {
  code?: string | number;
  status?: boolean;
  message?: string;
  data?: SyringeAuditLog[];
  meta?: {
    pagination?: SyringeAuditLogPagination;
    [key: string]: unknown;
  };
  timestamp?: string;
  [key: string]: unknown;
}

export interface SyringeAuditLogQuery {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  syringeId?: number | string;
}

export interface SyringeAuditLogResult {
  data: SyringeAuditLog[];
  pagination: SyringeAuditLogPagination;
}

const normalizeAuditResponse = (
  payload: SyringeAuditLogEnvelope | SyringeAuditLog[] | undefined,
): SyringeAuditLogEnvelope => {
  if (Array.isArray(payload)) {
    return { code: '00', status: true, message: 'OK', data: payload };
  }
  if (payload && typeof payload === 'object') {
    return payload;
  }
  return {
    code: '99',
    status: false,
    message: 'Response audit log tidak valid',
    data: [],
  };
};

export const getSyringeAuditLogs = async (
  query: SyringeAuditLogQuery = {},
): Promise<SyringeAuditLogResult> => {
  const { page = 1, pageSize = 10, startDate, endDate, syringeId } = query;
  const formattedStart = startDate ? `${startDate}` : '';
  const formattedEnd = endDate ? `${endDate}` : '';

  const response = await request<
    SyringeAuditLogEnvelope | SyringeAuditLog[] | undefined
  >(`${SYRINGE_ENDPOINT}/audit-logs/paged`, {
    method: 'GET',
    params: {
      PageNumber: page,
      PageSize: pageSize,
      page,
      perPage: pageSize,
      StartDate: formattedStart,
      EndDate: formattedEnd,
      SyringeId: syringeId,
    },
  });

  const payload = normalizeAuditResponse(response);

  if (!isSuccessPayload(payload)) {
    throw new Error(payload?.message || 'Gagal memuat audit log syringe');
  }

  return {
    data: payload.data ?? [],
    pagination: payload.meta?.pagination || {
      page,
      perPage: pageSize,
      totalData: payload.data?.length ?? 0,
      totalPage: 1,
    },
  };
};
