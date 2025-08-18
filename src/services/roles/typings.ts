export interface AvailableModule {
  key: string;
  name: string;
  description: string;
  icon: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  unitId: string;
  unitName: string;
  createdAt: string;
  updatedAt: string;
  userCount: number;
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
  permissions: string[];
}

export interface UpdateRoleRequest {
  name: string;
  permissions: string[];
}

export interface DeleteRoleResponse {
  message: string;
  id: string;
}

export interface RoleQueryParams {
  page?: number;
  pageSize?: number;
  q?: string;
} 