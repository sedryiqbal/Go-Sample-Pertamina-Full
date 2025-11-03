import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Statistic } from 'antd';
import React from 'react';

import type { ShippingSummary } from '../types';

interface SummaryCardsProps {
  data: ShippingSummary;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => (
  <Row
    gutter={[16, 16]}
    style={{ marginBottom: 24 }}
    className="shipping-summary"
  >
    <Col xs={24} sm={6}>
      <Card className="shipping-card">
        <Statistic
          title="Pending Orders"
          value={data.pending}
          prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
          valueStyle={{ color: '#faad14' }}
        />
      </Card>
    </Col>
    <Col xs={24} sm={6}>
      <Card className="shipping-card">
        <Statistic
          title="In Progress"
          value={data.inProgress}
          prefix={<RocketOutlined style={{ color: '#fa8c16' }} />}
          valueStyle={{ color: '#fa8c16' }}
        />
      </Card>
    </Col>
    <Col xs={24} sm={6}>
      <Card className="shipping-card">
        <Statistic
          title="Total Deliveries"
          value={data.totalDeliveries}
          prefix={<CarOutlined style={{ color: '#1890ff' }} />}
          valueStyle={{ color: '#1890ff' }}
        />
      </Card>
    </Col>
    <Col xs={24} sm={6}>
      <Card className="shipping-card">
        <Statistic
          title="Success Rate"
          value={data.successRate.toFixed(1)}
          prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          valueStyle={{ color: '#52c41a' }}
          suffix="%"
        />
      </Card>
    </Col>
  </Row>
);

export default SummaryCards;
