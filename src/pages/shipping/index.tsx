import {
  BoxPlotOutlined,
  CalendarOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  EyeOutlined,
  LoadingOutlined,
  MessageOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  RocketOutlined,
  TruckOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  FloatButton,
  Input,
  Modal,
  message,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const { Text } = Typography;
const { TextArea } = Input;

interface PendingSampleOrder {
  id: string;
  order_number: string;
  npc_number: string;
  order_type: 'ready' | 'request';
  sample_type: string;
  vessel_name: string;
  tank_number: string;
  quantity: number;
  unit: string;
  pickup_location: string;
  delivery_location: string;
  estimated_pickup_time: string;
  estimated_delivery_time: number;
  priority: 'normal' | 'urgent';
  created_at: string;
  distance: string;
}

interface ShippingHistory {
  id: string;
  order_number: string;
  npc_number: string;
  sample_type: string;
  pickup_location: string;
  delivery_location: string;
  pickup_time: string;
  delivery_time: string;
  status: 'completed' | 'cancelled';
  distance: string;
  vessel_name?: string;
  tank_number?: string;
  quantity?: number;
  unit?: string;
  status_updates?: StatusUpdate[];
}

interface ProgressOrder {
  id: string;
  order_number: string;
  npc_number: string;
  sample_type: string;
  vessel_name: string;
  tank_number: string;
  quantity: number;
  unit: string;
  pickup_location: string;
  delivery_location: string;
  pickup_time: string;
  estimated_delivery_time: string;
  distance: string;
  current_status: 'pickup' | 'in_transit' | 'delivered';
  progress_percentage: number;
  status_updates: StatusUpdate[];
}

interface StatusUpdate {
  id: string;
  timestamp: string;
  message: string;
  created_by: string;
}

const Shipping: React.FC = () => {
  const [pendingOrders, setPendingOrders] = useState<PendingSampleOrder[]>([]);
  const [progressOrders, setProgressOrders] = useState<ProgressOrder[]>([]);
  const [historyOrders, setHistoryOrders] = useState<ShippingHistory[]>([]);
  const [takingOrder, setTakingOrder] = useState<string | null>(null);
  const [_refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ProgressOrder | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState('');
  const [historyDetailVisible, setHistoryDetailVisible] = useState(false);
  const [selectedHistoryOrder, setSelectedHistoryOrder] =
    useState<ShippingHistory | null>(null);

  // Custom styles
  const cardStyles = {
    pendingCard: {
      borderRadius: 12,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
      },
    },
    urgentCard: {
      background: 'linear-gradient(135deg, #fff2f0 0%, #fff 100%)',
      border: '2px solid #ff7875',
      boxShadow: '0 4px 16px rgba(255, 77, 79, 0.2)',
    },
    normalCard: {
      background: 'linear-gradient(135deg, #f6ffed 0%, #fff 100%)',
      border: '1px solid #d9f7be',
    },
  };

  // Mock pending orders data
  const mockPendingOrders: PendingSampleOrder[] = [
    {
      id: '1',
      order_number: 'SO-20250829-001',
      npc_number: '227/NPC/SKH/2025',
      order_type: 'ready',
      sample_type: 'JET-A1',
      vessel_name: 'MT. Commodore One',
      tank_number: 'Tangki 107',
      quantity: 4,
      unit: 'botol',
      pickup_location: 'Tanjung Priok Port, Jakarta',
      delivery_location: 'LPUJ Laboratory, Priok',
      estimated_pickup_time: '2025-08-29 14:00',
      estimated_delivery_time: 1,
      priority: 'urgent',
      created_at: '2025-08-29 08:30:00',
      distance: '15 km',
    },
    {
      id: '2',
      order_number: 'RQ-20250829-002',
      npc_number: '228/NPC/SKH/2025',
      order_type: 'request',
      sample_type: 'Avgas',
      vessel_name: 'MT. Pioneer',
      tank_number: 'Tangki 203',
      quantity: 3,
      unit: 'botol',
      pickup_location: 'Anchorage Area B, Jakarta Bay',
      delivery_location: 'Lemigas Laboratory, Jakarta',
      estimated_pickup_time: '2025-08-29 16:00',
      estimated_delivery_time: 1,
      priority: 'normal',
      created_at: '2025-08-29 10:15:00',
      distance: '25 km',
    },
    {
      id: '3',
      order_number: 'SO-20250829-003',
      npc_number: '229/NPC/SKH/2025',
      order_type: 'ready',
      sample_type: 'Soft blended',
      vessel_name: 'MT. Ocean Star',
      tank_number: 'Tangki 301',
      quantity: 2,
      unit: 'botol',
      pickup_location: 'Tanjung Priok Port, Jakarta',
      delivery_location: 'Balongan Testing Center',
      estimated_pickup_time: '2025-08-29 18:00',
      estimated_delivery_time: 6,
      priority: 'urgent',
      created_at: '2025-08-29 11:45:00',
      distance: '380 km',
    },
    {
      id: '4',
      order_number: 'RQ-20250829-004',
      npc_number: '230/NPC/SKH/2025',
      order_type: 'request',
      sample_type: 'JET-A1',
      vessel_name: 'MT. Excellence',
      tank_number: 'Tangki 108',
      quantity: 5,
      unit: 'botol',
      pickup_location: 'Private Port, Bekasi',
      delivery_location: 'LPUJ Laboratory, Priok',
      estimated_pickup_time: '2025-08-29 19:30',
      estimated_delivery_time: 2,
      priority: 'normal',
      created_at: '2025-08-29 12:20:00',
      distance: '45 km',
    },
  ];

  // Mock history orders data - expanded for pagination demo
  const mockHistoryOrders: ShippingHistory[] = [
    {
      id: '1',
      order_number: 'SO-20250828-015',
      npc_number: '224/NPC/SKH/2025',
      sample_type: 'Soft blended',
      pickup_location: 'Tanjung Priok Port',
      delivery_location: 'LPUJ Laboratory',
      pickup_time: '2025-08-28 09:30',
      delivery_time: '2025-08-28 10:45',
      status: 'completed',
      distance: '15 km',
      vessel_name: 'MT. Southern Star',
      tank_number: 'Tangki 205',
      quantity: 3,
      unit: 'botol',
      status_updates: [
        {
          id: '1',
          timestamp: '2025-08-28 09:30:00',
          message:
            'Order diambil oleh driver, menuju lokasi pickup: Tanjung Priok Port',
          created_by: 'Driver',
        },
        {
          id: '2',
          timestamp: '2025-08-28 09:45:00',
          message:
            'Sample berhasil diambil dari Tanjung Priok Port, menuju ke LPUJ Laboratory',
          created_by: 'System',
        },
        {
          id: '3',
          timestamp: '2025-08-28 10:15:00',
          message: 'Tiba di lokasi delivery, sedang melakukan handover sample',
          created_by: 'Driver',
        },
      ],
    },
    {
      id: '2',
      order_number: 'RQ-20250827-008',
      npc_number: '225/NPC/SKH/2025',
      sample_type: 'JET-A1',
      pickup_location: 'Anchorage Area A',
      delivery_location: 'Balongan Testing Center',
      pickup_time: '2025-08-27 08:00',
      delivery_time: '2025-08-27 14:30',
      status: 'completed',
      distance: '380 km',
      vessel_name: 'MT. Eagle Express',
      tank_number: 'Tangki 401',
      quantity: 5,
      unit: 'botol',
      status_updates: [
        {
          id: '1',
          timestamp: '2025-08-27 08:00:00',
          message:
            'Order diambil oleh driver, menuju lokasi pickup: Anchorage Area A',
          created_by: 'Driver',
        },
        {
          id: '2',
          timestamp: '2025-08-27 08:30:00',
          message:
            'Sample berhasil diambil dari Anchorage Area A, menuju ke Balongan Testing Center',
          created_by: 'System',
        },
        {
          id: '3',
          timestamp: '2025-08-27 11:15:00',
          message: 'Istirahat di rest area Tol Cipali, perjalanan lancar',
          created_by: 'Driver',
        },
        {
          id: '4',
          timestamp: '2025-08-27 13:45:00',
          message: 'Tiba di Balongan Testing Center, melakukan proses delivery',
          created_by: 'Driver',
        },
      ],
    },
    {
      id: '3',
      order_number: 'SO-20250826-012',
      npc_number: '226/NPC/SKH/2025',
      sample_type: 'Avgas',
      pickup_location: 'Private Port',
      delivery_location: 'Lemigas Laboratory',
      pickup_time: '2025-08-26 11:00',
      delivery_time: '2025-08-26 11:00',
      status: 'cancelled',
      distance: '20 km',
      vessel_name: 'MT. Swift Runner',
      tank_number: 'Tangki 102',
      quantity: 2,
      unit: 'botol',
      status_updates: [
        {
          id: '1',
          timestamp: '2025-08-26 11:00:00',
          message:
            'Order diambil oleh driver, menuju lokasi pickup: Private Port',
          created_by: 'Driver',
        },
        {
          id: '2',
          timestamp: '2025-08-26 11:30:00',
          message:
            'Tidak dapat mengakses kapal karena masalah keamanan pelabuhan',
          created_by: 'Driver',
        },
        {
          id: '3',
          timestamp: '2025-08-26 11:45:00',
          message: 'Order dibatalkan atas permintaan management port',
          created_by: 'System',
        },
      ],
    },
    {
      id: '4',
      order_number: 'SO-20250825-009',
      npc_number: '221/NPC/SKH/2025',
      sample_type: 'Diesel',
      pickup_location: 'Tanjung Priok Port',
      delivery_location: 'LPUJ Laboratory',
      pickup_time: '2025-08-25 14:15',
      delivery_time: '2025-08-25 15:30',
      status: 'completed',
      distance: '15 km',
      vessel_name: 'MT. Ocean Breeze',
      tank_number: 'Tangki 310',
      quantity: 4,
      unit: 'botol',
      status_updates: [
        {
          id: '1',
          timestamp: '2025-08-25 14:15:00',
          message:
            'Order diambil oleh driver, menuju lokasi pickup: Tanjung Priok Port',
          created_by: 'Driver',
        },
        {
          id: '2',
          timestamp: '2025-08-25 14:45:00',
          message:
            'Sample berhasil diambil dari Tanjung Priok Port, menuju ke LPUJ Laboratory',
          created_by: 'System',
        },
      ],
    },
    {
      id: '5',
      order_number: 'RQ-20250824-004',
      npc_number: '222/NPC/SKH/2025',
      sample_type: 'JET-A1',
      pickup_location: 'Anchorage Area B',
      delivery_location: 'Lemigas Laboratory',
      pickup_time: '2025-08-24 10:30',
      delivery_time: '2025-08-24 11:45',
      status: 'completed',
      distance: '25 km',
      vessel_name: 'MT. Blue Horizon',
      tank_number: 'Tangki 205',
      quantity: 3,
      unit: 'botol',
      status_updates: [
        {
          id: '1',
          timestamp: '2025-08-24 10:30:00',
          message:
            'Order diambil oleh driver, menuju lokasi pickup: Anchorage Area B',
          created_by: 'Driver',
        },
        {
          id: '2',
          timestamp: '2025-08-24 11:00:00',
          message:
            'Sample berhasil diambil dari Anchorage Area B, menuju ke Lemigas Laboratory',
          created_by: 'System',
        },
        {
          id: '3',
          timestamp: '2025-08-24 11:20:00',
          message:
            'Sedikit terkendala traffic, estimasi tiba 15 menit lebih lambat',
          created_by: 'Driver',
        },
      ],
    },
    {
      id: '6',
      order_number: 'SO-20250823-016',
      npc_number: '223/NPC/SKH/2025',
      sample_type: 'Avgas',
      pickup_location: 'Private Port, Bekasi',
      delivery_location: 'Balongan Testing Center',
      pickup_time: '2025-08-23 07:00',
      delivery_time: '2025-08-23 13:30',
      status: 'completed',
      distance: '420 km',
      vessel_name: 'MT. Sky Rider',
      tank_number: 'Tangki 501',
      quantity: 6,
      unit: 'botol',
      status_updates: [
        {
          id: '1',
          timestamp: '2025-08-23 07:00:00',
          message:
            'Order diambil oleh driver, menuju lokasi pickup: Private Port, Bekasi',
          created_by: 'Driver',
        },
        {
          id: '2',
          timestamp: '2025-08-23 07:45:00',
          message:
            'Sample berhasil diambil dari Private Port, Bekasi, menuju ke Balongan Testing Center',
          created_by: 'System',
        },
        {
          id: '3',
          timestamp: '2025-08-23 10:15:00',
          message:
            'Perjalanan lancar, melewati Tol Cipali dengan kondisi cuaca cerah',
          created_by: 'Driver',
        },
        {
          id: '4',
          timestamp: '2025-08-23 12:30:00',
          message:
            'Hampir tiba di Balongan Testing Center, estimasi 1 jam lagi',
          created_by: 'Driver',
        },
      ],
    },
    {
      id: '7',
      order_number: 'RQ-20250822-007',
      npc_number: '220/NPC/SKH/2025',
      sample_type: 'Soft blended',
      pickup_location: 'Tanjung Priok Port',
      delivery_location: 'LPUJ Laboratory',
      pickup_time: '2025-08-22 16:00',
      delivery_time: '2025-08-22 16:00',
      status: 'cancelled',
      distance: '15 km',
    },
    {
      id: '8',
      order_number: 'SO-20250821-013',
      npc_number: '219/NPC/SKH/2025',
      sample_type: 'JET-A1',
      pickup_location: 'Anchorage Area C',
      delivery_location: 'Lemigas Laboratory',
      pickup_time: '2025-08-21 09:15',
      delivery_time: '2025-08-21 10:30',
      status: 'completed',
      distance: '30 km',
    },
    {
      id: '9',
      order_number: 'RQ-20250820-002',
      npc_number: '218/NPC/SKH/2025',
      sample_type: 'Diesel',
      pickup_location: 'Private Port, Jakarta',
      delivery_location: 'Balongan Testing Center',
      pickup_time: '2025-08-20 11:45',
      delivery_time: '2025-08-20 18:15',
      status: 'completed',
      distance: '390 km',
    },
    {
      id: '10',
      order_number: 'SO-20250819-010',
      npc_number: '217/NPC/SKH/2025',
      sample_type: 'Avgas',
      pickup_location: 'Tanjung Priok Port',
      delivery_location: 'LPUJ Laboratory',
      pickup_time: '2025-08-19 13:30',
      delivery_time: '2025-08-19 14:45',
      status: 'completed',
      distance: '15 km',
    },
  ];

  useState(() => {
    setPendingOrders(mockPendingOrders);
    setHistoryOrders(mockHistoryOrders);
  });

  // Check if it's mobile for FloatButton visibility
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load initial data
  useEffect(() => {
    loadShippingData();
  }, []);

  const loadShippingData = async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPendingOrders(mockPendingOrders);
      setHistoryOrders(mockHistoryOrders);

      message.success('Data refreshed successfully');
    } catch (_error) {
      message.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadShippingData();
  };

  const handleTakeOrder = async (order: PendingSampleOrder) => {
    setTakingOrder(order.id);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      message.success(`Order ${order.order_number} berhasil diambil!`);
      message.info(`Menuju lokasi pickup: ${order.pickup_location}`);

      // Move from pending to progress orders
      setPendingOrders((prev) => prev.filter((item) => item.id !== order.id));

      // Add to progress orders
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
            id: '1',
            timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            message: `Order diambil oleh driver, menuju lokasi pickup: ${order.pickup_location}`,
            created_by: 'Driver',
          },
        ],
      };

      setProgressOrders((prev) => [progressOrder, ...prev]);

      // Switch to progress tab
      setActiveTab('progress');

      // In real implementation, this would trigger navigation/tracking features
      setTimeout(() => {
        message.success('GPS navigation started to pickup location');
      }, 1000);
    } catch (_error) {
      message.error('Failed to take order. Please try again.');
    } finally {
      setTakingOrder(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'urgent' ? 'red' : 'blue';
  };

  const getOrderTypeColor = (type: string) => {
    return type === 'ready' ? 'green' : 'blue';
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'green' : 'red';
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

  const openStatusModal = (order: ProgressOrder) => {
    setSelectedOrder(order);
    setStatusModalVisible(true);
  };

  const openHistoryDetail = (order: ShippingHistory) => {
    setSelectedHistoryOrder(order);
    setHistoryDetailVisible(true);
  };

  const _formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const shippingSummary = {
    pending: pendingOrders.length,
    inProgress: progressOrders.length,
    todayCompleted: historyOrders.filter(
      (order) =>
        dayjs(order.delivery_time).isSame(dayjs(), 'day') &&
        order.status === 'completed',
    ).length,
    totalDeliveries: historyOrders.filter(
      (order) => order.status === 'completed',
    ).length,
    successRate:
      historyOrders.length > 0
        ? (historyOrders.filter((order) => order.status === 'completed')
            .length /
            historyOrders.length) *
          100
        : 0,
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .ant-col {
              margin-bottom: 16px;
            }
            .shipping-card .ant-card-body {
              padding: 12px !important;
            }
            .shipping-summary .ant-statistic-title {
              font-size: 12px !important;
            }
            .shipping-summary .ant-statistic-content-value {
              font-size: 18px !important;
            }
            .pending-order-card {
              margin-bottom: 12px !important;
            }
            .pending-order-card .ant-card-body {
              padding: 12px !important;
            }
          }
          
          @media (max-width: 576px) {
            .ant-page-header-heading-title {
              font-size: 20px !important;
            }
            .shipping-metrics {
              padding: 6px !important;
            }
            .reward-text {
              font-size: 12px !important;
            }
          }
          
          .pending-order-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.12) !important;
            transition: all 0.3s ease;
          }
          
          .urgent-pulse {
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(255, 77, 79, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(255, 77, 79, 0);
            }
          }

          /* Table Styling */
          .ant-table-thead > tr > th {
            background: linear-gradient(135deg, #f0f2f5 0%, #fafbfc 100%);
            border-bottom: 2px solid #e8f4fd;
            font-weight: 600;
            font-size: 12px;
            color: #434343;
            padding: 12px 8px;
          }

          .ant-table-tbody > tr > td {
            padding: 12px 8px;
            border-bottom: 1px solid #f0f0f0;
            vertical-align: top;
          }

          .ant-table-tbody > tr:hover > td {
            background: #f8fbff !important;
          }

          .completed-row {
            background: linear-gradient(135deg, #f6ffed 0%, #ffffff 100%);
          }

          .completed-row:hover {
            background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%) !important;
          }

          .cancelled-row {
            background: linear-gradient(135deg, #fff2f0 0%, #ffffff 100%);
          }

          .cancelled-row:hover {
            background: linear-gradient(135deg, #fff7f0 0%, #ffffff 100%) !important;
          }

          .ant-table {
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          }

          .ant-table-pagination {
            margin: 16px 0 0 0 !important;
            padding: 16px;
            background: #fafafa;
            border-radius: 0 0 8px 8px;
            border-top: 1px solid #f0f0f0;
          }

          .ant-pagination-item-active {
            background: #1890ff;
            border-color: #1890ff;
          }

          .ant-pagination-item-active a {
            color: #ffffff;
          }

          .ant-table-small .ant-table-thead > tr > th {
            padding: 8px 6px;
            font-size: 11px;
          }

          .ant-table-small .ant-table-tbody > tr > td {
            padding: 8px 6px;
          }

          /* Mobile Table Responsiveness */
          @media (max-width: 768px) {
            .ant-table-scroll {
              overflow-x: auto;
            }
            
            .ant-table-pagination {
              padding: 12px;
            }
            
            .ant-pagination-options {
              display: none;
            }
          }

          /* Tab Styling */
          .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab {
            border-radius: 8px 8px 0 0;
            font-weight: 500;
            background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
            border-color: #d9d9d9;
            transition: all 0.3s ease;
          }

          .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active {
            background: linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%);
            border-color: #1890ff;
            color: #1890ff;
          }

          .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab:hover {
            background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
            border-color: #40a9ff;
          }

          .ant-tabs-content-holder {
            background: #ffffff;
            border-radius: 0 0 8px 8px;
          }

          /* Progress Card Styling */
          .progress-order-card {
            transition: all 0.3s ease;
          }

          .progress-order-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(250, 140, 22, 0.15) !important;
          }

          /* Timeline Customization */
          .ant-timeline .ant-timeline-item-tail {
            border-left: 2px solid #f0f0f0;
          }

          .ant-timeline .ant-timeline-item-head {
            border-width: 2px;
          }

          /* Progress Bar Customization */
          .ant-progress-bg {
            border-radius: 4px;
          }

          .ant-progress-outer {
            border-radius: 4px;
          }
        `}
      </style>

      <PageContainer
        title="Shipping Management"
        content="Take and manage sample delivery orders from ships to laboratories"
        className="shipping-container"
      >
        {/* Summary Cards */}
        <Row
          gutter={[16, 16]}
          style={{ marginBottom: 24 }}
          className="shipping-summary"
        >
          <Col xs={24} sm={6}>
            <Card className="shipping-card">
              <Statistic
                title="Pending Orders"
                value={shippingSummary.pending}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="shipping-card">
              <Statistic
                title="In Progress"
                value={shippingSummary.inProgress}
                prefix={<RocketOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="shipping-card">
              <Statistic
                title="Total Deliveries"
                value={shippingSummary.totalDeliveries}
                prefix={<CarOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="shipping-card">
              <Statistic
                title="Success Rate"
                value={shippingSummary.successRate.toFixed(1)}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>

        {/* Main Tabs Layout */}
        <Card bodyStyle={{ padding: '0' }}>
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
                  <div style={{ padding: '16px' }}>
                    {pendingOrders.length === 0 ? (
                      <Empty
                        description="No pending orders available"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{ padding: '40px 0' }}
                      />
                    ) : (
                      <Row gutter={[16, 16]}>
                        {pendingOrders.map((order) => (
                          <Col xs={24} sm={12} key={order.id}>
                            <Card
                              size="small"
                              hoverable
                              className={`pending-order-card ${order.priority === 'urgent' ? 'urgent-pulse' : ''}`}
                              style={{
                                height: '100%',
                                ...cardStyles.pendingCard,
                                ...(order.priority === 'urgent'
                                  ? cardStyles.urgentCard
                                  : cardStyles.normalCard),
                              }}
                              bodyStyle={{ padding: '16px' }}
                            >
                              {/* Header Section */}
                              <div style={{ marginBottom: 12 }}>
                                <Row
                                  align="middle"
                                  justify="space-between"
                                  gutter={[8, 8]}
                                >
                                  <Col xs={16} sm={18}>
                                    <Space align="center">
                                      <Badge
                                        dot={order.priority === 'urgent'}
                                        color="red"
                                      >
                                        <Avatar
                                          icon={<ExperimentOutlined />}
                                          style={{
                                            backgroundColor:
                                              order.priority === 'urgent'
                                                ? '#ff4d4f'
                                                : '#1890ff',
                                            color: '#fff',
                                          }}
                                          size="large"
                                        />
                                      </Badge>
                                      <div>
                                        <Space align="center">
                                          <Text
                                            strong
                                            style={{
                                              fontSize: '16px',
                                              color: '#333',
                                            }}
                                          >
                                            {order.order_number}
                                          </Text>
                                        </Space>
                                        <br />
                                        <Space size={4} wrap>
                                          <Tag
                                            color={getOrderTypeColor(
                                              order.order_type,
                                            )}
                                            style={{
                                              margin: 0,
                                              fontSize: '11px',
                                            }}
                                          >
                                            {order.order_type.toUpperCase()}
                                          </Tag>
                                          <Tag
                                            color={getPriorityColor(
                                              order.priority,
                                            )}
                                            style={{
                                              margin: 0,
                                              fontSize: '11px',
                                            }}
                                          >
                                            {order.priority.toUpperCase()}
                                          </Tag>
                                        </Space>
                                      </div>
                                    </Space>
                                  </Col>
                                  <Col xs={8} sm={6}>
                                    <div style={{ textAlign: 'right' }}>
                                      <Text
                                        strong
                                        style={{
                                          fontSize: '12px',
                                          color: '#1890ff',
                                        }}
                                      >
                                        {order.npc_number}
                                      </Text>
                                      <br />
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: '12px' }}
                                      >
                                        <CalendarOutlined />{' '}
                                        {dayjs(order.created_at).format(
                                          'HH:mm',
                                        )}
                                      </Text>
                                    </div>
                                  </Col>
                                </Row>
                              </div>

                              {/* Product Info */}
                              <div style={{ marginBottom: 12 }}>
                                <Text
                                  strong
                                  style={{ fontSize: '15px', color: '#1890ff' }}
                                >
                                  {order.sample_type}
                                </Text>
                                <Text style={{ marginLeft: 8, color: '#666' }}>
                                  • {order.vessel_name}
                                </Text>
                                <br />
                                <Text
                                  type="secondary"
                                  style={{ fontSize: '13px' }}
                                >
                                  <BoxPlotOutlined /> {order.tank_number} •{' '}
                                  {order.quantity} {order.unit}
                                </Text>
                              </div>

                              {/* Location Info */}
                              <div style={{ marginBottom: 12 }}>
                                <Row gutter={[8, 8]}>
                                  <Col xs={24} sm={12}>
                                    <div
                                      style={{
                                        background: '#f6ffed',
                                        padding: '8px 12px',
                                        borderRadius: 6,
                                        border: '1px solid #b7eb8f',
                                      }}
                                    >
                                      <Text
                                        type="secondary"
                                        style={{
                                          fontSize: '11px',
                                          display: 'block',
                                        }}
                                      >
                                        📍 PICKUP
                                      </Text>
                                      <Text
                                        strong
                                        style={{
                                          fontSize: '12px',
                                          color: '#52c41a',
                                        }}
                                      >
                                        {order.pickup_location}
                                      </Text>
                                    </div>
                                  </Col>
                                  <Col xs={24} sm={12}>
                                    <div
                                      style={{
                                        background: '#e6f7ff',
                                        padding: '8px 12px',
                                        borderRadius: 6,
                                        border: '1px solid #91d5ff',
                                      }}
                                    >
                                      <Text
                                        type="secondary"
                                        style={{
                                          fontSize: '11px',
                                          display: 'block',
                                        }}
                                      >
                                        🏥 DELIVERY
                                      </Text>
                                      <Text
                                        strong
                                        style={{
                                          fontSize: '12px',
                                          color: '#1890ff',
                                        }}
                                      >
                                        {order.delivery_location}
                                      </Text>
                                    </div>
                                  </Col>
                                </Row>
                              </div>

                              {/* Metrics Row */}
                              <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
                                <Col xs={8}>
                                  <div
                                    className="shipping-metrics"
                                    style={{
                                      textAlign: 'center',
                                      padding: '8px',
                                      background: '#fafafa',
                                      borderRadius: 6,
                                    }}
                                  >
                                    <TruckOutlined
                                      style={{
                                        fontSize: '16px',
                                        color: '#fa541c',
                                      }}
                                    />
                                    <br />
                                    <Text strong style={{ fontSize: '12px' }}>
                                      {order.distance}
                                    </Text>
                                    <br />
                                    <Text
                                      type="secondary"
                                      style={{ fontSize: '10px' }}
                                    >
                                      Distance
                                    </Text>
                                  </div>
                                </Col>
                                <Col xs={8}>
                                  <div
                                    className="shipping-metrics"
                                    style={{
                                      textAlign: 'center',
                                      padding: '8px',
                                      background: '#fafafa',
                                      borderRadius: 6,
                                    }}
                                  >
                                    <ClockCircleOutlined
                                      style={{
                                        fontSize: '16px',
                                        color: '#722ed1',
                                      }}
                                    />
                                    <br />
                                    <Text strong style={{ fontSize: '12px' }}>
                                      {order.estimated_delivery_time}h
                                    </Text>
                                    <br />
                                    <Text
                                      type="secondary"
                                      style={{ fontSize: '10px' }}
                                    >
                                      Est. Time
                                    </Text>
                                  </div>
                                </Col>
                                <Col xs={8}>
                                  <div
                                    className="shipping-metrics"
                                    style={{
                                      textAlign: 'center',
                                      padding: '8px',
                                      background: '#fafafa',
                                      borderRadius: 6,
                                    }}
                                  >
                                    <CalendarOutlined
                                      style={{
                                        fontSize: '16px',
                                        color: '#13c2c2',
                                      }}
                                    />
                                    <br />
                                    <Text strong style={{ fontSize: '12px' }}>
                                      {dayjs(
                                        order.estimated_pickup_time,
                                      ).format('HH:mm')}
                                    </Text>
                                    <br />
                                    <Text
                                      type="secondary"
                                      style={{ fontSize: '10px' }}
                                    >
                                      Pickup
                                    </Text>
                                  </div>
                                </Col>
                              </Row>

                              {/* Action Button */}
                              <Button
                                type="primary"
                                block
                                size="large"
                                loading={takingOrder === order.id}
                                onClick={() => handleTakeOrder(order)}
                                style={{
                                  backgroundColor: '#52c41a',
                                  borderColor: '#52c41a',
                                  borderRadius: 8,
                                  height: 44,
                                  fontWeight: 600,
                                  fontSize: '14px',
                                }}
                                icon={!takingOrder && <TruckOutlined />}
                              >
                                {takingOrder === order.id
                                  ? 'Taking Order...'
                                  : 'Take Order'}
                              </Button>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </div>
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
                  <div style={{ padding: '16px' }}>
                    {progressOrders.length === 0 ? (
                      <Empty
                        description="No orders in progress"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{ padding: '40px 0' }}
                      />
                    ) : (
                      <Row gutter={[16, 16]}>
                        {progressOrders.map((order) => (
                          <Col xs={24} lg={12} key={order.id}>
                            <Card
                              size="small"
                              hoverable
                              style={{
                                borderRadius: 12,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                background:
                                  'linear-gradient(135deg, #fff7e6 0%, #fff 100%)',
                                border: '2px solid #ffa940',
                              }}
                              bodyStyle={{ padding: '20px' }}
                            >
                              {/* Header Section */}
                              <div style={{ marginBottom: 16 }}>
                                <Row align="middle" justify="space-between">
                                  <Col xs={16}>
                                    <Space align="center">
                                      <Avatar
                                        icon={<RocketOutlined />}
                                        style={{
                                          backgroundColor: '#fa8c16',
                                          color: '#fff',
                                        }}
                                        size="large"
                                      />
                                      <div>
                                        <Text
                                          strong
                                          style={{
                                            fontSize: '16px',
                                            color: '#333',
                                          }}
                                        >
                                          {order.order_number}
                                        </Text>
                                        <br />
                                        <Text
                                          type="secondary"
                                          style={{ fontSize: '12px' }}
                                        >
                                          {order.npc_number}
                                        </Text>
                                      </div>
                                    </Space>
                                  </Col>
                                  <Col xs={8}>
                                    <div style={{ textAlign: 'right' }}>
                                      <Tag
                                        color="orange"
                                        style={{
                                          marginBottom: 4,
                                          fontSize: '10px',
                                        }}
                                      >
                                        {order.current_status.toUpperCase()}
                                      </Tag>
                                      <br />
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: '11px' }}
                                      >
                                        <CalendarOutlined />{' '}
                                        {dayjs(order.pickup_time).format(
                                          'HH:mm',
                                        )}
                                      </Text>
                                    </div>
                                  </Col>
                                </Row>
                              </div>

                              {/* Progress Section */}
                              <div style={{ marginBottom: 16 }}>
                                <div style={{ marginBottom: 8 }}>
                                  <Text
                                    strong
                                    style={{
                                      fontSize: '13px',
                                      color: '#fa8c16',
                                    }}
                                  >
                                    Delivery Progress
                                  </Text>
                                  <Text
                                    style={{
                                      float: 'right',
                                      fontSize: '12px',
                                      color: '#666',
                                    }}
                                  >
                                    {order.progress_percentage}%
                                  </Text>
                                </div>
                                <Progress
                                  percent={order.progress_percentage}
                                  strokeColor={{
                                    '0%': '#ffa940',
                                    '100%': '#52c41a',
                                  }}
                                  trailColor="#f0f0f0"
                                  strokeWidth={8}
                                  showInfo={false}
                                />
                                <div style={{ marginTop: 8 }}>
                                  <Timeline
                                    items={[
                                      {
                                        color:
                                          order.current_status === 'pickup'
                                            ? '#fa8c16'
                                            : '#52c41a',
                                        dot:
                                          order.current_status === 'pickup' ? (
                                            <LoadingOutlined />
                                          ) : (
                                            <CheckCircleOutlined />
                                          ),
                                        children: (
                                          <div>
                                            <Text
                                              strong
                                              style={{ fontSize: '11px' }}
                                            >
                                              Pickup Sample
                                            </Text>
                                            <br />
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: '10px' }}
                                            >
                                              {order.pickup_location}
                                            </Text>
                                          </div>
                                        ),
                                      },
                                      {
                                        color:
                                          order.current_status === 'in_transit'
                                            ? '#fa8c16'
                                            : order.current_status ===
                                                'delivered'
                                              ? '#52c41a'
                                              : '#d9d9d9',
                                        dot:
                                          order.current_status ===
                                          'in_transit' ? (
                                            <LoadingOutlined />
                                          ) : order.current_status ===
                                            'delivered' ? (
                                            <CheckCircleOutlined />
                                          ) : (
                                            <ClockCircleOutlined />
                                          ),
                                        children: (
                                          <div>
                                            <Text
                                              strong
                                              style={{ fontSize: '11px' }}
                                            >
                                              In Transit
                                            </Text>
                                            <br />
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: '10px' }}
                                            >
                                              {order.distance} - Est.{' '}
                                              {order.estimated_delivery_time}
                                            </Text>
                                          </div>
                                        ),
                                      },
                                      {
                                        color:
                                          order.current_status === 'delivered'
                                            ? '#52c41a'
                                            : '#d9d9d9',
                                        dot:
                                          order.current_status ===
                                          'delivered' ? (
                                            <CheckCircleOutlined />
                                          ) : (
                                            <ClockCircleOutlined />
                                          ),
                                        children: (
                                          <div>
                                            <Text
                                              strong
                                              style={{ fontSize: '11px' }}
                                            >
                                              Delivered
                                            </Text>
                                            <br />
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: '10px' }}
                                            >
                                              {order.delivery_location}
                                            </Text>
                                          </div>
                                        ),
                                      },
                                    ]}
                                  />
                                </div>
                              </div>

                              {/* Sample Info */}
                              <div style={{ marginBottom: 16 }}>
                                <Row gutter={[12, 8]}>
                                  <Col xs={12}>
                                    <div
                                      style={{
                                        background: '#f0f5ff',
                                        padding: '8px 10px',
                                        borderRadius: 6,
                                        border: '1px solid #adc6ff',
                                      }}
                                    >
                                      <Text
                                        type="secondary"
                                        style={{
                                          fontSize: '9px',
                                          display: 'block',
                                        }}
                                      >
                                        SAMPLE TYPE
                                      </Text>
                                      <Text
                                        strong
                                        style={{
                                          fontSize: '11px',
                                          color: '#1890ff',
                                        }}
                                      >
                                        {order.sample_type}
                                      </Text>
                                    </div>
                                  </Col>
                                  <Col xs={12}>
                                    <div
                                      style={{
                                        background: '#f6ffed',
                                        padding: '8px 10px',
                                        borderRadius: 6,
                                        border: '1px solid #b7eb8f',
                                      }}
                                    >
                                      <Text
                                        type="secondary"
                                        style={{
                                          fontSize: '9px',
                                          display: 'block',
                                        }}
                                      >
                                        QUANTITY
                                      </Text>
                                      <Text
                                        strong
                                        style={{
                                          fontSize: '11px',
                                          color: '#52c41a',
                                        }}
                                      >
                                        {order.quantity} {order.unit}
                                      </Text>
                                    </div>
                                  </Col>
                                </Row>
                              </div>

                              {/* Status Updates Section */}
                              {order.status_updates &&
                                order.status_updates.length > 0 && (
                                  <div style={{ marginBottom: 16 }}>
                                    <Text
                                      strong
                                      style={{
                                        fontSize: '12px',
                                        color: '#666',
                                        display: 'block',
                                        marginBottom: 8,
                                      }}
                                    >
                                      📢 Status Updates
                                    </Text>
                                    <div
                                      style={{
                                        maxHeight: '120px',
                                        overflowY: 'auto',
                                        background: '#fafafa',
                                        borderRadius: 6,
                                        padding: '8px',
                                        border: '1px solid #f0f0f0',
                                      }}
                                    >
                                      {order.status_updates
                                        .slice(0, 3)
                                        .map((update, index) => (
                                          <div
                                            key={update.id}
                                            style={{
                                              marginBottom:
                                                index <
                                                Math.min(
                                                  2,
                                                  order.status_updates.length -
                                                    1,
                                                )
                                                  ? 8
                                                  : 0,
                                              padding: '6px 8px',
                                              background: '#ffffff',
                                              borderRadius: 4,
                                              border: '1px solid #e8f4fd',
                                              borderLeft: '3px solid #fa8c16',
                                            }}
                                          >
                                            <Text
                                              style={{
                                                fontSize: '11px',
                                                display: 'block',
                                                marginBottom: 2,
                                              }}
                                            >
                                              {update.message}
                                            </Text>
                                            <Text
                                              type="secondary"
                                              style={{ fontSize: '9px' }}
                                            >
                                              {dayjs(update.timestamp).format(
                                                'DD/MM HH:mm',
                                              )}{' '}
                                              • {update.created_by}
                                            </Text>
                                          </div>
                                        ))}
                                      {order.status_updates.length > 3 && (
                                        <Text
                                          type="secondary"
                                          style={{
                                            fontSize: '10px',
                                            display: 'block',
                                            textAlign: 'center',
                                            marginTop: 4,
                                          }}
                                        >
                                          +{order.status_updates.length - 3}{' '}
                                          more updates
                                        </Text>
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Action Buttons */}
                              <Row gutter={[8, 8]}>
                                <Col xs={12}>
                                  <Button
                                    type="default"
                                    block
                                    size="small"
                                    icon={<MessageOutlined />}
                                    onClick={() => openStatusModal(order)}
                                    style={{
                                      borderColor: '#fa8c16',
                                      color: '#fa8c16',
                                      borderRadius: 6,
                                    }}
                                  >
                                    Update Status
                                  </Button>
                                </Col>
                                <Col xs={12}>
                                  <Button
                                    type="primary"
                                    block
                                    size="small"
                                    icon={<PlayCircleOutlined />}
                                    onClick={() => {
                                      // Simulate status update
                                      const nextStatus =
                                        order.current_status === 'pickup'
                                          ? 'in_transit'
                                          : order.current_status ===
                                              'in_transit'
                                            ? 'delivered'
                                            : 'delivered';
                                      const nextProgress =
                                        order.current_status === 'pickup'
                                          ? 50
                                          : order.current_status ===
                                              'in_transit'
                                            ? 100
                                            : 100;

                                      if (nextStatus === 'delivered') {
                                        // Move to history with complete status updates
                                        const completionUpdate: StatusUpdate = {
                                          id: Date.now().toString(),
                                          timestamp: dayjs().format(
                                            'YYYY-MM-DD HH:mm:ss',
                                          ),
                                          message: `Sample berhasil dikirim ke ${order.delivery_location}`,
                                          created_by: 'System',
                                        };

                                        setProgressOrders((prev) =>
                                          prev.filter((p) => p.id !== order.id),
                                        );
                                        const completedOrder: ShippingHistory =
                                          {
                                            id: order.id,
                                            order_number: order.order_number,
                                            npc_number: order.npc_number,
                                            sample_type: order.sample_type,
                                            pickup_location:
                                              order.pickup_location,
                                            delivery_location:
                                              order.delivery_location,
                                            pickup_time: order.pickup_time,
                                            delivery_time: dayjs().format(
                                              'YYYY-MM-DD HH:mm:ss',
                                            ),
                                            status: 'completed',
                                            distance: order.distance,
                                            vessel_name: order.vessel_name,
                                            tank_number: order.tank_number,
                                            quantity: order.quantity,
                                            unit: order.unit,
                                            status_updates: [
                                              completionUpdate,
                                              ...order.status_updates,
                                            ],
                                          };
                                        setHistoryOrders((prev) => [
                                          completedOrder,
                                          ...prev,
                                        ]);
                                        message.success(
                                          `Order ${order.order_number} completed!`,
                                        );
                                      } else {
                                        // Update progress with status update
                                        const statusUpdateMessage =
                                          order.current_status === 'pickup'
                                            ? `Sample berhasil diambil dari ${order.pickup_location}, menuju ke ${order.delivery_location}`
                                            : `Sample dalam perjalanan menuju ${order.delivery_location}`;

                                        const newStatusUpdate: StatusUpdate = {
                                          id: Date.now().toString(),
                                          timestamp: dayjs().format(
                                            'YYYY-MM-DD HH:mm:ss',
                                          ),
                                          message: statusUpdateMessage,
                                          created_by: 'System',
                                        };

                                        setProgressOrders((prev) =>
                                          prev.map((p) =>
                                            p.id === order.id
                                              ? {
                                                  ...p,
                                                  current_status:
                                                    nextStatus as any,
                                                  progress_percentage:
                                                    nextProgress,
                                                  status_updates: [
                                                    newStatusUpdate,
                                                    ...p.status_updates,
                                                  ],
                                                }
                                              : p,
                                          ),
                                        );
                                        message.success(
                                          `Status updated to ${nextStatus.replace('_', ' ')}`,
                                        );
                                      }
                                    }}
                                    style={{
                                      backgroundColor: '#fa8c16',
                                      borderColor: '#fa8c16',
                                      borderRadius: 6,
                                    }}
                                  >
                                    {order.current_status === 'pickup'
                                      ? 'Start Transit'
                                      : order.current_status === 'in_transit'
                                        ? 'Complete'
                                        : 'Delivered'}
                                  </Button>
                                </Col>
                              </Row>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </div>
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
                  <div style={{ padding: '16px' }}>
                    <Table
                      dataSource={historyOrders}
                      rowKey="id"
                      pagination={{
                        pageSize: 5,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} orders`,
                        pageSizeOptions: ['5', '10', '20'],
                        size: 'small',
                      }}
                      scroll={{ x: 800 }}
                      size="small"
                      style={{
                        borderRadius: 8,
                        overflow: 'hidden',
                      }}
                      rowClassName={(record) =>
                        record.status === 'completed'
                          ? 'completed-row'
                          : 'cancelled-row'
                      }
                      columns={[
                        {
                          title: 'Order Details',
                          key: 'order_details',
                          width: 280,
                          render: (_, record) => (
                            <div>
                              <Space align="center" style={{ marginBottom: 4 }}>
                                <Avatar
                                  icon={
                                    record.status === 'completed' ? (
                                      <CheckCircleOutlined />
                                    ) : (
                                      <ClockCircleOutlined />
                                    )
                                  }
                                  style={{
                                    backgroundColor:
                                      record.status === 'completed'
                                        ? '#52c41a'
                                        : '#ff4d4f',
                                    color: '#fff',
                                  }}
                                  size="small"
                                />
                                <div>
                                  <Text
                                    strong
                                    style={{ fontSize: '13px', color: '#333' }}
                                  >
                                    {record.order_number}
                                  </Text>
                                  <br />
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: '11px' }}
                                  >
                                    {record.npc_number}
                                  </Text>
                                </div>
                              </Space>
                              <div>
                                <Tag
                                  color={getStatusColor(record.status)}
                                  style={{ margin: 0, fontSize: '10px' }}
                                >
                                  {record.status.toUpperCase()}
                                </Tag>
                              </div>
                            </div>
                          ),
                        },
                        {
                          title: 'Sample Type',
                          key: 'sample_type',
                          width: 140,
                          render: (_, record) => (
                            <div>
                              <Text
                                strong
                                style={{ fontSize: '12px', color: '#1890ff' }}
                              >
                                {record.sample_type}
                              </Text>
                              <br />
                              <Text
                                type="secondary"
                                style={{ fontSize: '11px' }}
                              >
                                <TruckOutlined /> {record.distance}
                              </Text>
                            </div>
                          ),
                        },
                        {
                          title: 'Route',
                          key: 'route',
                          width: 320,
                          render: (_, record) => (
                            <div>
                              <Row gutter={[8, 4]}>
                                <Col xs={24} sm={12}>
                                  <div
                                    style={{
                                      background: '#f0f5ff',
                                      padding: '4px 8px',
                                      borderRadius: 4,
                                      border: '1px solid #adc6ff',
                                      marginBottom: 4,
                                    }}
                                  >
                                    <Text
                                      type="secondary"
                                      style={{
                                        fontSize: '9px',
                                        display: 'block',
                                      }}
                                    >
                                      📍 FROM
                                    </Text>
                                    <Tooltip title={record.pickup_location}>
                                      <Text
                                        strong
                                        style={{
                                          fontSize: '10px',
                                          color: '#1890ff',
                                        }}
                                      >
                                        {record.pickup_location.length > 15
                                          ? `${record.pickup_location.substring(0, 15)}...`
                                          : record.pickup_location}
                                      </Text>
                                    </Tooltip>
                                  </div>
                                </Col>
                                <Col xs={24} sm={12}>
                                  <div
                                    style={{
                                      background: '#f6ffed',
                                      padding: '4px 8px',
                                      borderRadius: 4,
                                      border: '1px solid #b7eb8f',
                                    }}
                                  >
                                    <Text
                                      type="secondary"
                                      style={{
                                        fontSize: '9px',
                                        display: 'block',
                                      }}
                                    >
                                      🏥 TO
                                    </Text>
                                    <Tooltip title={record.delivery_location}>
                                      <Text
                                        strong
                                        style={{
                                          fontSize: '10px',
                                          color: '#52c41a',
                                        }}
                                      >
                                        {record.delivery_location.length > 15
                                          ? `${record.delivery_location.substring(0, 15)}...`
                                          : record.delivery_location}
                                      </Text>
                                    </Tooltip>
                                  </div>
                                </Col>
                              </Row>
                            </div>
                          ),
                        },
                        {
                          title: 'Timeline',
                          key: 'timeline',
                          width: 180,
                          render: (_, record) => (
                            <div>
                              <div style={{ marginBottom: 4 }}>
                                <Text
                                  type="secondary"
                                  style={{ fontSize: '9px', display: 'block' }}
                                >
                                  🚚 PICKUP
                                </Text>
                                <Text strong style={{ fontSize: '11px' }}>
                                  {dayjs(record.pickup_time).format(
                                    'DD/MM HH:mm',
                                  )}
                                </Text>
                              </div>
                              <div>
                                <Text
                                  type="secondary"
                                  style={{ fontSize: '9px', display: 'block' }}
                                >
                                  📦 DELIVERY
                                </Text>
                                <Text strong style={{ fontSize: '11px' }}>
                                  {dayjs(record.delivery_time).format(
                                    'DD/MM HH:mm',
                                  )}
                                </Text>
                              </div>
                            </div>
                          ),
                        },
                        {
                          title: 'Action',
                          key: 'action',
                          width: 80,
                          align: 'center',
                          render: (_, record) => (
                            <Tooltip title="View Details">
                              <Button
                                type="text"
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => openHistoryDetail(record)}
                                style={{
                                  color: '#1890ff',
                                  padding: '4px 8px',
                                }}
                              />
                            </Tooltip>
                          ),
                        },
                      ]}
                    />
                  </div>
                ),
              },
            ]}
          />
        </Card>

        {/* Floating Action Button for Mobile Refresh */}
        {isMobile && (
          <FloatButton
            icon={<ReloadOutlined />}
            type="primary"
            style={{
              right: 24,
              bottom: 24,
              backgroundColor: '#1890ff',
            }}
            onClick={handleRefresh}
            tooltip="Refresh Orders"
          />
        )}
      </PageContainer>

      {/* Status Update Modal */}
      <Modal
        title={
          <Space>
            <MessageOutlined style={{ color: '#fa8c16' }} />
            <span>Update Status Order</span>
          </Space>
        }
        open={statusModalVisible}
        onOk={handleAddStatusUpdate}
        onCancel={() => {
          setStatusModalVisible(false);
          setStatusMessage('');
          setSelectedOrder(null);
        }}
        okText="Add Update"
        cancelText="Cancel"
        width={500}
        okButtonProps={{
          disabled: !statusMessage.trim(),
          style: { backgroundColor: '#fa8c16', borderColor: '#fa8c16' },
        }}
      >
        {selectedOrder && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                background: '#f6ffed',
                padding: '12px',
                borderRadius: 8,
                border: '1px solid #b7eb8f',
                marginBottom: 16,
              }}
            >
              <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
                {selectedOrder.order_number}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {selectedOrder.sample_type} • {selectedOrder.npc_number}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Current Status:{' '}
                <Tag color="orange" style={{ fontSize: '10px' }}>
                  {selectedOrder.current_status.replace('_', ' ').toUpperCase()}
                </Tag>
              </Text>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text
                strong
                style={{ fontSize: '13px', display: 'block', marginBottom: 8 }}
              >
                Add Status Update:
              </Text>
              <TextArea
                rows={4}
                placeholder="Contoh: Terjadi kemacetan di Tol Cikampek, estimasi keterlambatan 30 menit..."
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                maxLength={200}
                showCount
                style={{ borderRadius: 6 }}
              />
              <Text
                type="secondary"
                style={{ fontSize: '11px', display: 'block', marginTop: 4 }}
              >
                💡 Berikan informasi yang jelas tentang kondisi pengiriman untuk
                membantu monitoring
              </Text>
            </div>

            {/* Recent Updates Preview */}
            {selectedOrder.status_updates &&
              selectedOrder.status_updates.length > 0 && (
                <div>
                  <Text
                    strong
                    style={{
                      fontSize: '12px',
                      display: 'block',
                      marginBottom: 8,
                    }}
                  >
                    📋 Recent Updates:
                  </Text>
                  <div
                    style={{
                      maxHeight: '150px',
                      overflowY: 'auto',
                      background: '#fafafa',
                      borderRadius: 6,
                      padding: '8px',
                      border: '1px solid #f0f0f0',
                    }}
                  >
                    {selectedOrder.status_updates.slice(0, 3).map((update) => (
                      <div
                        key={update.id}
                        style={{
                          marginBottom: 8,
                          padding: '6px 8px',
                          background: '#ffffff',
                          borderRadius: 4,
                          border: '1px solid #e8f4fd',
                          borderLeft: '3px solid #1890ff',
                        }}
                      >
                        <Text style={{ fontSize: '11px', display: 'block' }}>
                          {update.message}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '9px' }}>
                          {dayjs(update.timestamp).format('DD/MM/YYYY HH:mm')} •{' '}
                          {update.created_by}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </Modal>

      {/* History Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: '#595959' }} />
            <span style={{ color: '#262626', fontWeight: 600 }}>
              Order Details
            </span>
          </Space>
        }
        open={historyDetailVisible}
        onCancel={() => {
          setHistoryDetailVisible(false);
          setSelectedHistoryOrder(null);
        }}
        footer={[
          <Button
            key="close"
            type="default"
            onClick={() => {
              setHistoryDetailVisible(false);
              setSelectedHistoryOrder(null);
            }}
            style={{ borderRadius: 6 }}
          >
            Close
          </Button>,
        ]}
        width={800}
        style={{ top: 20 }}
      >
        {selectedHistoryOrder && (
          <div>
            {/* Order Header */}
            <div
              style={{
                background: '#fafafa',
                padding: '20px',
                borderRadius: 8,
                border: '1px solid #e8e8e8',
                marginBottom: 24,
              }}
            >
              <Row align="middle" justify="space-between">
                <Col xs={18}>
                  <div>
                    <Text
                      strong
                      style={{
                        fontSize: '20px',
                        color: '#262626',
                        display: 'block',
                        marginBottom: 4,
                      }}
                    >
                      {selectedHistoryOrder.order_number}
                    </Text>
                    <Text style={{ fontSize: '14px', color: '#8c8c8c' }}>
                      {selectedHistoryOrder.npc_number}
                    </Text>
                  </div>
                </Col>
                <Col xs={6}>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        borderRadius: 20,
                        background:
                          selectedHistoryOrder.status === 'completed'
                            ? '#f6ffed'
                            : '#fff2f0',
                        border:
                          selectedHistoryOrder.status === 'completed'
                            ? '1px solid #d9f7be'
                            : '1px solid #ffccc7',
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: '12px',
                          color:
                            selectedHistoryOrder.status === 'completed'
                              ? '#52c41a'
                              : '#ff4d4f',
                        }}
                      >
                        {selectedHistoryOrder.status === 'completed'
                          ? 'COMPLETED'
                          : 'CANCELLED'}
                      </Text>
                    </div>
                    <br />
                    <Text style={{ fontSize: '13px', color: '#8c8c8c' }}>
                      Distance: {selectedHistoryOrder.distance}
                    </Text>
                  </div>
                </Col>
              </Row>
            </div>
            {/* Sample Information */}
            <div style={{ marginBottom: 24 }}>
              <Text
                strong
                style={{
                  fontSize: '16px',
                  color: '#262626',
                  display: 'block',
                  marginBottom: 16,
                }}
              >
                Sample Information
              </Text>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e8e8e8',
                  borderRadius: 8,
                  padding: '16px',
                }}
              >
                <Row gutter={[24, 16]}>
                  <Col xs={12} sm={6}>
                    <div>
                      <Text
                        style={{
                          fontSize: '12px',
                          color: '#8c8c8c',
                          display: 'block',
                          marginBottom: 4,
                        }}
                      >
                        Sample Type
                      </Text>
                      <Text
                        strong
                        style={{ fontSize: '14px', color: '#262626' }}
                      >
                        {selectedHistoryOrder.sample_type}
                      </Text>
                    </div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <div>
                      <Text
                        style={{
                          fontSize: '12px',
                          color: '#8c8c8c',
                          display: 'block',
                          marginBottom: 4,
                        }}
                      >
                        Quantity
                      </Text>
                      <Text
                        strong
                        style={{ fontSize: '14px', color: '#262626' }}
                      >
                        {selectedHistoryOrder.quantity || 'N/A'}{' '}
                        {selectedHistoryOrder.unit || ''}
                      </Text>
                    </div>
                  </Col>
                  {selectedHistoryOrder.vessel_name && (
                    <Col xs={12} sm={6}>
                      <div>
                        <Text
                          style={{
                            fontSize: '12px',
                            color: '#8c8c8c',
                            display: 'block',
                            marginBottom: 4,
                          }}
                        >
                          Vessel Name
                        </Text>
                        <Text
                          strong
                          style={{ fontSize: '14px', color: '#262626' }}
                        >
                          {selectedHistoryOrder.vessel_name}
                        </Text>
                      </div>
                    </Col>
                  )}
                  {selectedHistoryOrder.tank_number && (
                    <Col xs={12} sm={6}>
                      <div>
                        <Text
                          style={{
                            fontSize: '12px',
                            color: '#8c8c8c',
                            display: 'block',
                            marginBottom: 4,
                          }}
                        >
                          Tank Number
                        </Text>
                        <Text
                          strong
                          style={{ fontSize: '14px', color: '#262626' }}
                        >
                          {selectedHistoryOrder.tank_number}
                        </Text>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            </div>
            {/* Route Information */}
            <div style={{ marginBottom: 24 }}>
              <Text
                strong
                style={{
                  fontSize: '16px',
                  color: '#262626',
                  display: 'block',
                  marginBottom: 16,
                }}
              >
                Route Information
              </Text>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e8e8e8',
                  borderRadius: 8,
                  padding: '16px',
                }}
              >
                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text
                        style={{
                          fontSize: '12px',
                          color: '#8c8c8c',
                          display: 'block',
                          marginBottom: 4,
                        }}
                      >
                        Pickup Location
                      </Text>
                      <Text
                        style={{
                          fontSize: '14px',
                          color: '#262626',
                          lineHeight: '1.4',
                        }}
                      >
                        {selectedHistoryOrder.pickup_location}
                      </Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text
                        style={{
                          fontSize: '12px',
                          color: '#8c8c8c',
                          display: 'block',
                          marginBottom: 4,
                        }}
                      >
                        Delivery Location
                      </Text>
                      <Text
                        style={{
                          fontSize: '14px',
                          color: '#262626',
                          lineHeight: '1.4',
                        }}
                      >
                        {selectedHistoryOrder.delivery_location}
                      </Text>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
            {/* Timeline Information */}
            <div style={{ marginBottom: 24 }}>
              <Text
                strong
                style={{
                  fontSize: '16px',
                  color: '#262626',
                  display: 'block',
                  marginBottom: 16,
                }}
              >
                Delivery Timeline
              </Text>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e8e8e8',
                  borderRadius: 8,
                  padding: '20px',
                }}
              >
                {(() => {
                  const pickupTime = dayjs(selectedHistoryOrder.pickup_time);
                  const deliveryTime = dayjs(
                    selectedHistoryOrder.delivery_time,
                  );
                  const totalDuration = deliveryTime.diff(pickupTime, 'minute');
                  const hours = Math.floor(totalDuration / 60);
                  const minutes = totalDuration % 60;
                  const durationText =
                    hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

                  return (
                    <>
                      <div style={{ marginBottom: 20 }}>
                        <Row
                          align="middle"
                          justify="space-between"
                          style={{ marginBottom: 8 }}
                        >
                          <Col>
                            <Text
                              style={{ fontSize: '14px', color: '#8c8c8c' }}
                            >
                              Total Duration
                            </Text>
                          </Col>
                          <Col>
                            <Text
                              strong
                              style={{ fontSize: '16px', color: '#262626' }}
                            >
                              {selectedHistoryOrder.status === 'completed'
                                ? durationText
                                : 'Cancelled'}
                            </Text>
                          </Col>
                        </Row>
                        <div
                          style={{
                            height: 1,
                            background: '#e8e8e8',
                            marginBottom: 20,
                          }}
                        ></div>
                      </div>

                      <Timeline
                        items={[
                          {
                            color: '#52c41a',
                            dot: (
                              <div
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  background: '#52c41a',
                                  border: '3px solid #f6ffed',
                                }}
                              />
                            ),
                            children: (
                              <div style={{ paddingBottom: 16 }}>
                                <div style={{ marginBottom: 8 }}>
                                  <Text
                                    strong
                                    style={{
                                      fontSize: '14px',
                                      color: '#262626',
                                      display: 'block',
                                    }}
                                  >
                                    Pickup Started
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: '13px',
                                      color: '#8c8c8c',
                                    }}
                                  >
                                    {pickupTime.format('DD MMM YYYY, HH:mm')}
                                  </Text>
                                </div>
                                <Text
                                  style={{ fontSize: '12px', color: '#595959' }}
                                >
                                  Driver arrived at pickup location
                                </Text>
                              </div>
                            ),
                          },
                          ...(selectedHistoryOrder.status === 'completed'
                            ? [
                                {
                                  color: '#1890ff',
                                  dot: (
                                    <div
                                      style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        background: '#1890ff',
                                        border: '3px solid #e6f7ff',
                                      }}
                                    />
                                  ),
                                  children: (
                                    <div style={{ paddingBottom: 16 }}>
                                      <div style={{ marginBottom: 8 }}>
                                        <Text
                                          strong
                                          style={{
                                            fontSize: '14px',
                                            color: '#262626',
                                            display: 'block',
                                          }}
                                        >
                                          In Transit
                                        </Text>
                                        <Text
                                          style={{
                                            fontSize: '13px',
                                            color: '#8c8c8c',
                                          }}
                                        >
                                          Sample collected, en route to
                                          destination
                                        </Text>
                                      </div>
                                      <Text
                                        style={{
                                          fontSize: '12px',
                                          color: '#595959',
                                        }}
                                      >
                                        Estimated duration based on route:{' '}
                                        {selectedHistoryOrder.distance}
                                      </Text>
                                    </div>
                                  ),
                                },
                                {
                                  color: '#52c41a',
                                  dot: (
                                    <div
                                      style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        background: '#52c41a',
                                        border: '3px solid #f6ffed',
                                      }}
                                    />
                                  ),
                                  children: (
                                    <div>
                                      <div style={{ marginBottom: 8 }}>
                                        <Text
                                          strong
                                          style={{
                                            fontSize: '14px',
                                            color: '#262626',
                                            display: 'block',
                                          }}
                                        >
                                          Delivery Completed
                                        </Text>
                                        <Text
                                          style={{
                                            fontSize: '13px',
                                            color: '#8c8c8c',
                                          }}
                                        >
                                          {deliveryTime.format(
                                            'DD MMM YYYY, HH:mm',
                                          )}
                                        </Text>
                                      </div>
                                      <Text
                                        style={{
                                          fontSize: '12px',
                                          color: '#595959',
                                        }}
                                      >
                                        Sample successfully delivered to
                                        laboratory
                                      </Text>
                                    </div>
                                  ),
                                },
                              ]
                            : [
                                {
                                  color: '#ff4d4f',
                                  dot: (
                                    <div
                                      style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        background: '#ff4d4f',
                                        border: '3px solid #fff2f0',
                                      }}
                                    />
                                  ),
                                  children: (
                                    <div>
                                      <div style={{ marginBottom: 8 }}>
                                        <Text
                                          strong
                                          style={{
                                            fontSize: '14px',
                                            color: '#262626',
                                            display: 'block',
                                          }}
                                        >
                                          Order Cancelled
                                        </Text>
                                        <Text
                                          style={{
                                            fontSize: '13px',
                                            color: '#8c8c8c',
                                          }}
                                        >
                                          {deliveryTime.format(
                                            'DD MMM YYYY, HH:mm',
                                          )}
                                        </Text>
                                      </div>
                                      <Text
                                        style={{
                                          fontSize: '12px',
                                          color: '#595959',
                                        }}
                                      >
                                        Delivery was cancelled due to
                                        operational reasons
                                      </Text>
                                    </div>
                                  ),
                                },
                              ]),
                        ]}
                      />
                    </>
                  );
                })()}
              </div>
            </div>{' '}
            {/* Status Updates */}
            {selectedHistoryOrder.status_updates &&
              selectedHistoryOrder.status_updates.length > 0 && (
                <div>
                  <Text
                    strong
                    style={{
                      fontSize: '16px',
                      color: '#262626',
                      display: 'block',
                      marginBottom: 16,
                    }}
                  >
                    Communication Log
                  </Text>
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e8e8e8',
                      borderRadius: 8,
                      maxHeight: '300px',
                      overflowY: 'auto',
                    }}
                  >
                    {selectedHistoryOrder.status_updates.map(
                      (update, index) => (
                        <div
                          key={update.id}
                          style={{
                            padding: '16px 20px',
                            borderBottom:
                              index <
                              selectedHistoryOrder.status_updates?.length - 1
                                ? '1px solid #f0f0f0'
                                : 'none',
                          }}
                        >
                          <div style={{ marginBottom: 8 }}>
                            <Row align="middle" justify="space-between">
                              <Col>
                                <Text
                                  style={{
                                    fontSize: '13px',
                                    color: '#262626',
                                    lineHeight: '1.5',
                                  }}
                                >
                                  {update.message}
                                </Text>
                              </Col>
                            </Row>
                          </div>
                          <Row align="middle" justify="space-between">
                            <Col>
                              <Text
                                style={{ fontSize: '12px', color: '#8c8c8c' }}
                              >
                                {dayjs(update.timestamp).format(
                                  'DD MMM YYYY, HH:mm:ss',
                                )}
                              </Text>
                            </Col>
                            <Col>
                              <div
                                style={{
                                  display: 'inline-block',
                                  padding: '2px 8px',
                                  borderRadius: 12,
                                  background:
                                    update.created_by === 'Driver'
                                      ? '#f0f0f0'
                                      : '#e6f7ff',
                                  fontSize: '11px',
                                  color:
                                    update.created_by === 'Driver'
                                      ? '#595959'
                                      : '#1890ff',
                                  fontWeight: 500,
                                }}
                              >
                                {update.created_by}
                              </div>
                            </Col>
                          </Row>
                        </div>
                      ),
                    )}
                  </div>
                  <div
                    style={{
                      background: '#fafafa',
                      padding: '12px 20px',
                      borderRadius: '0 0 8px 8px',
                      borderTop: '1px solid #f0f0f0',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: '12px',
                        color: '#8c8c8c',
                        textAlign: 'center',
                        display: 'block',
                      }}
                    >
                      Real-time updates during delivery process
                    </Text>
                  </div>
                </div>
              )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default Shipping;
