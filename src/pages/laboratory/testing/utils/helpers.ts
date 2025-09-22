import type { TestingRecord } from '../types';

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'shipped':
      return 'default';
    case 'pending':
      return 'warning';
    case 'registered':
      return 'processing';
    case 'testing':
      return 'processing';
    case 'completed':
      return 'success';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'received':
      return 'Diterima';
    case 'registered':
      return 'Terdaftar';
    case 'testing':
      return 'Sedang Diuji';
    case 'completed':
      return 'Selesai';
    case 'failed':
      return 'Gagal';
    case 'pending':
      return 'Pending';
    case 'shipped':
      return 'Shipped';
    case 'proses':
      return 'Proses';
    default:
      return status;
  }
};

export const getPriorityColor = (priority: string): string => {
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

export const getProgressColor = (percentage: number): string => {
  if (percentage >= 90) return '#9fe400';
  if (percentage >= 50) return '#1890ff';
  if (percentage >= 40) return '#faad14';
  return '#808080';
};

export const getFilteredData = (
  data: TestingRecord[],
  activeTab: string,
): TestingRecord[] => {
  if (activeTab === 'all') return data;
  if (activeTab === 'pending')
    return data.filter((item) =>
      ['received', 'registered', 'pending'].includes(item.testing_status),
    );
  if (activeTab === 'process')
    return data.filter((item) =>
      ['testing', 'proses'].includes(item.testing_status),
    );
  if (activeTab === 'completed')
    return data.filter((item) => item.testing_status === 'completed');
  return data;
};

export const getTabCount = (data: TestingRecord[], tabKey: string): number => {
  if (tabKey === 'all') return data.length;
  if (tabKey === 'pending')
    return data.filter((item) =>
      ['received', 'registered', 'pending'].includes(item.testing_status),
    ).length;
  if (tabKey === 'process')
    return data.filter((item) =>
      ['testing', 'proses'].includes(item.testing_status),
    ).length;
  if (tabKey === 'completed')
    return data.filter((item) => item.testing_status === 'completed').length;
  return 0;
};

export const getTestingSummary = (data: TestingRecord[]) => ({
  total: data.length,
  received: data.filter((item) => item.testing_status === 'received').length,
  testing: data.filter((item) =>
    ['registered', 'testing'].includes(item.testing_status),
  ).length,
  completed: data.filter((item) => item.testing_status === 'completed').length,
});
