import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Col,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React from 'react';

import { getStatusColor } from '../helpers';
import type { ShippingHistory } from '../types';

const { Text } = Typography;

interface HistoryTabProps {
  orders: ShippingHistory[];
  onViewDetails: (order: ShippingHistory) => void;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  onChangePage: (page: number, pageSize: number) => void;
}

const HistoryTab: React.FC<HistoryTabProps> = ({
  orders,
  onViewDetails,
  pagination,
  onChangePage,
}) => (
  <div style={{ padding: 16 }}>
    <Table
      dataSource={orders}
      rowKey="id"
      pagination={{
        current: pagination.page,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} orders`,
        pageSizeOptions: ['5', '10', '20'],
        size: 'small',
        onChange: (page, pageSize) => onChangePage(page, pageSize),
        onShowSizeChange: (page, pageSize) => onChangePage(page, pageSize),
      }}
      scroll={{ x: 800 }}
      size="small"
      style={{ borderRadius: 8, overflow: 'hidden' }}
      rowClassName={(record) =>
        record.status === 'completed' ? 'completed-row' : 'cancelled-row'
      }
      columns={[
        {
          title: 'Order Details',
          key: 'order_details',
          width: 300,
          render: (_: unknown, record: ShippingHistory) => (
            <div>
              <Space align="start" style={{ width: '100%' }}>
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
                      record.status === 'completed' ? '#52c41a' : '#ff4d4f',
                    color: '#fff',
                  }}
                  size="small"
                />
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: 13, color: '#333' }}>
                    {record.order_number}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {record.npc_number}
                  </Text>
                  <br />
                  <Tag
                    color={getStatusColor(record.status)}
                    style={{
                      marginTop: 4,
                      fontSize: 10,
                      borderRadius: 999,
                      padding: '2px 10px',
                      display: 'inline-block',
                    }}
                  >
                    {record.status.toUpperCase()}
                  </Tag>
                </div>
              </Space>
            </div>
          ),
        },
        {
          title: 'Sample Type',
          key: 'sample_type',
          width: 140,
          render: (_: unknown, record: ShippingHistory) => (
            <div>
              <Text strong style={{ fontSize: 12 }}>
                {record.sample_type}
              </Text>
              {record.vessel_name && (
                <>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    <RocketOutlined /> {record.vessel_name}
                  </Text>
                </>
              )}
              {record.tank_number && (
                <>
                  <br />
                  <Text type="secondary" style={{ fontSize: 10 }}>
                    Tank: {record.tank_number}
                  </Text>
                </>
              )}
            </div>
          ),
        },
        {
          title: 'Quantity',
          key: 'quantity',
          width: 120,
          render: (_: unknown, record: ShippingHistory) =>
            record.quantity ? (
              <div>
                <Text strong style={{ fontSize: 12 }}>
                  {record.quantity} {record.unit}
                </Text>
              </div>
            ) : (
              <Text type="secondary" style={{ fontSize: 11 }}>
                -
              </Text>
            ),
        },
        {
          title: 'Route',
          key: 'route',
          width: 320,
          render: (_: unknown, record: ShippingHistory) => (
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
                      style={{ fontSize: 9, display: 'block' }}
                    >
                      📍 FROM
                    </Text>
                    <Tooltip title={record.pickup_location}>
                      <Text strong style={{ fontSize: 10, color: '#1890ff' }}>
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
                      style={{ fontSize: 9, display: 'block' }}
                    >
                      🏥 TO
                    </Text>
                    <Tooltip title={record.delivery_location}>
                      <Text strong style={{ fontSize: 10, color: '#52c41a' }}>
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
          render: (_: unknown, record: ShippingHistory) => (
            <div>
              <div style={{ marginBottom: 4 }}>
                <Text
                  type="secondary"
                  style={{ fontSize: 9, display: 'block' }}
                >
                  🚚 PICKUP
                </Text>
                <Text strong style={{ fontSize: 11 }}>
                  {record.pickup_time
                    ? dayjs(record.pickup_time).format('DD MMM, HH:mm')
                    : '-'}
                </Text>
              </div>
              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: 9, display: 'block' }}
                >
                  {record.status === 'cancelled'
                    ? '❌ CANCELLED'
                    : '🏁 DELIVERY'}
                </Text>
                <Text strong style={{ fontSize: 11 }}>
                  {record.status === 'cancelled'
                    ? record.canceled_at
                      ? dayjs(record.canceled_at).format('DD MMM, HH:mm')
                      : '-'
                    : record.delivery_time
                      ? dayjs(record.delivery_time).format('DD MMM, HH:mm')
                      : '-'}
                </Text>
              </div>
            </div>
          ),
        },
        {
          title: 'Action',
          key: 'actions',
          width: 80,
          render: (_: unknown, record: ShippingHistory) => (
            <Tooltip title="View Details">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => onViewDetails(record)}
                style={{ color: '#1890ff', padding: '4px 8px' }}
              />
            </Tooltip>
          ),
        },
      ]}
    />
  </div>
);

export default HistoryTab;
