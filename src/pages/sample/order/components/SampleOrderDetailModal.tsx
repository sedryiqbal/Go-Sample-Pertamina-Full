import { Descriptions, Divider, Modal, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

import type { SampleOrderRecord } from '../types';
import { getPriorityColor, getStatusColor, getStatusLabel } from '../utils';

interface SampleOrderDetailModalProps {
  open: boolean;
  loading: boolean;
  record: SampleOrderRecord | null;
  onClose: () => void;
}

const SampleOrderDetailModal: React.FC<SampleOrderDetailModalProps> = ({
  open,
  loading,
  record,
  onClose,
}) => {
  const createdAtFormatted = record?.created_at
    ? dayjs(record.created_at).format('DD MMM YYYY HH:mm')
    : '-';
  const etaFormatted = record?.estimated_arrival
    ? dayjs(record.estimated_arrival).format('DD MMM YYYY HH:mm')
    : '-';
  const orderDateFormatted = record?.order_date
    ? dayjs(record.order_date).format('DD MMM YYYY')
    : '-';

  return (
    <Modal
      title="Detail Sample Order"
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      destroyOnClose
    >
      <Descriptions
        column={2}
        size="small"
        bordered
        labelStyle={{ width: 160 }}
        contentStyle={{ background: '#fff' }}
        loading={loading}
      >
        <Descriptions.Item label="Order No">
          {record?.order_number ?? '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Nomor NPC">
          {record?.npc_number ?? '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Order Type">
          <Tag color={record?.order_type === 'ready' ? 'green' : 'blue'}>
            {record?.order_type === 'ready' ? 'Ready' : 'Request'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          {record && (
            <Tag color={getStatusColor(record.status)}>
              {getStatusLabel(record.status)}
            </Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Priority">
          {record && (
            <Tag color={getPriorityColor(record.priority)}>
              {record.priority.toUpperCase()}
            </Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Tanggal Order">
          {orderDateFormatted}
        </Descriptions.Item>
        <Descriptions.Item label="Estimasi Kedatangan">
          {etaFormatted}
        </Descriptions.Item>
        <Descriptions.Item label="Dibuat Pada">
          {createdAtFormatted}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions
        title="Detail Sample"
        column={2}
        size="small"
        bordered
        labelStyle={{ width: 160 }}
        contentStyle={{ background: '#fff' }}
        loading={loading}
      >
        <Descriptions.Item label="Jenis Product">
          {record?.sample_type ?? '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Kapal">
          {record?.vessel_name ?? '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Nomor Tangki">
          {record?.tank_number ?? '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Quantity">
          {record ? `${record.quantity} ${record.unit}` : '-'}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions
        title="Detail Lab & Category"
        column={2}
        size="small"
        bordered
        labelStyle={{ width: 160 }}
        contentStyle={{ background: '#fff' }}
        loading={loading}
      >
        <Descriptions.Item label="Laboratorium">
          {record?.lab_location ?? '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Category Test">
          {record?.category_test ?? '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Catatan">
          {record?.notes ?? '-'}
        </Descriptions.Item>
      </Descriptions>

      {record?.photo_sample || record?.memo_file ? (
        <>
          <Divider />
          <Descriptions
            title="Dokumen"
            column={1}
            size="small"
            bordered
            labelStyle={{ width: 160 }}
            contentStyle={{ background: '#fff' }}
            loading={loading}
          >
            {record?.photo_sample ? (
              <Descriptions.Item label="Photo Sample">
                <a href={record.photo_sample} target="_blank" rel="noreferrer">
                  {record.photo_sample}
                </a>
              </Descriptions.Item>
            ) : null}
            {record?.memo_file ? (
              <Descriptions.Item label="Memo File">
                <a href={record.memo_file} target="_blank" rel="noreferrer">
                  {record.memo_file}
                </a>
              </Descriptions.Item>
            ) : null}
          </Descriptions>
        </>
      ) : null}

      {/* {record?.raw?.sample && (
        <>
          <Divider />
          <Descriptions
            title="Informasi Sample Estimasi"
            column={2}
            size="small"
            bordered
            labelStyle={{ width: 160 }}
            contentStyle={{ background: '#fff' }}
            loading={loading}
          >
            <Descriptions.Item label="Ship Name">
              {(record.raw.sample?.shipName as string) ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Product">
              {(record.raw.sample?.typeLoadName as string) ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Nomor Tangki">
              {(record.raw.sample?.nomorTanki as string | number) ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Quantity">
              {record.raw.sample?.qty && record.raw.sample?.satuanName
                ? `${record.raw.sample.qty} ${record.raw.sample.satuanName}`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Space>
                <Tag>{(record.raw.sample?.status as string) ?? '-'}</Tag>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </>
      )} */}
    </Modal>
  );
};

export default SampleOrderDetailModal;
