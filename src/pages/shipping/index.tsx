import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ExperimentOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  List,
  message,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';

const { Text } = Typography;

interface PendingSampleOrder {
  id: string;
  order_number: string;
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
  reward: number;
}

interface ShippingHistory {
  id: string;
  order_number: string;
  sample_type: string;
  pickup_location: string;
  delivery_location: string;
  pickup_time: string;
  delivery_time: string;
  status: 'completed' | 'cancelled';
  distance: string;
  reward: number;
  rating?: number;
}

const Shipping: React.FC = () => {
  const [pendingOrders, setPendingOrders] = useState<PendingSampleOrder[]>([]);
  const [historyOrders, setHistoryOrders] = useState<ShippingHistory[]>([]);

  // Mock pending orders data
  const mockPendingOrders: PendingSampleOrder[] = [
    {
      id: '1',
      order_number: 'SO-20250829-001',
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
      reward: 150000,
    },
    {
      id: '2',
      order_number: 'RQ-20250829-002',
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
      reward: 200000,
    },
  ];

  // Mock history orders data
  const mockHistoryOrders: ShippingHistory[] = [
    {
      id: '1',
      order_number: 'SO-20250828-015',
      sample_type: 'Soft blended',
      pickup_location: 'Tanjung Priok Port',
      delivery_location: 'LPUJ Laboratory',
      pickup_time: '2025-08-28 09:30',
      delivery_time: '2025-08-28 10:45',
      status: 'completed',
      distance: '15 km',
      reward: 150000,
      rating: 5,
    },
    {
      id: '2',
      order_number: 'RQ-20250827-008',
      sample_type: 'JET-A1',
      pickup_location: 'Anchorage Area A',
      delivery_location: 'Balongan Testing Center',
      pickup_time: '2025-08-27 08:00',
      delivery_time: '2025-08-27 14:30',
      status: 'completed',
      distance: '380 km',
      reward: 800000,
      rating: 4,
    },
    {
      id: '3',
      order_number: 'SO-20250826-012',
      sample_type: 'Avgas',
      pickup_location: 'Private Port',
      delivery_location: 'Lemigas Laboratory',
      pickup_time: '2025-08-26 11:00',
      delivery_time: '2025-08-26 11:00',
      status: 'cancelled',
      distance: '20 km',
      reward: 0,
    },
  ];

  useState(() => {
    setPendingOrders(mockPendingOrders);
    setHistoryOrders(mockHistoryOrders);
  });

  const handleTakeOrder = (order: PendingSampleOrder) => {
    message.success(`Order ${order.order_number} berhasil diambil!`);
    // Move from pending to history
    setPendingOrders((prev) => prev.filter((item) => item.id !== order.id));
    // In real implementation, this would trigger navigation/tracking features
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const shippingSummary = {
    pending: pendingOrders.length,
    todayCompleted: historyOrders.filter(
      (order) =>
        dayjs(order.delivery_time).isSame(dayjs(), 'day') &&
        order.status === 'completed',
    ).length,
    totalEarnings: historyOrders
      .filter((order) => order.status === 'completed')
      .reduce((sum, order) => sum + order.reward, 0),
    averageRating: historyOrders
      .filter((order) => order.rating)
      .reduce(
        (sum, order, _, arr) => sum + (order.rating || 0) / arr.length,
        0,
      ),
  };

  return (
    <PageContainer
      title="Shipping Management"
      content="Take and manage sample delivery orders from ships to laboratories"
    >
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={shippingSummary.pending}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Completed Today"
              value={shippingSummary.todayCompleted}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Earnings"
              value={formatCurrency(shippingSummary.totalEarnings)}
              prefix={<CarOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Average Rating"
              value={shippingSummary.averageRating.toFixed(1)}
              prefix={<UserOutlined style={{ color: '#fd0017' }} />}
              valueStyle={{ color: '#fd0017' }}
              suffix="⭐"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Section 1: Pending Sample Orders */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: '#faad14' }} />
                Pending Sample Orders
              </Space>
            }
            extra={<Tag color="orange">{pendingOrders.length} Available</Tag>}
          >
            {pendingOrders.length === 0 ? (
              <Empty
                description="No pending orders available"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={pendingOrders}
                renderItem={(order) => (
                  <List.Item
                    actions={[
                      <Button
                        key="take"
                        type="primary"
                        size="small"
                        onClick={() => handleTakeOrder(order)}
                        style={{
                          backgroundColor: '#52c41a',
                          borderColor: '#52c41a',
                        }}
                      >
                        Take Order
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={<ExperimentOutlined />}
                          style={{
                            backgroundColor:
                              order.priority === 'urgent'
                                ? '#ff4d4f'
                                : '#1890ff',
                          }}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>{order.order_number}</Text>
                          <Tag color={getOrderTypeColor(order.order_type)}>
                            {order.order_type.toUpperCase()}
                          </Tag>
                          <Tag color={getPriorityColor(order.priority)}>
                            {order.priority.toUpperCase()}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <div style={{ marginBottom: 4 }}>
                            <Text strong>{order.sample_type}</Text> -{' '}
                            {order.vessel_name}
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#666',
                              marginBottom: 4,
                            }}
                          >
                            <EnvironmentOutlined /> {order.pickup_location} →{' '}
                            {order.delivery_location}
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#666',
                              marginBottom: 4,
                            }}
                          >
                            📦 {order.quantity} {order.unit} • 🏃‍♂️{' '}
                            {order.distance} • ⏱️ {order.estimated_delivery_time}
                            h
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#52c41a',
                              fontWeight: 500,
                            }}
                          >
                            💰 {formatCurrency(order.reward)}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Section 2: History Orders */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                Order History
              </Space>
            }
            extra={<Tag color="blue">{historyOrders.length} Total</Tag>}
          >
            <List
              dataSource={historyOrders}
              renderItem={(order) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={
                          order.status === 'completed' ? (
                            <CheckCircleOutlined />
                          ) : (
                            <ClockCircleOutlined />
                          )
                        }
                        style={{
                          backgroundColor:
                            order.status === 'completed'
                              ? '#52c41a'
                              : '#ff4d4f',
                        }}
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{order.order_number}</Text>
                        <Tag color={getStatusColor(order.status)}>
                          {order.status.toUpperCase()}
                        </Tag>
                        {order.rating && (
                          <span style={{ fontSize: '12px' }}>
                            {order.rating}⭐
                          </span>
                        )}
                      </Space>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: 4 }}>
                          <Text strong>{order.sample_type}</Text>
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#666',
                            marginBottom: 4,
                          }}
                        >
                          <EnvironmentOutlined /> {order.pickup_location} →{' '}
                          {order.delivery_location}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#666',
                            marginBottom: 4,
                          }}
                        >
                          📅{' '}
                          {dayjs(order.pickup_time).format('DD/MM/YYYY HH:mm')}{' '}
                          -{' '}
                          {dayjs(order.delivery_time).format(
                            'DD/MM/YYYY HH:mm',
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#666',
                            marginBottom: 4,
                          }}
                        >
                          🏃‍♂️ {order.distance}
                        </div>
                        {order.status === 'completed' && (
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#52c41a',
                              fontWeight: 500,
                            }}
                          >
                            💰 {formatCurrency(order.reward)}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Shipping;
