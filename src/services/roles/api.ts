import { request } from '@umijs/max';
import type {
  AvailableModule,
  CreateRoleRequest,
  DeleteRoleResponse,
  Role,
  RoleListResponse,
  RoleQueryParams,
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