import { request } from '@umijs/max';
import type { UnitReference } from './typings';

interface UnitsApiResponse {
  code?: string;
  status?: boolean;
  message?: string;
  data?: UnitApiRecord[];
}

interface UnitApiRecord {
  id?: number;
  nama?: string | null;
  description?: string | null;
  status?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

const UNITS_ENDPOINT = '/api/Units';

export const fetchUnits = async (): Promise<UnitReference[]> => {
  const response = await request<UnitsApiResponse>(UNITS_ENDPOINT, {
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
        name: record.nama ?? `Unit #${record.id}`,
        description: record.description ?? undefined,
        status: record.status ?? undefined,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };
    })
    .filter(Boolean) as UnitReference[];
};
