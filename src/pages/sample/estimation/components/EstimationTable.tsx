import {
  DatabaseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Input, Select, Space, Tag } from 'antd';
import type { SelectProps } from 'antd';
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
    sampleId?: number | string;
    shipId?: number | string;
    receivedRange?: [unknown, unknown];
  }) => Promise<{
    data: SampleEstimationRecord[];
    success: boolean;
    total: number;
  }>;
  onDetail: (record: SampleEstimationRecord) => void;
  onEdit: (record: SampleEstimationRecord) => void;
  onDelete: (record: SampleEstimationRecord) => void;
  productOptions?: SelectProps['options'];
  shipOptions?: SelectProps['options'];
  dropdownLoading?: boolean;
}

const buildColumns = ({
  onDetail,
  onEdit,
  onDelete,
  productOptions,
  shipOptions,
  dropdownLoading,
}: Pick<
  Props,
  | 'onDetail'
  | 'onEdit'
  | 'onDelete'
  | 'productOptions'
  | 'shipOptions'
  | 'dropdownLoading'
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
    title: 'Tanggal Diterima',
    dataIndex: 'receivedRange',
    hideInTable: true,
    valueType: 'dateRange',
    fieldProps: {
      allowClear: true,
      format: 'YYYY-MM-DD',
      placeholder: ['Mulai', 'Selesai'],
      style: { width: '100%' },
    },
  },
  {
    title: 'Jenis Produk',
    dataIndex: 'sampleId',
    hideInTable: true,
    renderFormItem: (_, { type }) => {
      if (type !== 'form') {
        return null;
      }
      return (
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Pilih jenis produk"
          options={productOptions}
          loading={dropdownLoading}
        />
      );
    },
  },
  {
    title: 'Kapal',
    dataIndex: 'shipId',
    hideInTable: true,
    renderFormItem: (_, { type }) => {
      if (type !== 'form') {
        return null;
      }
      return (
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Pilih kapal"
          options={shipOptions}
          loading={dropdownLoading}
        />
      );
    },
  },
  {
    title: 'Jenis Produk',
    dataIndex: 'typeLoadName',
    key: 'typeLoadName',
    hideInSearch: true,
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
    hideInSearch: true,
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
    hideInSearch: true,
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
    hideInSearch: true,
    render: (_, record) =>
      record.etaReceivedAt
        ? dayjs(record.etaReceivedAt).format('DD MMM YYYY HH:mm')
        : '-',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    hideInSearch: true,
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
    hideInSearch: true,
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
  productOptions,
  shipOptions,
  dropdownLoading,
}) => (
  <ProTable<SampleEstimationRecord>
    actionRef={actionRef}
    rowKey="id"
    search={{
      labelWidth: 0,
      collapsed: false,
      collapseRender: false,
      optionRender: ({ searchText, resetText }, { form }) => (
        <Space>
          <Button
            type="primary"
            onClick={() => form?.submit()}
            icon={<SearchOutlined />}
            style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
          >
            {searchText}
          </Button>
          <Button onClick={() => form?.resetFields()}>{resetText}</Button>
        </Space>
      ),
    }}
    columns={buildColumns({
      onDetail,
      onEdit,
      onDelete,
      productOptions,
      shipOptions,
      dropdownLoading,
    })}
    request={request}
    pagination={{
      pageSize: 10,
      showSizeChanger: true,
      showQuickJumper: true,
    }}
    dateFormatter="string"
    headerTitle="Daftar Estimasi Sample"
    // toolBarRender={() => [
    //   <Button key="export" type="default">
    //     Export Excel
    //   </Button>,
    //   <Button key="import" type="default">
    //     Import Excel
    //   </Button>,
    // ]}
  />
);

export default EstimationTable;
