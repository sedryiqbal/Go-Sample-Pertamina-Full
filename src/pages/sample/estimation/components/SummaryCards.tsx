import { DatabaseOutlined, WarningOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic } from 'antd';
import React from 'react';
import type { SummaryResult } from '../utils';

interface Props {
  summary: SummaryResult;
}

export const SummaryCards: React.FC<Props> = ({ summary }) => (
  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
    <Col xs={24} sm={6}>
      <Card>
        <Statistic
          title="Total Sample"
          value={summary.total}
          prefix={<DatabaseOutlined style={{ color: '#0073fe' }} />}
          valueStyle={{ color: '#0073fe' }}
        />
      </Card>
    </Col>
    <Col xs={24} sm={6}>
      <Card>
        <Statistic
          title="Tersedia"
          value={summary.available}
          prefix={<DatabaseOutlined style={{ color: '#9fe400' }} />}
          valueStyle={{ color: '#9fe400' }}
        />
      </Card>
    </Col>
    <Col xs={24} sm={6}>
      <Card>
        <Statistic
          title="Terbatas"
          value={summary.low}
          prefix={<WarningOutlined style={{ color: '#faad14' }} />}
          valueStyle={{ color: '#faad14' }}
        />
      </Card>
    </Col>
    <Col xs={24} sm={6}>
      <Card>
        <Statistic
          title="Urgent"
          value={summary.urgent}
          prefix={<WarningOutlined style={{ color: '#fd0017' }} />}
          valueStyle={{ color: '#fd0017' }}
        />
      </Card>
    </Col>
  </Row>
);

export default SummaryCards;
