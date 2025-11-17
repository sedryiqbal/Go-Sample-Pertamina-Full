import { MessageOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

import type { ProgressOrder } from '../types';

const { Text } = Typography;
const { TextArea } = Input;

interface StatusUpdateModalProps {
  visible: boolean;
  order: ProgressOrder | null;
  message: string;
  loading?: boolean;
  onChangeMessage: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  visible,
  order,
  message,
  loading = false,
  onChangeMessage,
  onSubmit,
  onCancel,
}) => (
  <Modal
    title={
      <Space>
        <MessageOutlined style={{ color: '#fa8c16' }} />
        <span>Update Status Order</span>
      </Space>
    }
    open={visible}
    onOk={onSubmit}
    onCancel={onCancel}
    okText="Add Update"
    cancelText="Cancel"
    confirmLoading={loading}
    width={500}
    okButtonProps={{
      disabled: !message.trim(),
      style: { backgroundColor: '#fa8c16', borderColor: '#fa8c16' },
    }}
  >
    {order && (
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            background: '#f6ffed',
            padding: 12,
            borderRadius: 8,
            border: '1px solid #b7eb8f',
            marginBottom: 16,
          }}
        >
          <Text strong style={{ color: '#52c41a', fontSize: 14 }}>
            {order.order_number}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {order.sample_type} • {order.npc_number}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Current Status:{' '}
            <Tag color="orange" style={{ fontSize: 10 }}>
              {order.current_status.replace('_', ' ').toUpperCase()}
            </Tag>
          </Text>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text
            strong
            style={{ fontSize: 13, display: 'block', marginBottom: 8 }}
          >
            Add Status Update:
          </Text>
          <TextArea
            rows={4}
            placeholder="Contoh: Terjadi kemacetan di Tol Cikampek, estimasi keterlambatan 30 menit..."
            value={message}
            onChange={(e) => onChangeMessage(e.target.value)}
            maxLength={200}
            showCount
            style={{ borderRadius: 6 }}
          />
          <Text
            type="secondary"
            style={{ fontSize: 11, display: 'block', marginTop: 4 }}
          >
            💡 Berikan informasi yang jelas tentang kondisi pengiriman untuk
            membantu monitoring
          </Text>
        </div>

        {order.status_updates && order.status_updates.length > 0 && (
          <div>
            <Text
              strong
              style={{
                fontSize: 12,
                display: 'block',
                marginBottom: 8,
              }}
            >
              📋 Recent Updates:
            </Text>
            <div
              style={{
                maxHeight: 150,
                overflowY: 'auto',
                background: '#fafafa',
                borderRadius: 6,
                padding: 8,
                border: '1px solid #f0f0f0',
              }}
            >
              {order.status_updates.slice(0, 3).map((update) => (
                <div
                  key={update.id}
                  style={{
                    marginBottom: 8,
                    padding: '6px 8px',
                    background: '#ffffff',
                    borderRadius: 4,
                    border: '1px solid #e8f4fd',
                    borderLeft: '3px solid #1890ff',
                  }}
                >
                  <Text style={{ fontSize: 11, display: 'block' }}>
                    {update.message}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 9 }}>
                    {dayjs(update.timestamp).format('DD/MM/YYYY HH:mm')} •{' '}
                    {update.created_by}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </Modal>
);

export default StatusUpdateModal;
