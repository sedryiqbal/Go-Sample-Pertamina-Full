import { request } from '@umijs/max';
import type {
  MonitoringApiEnvelope,
  MonitoringCountCards,
  MonitoringSampleOrder,
  MonitoringSampleOrderDetail,
  MonitoringSampleOrderQuery,
  MonitoringPagination,
} from './typings';

const MONITORING_ENDPOINT = '/api/Monitoring';

// Response types
export interface MonitoringCountCardsResponse {
  data: MonitoringCountCards;
}

export interface MonitoringSampleOrderListResponse {
  data: MonitoringSampleOrder[];
  pagination: MonitoringPagination;
}

export interface MonitoringSampleOrderDetailResponse {
  data: MonitoringSampleOrderDetail;
}

/**
 * Get count cards data for monitoring dashboard
 */
export const getMonitoringCountCards =
  async (): Promise<MonitoringCountCardsResponse> => {
    const response = await request<MonitoringApiEnvelope<MonitoringCountCards>>(
      `${MONITORING_ENDPOINT}/count-cards`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.status || response.code !== '00') {
      throw new Error(response.message || 'Failed to fetch count cards');
    }

    return { data: response.data };
  };

/**
 * Get sample orders list with pagination and filters
 */
export const getMonitoringSampleOrders = async (
  query?: MonitoringSampleOrderQuery,
): Promise<MonitoringSampleOrderListResponse> => {
  const params: Record<string, any> = {};

  if (query?.Status) params.Status = query.Status;
  if (query?.ShipId) params.ShipId = query.ShipId;
  if (query?.Page) params.Page = query.Page;
  if (query?.PageSize) params.PageSize = query.PageSize;
  if (query?.Search) params.Search = query.Search;
  if (query?.SortBy) params.SortBy = query.SortBy;
  if (query?.SortDescending !== undefined)
    params.SortDescending = query.SortDescending;

  const response = await request<
    MonitoringApiEnvelope<MonitoringSampleOrder[]>
  >(`${MONITORING_ENDPOINT}/sample-orders`, {
    method: 'GET',
    params,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.status || response.code !== '00') {
    throw new Error(response.message || 'Failed to fetch sample orders');
  }

  return {
    data: response.data,
    pagination: response.meta?.pagination || {
      page: 1,
      perPage: 10,
      totalData: 0,
      totalPage: 0,
    },
  };
};

/**
 * Get sample order detail by ID
 */
export const getMonitoringSampleOrderDetail = async (
  id: number | string,
): Promise<MonitoringSampleOrderDetailResponse> => {
  const response = await request<
    MonitoringApiEnvelope<MonitoringSampleOrderDetail>
  >(`${MONITORING_ENDPOINT}/sample-orders/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.status || response.code !== '00') {
    throw new Error(response.message || 'Failed to fetch sample order detail');
  }

  return { data: response.data };
};
