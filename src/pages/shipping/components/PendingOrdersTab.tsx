import {
  BoxPlotOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  TruckOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React from 'react';

import { getOrderTypeColor, getPriorityColor } from '../helpers';
import type { PendingSampleOrder } from '../types';

const { Text } = Typography;

const cardStyles = {
  pendingCard: {
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
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

type PendingActionType = 'take' | 'transit' | 'complete';

interface PendingOrdersTabProps {
  orders: PendingSampleOrder[];
  actionOrderId: string | null;
  onActionOrder: (order: PendingSampleOrder, action: PendingActionType) => void;
}

const PendingOrdersTab: React.FC<PendingOrdersTabProps> = ({
  orders,
  actionOrderId,
  onActionOrder,
}) => {
  if (orders.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <Empty
          description="No pending orders available"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '40px 0' }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={[16, 16]}>
        {orders.map((order) => {
          const etaDisplay = order.estimated_arrival_time
            ? dayjs(order.estimated_arrival_time).format('DD MMM YYYY HH:mm')
            : '-';
          const createdAtDisplay = dayjs(order.created_at).isValid()
            ? dayjs(order.created_at).format('DD MMM YYYY HH:mm')
            : '-';
          const rawNotes =
            typeof order.notes === 'string'
              ? order.notes
              : order.notes != null
                ? String(order.notes)
                : '';
          const notesDisplay = rawNotes.trim() ? rawNotes.trim() : '-';

          const statusCode = Number(order.status_code ?? 0);
          const actionMeta: { label: string; action: PendingActionType } =
            statusCode === 1
              ? { label: 'In Transit', action: 'transit' }
              : statusCode === 2
                ? { label: 'Completed', action: 'complete' }
                : { label: 'Take Order', action: 'take' };

          return (
            <Col xs={24} sm={12} key={order.id}>
              <Card
                size="small"
                hoverable
                className={`pending-order-card ${
                  order.priority === 'urgent' ? 'urgent-pulse' : ''
                }`}
                style={{
                  height: '100%',
                  ...cardStyles.pendingCard,
                  ...(order.priority === 'urgent'
                    ? cardStyles.urgentCard
                    : cardStyles.normalCard),
                }}
                bodyStyle={{ padding: 16 }}
              >
                <div style={{ marginBottom: 12 }}>
                  <Row align="middle" justify="space-between" gutter={[8, 8]}>
                    <Col xs={16} sm={18}>
                      <Space align="center">
                        <Badge dot={order.priority === 'urgent'} color="red">
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
                              style={{ fontSize: 16, color: '#333' }}
                            >
                              {order.order_number}
                            </Text>
                          </Space>
                          <br />
                          <Space size={4} wrap>
                            <Tag
                              color={getOrderTypeColor(order.order_type)}
                              style={{ margin: 0, fontSize: 11 }}
                            >
                              {order.order_type.toUpperCase()}
                            </Tag>
                            <Tag
                              color={getPriorityColor(order.priority)}
                              style={{ margin: 0, fontSize: 11 }}
                            >
                              {order.priority.toUpperCase()}
                            </Tag>
                          </Space>
                        </div>
                      </Space>
                    </Col>
                    <Col xs={8} sm={6}>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong style={{ fontSize: 12, color: '#1890ff' }}>
                          {order.npc_number}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <CalendarOutlined /> {createdAtDisplay}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ fontSize: 15, color: '#1890ff' }}>
                    {order.sample_type}
                  </Text>
                  <Text style={{ marginLeft: 8, color: '#666' }}>
                    • {order.vessel_name}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    <BoxPlotOutlined /> {order.tank_number} • {order.quantity}{' '}
                    {order.unit}
                  </Text>
                </div>

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
                          style={{ fontSize: 11, display: 'block' }}
                        >
                          📍 PICKUP
                        </Text>
                        <Text strong style={{ fontSize: 12, color: '#52c41a' }}>
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
                          style={{ fontSize: 11, display: 'block' }}
                        >
                          🏥 DELIVERY
                        </Text>
                        <Text strong style={{ fontSize: 12, color: '#1890ff' }}>
                          {order.delivery_location}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </div>

                <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
                  <Col xs={24} sm={12}>
                    <div
                      className="shipping-metrics"
                      style={{
                        padding: '10px 12px',
                        background: '#f9f5ff',
                        borderRadius: 6,
                        border: '1px solid #d3adf7',
                        height: '100%',
                      }}
                    >
                      <Space align="start" size={12}>
                        <ClockCircleOutlined
                          style={{
                            fontSize: 20,
                            color: '#722ed1',
                            marginTop: 2,
                          }}
                        />
                        <div>
                          <Text
                            strong
                            style={{ fontSize: 12, color: '#2f54eb' }}
                          >
                            {etaDisplay}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 10 }}>
                            Est. Arrival
                          </Text>
                        </div>
                      </Space>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div
                      className="shipping-metrics"
                      style={{
                        padding: '10px 12px',
                        background: '#f0f5ff',
                        borderRadius: 6,
                        border: '1px solid #adc6ff',
                        height: '100%',
                      }}
                    >
                      <Space align="start" size={12} style={{ width: '100%' }}>
                        <FileTextOutlined
                          style={{
                            fontSize: 20,
                            color: '#13c2c2',
                            marginTop: 2,
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <Text
                            strong
                            style={{
                              fontSize: 12,
                              color: '#08979c',
                              display: 'block',
                            }}
                            ellipsis={
                              notesDisplay !== '-'
                                ? { tooltip: notesDisplay }
                                : undefined
                            }
                          >
                            {notesDisplay}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 10 }}>
                            Notes
                          </Text>
                        </div>
                      </Space>
                    </div>
                  </Col>
                </Row>

                <Button
                  type="primary"
                  block
                  size="large"
                  loading={actionOrderId === order.id}
                  onClick={() => onActionOrder(order, actionMeta.action)}
                  style={{
                    backgroundColor: '#52c41a',
                    borderColor: '#52c41a',
                    borderRadius: 8,
                    height: 44,
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                  icon={
                    actionMeta.action === 'take' && !actionOrderId ? (
                      <TruckOutlined />
                    ) : undefined
                  }
                >
                  {actionOrderId === order.id
                    ? 'Processing...'
                    : actionMeta.label}
                </Button>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default PendingOrdersTab;
