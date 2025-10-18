export interface SearchUsersParams {
  name?: string;
  username?: string;
  roleId?: string;
  email?: string;
  page?: number;
  pageSize?: number;
}

export interface UserListItem {
  id: string;
  username: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  unitId: string;
  unitName: string;
  superAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchUsersResponse {
  status: boolean;
  code: number;
  data?: {
    message?: string;
    items?: {
      data: UserListItem[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  };
}

export interface RoleListItem {
  id: string;
  name: string;
  permissions?: string;
  unitId?: string;
  unitName?: string;
  createdAt?: string;
  updatedAt?: string;
  userCount?: number;
}

export interface RolesResponse {
  status: boolean;
  code: number;
  data?: {
    message?: string;
    items?: RoleListItem[];
  };
}
