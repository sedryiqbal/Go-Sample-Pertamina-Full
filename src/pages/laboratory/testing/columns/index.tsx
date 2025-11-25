import { EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { Badge, Space, Tag, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { TestingRecord } from '../types';
import {
  getPriorityColor,
  getProgressColor,
  getStatusColor,
  getStatusLabel,
} from '../utils/helpers';

const { Text } = Typography;

export const getTableColumns = (
  handleView: (record: TestingRecord) => void,
  handleInputTest: (record: TestingRecord) => void,
  handleViewReport: (record: TestingRecord) => void,
  handleConfirmSample: (record: TestingRecord) => void,
  handleStartTesting: (record: TestingRecord) => void,
): ProColumns<TestingRecord>[] => [
  {
    title: 'ID Sampel',
    dataIndex: 'sample_id',
    key: 'sample_id',
    width: 140,
    fixed: 'left',
    search: true,
    render: (_, record: TestingRecord) => (
      <div>
        <div>
          <Text strong>{record.sample_id}</Text>
        </div>
        <div>
          <Tag color={getPriorityColor(record.priority || 'normal')}>
            {(record.priority || '').toUpperCase()}
          </Tag>
        </div>
      </div>
    ),
  },
  {
    title: 'Sample Type',
    dataIndex: 'sample_type',
    key: 'sample_type',
    width: 160,
    search: true,
    render: (_, record: TestingRecord) => (
      <div>
        <div>
          <Text>
            {record.sample?.typeLoadName || record.sample_type || '-'}
          </Text>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.sample?.qty
              ? `${record.sample?.qty} ${record.sample?.satuanName || ''}`
              : '-'}
          </Text>
        </div>
      </div>
    ),
  },
  {
    title: 'Kategori Test',
    dataIndex: 'categoryTestName',
    key: 'categoryTestName',
    width: 160,
    render: (categoryTestName: string | undefined) =>
      categoryTestName ? (
        <Tag color="blue" style={{ fontWeight: 500 }}>
          {categoryTestName}
        </Tag>
      ) : (
        <Text type="secondary">-</Text>
      ),
  },
  {
    title: 'Status',
    dataIndex: 'testing_status',
    key: 'testing_status',
    width: 130,
    filters: [
      { text: 'Diterima', value: 'received' },
      { text: 'Terdaftar', value: 'registered' },
      { text: 'Sedang Diuji', value: 'testing' },
      { text: 'Selesai', value: 'completed' },
      { text: 'Gagal', value: 'failed' },
      { text: 'Pending', value: 'pending' },
      { text: 'Shipped', value: 'shipped' },
    ],
    onFilter: (value, record) => record.status === value,
    render: (_, record: TestingRecord) => (
      <Tag color={getStatusColor(record.status)}>
        {getStatusLabel(record.status)}
      </Tag>
    ),
  },
  {
    title: 'Progress',
    dataIndex: 'progress_percentage',
    key: 'progress_percentage',
    width: 120,
    sorter: (a, b) =>
      (a.progress_percentage || 0) - (b.progress_percentage || 0),
    render: (_, record: TestingRecord) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 60,
            height: 8,
            backgroundColor: '#f0f0f0',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${record.progress_percentage || 0}%`,
              height: '100%',
              backgroundColor: getProgressColor(
                record.progress_percentage || 0,
              ),
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <Text style={{ fontSize: '12px', fontWeight: 'bold' }}>
          {record.progress_percentage || 0}%
        </Text>
      </div>
    ),
  },
  {
    title: 'Tanggal Diterima',
    dataIndex: 'received_date',
    key: 'received_date',
    width: 140,
    sorter: (a, b) =>
      dayjs(a.received_date).unix() - dayjs(b.received_date).unix(),
    render: (_, record: TestingRecord) => (
      <div>
        <div>
          {record.received_date
            ? dayjs(record.received_date).format('DD MMM YYYY')
            : '-'}
        </div>
        <div style={{ fontSize: '12px', color: '#999' }}>
          {record.received_date
            ? dayjs(record.received_date).format('HH:mm')
            : '-'}
        </div>
      </div>
    ),
  },
  {
    title: 'Estimasi Selesai',
    dataIndex: 'estimated_completion',
    key: 'estimated_completion',
    width: 140,
    sorter: (a, b) =>
      dayjs(a.estimated_completion).unix() -
      dayjs(b.estimated_completion).unix(),
    render: (_, record: TestingRecord) => {
      const isOverdue =
        record.estimated_completion &&
        dayjs(record.estimated_completion).isBefore(dayjs());
      return (
        <div>
          <div style={{ color: isOverdue ? '#ff4d4f' : undefined }}>
            {record.estimated_completion
              ? dayjs(record.estimated_completion).format('DD MMM YYYY')
              : '-'}
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.estimated_completion
              ? dayjs(record.estimated_completion).format('HH:mm')
              : '-'}
          </div>
        </div>
      );
    },
  },
  {
    title: 'Aksi',
    key: 'action',
    width: 180,
    fixed: 'right',
    render: (_, record: TestingRecord) => {
      // Get status-specific action button
      const getStatusAction = () => {
        switch (record.status) {
          case 3: // 'received'
            return (
              <button
                type="button"
                onClick={() => handleConfirmSample(record)}
                style={{
                  backgroundColor: '#faad14',
                  borderColor: '#faad14',
                  color: 'white',
                  fontSize: '11px',
                  height: 26,
                  width: '100%',
                  marginBottom: 4,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Konfirmasi Sample
              </button>
            );
          case 4: // 'registered'
            return (
              <button
                type="button"
                onClick={() => handleStartTesting(record)}
                style={{
                  backgroundColor: '#1890ff',
                  borderColor: '#1890ff',
                  color: 'white',
                  fontSize: '11px',
                  height: 26,
                  width: '100%',
                  marginBottom: 4,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Mulai Pengujian
              </button>
            );
          // make case 5 or 6 to 'testing'
          case 5: // 'testing'
          case 6: // 'testing'
            return (
              <button
                type="button"
                onClick={() => handleInputTest(record)}
                style={{
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  color: 'white',
                  fontSize: '11px',
                  height: 26,
                  width: '100%',
                  marginBottom: 4,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Input Hasil
              </button>
            );
          default:
            return null;
        }
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {getStatusAction()}

          {/* Standard Actions */}
          <div style={{ display: 'flex', gap: 2 }}>
            <button
              type="button"
              onClick={() => handleViewReport(record)}
              disabled={(record.progress_percentage || 0) < 75}
              style={{
                fontSize: '11px',
                height: 24,
                flex: 1,
                color:
                  (record.progress_percentage || 0) >= 75
                    ? '#1890ff'
                    : '#d9d9d9',
                borderColor:
                  (record.progress_percentage || 0) >= 75
                    ? '#1890ff'
                    : '#d9d9d9',
                backgroundColor: 'white',
                border: '1px solid',
                borderRadius: '4px',
                cursor:
                  (record.progress_percentage || 0) >= 75
                    ? 'pointer'
                    : 'not-allowed',
              }}
            >
              Report
            </button>
            <button
              type="button"
              onClick={() => handleView(record)}
              style={{
                fontSize: '11px',
                height: 24,
                flex: 1,
                color: '#1890ff',
                borderColor: '#1890ff',
                backgroundColor: 'white',
                border: '1px solid #1890ff',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Detail
            </button>
          </div>
        </div>
      );
    },
  },
];
