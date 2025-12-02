import { request } from '@umijs/max';

const DASHBOARD_ENDPOINT = '/api/Dashboard';

export interface DashboardSummaryData {
  totalSamplePengujianLab: number;
  totalBerhasilDiuji: number;
  sedangDiprosesUji: number;
  totalRepeatSample: number;
  persentaseBerhasil: number;
  persentaseRepeat: number;
  [key: string]: number;
}

export interface DashboardSummaryResponse {
  code: string;
  status: boolean;
  message: string;
  data?: DashboardSummaryData;
  timestamp?: string;
}

export const getDashboardSummary =
  async (): Promise<DashboardSummaryData> => {
    const response = await request<DashboardSummaryResponse>(
      `${DASHBOARD_ENDPOINT}/summary`,
      {
        method: 'GET',
      },
    );

    if (!response?.status || response.code !== '00' || !response.data) {
      throw new Error(
        response?.message || 'Gagal memuat ringkasan dashboard',
      );
    }
    return response.data;
  };
