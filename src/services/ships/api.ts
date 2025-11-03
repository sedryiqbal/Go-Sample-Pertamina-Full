import { request } from '@umijs/max';
import type {
  CreateShipPayload,
  Ship,
  ShipApiEnvelope,
  ShipListEnvelope,
  ShipListPagination,
  ShipListQuery,
  DockReference,
  ShipCargoTypeReference,
  ShipTypeReference,
} from './typings';

const SHIPS_ENDPOINT = '/api/Ships';
const SHIPS_PAGED_ENDPOINT = `${SHIPS_ENDPOINT}/paged`;
const TYPE_SHIPS_ENDPOINT = '/api/TypeShips';
const TYPE_LOADS_ENDPOINT = '/api/TypeLoads';
const DOCKS_ENDPOINT = '/api/Docks';

const unwrapResponse = <T>(response: ShipApiEnvelope<T> | T): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    const envelope = response as ShipApiEnvelope<T>;
    if (!('data' in envelope) || envelope.data === undefined) {
      const errorMessage =
        typeof envelope.message === 'string' && envelope.message.trim()
          ? envelope.message
          : 'Response payload does not include data';
      throw new Error(errorMessage);
    }
    return envelope.data;
  }

  return response as T;
};

export const createShip = async (payload: CreateShipPayload): Promise<Ship> => {
  const response = await request<ShipApiEnvelope<Ship> | Ship>(SHIPS_ENDPOINT, {
    method: 'POST',
    data: payload,
  });

  return unwrapResponse<Ship>(response);
};

export const updateShip = async (
  shipId: string,
  payload: CreateShipPayload,
): Promise<Ship> => {
  if (!shipId) {
    throw new Error('Ship ID is required');
  }

  const response = await request<ShipApiEnvelope<Ship> | Ship>(
    `${SHIPS_ENDPOINT}/${shipId}`,
    {
      method: 'PUT',
      data: payload,
    },
  );

  return unwrapResponse<Ship>(response);
};

export const deleteShip = async (shipId: string): Promise<void> => {
  if (!shipId) {
    throw new Error('Ship ID is required');
  }

  await request<void>(`${SHIPS_ENDPOINT}/${shipId}`, {
    method: 'DELETE',
  });
};

type ShipListPaginationSource = Partial<ShipListPagination> & {
  page?: number;
  perPage?: number;
  totalData?: number;
  totalPage?: number;
};

interface ShipApiListResponse {
  code?: string;
  status?: boolean;
  message?: string;
  data?: ShipApiRecord[];
  meta?: {
    pagination?: ShipListPaginationSource;
    [key: string]: unknown;
  };
  timestamp?: string;
  [key: string]: unknown;
}

interface ShipApiRecord {
  id?: string | number;
  namaKapal?: string | null;
  kodeKapal?: string | null;
  typeShipId?: number | null;
  typeShipName?: string | null;
  bendera?: string | null;
  perusahaan?: string | null;
  namaKapten?: string | null;
  kapasitasMT?: number | string | null;
  typeLoadId?: number | null;
  typeLoadName?: string | null;
  tanggalKedatangan?: string | null;
  status?: string | null;
  contactPerson?: string | null;
  telepon?: string | null;
  email?: string | null;
  pelabuhanAsal?: string | null;
  pelabuhanTujuan?: string | null;
  catatan?: string | null;
  unitId?: string | number | null;
  unitName?: string | null;
  dockId?: number | null;
  dockName?: string | null;
  maximalTanki?: number | string | null;
  waktuSelesaiOperasi?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
}

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const mapShipRecord = (record: ShipApiRecord): Ship => {
  const capacity = toNumberOrNull(record.kapasitasMT);
  const maximalTanki = toNumberOrNull(record.maximalTanki);
  const rawId =
    record.id ??
    (record.kodeKapal ? `code-${record.kodeKapal}` : undefined) ??
    (record.namaKapal ? `name-${record.namaKapal}` : undefined) ??
    '';

  return {
    id: String(rawId),
    name: record.namaKapal ?? '',
    code: record.kodeKapal ?? null,
    type: record.typeShipName ?? null,
    typeShipId: record.typeShipId ?? null,
    typeShipName: record.typeShipName ?? null,
    flag: record.bendera ?? null,
    company: record.perusahaan ?? null,
    captainName: record.namaKapten ?? null,
    capacity,
    cargoType: record.typeLoadName ?? null,
    typeLoadId: record.typeLoadId ?? null,
    arrivalDate: record.tanggalKedatangan ?? null,
    operationCompletionTime: record.waktuSelesaiOperasi ?? null,
    portLocation:
      record.dockName ?? record.pelabuhanTujuan ?? record.pelabuhanAsal ?? null,
    status: record.status ?? '-',
    contactPerson: record.contactPerson ?? null,
    phone: record.telepon ?? null,
    email: record.email ?? null,
    originPort: record.pelabuhanAsal ?? null,
    destinationPort: record.pelabuhanTujuan ?? null,
    notes: record.catatan ?? null,
    dockId: record.dockId ?? null,
    dockName: record.dockName ?? null,
    maximalTanki,
    unitId:
      record.unitId !== undefined && record.unitId !== null
        ? String(record.unitId)
        : null,
    unitName: record.unitName ?? null,
    sampleCount: undefined,
    isActive: undefined,
    canAddSamples: undefined,
    daysUntilArrival: undefined,
    isOverdue: undefined,
    allowedStatusTransitions: undefined,
    createdAt: record.createdAt ?? undefined,
    updatedAt: record.updatedAt ?? undefined,
    isQCCompleted:
      record.isQCCompleted !== undefined && record.isQCCompleted !== null
        ? Boolean(record.isQCCompleted)
        : undefined,
  };
};

