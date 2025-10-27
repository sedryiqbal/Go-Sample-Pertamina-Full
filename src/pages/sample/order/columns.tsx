import { EditOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import React from 'react';
import type { SampleOrderRecord } from './types';
import {
  getPriorityColor,
  getSampleStatusColor,
  getSampleStatusLabel,
  getStatusColor,
  getStatusLabel,
} from './utils';

interface ColumnFactoryParams {
  onEdit: (record: SampleOrderRecord) => void;
}

export const getOrderColumns = ({
  onEdit,
}: ColumnFactoryParams): ProColumns<SampleOrderRecord>[] => [
  {
    title: 'No. Order',
    dataIndex: 'order_number',
    key: 'order_number',
    render: (_, record) => (
      <Space direction="vertical" size={0}>
        <span style={{ fontWeight: 500 }}>{record.order_number}</span>
        <span style={{ fontSize: '12px', color: '#666' }}>
          {record.npc_number}
        </span>
        <Tag color={record.order_type === 'ready' ? 'green' : 'blue'}>
          {record.order_type === 'ready' ? 'Ready' : 'Request'}
        </Tag>
      </Space>
    ),
  },
  {
    title: 'Tanggal Order',
    dataIndex: 'order_date',
    key: 'order_date',
    valueType: 'date',
    sorter: true,
  },
  {
    title: 'Detail Sample',
    dataIndex: 'sample_type',
    key: 'sample_type',
    render: (_, record) => (
      <div>
        <div style={{ fontWeight: 500 }}>{record.sample_type}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {record.vessel_name} • {record.tank_number}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {record.quantity} {record.unit}
        </div>
        {record.category && (
          <Tag
            color={
              record.category === 'import'
                ? 'blue'
                : record.category === 'local'
                  ? 'green'
                  : 'purple'
            }
          >
            {record.category}
          </Tag>
        )}
      </div>
    ),
  },
  {
    title: 'Category Test',
    dataIndex: 'category_test',
    key: 'category_test',
  },
  {
    title: 'Lab Tujuan',
    dataIndex: 'lab_location',
    key: 'lab_location',
    render: (_, record) => (
      <Space direction="vertical" size={0}>
        <span>{record.lab_location}</span>
        <span style={{ fontSize: '12px', color: '#666' }}>
          Est. {record.estimated_delivery_time} jam
        </span>
      </Space>
    ),
  },
  {
    title: 'Priority',
    dataIndex: 'priority',
    key: 'priority',
    render: (_, record) => (
      <Tag color={getPriorityColor(record.priority)}>
        {record.priority.toUpperCase()}
      </Tag>
    ),
    filters: [
      { text: 'Normal', value: 'normal' },
      { text: 'Urgent', value: 'urgent' },
    ],
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (_, record) => (
      <Tag color={getStatusColor(record.status)}>
        {getStatusLabel(record.status)}
      </Tag>
    ),
    filters: [
      { text: 'Pending', value: 'pending' },
      { text: 'Dikonfirmasi', value: 'confirmed' },
      { text: 'Diambil', value: 'picked_up' },
      { text: 'Dalam Perjalanan', value: 'in_transit' },
      { text: 'Terkirim', value: 'delivered' },
      { text: 'Dibatalkan', value: 'cancelled' },
    ],
  },
  {
    title: 'Aksi',
    key: 'actions',
    width: 120,
    render: (_, record) => (
      <Space>
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => onEdit(record)}
        >
          Edit
        </Button>
      </Space>
    ),
  },
];
