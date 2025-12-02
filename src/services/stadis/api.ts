import { request } from '@umijs/max';

export const STADIS_ENDPOINT = '/api/StadiumStock';

export interface StadiumStockItem {
  id: number | string;
  unitId: number | string;
  unitName: string;
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

export interface StadiumStockResponse {
  code: string;
  status: boolean;
  message: string;
  data?: StadiumStockItem[];
  timestamp?: string;
}

type StadiumStockPayload =
  | StadiumStockResponse
  | StadiumStockItem[]
  | StadiumStockItem
  | undefined;

const normalizeResponse = (
  payload: StadiumStockPayload,
): StadiumStockResponse => {
  if (
    payload &&
    typeof payload === 'object' &&
    'code' in payload &&
    'status' in payload
  ) {
    return payload as StadiumStockResponse;
  }

  if (Array.isArray(payload)) {
    return {
      code: '00',
      status: true,
      message: 'OK',
      data: payload,
    };
  }

  if (payload && typeof payload === 'object') {
    return {
      code: '00',
      status: true,
      message: 'OK',
      data: [payload as StadiumStockItem],
    };
  }

  return {
    code: '99',
    status: false,
    message: 'Response payload tidak valid',
    data: [],
  };
};

const normalizeCode = (code?: string | number) => {
  if (typeof code === 'number') {
    return String(code);
  }
  return (code || '').trim();
};

const isSuccessPayload = (payload?: {
  code?: string | number;
  status?: boolean;
}) => {
  if (!payload) return false;
  const normalizedCode = normalizeCode(payload.code);
  const successCodes = new Set(['00', '0', '200', '201']);
  return Boolean(payload.status) || successCodes.has(normalizedCode);
};

export const getStadiumStock = async (): Promise<StadiumStockItem> => {
  const response = await request<StadiumStockPayload>(STADIS_ENDPOINT, {
    method: 'GET',
  });

  const payload = normalizeResponse(response);

  const records = Array.isArray(payload.data)
    ? payload.data
    : payload.data
      ? [payload.data]
      : [];

  if (!isSuccessPayload(payload) || !records.length) {
    throw new Error(payload?.message || 'Gagal memuat data stock stadis');
  }

  const stock = records[0];

  if (!stock) {
    throw new Error('Data stock stadis tidak tersedia');
  }

  return stock;
};

export interface UpdateStadiumStockPayload {
  newStockAmount: number;
  notes?: string;
}

export const updateStadiumStockQuantity = async (
  unitId: number | string,
  payload: UpdateStadiumStockPayload,
): Promise<void> => {
  if (unitId === undefined || unitId === null || unitId === '') {
    throw new Error('Unit ID stadis tidak ditemukan');
  }

  const endpoint = `${STADIS_ENDPOINT}/${unitId}/quantity`;

  const response = await request<
    StadiumStockPayload | { code?: string | number; status?: boolean; message?: string } | boolean | null
  >(endpoint, {
    method: 'PUT',
    data: payload,
  });

  if (response === undefined || response === null) {
    return;
  }

  if (typeof response === 'boolean') {
    if (!response) {
      throw new Error('Gagal memperbarui stock stadis');
    }
    return;
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    ('code' in response || 'status' in response)
  ) {
    const envelope = response as {
      code?: string | number;
      status?: boolean;
      message?: string;
    };

    if (!isSuccessPayload(envelope)) {
      throw new Error(envelope?.message || 'Gagal memperbarui stock stadis');
    }
  }
};

export interface StadiumAuditLog {
  id: number | string;
  stadiumStockId?: number | string;
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

export interface StadiumAuditLogPagination {
  page?: number;
  perPage?: number;
  totalData?: number;
  totalPage?: number;
}

interface StadiumAuditLogEnvelope {
  code?: string | number;
  status?: boolean;
  message?: string;
  data?: StadiumAuditLog[];
  meta?: {
    pagination?: StadiumAuditLogPagination;
    [key: string]: unknown;
  };
  timestamp?: string;
  [key: string]: unknown;
}

export interface StadiumAuditLogQuery {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  stadiumStockId?: number | string;
}

export interface StadiumAuditLogResult {
  data: StadiumAuditLog[];
  pagination: StadiumAuditLogPagination;
}

const normalizeAuditResponse = (
  payload: StadiumAuditLogEnvelope | StadiumAuditLog[] | undefined,
): StadiumAuditLogEnvelope => {
  if (Array.isArray(payload)) {
    return {
      code: '00',
      status: true,
      message: 'OK',
      data: payload,
    };
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

export const getStadiumAuditLogs = async (
  query: StadiumAuditLogQuery = {},
): Promise<StadiumAuditLogResult> => {
  const { page = 1, pageSize = 10, startDate, endDate, stadiumStockId } = query;
  const formattedStart = startDate ? `${startDate}` : '';
  const formattedEnd = endDate ? `${endDate}` : '';

  const response = await request<
    StadiumAuditLogEnvelope | StadiumAuditLog[] | undefined
  >(`${STADIS_ENDPOINT}/audit-logs/paged`, {
    method: 'GET',
    params: {
      PageNumber: page,
      PageSize: pageSize,
      page,
      perPage: pageSize,
      StartDate: formattedStart,
      EndDate: formattedEnd,
      StadiumStockId: stadiumStockId,
    },
  });

  const payload = normalizeAuditResponse(response);

  if (!isSuccessPayload(payload)) {
    throw new Error(payload?.message || 'Gagal memuat audit log stadis');
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
