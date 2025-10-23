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
  RolePermissionResponse,
  RolePermissionsResult,
  RoleMenuOption,
  RoleAvailableMenusResponse,
  RoleAssignMenusResponse,
  RoleUpdateResponse,
  RoleAvailableMenusResult,
  UpdateRoleRequest,
} from './typings';

const baseUrl = '/api/Roles';
const menusUrl = '/api/Menus';

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
  const payload: Record<string, unknown> = {
    nama: data.name,
  };

  if (typeof data.description !== 'undefined') {
    payload.deskripsi = data.description;
  }

  const response = await request<RoleUpdateResponse>(baseUrl, {
    method: 'POST',
    data: payload,
  });

  if (!response?.status) {
    throw new Error(response?.message || 'Gagal membuat role');
  }

  const result = response.data;

  return {
    id: result.id,
    name: result.nama,
    description: result.deskripsi,
    permissions: [],
    permissionsDetail: [],
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  } as Role;
}

export async function updateRole(
  id: string | number,
  data: UpdateRoleRequest,
): Promise<Role> {
  const payload: Record<string, unknown> = {
    nama: data.name,
  };

  if (typeof data.description !== 'undefined') {
    payload.deskripsi = data.description;
  }

  const response = await request<RoleUpdateResponse>(`${baseUrl}/${id}`, {
    method: 'PUT',
    data: payload,
  });

  if (!response?.status) {
    throw new Error(response?.message || 'Gagal memperbarui role');
  }

  const result = response.data;

  return {
    id: result.id,
    name: result.nama,
    description: result.deskripsi,
    permissions: [],
    permissionsDetail: [],
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  } as Role;
}

export async function deleteRole(id: string | number): Promise<DeleteRoleResponse> {
  return request(`${baseUrl}/${id}`, {
    method: 'DELETE',
  });
}

export async function getRolePermissions(
  id: string | number,
): Promise<RolePermissionsResult> {
  const response = await request<RolePermissionResponse>(
    `${baseUrl}/${id}/permissions`,
    {
      method: 'GET',
    },
  );

  if (!response?.status) {
    throw new Error(response?.message || 'Gagal memuat permission role');
  }

  const data = response.data;

  return {
    id: data.id,
    name: data.nama,
    description: data.deskripsi,
    permissions: data.permissions ?? [],
    totalPermissions: data.totalPermissions ?? data.permissions?.length ?? 0,
    createdAt: data.createdAt,
  };
}

export async function getRoleAvailableMenus(
  id?: string | number,
): Promise<RoleAvailableMenusResult> {
  const response = await request<RoleAvailableMenusResponse>(
    typeof id === 'undefined'
      ? `${baseUrl}/available-menus`
      : `${baseUrl}/${id}/available-menus`,
    {
      method: 'GET',
    },
  );

  if (!response?.status) {
    throw new Error(
      response?.message || 'Gagal memuat daftar menu yang tersedia',
    );
  }

  const payloadRaw = response.data;
  const payload =
    Array.isArray(payloadRaw)
      ? {
          menus: payloadRaw,
          totalMenus: payloadRaw.length,
          selectedCount: payloadRaw.filter((menu) => menu.isSelected).length,
        }
      : payloadRaw ?? {
          menus: [],
          totalMenus: 0,
          selectedCount: 0,
        };

  const menus = [...(payload.menus ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  const mappedMenus: RoleMenuOption[] = menus.map((menu) => ({
    menuId: menu.id,
    menuNama: menu.nama,
    menuDeskripsi: menu.deskripsi,
    menuIcon: menu.icon,
    menuUrl: menu.url,
    menuOrder: menu.order,
    isActive: menu.isActive,
    isSelected: menu.isSelected,
  }));

  const defaultSelectedCount =
    payload.selectedCount ??
    mappedMenus.filter((menu) => menu.isSelected).length;

  return {
    menus: mappedMenus,
    totalMenus: payload.totalMenus ?? mappedMenus.length,
    selectedCount: defaultSelectedCount,
  };
}

export async function getMenus(): Promise<RoleAvailableMenusResult> {
  const response = await request<RoleAvailableMenusResponse>(menusUrl, {
    method: 'GET',
  });

  if (!response?.status) {
    throw new Error(response?.message || 'Gagal memuat daftar menu');
  }

  const payloadRaw = response.data;
  const payload =
    Array.isArray(payloadRaw)
      ? {
          menus: payloadRaw,
          totalMenus: payloadRaw.length,
          selectedCount: payloadRaw.filter((menu) => menu.isSelected).length,
        }
      : payloadRaw ?? {
          menus: [],
          totalMenus: 0,
          selectedCount: 0,
        };

  const menus = [...(payload.menus ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  const mappedMenus: RoleMenuOption[] = menus.map((menu) => ({
    menuId: menu.id,
    menuNama: menu.nama,
    menuDeskripsi: menu.deskripsi,
    menuIcon: menu.icon,
    menuUrl: menu.url,
    menuOrder: menu.order,
    isActive: menu.isActive,
    isSelected: menu.isSelected,
  }));

  const defaultSelectedCount =
    payload.selectedCount ??
    mappedMenus.filter((menu) => menu.isSelected).length;

  return {
    menus: mappedMenus,
    totalMenus: payload.totalMenus ?? mappedMenus.length,
    selectedCount: defaultSelectedCount,
  };
}

export async function assignRoleMenus(
  id: string | number,
  menuIds: number[],
): Promise<RoleAssignMenusResponse> {
  const response = await request<RoleAssignMenusResponse>(
    `${baseUrl}/${id}/menus`,
    {
      method: 'PUT',
      data: {
        menuIds,
      },
    },
  );

  if (!response?.status) {
    throw new Error(response?.message || 'Gagal memperbarui menu role');
  }

  return response;
}

export async function searchRoles(
  params: RoleSearchParams,
): Promise<RoleSearchResult> {
  const response = await request<RoleSearchResponse>(`${baseUrl}/paged`, {
    method: 'GET',
    params: {
      Page: params.page ?? 1,
      PageSize: params.pageSize ?? 10,
      Search: params.name ?? '',
    },
  });

  if (!response?.status) {
    throw new Error(response?.message || 'Gagal memuat daftar role');
  }

  const list =
    response.data?.map((item) => {
      return {
        id: item.id,
        name: item.nama,
        description: item.deskripsi,
        permissions: [],
        permissionsDetail: [],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      } as Role;
    }) ?? [];

  const pagination = response.meta?.pagination;

  return {
    list,
    total: pagination?.totalData ?? list.length,
    page: pagination?.page ?? params.page ?? 1,
    pageSize: pagination?.perPage ?? params.pageSize ?? 10,
  };
}
