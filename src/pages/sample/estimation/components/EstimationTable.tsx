import {
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Input, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { SampleEstimationRecord } from '@/services/sample-estimations/typings';
import { getStatusColor, getStatusLabel } from '../utils';

interface Props {
  actionRef: React.MutableRefObject<ActionType | null>;
  request: (params: {
    current?: number;
    pageSize?: number;
    search?: string;
  }) => Promise<{
    data: SampleEstimationRecord[];
    success: boolean;
    total: number;
  }>;
  onDetail: (record: SampleEstimationRecord) => void;
  onEdit: (record: SampleEstimationRecord) => void;
  onDelete: (record: SampleEstimationRecord) => void;
}

const buildColumns = ({
  onDetail,
  onEdit,
  onDelete,
}: Pick<
  Props,
  'onDetail' | 'onEdit' | 'onDelete'
>): ProColumns<SampleEstimationRecord>[] => [
  {
    title: 'Cari Data',
    dataIndex: 'search',
    hideInTable: true,
    renderFormItem: (_, { type }) => {
      if (type === 'form') {
        return (
          <Input
            allowClear
            placeholder="Cari jenis produk, kapal, atau nomor tangki"
          />
        );
      }
      return null;
    },
  },
  {
    title: 'Jenis Produk',
    dataIndex: 'typeLoadName',
    key: 'typeLoadName',
    render: (_, record) => (
      <Space>
        <DatabaseOutlined style={{ color: '#fd0017' }} />
        <span style={{ fontWeight: 500 }}>{record.typeLoadName ?? '-'}</span>
      </Space>
    ),
  },
  {
    title: 'Kapal / Tangki',
    dataIndex: 'shipName',
    key: 'shipName',
    render: (_, record) => (
      <div>
        <div style={{ fontWeight: 500 }}>
          {record.shipName ?? '-'}
          {record.shipKode ? ` (${record.shipKode})` : ''}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {record.tankiName ??
            (record.nomorTanki
              ? `Tangki ${record.nomorTanki}`
              : 'Nomor tangki belum ditentukan')}
        </div>
      </div>
    ),
  },
  {
    title: 'Kuantitas',
    dataIndex: 'qty',
    key: 'qty',
    render: (_, record) => (
      <span>
        {typeof record.qty === 'number' ? record.qty : '-'}
        {record.satuanName ? ` ${record.satuanName}` : ''}
      </span>
    ),
  },
  {
    title: 'Estimasi Diterima',
    dataIndex: 'etaReceivedAt',
    key: 'etaReceivedAt',
    valueType: 'dateTime',
    render: (_, record) =>
      record.etaReceivedAt
        ? dayjs(record.etaReceivedAt).format('DD MMM YYYY HH:mm')
        : '-',
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
  },
  {
    title: 'Lokasi',
    dataIndex: 'lokasi',
    key: 'lokasi',
    render: (_, record) => (
      <Space>{record.lokasi ?? record.unitName ?? '-'}</Space>
    ),
  },
  {
    title: 'Catatan',
    dataIndex: 'note',
    key: 'note',
    ellipsis: true,
    hideInSearch: true,
    render: (_, record) => record.note ?? '-',
  },
  {
    title: 'Aksi',
    key: 'actions',
    width: 220,
    valueType: 'option',
    render: (_, record) => (
      <Space size="small" wrap>
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onDetail(record)}
        >
          Detail
        </Button>
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => onEdit(record)}
        >
          Edit
        </Button>
        <Button
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(record)}
        >
          Hapus
        </Button>
      </Space>
    ),
  },
];

export const EstimationTable: React.FC<Props> = ({
  actionRef,
  request,
  onDetail,
  onEdit,
  onDelete,
}) => (
  <ProTable<SampleEstimationRecord>
    actionRef={actionRef}
    rowKey="id"
    search={{
      labelWidth: 'auto',
    }}
    columns={buildColumns({ onDetail, onEdit, onDelete })}
    request={request}
    pagination={{
      pageSize: 10,
      showSizeChanger: true,
      showQuickJumper: true,
    }}
    dateFormatter="string"
    headerTitle="Daftar Estimasi Sample"
    toolBarRender={() => [
      <Button key="export" type="default">
        Export Excel
      </Button>,
      <Button key="import" type="default">
        Import Excel
      </Button>,
    ]}
  />
);

export default EstimationTable;
