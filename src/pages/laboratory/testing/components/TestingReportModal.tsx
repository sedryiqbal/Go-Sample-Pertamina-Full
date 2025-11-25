import {
  CheckCircleOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { Card, Col, Divider, Modal, Row, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { TEST_PARAMETERS } from '../constants/testParameters';
import type { TestingRecord } from '../types';

const { Title, Text } = Typography;

interface TestingReportModalProps {
  visible: boolean;
  record: TestingRecord | null;
  onClose: () => void;
}

const TestingReportModal: React.FC<TestingReportModalProps> = ({
  visible,
  record,
  onClose,
}) => {
  if (!record) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'fail':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <MinusCircleOutlined style={{ color: '#999' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return '#52c41a';
      case 'fail':
        return '#ff4d4f';
      default:
        return '#999';
    }
  };

  const reportColumns = [
    {
      title: 'Property',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: any) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.method}
          </Text>
        </div>
      ),
    },
    {
      title: 'Standar',
      dataIndex: 'standard',
      key: 'standard',
      width: 120,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Batas',
      dataIndex: 'limit',
      key: 'limit',
      width: 100,
      render: (text: string, record: any) => (
        <div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.unit}
          </Text>
        </div>
      ),
    },
    {
      title: 'Hasil',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result: any) => <Text strong>{result.value}</Text>,
    },
  ];

  const reportData = TEST_PARAMETERS.map((param: any, index: number) => ({
    key: index,
    name: param.name,
    method: param.method,
    standard: param.standard,
    limit: param.limit,
    unit: param.unit,
    result: record.test_results?.[param.name] || {
      value: '-',
      unit: param.unit,
      status: 'unknown',
    },
  }));

  const passCount = reportData.filter(
    (item: any) => item.result.status === 'pass',
  ).length;
  const failCount = reportData.filter(
    (item: any) => item.result.status === 'fail',
  ).length;
  const unknownCount = reportData.filter(
    (item: any) => item.result.status === 'unknown',
  ).length;

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: 20 }}
      bodyStyle={{ padding: 0 }}
      closeIcon={<CloseOutlined style={{ color: 'white', fontSize: '16px' }} />}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px',
          color: 'white',
        }}
      >
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          📊 Laporan Hasil Pengujian
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
          Laporan lengkap hasil analisis laboratorium
        </Text>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Sample Information */}
        <Card
          title="📋 Informasi Sampel"
          style={{ marginBottom: 24 }}
          headStyle={{
            background: 'linear-gradient(90deg, #f0f2f5 0%, #ffffff 100%)',
            borderBottom: '2px solid #1890ff',
          }}
        >
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Text type="secondary">ID Sampel:</Text>
              <br />
              <Text strong style={{ fontSize: '16px' }}>
                {record.sample_id}
              </Text>
            </Col>
            <Col span={8}>
              <Text type="secondary">Vessel:</Text>
              <br />
              <Text strong>{record.vessel_name}</Text>
            </Col>
            <Col span={8}>
              <Text type="secondary">Tank:</Text>
              <br />
              <Text strong>{record.tank_number}</Text>
            </Col>
            <Col span={8}>
              <Text type="secondary">Jenis Sampel:</Text>
              <br />
              <Text strong>{record.sample_type}</Text>
            </Col>
            <Col span={8}>
              <Text type="secondary">Tanggal Diterima:</Text>
              <br />
              <Text strong>
                {dayjs(record.received_date).format('DD MMMM YYYY, HH:mm')}
              </Text>
            </Col>
            <Col span={8}>
              <Text type="secondary">Teknisi:</Text>
              <br />
              <Text strong>{record.lab_technician}</Text>
            </Col>
          </Row>
        </Card>

        <Divider orientation="left" orientationMargin="0">
          <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
            Detail Hasil Pengujian
          </Text>
        </Divider>

        {/* Test Results Table */}
        <Table
          columns={reportColumns}
          dataSource={reportData}
          pagination={false}
          bordered
          size="middle"
          scroll={{ x: 600 }}
          style={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        />

        {record.quality_notes && (
          <Card
            title="📝 Catatan Kualitas"
            style={{ marginTop: 24 }}
            headStyle={{
              background: 'linear-gradient(90deg, #f0f2f5 0%, #ffffff 100%)',
              borderBottom: '2px solid #faad14',
            }}
          >
            <Text>{record.quality_notes}</Text>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default TestingReportModal;
