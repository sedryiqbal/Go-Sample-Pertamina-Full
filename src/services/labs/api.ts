import { request } from '@umijs/max';
import type { LabReference } from './typings';

interface LabsApiResponse {
  code?: string;
  status?: boolean;
  message?: string;
  data?: LabApiRecord[];
}

interface LabApiRecord {
  id?: number;
  nama?: string | null;
  deskripsi?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const LABS_ENDPOINT = '/api/Labs';

export const fetchLabs = async (): Promise<LabReference[]> => {
  const response = await request<LabsApiResponse>(LABS_ENDPOINT, {
    method: 'GET',
  });

  const records = response?.data ?? [];
  return records
    .map((record) => {
      if (record?.id === undefined || record.id === null) {
        return undefined;
      }

      return {
        id: record.id,
        name: record.nama ?? `Lab #${record.id}`,
        description: record.deskripsi ?? undefined,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };
    })
    .filter(Boolean) as LabReference[];
};
