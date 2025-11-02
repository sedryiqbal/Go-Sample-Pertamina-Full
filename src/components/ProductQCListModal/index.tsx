import {
  CalendarOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  FileSearchOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Empty,
  List,
  Modal,
  Popconfirm,
  Space,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import type { ShipTableRecord } from '@/pages/ships/types';
import type { ProductQcRecord } from '@/services/product-qc/api';

const { Text } = Typography;

export interface ProductQCListModalProps {
  open: boolean;
  loading?: boolean;
  ship?: ShipTableRecord | null;
  records: ProductQcRecord[];
  onClose: () => void;
  onSelect: (record: ProductQcRecord) => void;
  onCreateNew?: () => void;
  onDelete?: (record: ProductQcRecord) => void;
  deletingId?: number | string | null;
}

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return value;
  }

  return parsed.format('DD MMM YYYY HH:mm');
};

const ProductQCListModal: React.FC<ProductQCListModalProps> = ({
  open,
  loading,
  ship,
  records,
  onClose,
  onSelect,
  onCreateNew,
  onDelete,
  deletingId,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Space>
          <DatabaseOutlined style={{ color: '#1890ff' }} />
          <span>
            Riwayat Product QC
            {ship?.name ? (
              <Text type="secondary" style={{ marginLeft: 8 }}>
                ({ship.name})
              </Text>
            ) : null}
          </span>
        </Space>
      }
      width={700}
      footer={
        [
          onCreateNew ? (
            <Button
              key="create"
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={onCreateNew}
            >
              Buat Product QC Baru
            </Button>
          ) : null,
          <Button key="close" onClick={onClose}>
            Tutup
          </Button>,
        ].filter(Boolean) as React.ReactNode[]
      }
      destroyOnClose
    >
      {records.length === 0 && !loading ? (
        <Empty
          description="Belum ada Product QC untuk kapal ini"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '48px 0' }}
        />
      ) : (
        <List
          loading={loading}
          dataSource={records}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="detail"
                  type="link"
                  icon={<FileSearchOutlined />}
                  onClick={() => onSelect(item)}
                >
                  Detail
                </Button>,
                onDelete ? (
                  <Popconfirm
                    key="delete"
                    title="Hapus Product QC?"
                    description="Tindakan ini tidak dapat dibatalkan."
                    okText="Hapus"
                    cancelText="Batal"
                    okButtonProps={{
                      danger: true,
                      loading: deletingId === item.id,
                    }}
                    onConfirm={() => onDelete(item)}
                  >
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      loading={deletingId === item.id}
                      disabled={deletingId !== null && deletingId !== item.id}
                    >
                      Hapus
                    </Button>
                  </Popconfirm>
                ) : null,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{ backgroundColor: '#1890ff' }}
                    icon={<DatabaseOutlined />}
                  />
                }
                title={
                  <Space direction="vertical" size={0}>
                    <Text strong>{item.shipName || ship?.name || '-'}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Dibuat pada {formatDateTime(item.createdAt)}
                    </Text>
                  </Space>
                }
                description={
                  <Space size={12} wrap>
                    <Tag icon={<CalendarOutlined />} color="blue">
                      {formatDateTime(item.arrivalDate)}
                    </Tag>
                    <Tag color="green">{item.refineryTerminal || '-'}</Tag>
                    <Tag color="geekblue">{item.gradeOfProduct || '-'}</Tag>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
};

export default ProductQCListModal;
