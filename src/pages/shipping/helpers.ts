import dayjs from 'dayjs';

import type {
  OrderPriority,
  OrderStatus,
  OrderType,
  ProgressOrder,
  ShippingHistory,
} from './types';

export const getPriorityColor = (priority: OrderPriority) =>
  priority === 'urgent' ? 'red' : 'blue';

export const getOrderTypeColor = (type: OrderType) =>
  type === 'ready' ? 'green' : 'blue';

export const getStatusColor = (status: OrderStatus) =>
  status === 'completed' ? 'green' : 'red';

export const buildShippingSummary = (
  pendingCount: number,
  progressOrders: ProgressOrder[],
  historyOrders: ShippingHistory[],
) => {
  const completedCount = historyOrders.filter(
    (order) => order.status === 'completed',
  ).length;

  const todayCompleted = historyOrders.filter((order) => {
    if (order.status !== 'completed') {
      return false;
    }

    return dayjs(order.delivery_time).isSame(dayjs(), 'day');
  }).length;

  const successRate =
    historyOrders.length > 0
      ? (completedCount / historyOrders.length) * 100
      : 0;

  return {
    pending: pendingCount,
    inProgress: progressOrders.length,
    todayCompleted,
    totalDeliveries: completedCount,
    successRate,
  };
};
