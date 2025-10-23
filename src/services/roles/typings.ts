export interface AvailableModule {
  key: string;
  name: string;
  description: string;
  icon: string;
}

export interface Role {
  id: string | number;
  name: string;
  description?: string;
  permissions?: string[];
  unitId?: string;
  unitName?: string;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
  permissionsDetail?: RolePermissionDetail[];
  permissionsRaw?: string;
  menuPermissions?: RoleMenuPermission[];
  totalPermissions?: number;
}

export interface RoleListResponse {
  data: Role[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface DeleteRoleResponse {
  message: string;
  id: string | number;
}

export interface RoleQueryParams {
  page?: number;
  pageSize?: number;
  q?: string;
}

export interface RolePermissionDetail {
  module: string;
  actions: string[];
}

export interface RoleMenuOption {
  menuId: number;
  menuNama: string;
  menuDeskripsi?: string;
  menuIcon?: string;
  menuUrl?: string;
  menuOrder?: number;
  isActive?: boolean;
  isSelected?: boolean;
}

export interface RawRoleMenu {
  id: number;
  nama: string;
  deskripsi: string;
  icon: string;
  url: string;
  order: number;
  isActive: boolean;
  isSelected: boolean;
}

export interface RoleMenuPermission {
  menuId: number;
  menuNama: string;
  menuDeskripsi: string;
  menuIcon: string;
  menuUrl: string;
  menuOrder: number;
  assignedAt: string;
  assignedBy: string;
}

export interface RoleSearchParams {
  name?: string;
  page?: number;
  pageSize?: number;
}

export interface RoleSearchResponse {
  code: string;
  status: boolean;
  message: string;
  data: Array<{
    id: number;
    nama: string;
    deskripsi: string;
    createdAt: string;
    updatedAt: string;
  }>;
  meta?: {
    pagination?: {
      page: number;
      perPage: number;
      totalData: number;
      totalPage: number;
    };
  };
  timestamp?: string;
}

export interface RoleSearchResult {
  list: Role[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RolePermissionResponse {
  code: string;
  status: boolean;
  message: string;
  data: {
    id: number;
    nama: string;
    deskripsi: string;
    permissions: RoleMenuPermission[];
    totalPermissions: number;
    createdAt: string;
  };
  timestamp?: string;
}

export interface RolePermissionsResult {
  id: number;
  name: string;
  description?: string;
  permissions: RoleMenuPermission[];
  totalPermissions: number;
  createdAt: string;
}

export interface RoleAvailableMenusResponse {
  code: string;
  status: boolean;
  message: string;
  data:
    | {
        menus: RawRoleMenu[];
        totalMenus?: number;
        selectedCount?: number;
      }
    | RawRoleMenu[];
  timestamp?: string;
}

export interface RoleAssignMenusResponse {
  code: string;
  status: boolean;
  message: string;
  data?: unknown;
  timestamp?: string;
}

export interface RoleUpdateResponse {
  code: string;
  status: boolean;
  message: string;
  data: {
    id: number;
    nama: string;
    deskripsi: string;
    createdAt: string;
    updatedAt: string;
  };
  timestamp?: string;
}

export interface RoleAvailableMenusResult {
  menus: RoleMenuOption[];
  totalMenus: number;
  selectedCount: number;
}
