import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Badge, Card, FloatButton, message, Space, Tabs } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';

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
import { MOCK_HISTORY_ORDERS, MOCK_PENDING_ORDERS } from './mockData';
import type {
  PendingSampleOrder,
  ProgressOrder,
  ShippingHistory,
  ShippingSummary,
  StatusUpdate,
} from './types';

const Shipping: React.FC = () => {
  const [pendingOrders, setPendingOrders] = useState<PendingSampleOrder[]>([]);
  const [progressOrders, setProgressOrders] = useState<ProgressOrder[]>([]);
  const [historyOrders, setHistoryOrders] = useState<ShippingHistory[]>([]);

  const [takingOrderId, setTakingOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('pending');

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ProgressOrder | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState('');

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

  const loadShippingData = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPendingOrders(MOCK_PENDING_ORDERS);
      setHistoryOrders(MOCK_HISTORY_ORDERS);
      message.success('Data refreshed successfully');
    } catch (error) {
      message.error('Failed to refresh data');
    }
  };

  const handleTakeOrder = async (order: PendingSampleOrder) => {
    setTakingOrderId(order.id);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      message.success(`Order ${order.order_number} berhasil diambil!`);
      message.info(`Menuju lokasi pickup: ${order.pickup_location}`);

      setPendingOrders((prev) => prev.filter((item) => item.id !== order.id));

      const progressOrder: ProgressOrder = {
        id: order.id,
        order_number: order.order_number,
        npc_number: order.npc_number,
        sample_type: order.sample_type,
        vessel_name: order.vessel_name,
        tank_number: order.tank_number,
        quantity: order.quantity,
        unit: order.unit,
        pickup_location: order.pickup_location,
        delivery_location: order.delivery_location,
        pickup_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        estimated_delivery_time: dayjs()
          .add(order.estimated_delivery_time, 'hour')
          .format('YYYY-MM-DD HH:mm:ss'),
        distance: order.distance,
        current_status: 'pickup',
        progress_percentage: 10,
        status_updates: [
          {
            id: Date.now().toString(),
            timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            message: `Order diambil oleh driver, menuju lokasi pickup: ${order.pickup_location}`,
            created_by: 'Driver',
          },
        ],
      };

      setProgressOrders((prev) => [progressOrder, ...prev]);
      setActiveTab('progress');

      setTimeout(() => {
        message.success('GPS navigation started to pickup location');
      }, 1000);
    } catch (error) {
      message.error('Failed to take order. Please try again.');
    } finally {
      setTakingOrderId(null);
    }
  };

  const handleAdvanceStatus = (order: ProgressOrder) => {
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

    if (nextStatus === 'delivered') {
      const completionUpdate: StatusUpdate = {
        id: Date.now().toString(),
        timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        message: `Sample berhasil dikirim ke ${order.delivery_location}`,
        created_by: 'System',
      };

      setProgressOrders((prev) => prev.filter((item) => item.id !== order.id));

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
      return;
    }

    const statusUpdateMessage =
      order.current_status === 'pickup'
        ? `Sample berhasil diambil dari ${order.pickup_location}, menuju ke ${order.delivery_location}`
        : `Sample dalam perjalanan menuju ${order.delivery_location}`;

    const newStatusUpdate: StatusUpdate = {
      id: Date.now().toString(),
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      message: statusUpdateMessage,
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
            }
          : item,
      ),
    );

    message.success(`Status updated to ${nextStatus.replace('_', ' ')}`);
  };

  const handleAddStatusUpdate = () => {
    if (!selectedOrder || !statusMessage.trim()) {
      message.warning('Please enter a status message');
      return;
    }

    const newStatusUpdate: StatusUpdate = {
      id: Date.now().toString(),
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      message: statusMessage.trim(),
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

  const shippingSummary: ShippingSummary = useMemo(
    () =>
      buildShippingSummary(pendingOrders.length, progressOrders, historyOrders),
    [pendingOrders.length, progressOrders, historyOrders],
  );

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
                    takingOrderId={takingOrderId}
                    onTakeOrder={handleTakeOrder}
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
                    onOpenStatusModal={handleOpenStatusModal}
                    onAdvanceStatus={handleAdvanceStatus}
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

      <StatusUpdateModal
        visible={statusModalVisible}
        order={selectedOrder}
        message={statusMessage}
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
