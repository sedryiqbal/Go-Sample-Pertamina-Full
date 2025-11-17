import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Badge,
  Card,
  FloatButton,
  Input,
  Modal,
  message,
  Space,
  Tabs,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';

import {
  type AvailableForPickupOrder,
  createTransitLog,
  type DeliveredSampleOrder,
  getAvailableForPickupOrders,
  getDeliveredOrders,
  getInTransitOrders,
  type InTransitSampleOrder,
  type TransitLogRecord,
  updateSampleOrderStatus,
} from '@/services/shipping/api';
import {
  HistoryDetailModal,
  HistoryTab,
  PendingOrdersTab,
  ProgressOrdersTab,
  ShippingStyles,
  StatusUpdateModal,
  SummaryCards,
} from './components';
import { buildShippingSummary } from './helpers';
import type {
  PendingSampleOrder,
  ProgressOrder,
  ShippingHistory,
  ShippingSummary,
  StatusUpdate,
} from './types';

type PendingActionType = 'take' | 'transit' | 'complete';

const sanitizeString = (value: unknown, fallback = ''): string => {
  if (value === null || value === undefined) {
    return fallback;
  }
  const stringified = String(value).trim();
  return stringified || fallback;
};

const pickFirstNonEmpty = (values: unknown[], fallback = ''): string => {
  for (const value of values) {
    const sanitized = sanitizeString(value, '');
    if (sanitized) {
      return sanitized;
    }
  }
  return fallback;
};

const parseNumber = (value: unknown, fallback = 0): number => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeOrderType = (
  type?: string | null,
): PendingSampleOrder['order_type'] => {
  const normalized = sanitizeString(type, '').toLowerCase();
  if (normalized === 'request') {
    return 'request';
  }
  if (normalized === 'ready') {
    return 'ready';
  }
  if (normalized === 'sample') {
    return 'sample';
  }
  return 'sample';
};

const normalizePriority = (
  priority?: string | null,
): PendingSampleOrder['priority'] => {
  const normalized = sanitizeString(priority, '').toLowerCase();
  return normalized === 'urgent' ? 'urgent' : 'normal';
};

const buildTankLabel = (
  source: AvailableForPickupOrder | InTransitSampleOrder | DeliveredSampleOrder,
): string => {
  const namedTank = sanitizeString(source.tankiName, '');
  if (namedTank) {
    return namedTank;
  }

  const nomor = pickFirstNonEmpty(
    [
      source.nomorTangki,
      (source as AvailableForPickupOrder)?.sample?.nomorTanki,
      (source as DeliveredSampleOrder)?.sample?.nomorTanki,
    ],
    '',
  );
  if (nomor) {
    return `Tanki ${nomor}`;
  }

  return '-';
};

const formatDateTime = (value?: string | null) => {
  const sanitized = sanitizeString(value, '');
  if (!sanitized) {
    return '';
  }

  const parsed = dayjs(sanitized);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : sanitized;
};

const mapTransitLogsToStatusUpdates = (
  logs?: TransitLogRecord[],
): StatusUpdate[] =>
  (logs ?? []).map((log, index) => ({
    id: String(
      log.id ??
        log.sampleOrderId ??
        `transit-log-${log.sampleOrderNomorNpc ?? Date.now()}-${index}`,
    ),
    timestamp: formatDateTime(log.createdAt) || dayjs().format(),
    message: sanitizeString(log.comment, 'Transit update'),
    created_by: sanitizeString(log.driverName, 'Driver'),
  }));

const getProgressStatusFromApi = (
  status?: number | string | null,
): ProgressOrder['current_status'] => {
  if (status === null || status === undefined || status === '') {
    return 'pickup';
  }

  const numeric = Number(status);
  if (!Number.isNaN(numeric)) {
    if (numeric >= 3) return 'delivered';
    if (numeric >= 2) return 'in_transit';
    return 'pickup';
  }

  const normalized = sanitizeString(status, '').toLowerCase();
  if (
    normalized === 'delivered' ||
    normalized === 'completed' ||
    normalized === 'done'
  ) {
    return 'delivered';
  }
  if (
    normalized === 'in_transit' ||
    normalized === 'transit' ||
    normalized === 'shipping'
  ) {
    return 'in_transit';
  }
  return 'pickup';
};