export const fetchShips = async (
  params?: ShipListQuery,
): Promise<ShipListEnvelope> => {
  const requestParams: Record<string, number | string> = {};

  if (params?.page !== undefined) {
    requestParams.Page = params.page;
  }

  if (params?.pageSize !== undefined) {
    requestParams.PageSize = params.pageSize;
  }

  if (params?.search !== undefined && params.search !== '') {
    requestParams.Search = params.search;
  }

  const response = await request<ShipApiListResponse>(SHIPS_PAGED_ENDPOINT, {
    method: 'GET',
    params: requestParams,
  });

  const ships = (response?.data ?? []).map(mapShipRecord);
  const paginationSource = response?.meta?.pagination ?? {};

  const totalData =
    paginationSource.totalData !== undefined
      ? paginationSource.totalData
      : ships.length;
  const requestedPageSize =
    params?.pageSize !== undefined && params.pageSize !== null
      ? params.pageSize
      : undefined;
  const perPage =
    paginationSource.perPage ?? requestedPageSize ?? (ships.length || 10);

  const pagination: ShipListPagination = {
    page: paginationSource.page ?? params?.page ?? 1,
    perPage,
    totalData,
    totalPage:
      paginationSource.totalPage ??
      (perPage > 0 ? Math.max(1, Math.ceil(totalData / perPage)) : 1),
  };

  return {
    data: ships,
    pagination,
    message: response?.message,
    status: response?.status,
  };
};

const normalizeReferenceList = <T>(value: T | undefined): T | undefined => {
  if (!value) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value as T;
  }

  return undefined;
};

export const fetchShipTypesReference = async (): Promise<ShipTypeReference[]> => {
  const response = await request<
    ShipApiEnvelope<ShipTypeReference[]> | ShipTypeReference[]
  >(TYPE_SHIPS_ENDPOINT, {
    method: 'GET',
  });

  const payload = normalizeReferenceList(
    unwrapResponse<ShipTypeReference[]>(response),
  );
  return payload ?? [];
};

export const fetchShipCargoTypes = async (): Promise<
  ShipCargoTypeReference[]
> => {
  const response = await request<
    ShipApiEnvelope<ShipCargoTypeReference[]> | ShipCargoTypeReference[]
  >(TYPE_LOADS_ENDPOINT, {
    method: 'GET',
  });

  const payload = normalizeReferenceList(
    unwrapResponse<ShipCargoTypeReference[]>(response),
  );
  return payload ?? [];
};

export const fetchDockReferences = async (): Promise<DockReference[]> => {
  const response = await request<
    ShipApiEnvelope<DockReference[]> | DockReference[]
  >(DOCKS_ENDPOINT, {
    method: 'GET',
  });

  const payload = normalizeReferenceList(
    unwrapResponse<DockReference[]>(response),
  );
  return payload ?? [];
};
