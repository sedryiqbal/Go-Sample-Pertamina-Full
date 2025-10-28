import { request } from '@umijs/max';
import type {
  ApiEnvelope,
  CategoryTest,
  LabReference,
  PaginationMeta,
  ProductType,
  SampleEstimationListPayload,
  SampleEstimationListResponse,
  SampleEstimationPayload,
  SampleEstimationRecord,
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
const CATEGORY_TESTS_ENDPOINT = '/api/CategoryTests';
const LABS_ENDPOINT = '/api/Labs';

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
