import { Button, Descriptions, Modal, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { SampleEstimationRecord } from '@/services/sample-estimations/typings';
import { getStatusColor, getStatusLabel } from '../utils';

interface Props {
  open: boolean;
  record: SampleEstimationRecord | null;
  onClose: () => void;
}

export const EstimationDetailModal: React.FC<Props> = ({
  open,
  record,
  onClose,
}) => (
  <Modal
    centered
    open={open}
    onCancel={onClose}
    footer={[
      <Button
        key="close"
        type="primary"
        onClick={onClose}
        style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
      >
        Tutup
      </Button>,
    ]}
    title="Detail Estimasi Sample"
    width={520}
    destroyOnClose
    maskClosable={false}
  >
    {record ? (
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            background: '#f7f9fc',
            border: '1px solid #e6f0ff',
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#1f1f1f',
              marginBottom: 8,
            }}
          >
            {record.typeLoadName ?? 'Jenis produk tidak tersedia'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ color: '#595959' }}>
              {record.shipName ?? 'Nama kapal tidak tersedia'}
              {record.shipKode ? ` · ${record.shipKode}` : ''}
            </span>
            <span style={{ color: '#8c8c8c', fontSize: 12 }}>
              {record.tankiName ??
                (record.nomorTanki
                  ? `Tangki ${record.nomorTanki}`
                  : 'Nomor tangki belum ditentukan')}
            </span>
          </div>
          <div style={{ marginTop: 12 }}>
            <Tag color={getStatusColor(record.status)}>
              {getStatusLabel(record.status)}
            </Tag>
          </div>
        </div>

        <Descriptions
          column={1}
          size="small"
          colon={false}
          labelStyle={{ width: 160, color: '#8c8c8c', fontWeight: 500 }}
          contentStyle={{ color: '#262626' }}
        >
          <Descriptions.Item label="Kuantitas">
            {typeof record.qty === 'number' ? record.qty : '-'}
            {record.satuanName ? ` ${record.satuanName}` : ''}
          </Descriptions.Item>
          <Descriptions.Item label="Estimasi Diterima">
            {record.etaReceivedAt
              ? dayjs(record.etaReceivedAt).format('DD MMM YYYY HH:mm')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Lokasi / Unit">
            {record.lokasi ?? record.unitName ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Detail Sample">
            {record.detailSample ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Catatan">
            {record.note && record.note.trim()
              ? record.note
              : 'Tidak ada catatan'}
          </Descriptions.Item>
          <Descriptions.Item label="Dibuat Pada">
            {record.createdAt
              ? dayjs(record.createdAt).format('DD MMM YYYY HH:mm')
              : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Space>
    ) : null}
  </Modal>
);

export default EstimationDetailModal;
