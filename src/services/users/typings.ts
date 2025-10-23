export interface SearchUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface CreateUserPayload {
  email: string;
  nama: string;
  password?: string;
  roleId: number;
  unitId?: number;
  labId?: number;
  isSuperadmin: boolean;
  phone: string;
  status: string;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  roleId?: number | null;
  roleName?: string | null;
  unitId?: number | null;
  unitName?: string | null;
  labId?: number | null;
  labName?: string | null;
  isSuperadmin: boolean;
  phone?: string | null;
  status?: string | null;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsersListPagination {
  page: number;
  perPage: number;
  totalData: number;
  totalPage: number;
}

export interface UsersListResponse {
  data: UserListItem[];
  pagination: UsersListPagination;
  status?: boolean;
  message?: string;
}

export interface RoleListItem {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
