import { request } from '@umijs/max';
import type {
  RoleListItem,
  RolesResponse,
  SearchUsersParams,
  SearchUsersResponse,
} from './typings';

const USERS_SEARCH_ENDPOINT = '/api/users/search';
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

export const fetchRoles = async (): Promise<RoleListItem[]> => {
  const response = await request<RolesResponse>(ROLES_ENDPOINT, {
    method: 'GET',
  });

  if (!response?.status) {
    return [];
  }

  return response?.data?.items ?? [];
};
