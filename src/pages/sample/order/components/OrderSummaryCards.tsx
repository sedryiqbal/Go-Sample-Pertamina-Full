import { Card, Col, Row, Statistic } from 'antd';
import React from 'react';

import type { SummaryMetrics } from '../types';

interface OrderSummaryCardsProps {
  summary: SummaryMetrics;
}

const OrderSummaryCards: React.FC<OrderSummaryCardsProps> = ({ summary }) => (
  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
    <Col xs={24} sm={6}>
      <Card>
        <Statistic
          title="Total Orders"
          value={summary.total}
          valueStyle={{ color: '#0073fe' }}
        />
      </Card>
    </Col>
    <Col xs={24} sm={6}>
      <Card>
        <Statistic
          title="Ready Orders"
          value={summary.ready}
          valueStyle={{ color: '#52c41a' }}
        />
      </Card>
    </Col>
    <Col xs={24} sm={6}>
      <Card>
        <Statistic
          title="Request Orders"
          value={summary.request}
          valueStyle={{ color: '#1890ff' }}
        />
      </Card>
    </Col>
    <Col xs={24} sm={6}>
      <Card>
        <Statistic
          title="In Progress"
          value={summary.in_progress}
          valueStyle={{ color: '#faad14' }}
        />
      </Card>
    </Col>
  </Row>
);

export default OrderSummaryCards;
