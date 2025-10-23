import {
  CalendarOutlined,
  CarOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Descriptions, Divider, Modal, Space, Tag, Typography } from 'antd';
import type { FC } from 'react';
import {
  SHIP_STATUS_BADGE_COLOR,
  SHIP_STATUS_LABEL_MAP,
  SHIP_TYPE_COLOR_MAP,
} from '../constants';
import type { ShipTableRecord } from '../types';
import { formatDateTime, safeText } from '../utils';

interface ShipDetailModalProps {
  open: boolean;
  onClose: () => void;
  ship: ShipTableRecord | null;
}

const getTypeColor = (type?: string | null) =>
  type ? SHIP_TYPE_COLOR_MAP[type] || 'default' : 'default';

const getStatusColor = (status?: string | null) =>
  (status && SHIP_STATUS_BADGE_COLOR[status]) || 'default';

const getStatusLabel = (status?: string | null) =>
  (status && SHIP_STATUS_LABEL_MAP[status]) || safeText(status);

const formatNumber = (value?: number | null) => {
  if (value === null || value === undefined) {
    return '-';
  }

  return value.toLocaleString();
};

const ShipDetailModal: FC<ShipDetailModalProps> = ({ open, onClose, ship }) => {
  if (!ship) {
    return null;
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={onClose}
      okText="Tutup"
      cancelButtonProps={{ style: { display: 'none' } }}
      title={
        <Space>
          <InfoCircleOutlined style={{ color: '#1890ff' }} />
          <span>Detail Kapal</span>
        </Space>
      }
      width={720}
      destroyOnClose
      centered
    >
      <Descriptions
        column={2}
        colon={false}
        labelStyle={{ fontWeight: 500 }}
        contentStyle={{ color: '#1f1f1f' }}
        size="small"
      >
        <Descriptions.Item
          label={
            <Space size={4}>
              <CarOutlined />
              <span>Nama Kapal</span>
            </Space>
          }
          span={2}
        >
          <Space size={8}>
            <Typography.Text strong>{safeText(ship.name)}</Typography.Text>
            <Tag color={getTypeColor(ship.type)}>{safeText(ship.type)}</Tag>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Kode Kapal">
          {safeText(ship.code)}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={getStatusColor(ship.status)}>
            {getStatusLabel(ship.status)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space size={4}>
              <CalendarOutlined />
              <span>Tanggal Kedatangan</span>
            </Space>
          }
        >
          {formatDateTime(ship.arrivalDate ?? undefined)}
        </Descriptions.Item>
        <Descriptions.Item label="Selesai Operasi">
          {formatDateTime(ship.operationCompletionTime ?? undefined)}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space size={4}>
              <EnvironmentOutlined />
              <span>Lokasi Dermaga</span>
            </Space>
          }
        >
          {safeText(ship.portLocation)}
        </Descriptions.Item>
        <Descriptions.Item label="Bendera">
          {safeText(ship.flag)}
        </Descriptions.Item>
        <Descriptions.Item label="Kapasitas (MT)">
          {formatNumber(ship.capacity)}
        </Descriptions.Item>
        <Descriptions.Item label="Maksimal Tanki">
          {formatNumber(ship.maximalTanki)}
        </Descriptions.Item>
        <Descriptions.Item label="Perusahaan">
          {safeText(ship.company)}
        </Descriptions.Item>
        <Descriptions.Item label="Muatan">
          {safeText(ship.cargoType)}
        </Descriptions.Item>
        <Descriptions.Item label="Kapten">
          {safeText(ship.captainName)}
        </Descriptions.Item>
        <Descriptions.Item label="Unit">
          {safeText(ship.unitName)}
        </Descriptions.Item>
        <Descriptions.Item label="Pelabuhan Asal">
          {safeText(ship.originPort)}
        </Descriptions.Item>
        <Descriptions.Item label="Pelabuhan Tujuan">
          {safeText(ship.destinationPort)}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space size={4}>
              <PhoneOutlined />
              <span>Kontak</span>
            </Space>
          }
        >
          <Space direction="vertical" size={0}>
            <Typography.Text>{safeText(ship.contactPerson)}</Typography.Text>
            <Typography.Text type="secondary">
              {safeText(ship.phone)}
            </Typography.Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space size={4}>
              <MailOutlined />
              <span>Email</span>
            </Space>
          }
        >
          {safeText(ship.email)}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions
        column={1}
        colon={false}
        size="small"
        labelStyle={{ fontWeight: 500 }}
        contentStyle={{ color: '#1f1f1f' }}
      >
        <Descriptions.Item
          label={
            <Space size={4}>
              <TeamOutlined />
              <span>Status Transisi Diizinkan</span>
            </Space>
          }
        >
          {ship.allowedStatusTransitions &&
          ship.allowedStatusTransitions.length > 0 ? (
            <Space wrap>
              {ship.allowedStatusTransitions.map((transition) => (
                <Tag key={transition} color={getStatusColor(transition)}>
                  {getStatusLabel(transition)}
                </Tag>
              ))}
            </Space>
          ) : (
            '-'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Catatan">
          <Typography.Paragraph
            style={{ marginBottom: 0 }}
            type={ship.notes ? undefined : 'secondary'}
          >
            {safeText(ship.notes)}
          </Typography.Paragraph>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ShipDetailModal;
