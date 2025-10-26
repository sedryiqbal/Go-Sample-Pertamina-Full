import { DatabaseOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Statistic, Tag } from 'antd';
import React from 'react';
import type { StadisData } from '@/components/StadisManagement';

interface Props {
  stadis: StadisData;
  onEdit: (stadis: StadisData) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal':
      return '#52c41a';
    case 'low':
      return '#faad14';
    case 'urgent':
      return '#ff4d4f';
    case 'full':
      return '#1890ff';
    default:
      return '#d9d9d9';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'normal':
      return 'Normal';
    case 'low':
      return 'Stock Rendah';
    case 'urgent':
      return 'Urgent';
    case 'full':
      return 'Penuh';
    default:
      return 'Tidak Diketahui';
  }
};

const getStockPercentage = (stadis: StadisData) =>
  Math.round((stadis.current_stock / stadis.max_capacity) * 100);

export const StadisStockCard: React.FC<Props> = ({ stadis, onEdit }) => (
  <Card
    title={
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <DatabaseOutlined style={{ color: '#fd0017' }} />
        <span>Stadis Stock - {stadis.location}</span>
      </div>
    }
    extra={
      <Button
        type="primary"
        size="small"
        icon={<EditOutlined />}
        onClick={() => onEdit(stadis)}
        style={{
          backgroundColor: '#fd0017',
          borderColor: '#fd0017',
          boxShadow: 'none',
        }}
      >
        Kelola Stock
      </Button>
    }
    style={{
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #f0f0f0',
    }}
  >
    <Row gutter={[16, 16]} align="middle">
      <Col span={24}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <Statistic
            title=""
            value={stadis.current_stock}
            suffix={`/ ${stadis.max_capacity} unit`}
            valueStyle={{
              color: getStatusColor(stadis.status),
              fontSize: '28px',
              fontWeight: 'bold',
            }}
          />
          <div
            style={{
              marginTop: '8px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#666',
            }}
          >
            {getStockPercentage(stadis)}% dari kapasitas
          </div>
        </div>
      </Col>

      <Col span={24}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            backgroundColor: '#fafafa',
            borderRadius: '6px',
            border: '1px solid #f0f0f0',
          }}
        >
          <div>
            <div
              style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}
            >
              Status Stock
            </div>
            <Tag
              style={{
                backgroundColor: getStatusColor(stadis.status),
                color: '#fff',
                border: 'none',
                fontWeight: '500',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              {getStatusText(stadis.status)}
            </Tag>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}
            >
              Batas Minimum
            </div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
              {stadis.min_threshold} unit
            </div>
          </div>
        </div>
      </Col>

      <Col span={24}>
        <div
          style={{
            fontSize: '11px',
            color: '#999',
            textAlign: 'center',
            borderTop: '1px solid #f0f0f0',
            paddingTop: '8px',
            marginTop: '8px',
          }}
        >
          Terakhir diperbarui:{' '}
          {new Date(stadis.last_updated).toLocaleString('id-ID')}
        </div>
      </Col>
    </Row>
  </Card>
);

export default StadisStockCard;
