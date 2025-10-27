import dayjs from 'dayjs';

import {
  LAB_LOCATION_OPTIONS,
  PRIORITY_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
  SHIP_OPTIONS,
  TANK_NUMBER_OPTIONS,
} from './constants';
import type {
  AvailableSample,
  OrderPriority,
  OrderStatus,
  OrderType,
  SampleOrderRecord,
  SampleStatus,
  SummaryMetrics,
} from './types';

const SAMPLE_STATUS_COLOR_MAP: Record<SampleStatus, string> = {
  available: 'success',
  low: 'warning',
  urgent: 'error',
};

const SAMPLE_STATUS_LABEL_MAP: Record<SampleStatus, string> = {
  available: 'Tersedia',
  low: 'Terbatas',
  urgent: 'Urgent',
};

const PRIORITY_COLOR_MAP: Record<OrderPriority, string> = {
  normal: 'blue',
  urgent: 'red',
};

const STATUS_COLOR_MAP: Record<OrderStatus, string> = {
  pending: 'orange',
  confirmed: 'blue',
  picked_up: 'purple',
  in_transit: 'cyan',
  delivered: 'green',
  cancelled: 'red',
};

const STATUS_LABEL_MAP: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Dikonfirmasi',
  picked_up: 'Diambil',
  in_transit: 'Dalam Perjalanan',
  delivered: 'Terkirim',
  cancelled: 'Dibatalkan',
};

export const getSampleStatusColor = (status: SampleStatus) =>
  SAMPLE_STATUS_COLOR_MAP[status] ?? 'default';

export const getSampleStatusLabel = (status: SampleStatus) =>
  SAMPLE_STATUS_LABEL_MAP[status] ?? status;

export const getPriorityColor = (priority: OrderPriority) =>
  PRIORITY_COLOR_MAP[priority] ?? 'default';

export const getStatusColor = (status: OrderStatus) =>
  STATUS_COLOR_MAP[status] ?? 'default';

export const getStatusLabel = (status: OrderStatus) =>
  STATUS_LABEL_MAP[status] ?? status;

export const buildOrderNumber = (orderType: OrderType) => {
  const prefix = orderType === 'ready' ? 'SO' : 'RQ';
  const sequence = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${prefix}-${dayjs().format('YYYYMMDD')}-${sequence}`;
};

export const getLabDeliveryTime = (labValue: string) =>
  LAB_LOCATION_OPTIONS.find((lab) => lab.value === labValue)?.time ?? 1;

export const computeSummary = (
  orders: SampleOrderRecord[],
): SummaryMetrics => ({
  total: orders.length,
  ready: orders.filter((item) => item.order_type === 'ready').length,
  request: orders.filter((item) => item.order_type === 'request').length,
  pending: orders.filter((item) => item.status === 'pending').length,
  in_progress: orders.filter((item) =>
    ['confirmed', 'picked_up', 'in_transit'].includes(item.status),
  ).length,
  delivered: orders.filter((item) => item.status === 'delivered').length,
});

export const mapSampleToFormValues = (sample: AvailableSample) => ({
  sample_type: sample.sample_type.toLowerCase().replace('-', '_'),
  vessel_name: sample.vessel_name
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/ /g, '-'),
  tank_number: sample.tank_number.toLowerCase().replace(' ', '-'),
});

export const isValidQuantity = (quantity: number | null | undefined) =>
  typeof quantity === 'number' && quantity > 0;

export const getProductOptions = () => PRODUCT_TYPE_OPTIONS;
export const getTankOptions = () => TANK_NUMBER_OPTIONS;
export const getShipOptions = () => SHIP_OPTIONS;
export const getPriorityOptions = () => PRIORITY_OPTIONS;
