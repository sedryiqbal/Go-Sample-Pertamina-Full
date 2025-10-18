import { request } from '@umijs/max';
import type {
  AvailableModule,
  CreateRoleRequest,
  DeleteRoleResponse,
  Role,
  RoleListResponse,
  RoleQueryParams,
  RoleSearchParams,
  RoleSearchResult,
  RoleSearchResponse,
  RolePermissionDetail,
  UpdateRoleRequest,
} from './typings';

const baseUrl = '/api/roles';

export async function getAvailableModules(): Promise<AvailableModule[]> {
  return request(`${baseUrl}/available-modules`, {
    method: 'GET',
  });
}

export async function getRoles(params?: RoleQueryParams): Promise<RoleListResponse> {
  return request(baseUrl, {
    method: 'GET',
    params,
  });
}

export async function createRole(data: CreateRoleRequest): Promise<Role> {
  return request(baseUrl, {
    method: 'POST',
    data,
  });
}

export async function updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
  return request(`${baseUrl}/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteRole(id: string): Promise<DeleteRoleResponse> {
  return request(`${baseUrl}/${id}`, {
    method: 'DELETE',
  });
}

const parsePermissions = (
  value?: string,
): { modules: string[]; detail: RolePermissionDetail[] } => {
  if (!value) {
    return { modules: [], detail: [] };
  }

  try {
    const parsed = JSON.parse(value) as Record<string, string[]>;
    const entries = Object.entries(parsed || {});
    return {
      modules: entries.map(([module]) => module),
      detail: entries.map(([module, actions]) => ({
        module,
        actions: Array.isArray(actions) ? actions : [],
      })),
    };
  } catch (error) {
    console.warn('Failed to parse permissions payload:', error);
    return { modules: [], detail: [] };
  }
};

export async function searchRoles(
  params: RoleSearchParams,
): Promise<RoleSearchResult> {
  const response = await request<RoleSearchResponse>(`${baseUrl}/search`, {
    method: 'GET',
    params: {
      name: params.name ?? '',
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    },
  });

  if (!response?.status) {
    throw new Error(response?.data?.message || 'Gagal memuat daftar role');
  }

  const items = response.data?.items;
  const list =
    items?.data?.map((item) => {
      const permissionsInfo = parsePermissions(item.permissions);
      return {
        id: item.id,
        name: item.name,
        permissions: permissionsInfo.modules,
        permissionsDetail: permissionsInfo.detail,
        permissionsRaw: item.permissions,
        unitId: item.unitId,
        unitName: item.unitName,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        userCount: item.userCount,
      } as Role;
    }) ?? [];

  return {
    list,
    total: items?.totalCount ?? 0,
    page: items?.page ?? params.page ?? 1,
    pageSize: items?.pageSize ?? params.pageSize ?? 10,
  };
}
