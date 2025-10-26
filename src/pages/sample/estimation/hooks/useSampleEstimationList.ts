import { message } from 'antd';
import { useState } from 'react';
import {
  deleteSampleEstimation,
  getSampleEstimations,
} from '@/services/sample-estimations/api';
import type {
  PaginationMeta,
  SampleEstimationRecord,
} from '@/services/sample-estimations/typings';
import {
  buildCalendarData,
  buildSummary,
  type CalendarData,
  getErrorMessage,
  type SummaryResult,
} from '../utils';

interface RequestParams {
  current?: number;
  pageSize?: number;
  search?: string;
}

interface DeleteParams {
  id: number | string;
  description?: string;
  onSuccess?: () => void;
}

export interface SampleEstimationListResult {
  data: SampleEstimationRecord[];
  meta: PaginationMeta;
  summary: SummaryResult;
  calendarData: CalendarData;
  request: (params: RequestParams) => Promise<{
    data: SampleEstimationRecord[];
    success: boolean;
    total: number;
  }>;
  remove: (params: DeleteParams) => Promise<void>;
}

const INITIAL_SUMMARY: SummaryResult = {
  total: 0,
  available: 0,
  low: 0,
  urgent: 0,
};

export const useSampleEstimationList = (): SampleEstimationListResult => {
  const [data, setData] = useState<SampleEstimationRecord[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({});
  const [summary, setSummary] = useState<SummaryResult>(INITIAL_SUMMARY);
  const [calendarData, setCalendarData] = useState<CalendarData>({});

  const request = async (params: RequestParams) => {
    try {
      const response = await getSampleEstimations({
        page: params.current,
        pageSize: params.pageSize,
        search: params.search,
      });

      const rows = Array.isArray(response.data) ? response.data : [];
      setData(rows);
      setMeta(response.pagination);
      setSummary(buildSummary(rows, response.pagination));
      setCalendarData(buildCalendarData(rows));

      return {
        data: rows,
        success: true,
        total: response.pagination.totalData ?? rows.length,
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      message.error(`Gagal memuat data estimasi sample: ${errorMessage}`);
      setData([]);
      setMeta({});
      setSummary(INITIAL_SUMMARY);
      setCalendarData({});
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  const remove = async ({ id, description, onSuccess }: DeleteParams) => {
    try {
      await deleteSampleEstimation(id);
      if (description) {
        message.success(`Estimasi sample ${description} berhasil dihapus`);
      } else {
        message.success('Estimasi sample berhasil dihapus');
      }
      onSuccess?.();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      message.error(`Gagal menghapus estimasi: ${errorMessage}`);
      throw error;
    }
  };

  return {
    data,
    meta,
    summary,
    calendarData,
    request,
    remove,
  };
};
