import { request } from '@umijs/max';
import type {
  CreateUserPayload,
  RoleListItem,
  SearchUsersParams,
  UserListItem,
  UsersListPagination,
  UsersListResponse,
} from './typings';

const USERS_ENDPOINT = '/api/Users';
const USERS_PAGED_ENDPOINT = `${USERS_ENDPOINT}/paged`;
const ROLES_ENDPOINT = '/api/Roles';

interface UsersApiListResponse {
  code?: string;
  status?: boolean;
  message?: string;
  data?: UserApiRecord[];
  meta?: {
    pagination?: UsersApiPagination;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface UsersApiPagination {
  page?: number;
  perPage?: number;
  totalData?: number;
  totalPage?: number;
}

interface UserApiRecord {
  id?: number | string;
  nama?: string | null;
  email?: string | null;
  roleId?: number | null;
  roleName?: string | null;
  unitId?: number | null;
  unitName?: string | null;
  labId?: number | null;
  labName?: string | null;
  isSuperadmin?: boolean | null;
  phone?: string | null;
  status?: string | null;
  lastLogin?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface RolesApiResponse {
  code?: string;
  status?: boolean;
  message?: string;
  data?: RolesApiRecord[];
}

interface RolesApiRecord {
  id?: number;
  nama?: string | null;
  deskripsi?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const mapUserRecord = (record: UserApiRecord): UserListItem => {
  const rawId =
    record.id ??
    (record.email ? `email-${record.email}` : undefined) ??
    (record.nama ? `name-${record.nama}` : undefined) ??
    '';

  return {
    id: String(rawId),
    name: record.nama ?? '',
    email: record.email ?? '',
    roleId: toNumberOrNull(record.roleId),
    roleName: record.roleName ?? null,
    unitId: toNumberOrNull(record.unitId),
    unitName: record.unitName ?? null,
    labId: toNumberOrNull(record.labId),
    labName: record.labName ?? null,
    isSuperadmin: Boolean(record.isSuperadmin),
    phone: record.phone ?? null,
    status: record.status ?? null,
    lastLogin: record.lastLogin ?? null,
    createdAt: record.createdAt ?? undefined,
    updatedAt: record.updatedAt ?? undefined,
  };
};

const mapPagination = (source?: UsersApiPagination): UsersListPagination => {
  const page = source?.page ?? 1;
  const perPage = source?.perPage ?? 10;
  const totalData = source?.totalData ?? 0;
  const totalPage =
    source?.totalPage ?? (perPage > 0 ? Math.max(1, Math.ceil(totalData / perPage)) : 1);

  return {
    page,
    perPage,
    totalData,
    totalPage,
  };
};

export const searchUsers = async (
  params: SearchUsersParams,
): Promise<UsersListResponse> => {
  const query: Record<string, string | number> = {};
  if (params.page !== undefined) {
    query.Page = params.page;
  }
  if (params.pageSize !== undefined) {
    query.PageSize = params.pageSize;
  }
  if (params.search && params.search.trim()) {
    query.Search = params.search.trim();
  }

  const response = await request<UsersApiListResponse>(USERS_PAGED_ENDPOINT, {
    method: 'GET',
    params: query,
  });

  if (response?.status === false) {
    const error = new Error(
      response?.message || 'Gagal memuat data user',
    ) as Error & { response?: any };
    error.response = { data: response };
    throw error;
  }

  const users = (response?.data ?? []).map(mapUserRecord);
  const pagination = mapPagination(response?.meta?.pagination);

  return {
    data: users,
    pagination,
    status: response?.status,
    message: response?.message,
  };
};

export const createUser = async (payload: CreateUserPayload): Promise<void> => {
  await request<void>(USERS_ENDPOINT, {
    method: 'POST',
    data: payload,
  });
};

export const updateUser = async (
  userId: string,
  payload: CreateUserPayload,
): Promise<void> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  await request<void>(`${USERS_ENDPOINT}/${userId}`, {
    method: 'PUT',
    data: payload,
  });
};

export const deleteUser = async (userId: string): Promise<void> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  await request<void>(`${USERS_ENDPOINT}/${userId}`, {
    method: 'DELETE',
  });
};

export const fetchRoles = async (): Promise<RoleListItem[]> => {
  const response = await request<RolesApiResponse>(ROLES_ENDPOINT, {
    method: 'GET',
  });

  const records = response?.data ?? [];
  return records
    .map((record) => {
      if (record?.id === undefined || record.id === null) {
        return undefined;
      }

      return {
        id: record.id,
        name: record.nama ?? `Role #${record.id}`,
        description: record.deskripsi ?? undefined,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };
    })
    .filter(Boolean) as RoleListItem[];
};
