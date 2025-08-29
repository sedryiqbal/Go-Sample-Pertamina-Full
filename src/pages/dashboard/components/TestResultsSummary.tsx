import { Card, Col, Row, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

interface TestResultsSummaryProps {
  successRate?: number;
  failureRate?: number;
}

const TestResultsSummary: React.FC<TestResultsSummaryProps> = ({
  successRate = 87,
  failureRate = 13,
}) => {
  return (
    <Card title="Total Pengujian Berhasil / Gagal" size="small">
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'inline-block',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `conic-gradient(#52c41a 0% ${successRate}%, #ff4d4f ${successRate}% 100%)`,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'white',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Text strong style={{ fontSize: '20px' }}>
                {successRate}%
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Berhasil
              </Text>
            </div>
          </div>
        </div>
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ color: '#52c41a', fontWeight: 'bold' }}>
              Berhasil: {successRate}%
            </div>
          </Col>
          <Col span={12}>
            <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
              Gagal: {failureRate}%
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default TestResultsSummary;
