import { request } from '@umijs/max';

export interface ProfileItems {
  id: string;
  name?: string;
  email?: string;
  roleName?: string;
  unitName?: string;
  unitType?: string;
  superAdmin?: boolean;
  phone?: string;
  status?: string;
  username?: string;
}

export interface ProfileResponseData {
  id: number | string;
  nama?: string;
  email?: string;
  roleName?: string;
  isSuperadmin?: boolean;
  phone?: string;
  status?: string;
  [key: string]: any;
}

export interface ProfileResponse {
  code: string;
  status: boolean;
  message: string;
  data?: ProfileResponseData;
  timestamp?: string;
  [key: string]: any;
}

export const fetchProfile = async (): Promise<ProfileItems | undefined> => {
  const response = await request<ProfileResponse>('/api/Auth/me', {
    method: 'GET',
  });

  if (!response?.status || !response?.data) {
    throw new Error(response?.message || 'Gagal memuat profil pengguna');
  }

  const profileData = response.data;

  return {
    id: profileData.id != null ? String(profileData.id) : '',
    name: profileData.nama || profileData.email,
    email: profileData.email,
    roleName: profileData.roleName,
    superAdmin: profileData.isSuperadmin,
    phone: profileData.phone,
    status: profileData.status,
    username: profileData.email,
  };
};

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  code: string;
  status: boolean;
  message: string;
  data?: boolean;
  timestamp?: string;
  [key: string]: any;
}

export const changePassword = async (
  payload: ChangePasswordPayload,
  options?: { [key: string]: any },
) => {
  const response = await request<ChangePasswordResponse>(
    '/api/Auth/change-password',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
      ...(options || {}),
    },
  );

  if (!response?.status) {
    throw new Error(response?.message || 'Gagal mengganti password.');
  }

  return response;
};
