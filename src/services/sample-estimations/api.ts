import { request } from '@umijs/max';
import type { UploadFile } from 'antd/es/upload/interface';
import type {
  ApiEnvelope,
  CategoryTest,
  CreateSampleOrderPayload,
  LabReference,
  PaginationMeta,
  ProductType,
  SampleCalendarQuery,
  SampleCalendarResponse,
  SampleEstimationListPayload,
  SampleEstimationListResponse,
  SampleEstimationPayload,
  SampleEstimationRecord,
  SampleOrderApiRecord,
  SampleOrderListQuery,
  SampleOrderListResponse,
  ShipReference,
  TankReference,
  UnitReference,
} from './typings';

const TYPE_LOADS_ENDPOINT = '/api/TypeLoads';
const SHIPS_ENDPOINT = '/api/Ships';
const TANKS_ENDPOINT = '/api/Tankis';
const UNITS_ENDPOINT = '/api/Satuans';
const SAMPLE_ESTIMATIONS_ENDPOINT = '/api/EstimasiSamples';
const SAMPLE_ESTIMATIONS_PAGED_ENDPOINT = `${SAMPLE_ESTIMATIONS_ENDPOINT}/paged`;
const SAMPLE_ESTIMATIONS_CALENDAR_ENDPOINT = `${SAMPLE_ESTIMATIONS_ENDPOINT}/calendar`;
const CATEGORY_TESTS_ENDPOINT = '/api/CategoryTests';
const LABS_ENDPOINT = '/api/Labs';
const SAMPLE_ORDERS_ENDPOINT = '/api/SampleOrders';
const SAMPLE_ORDERS_PAGED_ENDPOINT = `${SAMPLE_ORDERS_ENDPOINT}/paged`;
const FILE_UPLOAD_ENDPOINT = '/api/FileUpload/upload';

type RequestOptions = Parameters<typeof request>[1];

const isApiEnvelope = <T>(payload: unknown): payload is ApiEnvelope<T> => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const candidate = payload as Record<string, unknown>;
  return (
    Object.prototype.hasOwnProperty.call(candidate, 'data') ||
    Object.prototype.hasOwnProperty.call(candidate, 'status') ||
    Object.prototype.hasOwnProperty.call(candidate, 'code') ||
    Object.prototype.hasOwnProperty.call(candidate, 'meta') ||
    Object.prototype.hasOwnProperty.call(candidate, 'message')
  );
};

interface EnvelopeResult<T> {
  data: T;
  meta?: Record<string, unknown>;
  message?: string;
  status?: boolean;
}

const requestWithEnvelope = async <T>(
  url: string,
  options?: RequestOptions,
): Promise<EnvelopeResult<T>> => {
  const response = await request<ApiEnvelope<T> | T>(url, options);

  if (isApiEnvelope<T>(response)) {
    const envelope = response as ApiEnvelope<T>;

    if (envelope.status === false) {
      const errorMessage =
        typeof envelope.message === 'string' && envelope.message.trim()
          ? envelope.message
          : 'Permintaan gagal diproses';
      throw new Error(errorMessage);
    }

    return {
      data: (envelope.data ?? null) as T,
      meta: envelope.meta,
      message: envelope.message,
      status: envelope.status,
    };
  }

  return {
    data: response as T,
  };
};

const normalizePagination = (meta?: Record<string, unknown>): PaginationMeta => {
  if (!meta || typeof meta !== 'object') {
    return {};
  }

  const paginationRaw = (
    Object.prototype.hasOwnProperty.call(meta, 'pagination')
      ? (meta.pagination as Record<string, unknown>)
      : meta
  ) as Record<string, unknown> | undefined;

  const readNumber = (value?: unknown): number | undefined => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  if (!paginationRaw || typeof paginationRaw !== 'object') {
    return {};
  }

  return {
    page:
      readNumber(
        paginationRaw.page ??
          paginationRaw.Page ??
          paginationRaw.current ??
          paginationRaw.currentPage,
      ) ?? undefined,
    perPage:
      readNumber(
        paginationRaw.perPage ??
          paginationRaw.PerPage ??
          paginationRaw.pageSize ??
          paginationRaw.PageSize,
      ) ?? undefined,
    totalData:
      readNumber(
        paginationRaw.totalData ??
          paginationRaw.TotalData ??
          paginationRaw.total ??
          paginationRaw.totalCount,
      ) ?? undefined,
    totalPage:
      readNumber(
        paginationRaw.totalPage ??
          paginationRaw.TotalPage ??
          paginationRaw.totalPages,
      ) ?? undefined,
  };
};

