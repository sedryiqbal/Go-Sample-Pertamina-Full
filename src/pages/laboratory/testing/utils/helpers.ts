import type { TestingRecord } from '../types';

export const getStatusMeta = (
  status?: number | string,
): { label: string; color: string } => {
  const statusCode =
    typeof status === 'number'
      ? status
      : Number.isFinite(Number(status))
        ? Number(status)
        : null;

  if (statusCode !== null) {
    if (statusCode >= 0 && statusCode <= 3)
      return { label: 'Shipped', color: 'default' };
    if (statusCode === 4) return { label: 'Pending', color: 'warning' };
    if (statusCode === 5) return { label: 'Terdaftar', color: 'processing' };
    if (statusCode === 6)
      return { label: 'Sedang Di uji', color: 'processing' };
    if (statusCode >= 7 && statusCode <= 9)
      return { label: 'Selesai', color: 'success' };
    if (statusCode === 10) return { label: 'Dibatalkan', color: 'error' };
  }

  switch (status) {
    case 'shipped':
      return { label: 'Shipped', color: 'default' };
    case 'pending':
      return { label: 'Pending', color: 'warning' };
    case 'registered':
      return { label: 'Terdaftar', color: 'processing' };
    case 'testing':
      return { label: 'Sedang Diuji', color: 'processing' };
    case 'completed':
      return { label: 'Selesai', color: 'success' };
    case 'failed':
      return { label: 'Gagal', color: 'error' };
    default:
      return { label: '-', color: 'default' };
  }
};

export const getStatusColor = (status: string | number | undefined): string =>
  getStatusMeta(status).color;

export const getStatusLabel = (status: string | number | undefined): string =>
  getStatusMeta(status).label;

export const getPriorityColor = (priority?: string): string => {
  switch (priority) {
    case 'normal':
      return 'default';
    case 'urgent':
      return 'warning';
    case 'critical':
      return 'error';
    default:
      return 'default';
  }
};

export const getProgressColor = (percentage: number | undefined): string => {
  if (!percentage) return '#808080';
  if (percentage >= 90) return '#9fe400';
  if (percentage >= 50) return '#1890ff';
  if (percentage >= 40) return '#faad14';
  return '#808080';
};

export const getTestingSummary = (data: TestingRecord[]) => ({
  total: data.length,
  received: data.filter((item) => {
    const statusCode =
      typeof item.status === 'number'
        ? item.status
        : Number.isFinite(Number(item.status))
          ? Number(item.status)
          : null;
    return statusCode !== null && statusCode >= 0 && statusCode <= 3;
  }).length,
  testing: data.filter((item) => {
    const statusCode =
      typeof item.status === 'number'
        ? item.status
        : Number.isFinite(Number(item.status))
          ? Number(item.status)
          : null;
    return statusCode !== null && [5, 6].includes(statusCode);
  }).length,
  completed: data.filter((item) => {
    const statusCode =
      typeof item.status === 'number'
        ? item.status
        : Number.isFinite(Number(item.status))
          ? Number(item.status)
          : null;
    return statusCode !== null && statusCode >= 7 && statusCode <= 9;
  }).length,
});
