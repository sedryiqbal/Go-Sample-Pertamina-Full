import { request } from '@umijs/max';
import type {
  CreateUserPayload,
  CreateUserResponse,
  RoleListItem,
  RolesResponse,
  SearchUsersParams,
  SearchUsersResponse,
} from './typings';

const USERS_SEARCH_ENDPOINT = '/api/users/search';
const USERS_ENDPOINT = '/api/users';
const ROLES_ENDPOINT = '/api/roles';

const mapSearchParams = (params: SearchUsersParams) => ({
  name: params.name ?? '',
  username: params.username ?? '',
  roleId: params.roleId ?? '',
  email: params.email ?? '',
  page: params.page ?? 1,
  pageSize: params.pageSize ?? 10,
});

export const searchUsers = async (
  params: SearchUsersParams,
): Promise<SearchUsersResponse> => {
  return request<SearchUsersResponse>(USERS_SEARCH_ENDPOINT, {
    method: 'GET',
    params: mapSearchParams(params),
  });
};

export const createUser = async (
  payload: CreateUserPayload,
): Promise<CreateUserResponse> => {
  return request<CreateUserResponse>(USERS_ENDPOINT, {
    method: 'POST',
    data: payload,
  });
};

export const updateUser = async (
  userId: string,
  payload: CreateUserPayload,
): Promise<CreateUserResponse> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  return request<CreateUserResponse>(`${USERS_ENDPOINT}/${userId}`, {
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
  const response = await request<RolesResponse>(ROLES_ENDPOINT, {
    method: 'GET',
  });

  if (!response?.status) {
    return [];
  }

  return response?.data?.items ?? [];
};