export interface SampleEstimationQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  receivedStartDate?: string;
  receivedEndDate?: string;
  sampleId?: number;
  shipId?: number;
}

export const getProductTypes = async (): Promise<ProductType[]> => {
  const { data } = await requestWithEnvelope<ProductType[]>(
    TYPE_LOADS_ENDPOINT,
    {
      method: 'GET',
    },
  );

  return Array.isArray(data) ? data : [];
};

export const getShips = async (): Promise<ShipReference[]> => {
  const { data } = await requestWithEnvelope<ShipReference[]>(SHIPS_ENDPOINT, {
    method: 'GET',
  });

  return Array.isArray(data) ? data : [];
};

export const getTanks = async (): Promise<TankReference[]> => {
  const { data } = await requestWithEnvelope<TankReference[]>(TANKS_ENDPOINT, {
    method: 'GET',
  });

  return Array.isArray(data) ? data : [];
};

export const getUnits = async (): Promise<UnitReference[]> => {
  const { data } = await requestWithEnvelope<UnitReference[]>(UNITS_ENDPOINT, {
    method: 'GET',
  });

  return Array.isArray(data) ? data : [];
};

export const getSampleEstimations = async (
  params?: SampleEstimationQuery,
): Promise<SampleEstimationListResponse> => {
  const requestParams: SampleEstimationListPayload = {};

  if (params?.page !== undefined) {
    requestParams.Page = params.page;
  }

  if (params?.pageSize !== undefined) {
    requestParams.PageSize = params.pageSize;
  }

  if (params?.search) {
    requestParams.search = params.search;
  }

  if (params?.receivedStartDate) {
    requestParams.ReceivedStartDate = params.receivedStartDate;
  }

  if (params?.receivedEndDate) {
    requestParams.ReceivedEndDate = params.receivedEndDate;
  }

  if (params?.sampleId !== undefined) {
    requestParams.SampleId = params.sampleId;
  }

  if (params?.shipId !== undefined) {
    requestParams.ShipId = params.shipId;
  }

  const { data, meta } = await requestWithEnvelope<SampleEstimationRecord[]>(
    SAMPLE_ESTIMATIONS_PAGED_ENDPOINT,
    {
      method: 'GET',
      params: requestParams,
    },
  );

  return {
    data: Array.isArray(data) ? data : [],
    pagination: normalizePagination(meta),
  };
};

export const getSampleEstimationCalendar = async (
  params: SampleCalendarQuery,
): Promise<SampleCalendarResponse> => {
  if (
    !params ||
    params.month === null ||
    params.month === undefined ||
    params.year === null ||
    params.year === undefined
  ) {
    throw new Error('Parameter bulan dan tahun wajib diisi');
  }

  const requestParams: Record<string, number> = {
    month: Number(params.month),
    year: Number(params.year),
  };

  if (params.page !== undefined) {
    requestParams.page = Number(params.page);
  }

  if (params.pageSize !== undefined) {
    requestParams.pageSize = Number(params.pageSize);
  }

  const { data, meta } = await requestWithEnvelope<SampleEstimationRecord[]>(
    SAMPLE_ESTIMATIONS_CALENDAR_ENDPOINT,
    {
      method: 'GET',
      params: requestParams,
    },
  );

  return {
    data: Array.isArray(data) ? data : [],
    pagination: normalizePagination(meta),
  };
};

export const getAvailableSampleList = async (): Promise<
  SampleEstimationRecord[]
> => {
  const { data } = await requestWithEnvelope<SampleEstimationRecord[]>(
    SAMPLE_ESTIMATIONS_ENDPOINT,
    {
      method: 'GET',
    },
  );

  return Array.isArray(data) ? data : [];
};

export const getCategoryTests = async (): Promise<CategoryTest[]> => {
  const { data } = await requestWithEnvelope<CategoryTest[]>(
    CATEGORY_TESTS_ENDPOINT,
    {
      method: 'GET',
    },
  );

  return Array.isArray(data) ? data : [];
};

