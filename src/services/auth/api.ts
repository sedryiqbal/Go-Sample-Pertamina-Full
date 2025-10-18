import { request } from '@umijs/max';

export interface ProfileItems {
  id: string;
  username: string;
  name: string;
  email: string;
  roleName?: string;
  unitName?: string;
  unitType?: string;
  superAdmin?: boolean;
}

export interface ProfileResponse {
  status: boolean;
  code: number;
  data?: {
    message?: string;
    items?: ProfileItems;
  };
}

export const fetchProfile = async (): Promise<ProfileItems | undefined> => {
  const response = await request<ProfileResponse>('/api/auth/profile', {
    method: 'GET',
  });

  if (!response?.status) {
    throw new Error(response?.data?.message || 'Gagal memuat profil pengguna');
  }

  return response?.data?.items;
};