const getProgressPercentage = (status: ProgressOrder['current_status']) => {
  if (status === 'pickup') {
    return 10;
  }
  if (status === 'in_transit') {
    return 70;
  }
  return 100;
};

const buildSampleOrderIdValue = (value: string | number): number | string => {
  if (typeof value === 'number') {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && !Number.isNaN(parsed) ? parsed : value;
};

const mapAvailableOrderToPending = (
  source: AvailableForPickupOrder,
): PendingSampleOrder => {
  const quantityCandidate =
    source.quantity ??
    (source.sample?.qty !== undefined ? source.sample.qty : undefined);

  const notesCandidate = pickFirstNonEmpty([source.notes], '');
  const estimatedArrival = sanitizeString(source.etaArival, '');
  const createdAt = pickFirstNonEmpty(
    [source.createdAt, source.tanggalOrder],
    '',
  );

  const statusCodeRaw = Number(source.status);

  return {
    id: String(
      source.id ?? source.orderNo ?? source.nomorNpc ?? `pending-${Date.now()}`,
    ),
    order_number: pickFirstNonEmpty([source.orderNo], '-'),
    npc_number: pickFirstNonEmpty([source.nomorNpc], '-'),
    order_type: normalizeOrderType(source.type),
    sample_type: pickFirstNonEmpty(
      [
        source.typeLoadName,
        source.sample?.typeLoadName,
        source.categoryTestName,
      ],
      '-',
    ),
    vessel_name: pickFirstNonEmpty(
      [source.shipName, source.sample?.shipName],
      '-',
    ),
    tank_number: buildTankLabel(source),
    quantity: parseNumber(quantityCandidate, 0),
    unit: pickFirstNonEmpty(
      [source.satuanName, source.sample?.satuanName],
      '-',
    ),
    pickup_location: pickFirstNonEmpty([source.unitName], '-'),
    delivery_location: pickFirstNonEmpty([source.labName], '-'),
    estimated_arrival_time: estimatedArrival || null,
    notes: notesCandidate || null,
    priority: normalizePriority(source.priority),
    created_at: createdAt,
    status_code: Number.isFinite(statusCodeRaw) ? statusCodeRaw : null,
  };
};

const mapInTransitOrderToProgress = (
  source: InTransitSampleOrder,
): ProgressOrder => {
  const currentStatus = getProgressStatusFromApi(source.status);

  return {
    id: String(
      source.id ??
        source.orderNo ??
        source.nomorNpc ??
        `in-transit-${Date.now()}`,
    ),
    order_number: pickFirstNonEmpty([source.orderNo], '-'),
    npc_number: pickFirstNonEmpty([source.nomorNpc], '-'),
    sample_type: pickFirstNonEmpty(
      [source.typeLoadName, source.categoryTestName],
      '-',
    ),
    vessel_name: pickFirstNonEmpty([source.shipName], '-'),
    tank_number: buildTankLabel(source),
    quantity: parseNumber(source.quantity, 0),
    unit: pickFirstNonEmpty([source.satuanName], '-'),
    pickup_location: pickFirstNonEmpty([source.unitName], '-'),
    delivery_location: pickFirstNonEmpty([source.labName], '-'),
    pickup_time:
      formatDateTime(source.createdAt) || formatDateTime(source.tanggalOrder),
    estimated_delivery_time: formatDateTime(source.etaArival),
    distance: 'N/A',
    current_status: currentStatus,
    progress_percentage: getProgressPercentage(currentStatus),
    status_updates: mapTransitLogsToStatusUpdates(source.transitLogs),
    status_code: Number.isFinite(Number(source.status))
      ? Number(source.status)
      : null,
  };
};

const mapDeliveredOrderToHistory = (
  source: DeliveredSampleOrder,
): ShippingHistory => {
  const statusCode = Number(source.status);
  const status: ShippingHistory['status'] =
    statusCode === 10 ? 'cancelled' : 'completed';
  const vesselName = pickFirstNonEmpty(
    [source.shipName, source.sample?.shipName],
    '',
  );
  const unitValue = pickFirstNonEmpty(
    [source.satuanName, source.sample?.satuanName],
    '',
  );
  const quantityValue = source.quantity ?? source.sample?.qty ?? undefined;

  return {
    id: String(
      source.id ?? source.orderNo ?? source.nomorNpc ?? `history-${Date.now()}`,
    ),
    order_number: pickFirstNonEmpty([source.orderNo], '-'),
    npc_number: pickFirstNonEmpty([source.nomorNpc], '-'),
    sample_type: pickFirstNonEmpty(
      [source.typeLoadName, source.categoryTestName],
      '-',
    ),
    pickup_location: pickFirstNonEmpty([source.unitName], '-'),
    delivery_location: pickFirstNonEmpty([source.labName], '-'),
    pickup_time:
      formatDateTime(source.pickupAt) || formatDateTime(source.takeOrderAt),
    delivery_time:
      formatDateTime(source.deliveredAt) ||
      formatDateTime(source.updatedAt) ||
      formatDateTime(source.pickupAt),
    status,
    distance: sanitizeString(source.duration, '-') || '-',
    vessel_name: vesselName || undefined,
    tank_number: buildTankLabel(source),
    quantity:
      quantityValue !== undefined && quantityValue !== null
        ? parseNumber(quantityValue, 0)
        : undefined,
    unit: unitValue || undefined,
    status_updates: mapTransitLogsToStatusUpdates(source.transitLogs),
  };
};

const Shipping: React.FC = () => {
  const [pendingOrders, setPendingOrders] = useState<PendingSampleOrder[]>([]);
  const [progressOrders, setProgressOrders] = useState<ProgressOrder[]>([]);
  const [historyOrders, setHistoryOrders] = useState<ShippingHistory[]>([]);
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  const [pendingActionOrderId, setPendingActionOrderId] = useState<
    string | null
  >(null);
  const [pendingActionType, setPendingActionType] =
    useState<PendingActionType>('take');
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [takeOrderModalVisible, setTakeOrderModalVisible] = useState(false);
  const [takeOrderComment, setTakeOrderComment] = useState('');
  const [takeOrderSubmitting, setTakeOrderSubmitting] = useState(false);
  const [orderToTake, setOrderToTake] = useState<PendingSampleOrder | null>(
    null,
  );
  const [progressActionOrderId, setProgressActionOrderId] = useState<
    string | null
  >(null);

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ProgressOrder | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState('');
  const [statusUpdateSubmitting, setStatusUpdateSubmitting] = useState(false);
  const [progressCancelOrderId, setProgressCancelOrderId] = useState<
    string | null
  >(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [orderToCancel, setOrderToCancel] = useState<ProgressOrder | null>(
    null,
  );
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  const [historyDetailVisible, setHistoryDetailVisible] = useState(false);
  const [selectedHistoryOrder, setSelectedHistoryOrder] =
    useState<ShippingHistory | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadShippingData();
  }, []);

  const loadShippingData = async (options?: {
    silent?: boolean;
    historyPage?: number;
    historyPageSize?: number;
  }) => {
    const historyPage = options?.historyPage ?? historyPagination.page;
    const historyPageSize =
      options?.historyPageSize ?? historyPagination.pageSize;
    try {
      const [availableOrders, inTransitOrders, deliveredResponse] =
        await Promise.all([
          getAvailableForPickupOrders(),
          getInTransitOrders(),
          getDeliveredOrders({ page: historyPage, pageSize: historyPageSize }),
        ]);
      const mappedPending = availableOrders.map(mapAvailableOrderToPending);
      const mappedProgress = inTransitOrders.map(mapInTransitOrderToProgress);
      const deliveredData = deliveredResponse.data ?? [];
      const mappedHistory = deliveredData.map(mapDeliveredOrderToHistory);

      setPendingOrders(mappedPending);
      setProgressOrders(mappedProgress);
      setHistoryOrders(mappedHistory);
      const paginationMeta = deliveredResponse.meta?.pagination;
      setHistoryPagination({
        page: paginationMeta?.page ?? historyPage,
        pageSize: paginationMeta?.perPage ?? historyPageSize,
        total: paginationMeta?.totalData ?? mappedHistory.length,
      });

      if (!options?.silent) {
        message.success('Data refreshed successfully');
      }
    } catch (error) {
      message.error('Failed to refresh data');
    }
  };

  const handleOpenPendingActionModal = (
    order: PendingSampleOrder,
    action: PendingActionType,
  ) => {
    setOrderToTake(order);
    setPendingActionType(action);
    setTakeOrderComment('');
    setTakeOrderModalVisible(true);
  };

  const resetTakeOrderModal = () => {
    setTakeOrderModalVisible(false);
    setTakeOrderComment('');
    setOrderToTake(null);
    setPendingActionType('take');
  };

  const handleCancelTakeOrder = () => {
    if (takeOrderSubmitting) {
      return;
    }
    resetTakeOrderModal();
  };

  const handleConfirmPendingAction = async () => {
    if (!orderToTake) {
      return;
    }

    const comment = takeOrderComment.trim();
    setTakeOrderSubmitting(true);
    setPendingActionOrderId(orderToTake.id);

    const sampleOrderIdPayload = buildSampleOrderIdValue(orderToTake.id);

    try {
      if (pendingActionType === 'take') {
        const response = await updateSampleOrderStatus(sampleOrderIdPayload, {
          status: 1,
          driverId: null,
          comment: comment || undefined,
        });

        if (response?.status === false) {
          throw new Error(response?.message || 'Failed to take order');
        }

        if (comment) {
          const transitResponse = await createTransitLog({
            sampleOrderId: sampleOrderIdPayload,
            comment,
          });

          if (transitResponse?.status === false) {
            throw new Error(
              transitResponse?.message || 'Failed to create transit log',
            );
          }
        }

        const pickupMessageBase = `Order diambil oleh driver, menuju lokasi pickup: ${orderToTake.pickup_location}`;
        const pickupMessage = comment
          ? `${pickupMessageBase}. Catatan: ${comment}`
          : pickupMessageBase;

        message.success(`Order ${orderToTake.order_number} berhasil diambil!`);

        setPendingOrders((prev) =>
          prev.filter((item) => item.id !== orderToTake.id),
        );

        const progressOrder: ProgressOrder = {
          id: orderToTake.id,
          order_number: orderToTake.order_number,
          npc_number: orderToTake.npc_number,
          sample_type: orderToTake.sample_type,
          vessel_name: orderToTake.vessel_name,
          tank_number: orderToTake.tank_number,
          quantity: orderToTake.quantity,
          unit: orderToTake.unit,
          pickup_location: orderToTake.pickup_location,
          delivery_location: orderToTake.delivery_location,
          pickup_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          estimated_delivery_time: orderToTake.estimated_arrival_time
            ? dayjs(orderToTake.estimated_arrival_time).format(
                'YYYY-MM-DD HH:mm:ss',
              )
            : '',
          distance: 'N/A',
          current_status: 'pickup',
          progress_percentage: 10,
          status_updates: [
            {
              id: Date.now().toString(),
              timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              message: pickupMessage,
              created_by: 'Driver',
            },
          ],
          status_code: 1,
        };

        setProgressOrders((prev) => [progressOrder, ...prev]);
        setActiveTab('progress');
        resetTakeOrderModal();
      } else {
        const statusValue = pendingActionType === 'transit' ? 2 : 3;
        const response = await updateSampleOrderStatus(sampleOrderIdPayload, {
          status: statusValue,
          driverId: null,
          comment: comment || undefined,
        });

        if (response?.status === false) {
          throw new Error(response?.message || 'Failed to update status');
        }

        if (comment) {
          const transitResponse = await createTransitLog({
            sampleOrderId: sampleOrderIdPayload,
            comment,
          });

          if (transitResponse?.status === false) {
            throw new Error(
              transitResponse?.message || 'Failed to record transit log',
            );
          }
        }

        if (pendingActionType === 'transit') {
          message.success(
            `Order ${orderToTake.order_number} memasuki status transit.`,
          );
          setActiveTab('progress');
        } else {
          message.success(`Order ${orderToTake.order_number} completed.`);
          setActiveTab('history');
        }

        await loadShippingData({ silent: true });
        resetTakeOrderModal();
      }
    } catch (error) {
      const errorMessage =
        (error as Error)?.message || 'Failed to process order action.';
      message.error(errorMessage);
    } finally {
      setPendingActionOrderId(null);
      setTakeOrderSubmitting(false);
    }
  };

  const handleAdvanceStatus = async (order: ProgressOrder) => {
    const nextStatus: ProgressOrder['current_status'] =
      order.current_status === 'pickup'
        ? 'in_transit'
        : order.current_status === 'in_transit'
          ? 'delivered'
          : 'delivered';

    const nextProgress =
      order.current_status === 'pickup'
        ? 50
        : order.current_status === 'in_transit'
          ? 100
          : 100;

    setProgressActionOrderId(order.id);

    const statusValue = nextStatus === 'in_transit' ? 2 : 3;
    const sampleOrderIdPayload = buildSampleOrderIdValue(order.id);
    const autoComment =
      nextStatus === 'in_transit'
        ? `Sample dalam perjalanan menuju ${order.delivery_location}`
        : `Sample tiba di ${order.delivery_location}`;

    try {
      const response = await updateSampleOrderStatus(sampleOrderIdPayload, {
        status: statusValue,
        driverId: null,
        comment: autoComment,
      });

      if (response?.status === false) {
        throw new Error(response?.message || 'Failed to update status');
      }

      const logResponse = await createTransitLog({
        sampleOrderId: sampleOrderIdPayload,
        comment: autoComment,
      });

      if (logResponse?.status === false) {
        throw new Error(logResponse?.message || 'Failed to record transit log');
      }

      if (nextStatus === 'delivered') {
        const completionUpdate: StatusUpdate = {
          id: Date.now().toString(),
          timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          message: `Sample berhasil dikirim ke ${order.delivery_location}`,
          created_by: 'System',
        };

        setProgressOrders((prev) =>
          prev.filter((item) => item.id !== order.id),
        );

        const completedOrder: ShippingHistory = {
          id: order.id,
          order_number: order.order_number,
          npc_number: order.npc_number,
          sample_type: order.sample_type,
          pickup_location: order.pickup_location,
          delivery_location: order.delivery_location,
          pickup_time: order.pickup_time,
          delivery_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          status: 'completed',
          distance: order.distance,
          vessel_name: order.vessel_name,
          tank_number: order.tank_number,
          quantity: order.quantity,
          unit: order.unit,
          status_updates: [completionUpdate, ...order.status_updates],
        };

        setHistoryOrders((prev) => [completedOrder, ...prev]);
        message.success(`Order ${order.order_number} completed!`);
      } else {
        const newStatusUpdate: StatusUpdate = {
          id: Date.now().toString(),
          timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          message: `Sample sedang dalam perjalanan menuju ${order.delivery_location}`,
          created_by: 'System',
        };

        setProgressOrders((prev) =>
          prev.map((item) =>
            item.id === order.id
              ? {
                  ...item,
                  current_status: nextStatus,
                  progress_percentage: nextProgress,
                  status_updates: [newStatusUpdate, ...item.status_updates],
                  status_code: statusValue,
                }
              : item,
          ),
        );

        message.success('Status updated to in transit');
      }

      await loadShippingData({ silent: true });
    } catch (error) {
      message.error(
        (error as Error)?.message || 'Failed to update order status.',
      );
    } finally {
      setProgressActionOrderId(null);
    }
  };

  const handleAddStatusUpdate = async () => {
    if (!selectedOrder || !statusMessage.trim()) {
      message.warning('Please enter a status message');
      return;
    }

    const trimmedMessage = statusMessage.trim();
    setStatusUpdateSubmitting(true);

    try {
      const response = await createTransitLog({
        sampleOrderId: buildSampleOrderIdValue(selectedOrder.id),
        comment: trimmedMessage,
      });

      if (response?.status === false) {
        throw new Error(response?.message || 'Failed to submit status update');
      }

      const newStatusUpdate: StatusUpdate = {
        id: Date.now().toString(),
        timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        message: trimmedMessage,
        created_by: 'Driver',
      };

      setProgressOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id
            ? {
                ...order,
                status_updates: [newStatusUpdate, ...order.status_updates],
              }
            : order,
        ),
      );

      setStatusModalVisible(false);
      setStatusMessage('');
      setSelectedOrder(null);
      message.success('Status update added successfully');
    } catch (error) {
      message.error(
        (error as Error)?.message || 'Failed to add status update.',
      );
    } finally {
      setStatusUpdateSubmitting(false);
    }
  };

  const handleOpenStatusModal = (order: ProgressOrder) => {
    setSelectedOrder(order);
    setStatusMessage('');
    setStatusModalVisible(true);
  };

  const handleCloseStatusModal = () => {
    setStatusModalVisible(false);
    setStatusMessage('');
    setSelectedOrder(null);
  };

  const handleOpenHistoryDetail = (order: ShippingHistory) => {
    setSelectedHistoryOrder(order);
    setHistoryDetailVisible(true);
  };

  const handleCloseHistoryDetail = () => {
    setHistoryDetailVisible(false);
    setSelectedHistoryOrder(null);
  };

  const handleHistoryPaginationChange = (page: number, pageSize: number) => {
    loadShippingData({
      silent: true,
      historyPage: page,
      historyPageSize: pageSize,
    });
  };

  const handleCancelProgressOrder = (order: ProgressOrder) => {
    setOrderToCancel(order);
    setCancelReason('');
    setCancelModalVisible(true);
  };

  const handleCloseCancelModal = () => {
    if (cancelSubmitting) {
      return;
    }
    setCancelModalVisible(false);
    setCancelReason('');
    setOrderToCancel(null);
  };

  const handleConfirmCancelOrder = async () => {
    if (!orderToCancel || !cancelReason.trim()) {
      message.warning('Alasan pembatalan wajib diisi');
      return;
    }

    const comment = cancelReason.trim();
    setCancelSubmitting(true);
    setProgressCancelOrderId(orderToCancel.id);

    try {
      const sampleOrderId = buildSampleOrderIdValue(orderToCancel.id);
      const response = await updateSampleOrderStatus(sampleOrderId, {
        status: 10,
        driverId: null,
        comment,
      });

      if (response?.status === false) {
        throw new Error(response?.message || 'Gagal membatalkan order');
      }

      setProgressOrders((prev) =>
        prev.filter((progressOrder) => progressOrder.id !== orderToCancel.id),
      );
      setHistoryOrders((prev) => [
        {
          id: orderToCancel.id,
          order_number: orderToCancel.order_number,
          npc_number: orderToCancel.npc_number,
          sample_type: orderToCancel.sample_type,
          pickup_location: orderToCancel.pickup_location,
          delivery_location: orderToCancel.delivery_location,
          pickup_time: orderToCancel.pickup_time,
          delivery_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          status: 'cancelled',
          distance: orderToCancel.distance,
          vessel_name: orderToCancel.vessel_name,
          tank_number: orderToCancel.tank_number,
          quantity: orderToCancel.quantity,
          unit: orderToCancel.unit,
          status_updates: [
            {
              id: Date.now().toString(),
              timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              message: comment,
              created_by: 'Driver',
            },
            ...(orderToCancel.status_updates || []),
          ],
        },
        ...prev,
      ]);
      message.success(`Order ${orderToCancel.order_number} dibatalkan.`);
      await loadShippingData({ silent: true });
      handleCloseCancelModal();
    } catch (error) {
      message.error(
        (error as Error)?.message || 'Gagal membatalkan order. Coba lagi.',
      );
    } finally {
      setCancelSubmitting(false);
      setProgressCancelOrderId(null);
    }
  };

  const shippingSummary: ShippingSummary = useMemo(
    () =>
      buildShippingSummary(pendingOrders.length, progressOrders, historyOrders),
    [pendingOrders.length, progressOrders, historyOrders],
  );

  const pendingActionModalMeta =
    pendingActionType === 'transit'
      ? {
          title: 'Mulai Transit',
          okText: 'In Transit',
          description:
            'Konfirmasi memulai perjalanan dari titik pickup menuju laboratorium.',
        }
      : pendingActionType === 'complete'
        ? {
            title: 'Selesaikan Order',
            okText: 'Completed',
            description: 'Pastikan sample sudah diterima di laboratorium.',
          }
        : {
            title: 'Ambil Order',
            okText: 'Ambil Sekarang',
            description:
              'Masukkan catatan bila diperlukan sebelum mengambil sample.',
          };

  return (
    <>
      <ShippingStyles />
      <PageContainer
        title="Shipping Management"
        content="Take and manage sample delivery orders from ships to laboratories"
        className="shipping-container"
      >
        <SummaryCards data={shippingSummary} />

        <Card bodyStyle={{ padding: 0 }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            type="card"
            size="large"
            items={[
              {
                key: 'pending',
                label: (
                  <Space>
                    <ClockCircleOutlined />
                    <span>Pending Orders</span>
                    <Badge
                      count={pendingOrders.length}
                      style={{ backgroundColor: '#faad14' }}
                      size="small"
                    />
                  </Space>
                ),
                children: (
                  <PendingOrdersTab
                    orders={pendingOrders}
                    actionOrderId={pendingActionOrderId}
                    onActionOrder={handleOpenPendingActionModal}
                  />
                ),
              },
              {
                key: 'progress',
                label: (
                  <Space>
                    <RocketOutlined />
                    <span>In Progress</span>
                    <Badge
                      count={progressOrders.length}
                      style={{ backgroundColor: '#fa8c16' }}
                      size="small"
                    />
                  </Space>
                ),
                children: (
                  <ProgressOrdersTab
                    orders={progressOrders}
                    actionOrderId={progressActionOrderId}
                    cancelOrderId={progressCancelOrderId}
                    onOpenStatusModal={handleOpenStatusModal}
                    onAdvanceStatus={handleAdvanceStatus}
                    onCancelOrder={handleCancelProgressOrder}
                  />
                ),
              },
              {
                key: 'history',
                label: (
                  <Space>
                    <CheckCircleOutlined />
                    <span>Order History</span>
                    <Badge
                      count={historyOrders.length}
                      style={{ backgroundColor: '#52c41a' }}
                      size="small"
                    />
                  </Space>
                ),
                children: (
                  <HistoryTab
                    orders={historyOrders}
                    onViewDetails={handleOpenHistoryDetail}
                    pagination={historyPagination}
                    onChangePage={handleHistoryPaginationChange}
                  />
                ),
              },
            ]}
          />
        </Card>

        {isMobile && (
          <FloatButton
            icon={<ReloadOutlined />}
            type="primary"
            style={{ right: 24, bottom: 24, backgroundColor: '#1890ff' }}
            onClick={loadShippingData}
            tooltip="Refresh Orders"
          />
        )}
      </PageContainer>

      <Modal
        title="Batalkan Order"
        open={cancelModalVisible}
        onOk={handleConfirmCancelOrder}
        okText="Batalkan"
        cancelText="Tutup"
        okButtonProps={{ danger: true, disabled: !cancelReason.trim() }}
        confirmLoading={cancelSubmitting}
        onCancel={handleCloseCancelModal}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {orderToCancel?.order_number}
            </div>
            <div style={{ color: '#666', fontSize: 12 }}>
              {orderToCancel?.pickup_location} →{' '}
              {orderToCancel?.delivery_location}
            </div>
          </div>
          <Input.TextArea
            rows={4}
            placeholder="Masukkan alasan pembatalan"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            maxLength={200}
            showCount
          />
        </Space>
      </Modal>

      <Modal
        title={pendingActionModalMeta.title}
        open={takeOrderModalVisible}
        onOk={handleConfirmPendingAction}
        okText={pendingActionModalMeta.okText}
        cancelText="Batal"
        confirmLoading={takeOrderSubmitting}
        onCancel={handleCancelTakeOrder}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {orderToTake?.order_number}
            </div>
            <div style={{ color: '#666', fontSize: 12 }}>
              {orderToTake?.pickup_location} → {orderToTake?.delivery_location}
            </div>
            <div style={{ color: '#999', fontSize: 12 }}>
              {pendingActionModalMeta.description}
            </div>
          </div>
          <Input.TextArea
            rows={4}
            placeholder="Tambahkan catatan untuk dispatcher (opsional)"
            value={takeOrderComment}
            onChange={(event) => setTakeOrderComment(event.target.value)}
            maxLength={200}
            showCount
          />
        </Space>
      </Modal>

      <StatusUpdateModal
        visible={statusModalVisible}
        order={selectedOrder}
        message={statusMessage}
        loading={statusUpdateSubmitting}
        onChangeMessage={setStatusMessage}
        onSubmit={handleAddStatusUpdate}
        onCancel={handleCloseStatusModal}
      />

      <HistoryDetailModal
        visible={historyDetailVisible}
        order={selectedHistoryOrder}
        onClose={handleCloseHistoryDetail}
      />
    </>
  );
};

export default Shipping;