export const getLabs = async (): Promise<LabReference[]> => {
  const { data } = await requestWithEnvelope<LabReference[]>(LABS_ENDPOINT, {
    method: 'GET',
  });

  return Array.isArray(data) ? data : [];
};

export const createSampleOrder = async (
  payload: CreateSampleOrderPayload,
): Promise<{ message?: string }> => {
  const { message: responseMessage } = await requestWithEnvelope<unknown>(
    SAMPLE_ORDERS_ENDPOINT,
    {
      method: 'POST',
      data: payload,
    },
  );

  return {
    message: responseMessage,
  };
};

export const getSampleOrdersPaged = async (
  params?: SampleOrderListQuery,
): Promise<SampleOrderListResponse> => {
  const requestParams: Record<string, unknown> = {};

  if (params?.page !== undefined) {
    requestParams.Page = params.page;
  }

  if (params?.pageSize !== undefined) {
    requestParams.PageSize = params.pageSize;
  }

  if (params?.search && params.search.trim() !== '') {
    requestParams.Search = params.search.trim();
  }

  const { data, meta } = await requestWithEnvelope<SampleOrderApiRecord[]>(
    SAMPLE_ORDERS_PAGED_ENDPOINT,
    {
      method: 'GET',
      params: requestParams,
    },
  );

  return {
    data: Array.isArray(data) ? data : [],
    pagination: normalizePagination(meta),
  };
};

export interface UploadedFileInfo {
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  uploadedAt?: string;
}

export const uploadAttachment = async (
  file: File,
): Promise<UploadedFileInfo> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await requestWithEnvelope<UploadedFileInfo>(FILE_UPLOAD_ENDPOINT, {
    method: 'POST',
    data: formData,
    requestType: 'form',
  });

  if (!data || !data.fileUrl) {
    throw new Error('File upload gagal diproses.');
  }

  return data;
};

export const cancelSampleOrder = async (
  orderId: number | string,
  cancelReason: string,
): Promise<{ message?: string }> => {
  if (orderId === null || orderId === undefined || orderId === '') {
    throw new Error('ID sample order wajib diisi');
  }

  const { message: responseMessage } = await requestWithEnvelope<unknown>(
    `${SAMPLE_ORDERS_ENDPOINT}/${orderId}/cancel`,
    {
      method: 'POST',
      data: {
        cancelReason,
      },
    },
  );

  return {
    message: responseMessage,
  };
};

export const getSampleOrderDetail = async (
  orderId: number | string,
): Promise<SampleOrderApiRecord | null> => {
  if (orderId === null || orderId === undefined || orderId === '') {
    throw new Error('ID sample order wajib diisi');
  }

  const { data } = await requestWithEnvelope<SampleOrderApiRecord>(
    `${SAMPLE_ORDERS_ENDPOINT}/${orderId}`,
    {
      method: 'GET',
    },
  );

  return (data as SampleOrderApiRecord) ?? null;
};

export const createSampleEstimation = async (
  payload: SampleEstimationPayload,
): Promise<SampleEstimationRecord | null> => {
  const { data } = await requestWithEnvelope<SampleEstimationRecord>(
    SAMPLE_ESTIMATIONS_ENDPOINT,
    {
      method: 'POST',
      data: payload,
    },
  );

  return (data as SampleEstimationRecord) ?? null;
};

export const updateSampleEstimation = async (
  id: number | string,
  payload: SampleEstimationPayload,
): Promise<SampleEstimationRecord | null> => {
  if (id === null || id === undefined || id === '') {
    throw new Error('ID estimasi sample wajib diisi');
  }

  const { data } = await requestWithEnvelope<SampleEstimationRecord>(
    `${SAMPLE_ESTIMATIONS_ENDPOINT}/${id}`,
    {
      method: 'PUT',
      data: payload,
    },
  );

  return (data as SampleEstimationRecord) ?? null;
};

export const deleteSampleEstimation = async (
  id: number | string,
): Promise<void> => {
  if (id === null || id === undefined || id === '') {
    throw new Error('ID estimasi sample wajib diisi');
  }

  await requestWithEnvelope<unknown>(`${SAMPLE_ESTIMATIONS_ENDPOINT}/${id}`, {
    method: 'DELETE',
  });
};
