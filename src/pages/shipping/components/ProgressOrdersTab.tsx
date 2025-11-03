import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  MessageOutlined,
  PlayCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Space,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React from 'react';

import type { ProgressOrder } from '../types';

const { Text } = Typography;

interface ProgressOrdersTabProps {
  orders: ProgressOrder[];
  onOpenStatusModal: (order: ProgressOrder) => void;
  onAdvanceStatus: (order: ProgressOrder) => void;
}

const getActionLabel = (status: ProgressOrder['current_status']) => {
  if (status === 'pickup') return 'Start Transit';
  if (status === 'in_transit') return 'Complete';
  return 'Delivered';
};

const ProgressOrdersTab: React.FC<ProgressOrdersTabProps> = ({
  orders,
  onOpenStatusModal,
  onAdvanceStatus,
}) => {
  if (orders.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <Empty
          description="No orders in progress"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '40px 0' }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={[16, 16]}>
        {orders.map((order) => (
          <Col xs={24} lg={12} key={order.id}>
            <Card
              size="small"
              hoverable
              style={{
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                background: 'linear-gradient(135deg, #fff7e6 0%, #fff 100%)',
                border: '2px solid #ffa940',
              }}
              bodyStyle={{ padding: 20 }}
              className="progress-order-card"
            >
              <div style={{ marginBottom: 16 }}>
                <Row align="middle" justify="space-between">
                  <Col xs={16}>
                    <Space align="center">
                      <Avatar
                        icon={<RocketOutlined />}
                        style={{ backgroundColor: '#fa8c16', color: '#fff' }}
                        size="large"
                      />
                      <div>
                        <Text strong style={{ fontSize: 16, color: '#333' }}>
                          {order.order_number}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {order.npc_number}
                        </Text>
                      </div>
                    </Space>
                  </Col>
                  <Col xs={8}>
                    <div style={{ textAlign: 'right' }}>
                      <Tag
                        color="orange"
                        style={{ marginBottom: 4, fontSize: 10 }}
                      >
                        {order.current_status.toUpperCase()}
                      </Tag>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        <CalendarOutlined />{' '}
                        {dayjs(order.pickup_time).format('HH:mm')}
                      </Text>
                    </div>
                  </Col>
                </Row>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 13, color: '#fa8c16' }}>
                    Delivery Progress
                  </Text>
                  <Text
                    style={{
                      float: 'right',
                      fontSize: 12,
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
                            <Text strong style={{ fontSize: 11 }}>
                              Pickup Sample
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 10 }}>
                              {order.pickup_location}
                            </Text>
                          </div>
                        ),
                      },
                      {
                        color:
                          order.current_status === 'in_transit'
                            ? '#fa8c16'
                            : order.current_status === 'delivered'
                              ? '#52c41a'
                              : '#d9d9d9',
                        dot:
                          order.current_status === 'in_transit' ? (
                            <LoadingOutlined />
                          ) : order.current_status === 'delivered' ? (
                            <CheckCircleOutlined />
                          ) : (
                            <ClockCircleOutlined />
                          ),
                        children: (
                          <div>
                            <Text strong style={{ fontSize: 11 }}>
                              In Transit
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 10 }}>
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
                          order.current_status === 'delivered' ? (
                            <CheckCircleOutlined />
                          ) : (
                            <ClockCircleOutlined />
                          ),
                        children: (
                          <div>
                            <Text strong style={{ fontSize: 11 }}>
                              Delivered
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 10 }}>
                              {order.delivery_location}
                            </Text>
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              </div>

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
                        style={{ fontSize: 9, display: 'block' }}
                      >
                        SAMPLE TYPE
                      </Text>
                      <Text strong style={{ fontSize: 11, color: '#1890ff' }}>
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
                        style={{ fontSize: 9, display: 'block' }}
                      >
                        QUANTITY
                      </Text>
                      <Text strong style={{ fontSize: 11, color: '#52c41a' }}>
                        {order.quantity} {order.unit}
                      </Text>
                    </div>
                  </Col>
                </Row>
              </div>

              {order.status_updates && order.status_updates.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Text
                    strong
                    style={{
                      fontSize: 12,
                      color: '#666',
                      display: 'block',
                      marginBottom: 8,
                    }}
                  >
                    📢 Status Updates
                  </Text>
                  <div
                    style={{
                      maxHeight: 120,
                      overflowY: 'auto',
                      background: '#fafafa',
                      borderRadius: 6,
                      padding: 8,
                      border: '1px solid #f0f0f0',
                    }}
                  >
                    {order.status_updates.slice(0, 3).map((update, index) => (
                      <div
                        key={update.id}
                        style={{
                          marginBottom:
                            index < Math.min(2, order.status_updates.length - 1)
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
                            fontSize: 11,
                            display: 'block',
                            marginBottom: 2,
                          }}
                        >
                          {update.message}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 9 }}>
                          {dayjs(update.timestamp).format('DD/MM HH:mm')} •{' '}
                          {update.created_by}
                        </Text>
                      </div>
                    ))}
                    {order.status_updates.length > 3 && (
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 10,
                          display: 'block',
                          textAlign: 'center',
                          marginTop: 4,
                        }}
                      >
                        +{order.status_updates.length - 3} more updates
                      </Text>
                    )}
                  </div>
                </div>
              )}

              <Row gutter={[8, 8]}>
                <Col xs={12}>
                  <Button
                    type="default"
                    block
                    size="small"
                    icon={<MessageOutlined />}
                    onClick={() => onOpenStatusModal(order)}
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
                    onClick={() => onAdvanceStatus(order)}
                    style={{
                      backgroundColor: '#fa8c16',
                      borderColor: '#fa8c16',
                      borderRadius: 6,
                    }}
                  >
                    {getActionLabel(order.current_status)}
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProgressOrdersTab;
