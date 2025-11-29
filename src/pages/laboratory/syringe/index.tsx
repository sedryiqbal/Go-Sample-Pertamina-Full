import { DatabaseOutlined, UserOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, Row, Table, Tag, Typography, message, Progress } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';

import SyringeManagement from '@/components/SyringeManagement';

import { MOCK_AUDIT_LOGS, MOCK_SYRINGE_DATA } from '../testing/data/mockData';
import type { AuditLog, SyringeData } from '../testing/types';

const LaboratorySyringe: React.FC = () => {
  const [syringeModalVisible, setSyringeModalVisible] = useState(false);
  const [selectedSyringe, setSelectedSyringe] = useState<SyringeData | undefined>();

  const handleSyringeClick = (syringe: SyringeData) => {
    setSelectedSyringe(syringe);
    setSyringeModalVisible(true);
  };

  const handleSyringeUpdate = (updatedSyringe: SyringeData) => {
    console.log('Syringe updated:', updatedSyringe);
    message.success('Stock syringe berhasil diperbarui');
  };

  const auditLogsColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp: string) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: '12px' }}>
            {dayjs(timestamp).format('DD MMM YYYY')}
          </div>
          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
            {dayjs(timestamp).format('HH:mm:ss')}
          </div>
        </div>
      ),
      sorter: (a: AuditLog, b: AuditLog) =>
        dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (action: string, record: AuditLog) => (
        <Tag
          color={
            record.type === 'success'
              ? 'success'
              : record.type === 'warning'
                ? 'warning'
                : record.type === 'error'
                  ? 'error'
                  : 'processing'
          }
          style={{ fontSize: '11px', fontWeight: 500 }}
        >
          {action}
        </Tag>
      ),
      filters: [
        { text: 'Stock Updated', value: 'Stock Updated' },
        { text: 'Stock Usage', value: 'Stock Usage' },
        { text: 'Stock Replenishment', value: 'Stock Replenishment' },
        { text: 'Low Stock Alert', value: 'Low Stock Alert' },
        { text: 'Critical Stock Alert', value: 'Critical Stock Alert' },
        { text: 'Equipment Maintenance', value: 'Equipment Maintenance' },
      ],
      onFilter: (value: any, record: AuditLog) => record.action === value,
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: 140,
      render: (user: string) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            borderRadius: 6,
            background: user === 'System' ? '#f0f0f0' : '#e6f7ff',
            border: `1px solid ${user === 'System' ? '#d9d9d9' : '#bae7ff'}`,
          }}
        >
          <UserOutlined style={{ marginRight: 6, fontSize: '12px' }} />
          <span style={{ fontSize: '12px', fontWeight: 500 }}>{user}</span>
        </div>
      ),
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (details: string) => (
        <span style={{ fontSize: '12px' }}>{details}</span>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: 'Syringe Stock Management',
        breadcrumb: {
          items: [
            { path: '/', breadcrumbName: 'Home' },
            { path: '/laboratory', breadcrumbName: 'Laboratory' },
            { path: '/laboratory/syringe', breadcrumbName: 'Syringe' },
          ],
        },
      }}
    >
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 16,
          border: '1px solid #e6f4ff',
          background: 'linear-gradient(135deg, #f6fbff 0%, #ffffff 100%)',
        }}
        bodyStyle={{ padding: 24 }}
      >
        <Typography.Title level={4} style={{ marginBottom: 8 }}>
          Ringkasan Persediaan
        </Typography.Title>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          Terdapat {MOCK_SYRINGE_DATA.length} lokasi yang memantau stok syringe
          secara real-time. Klik salah satu kartu untuk melakukan pembaruan
          stok.
        </Typography.Paragraph>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title="📊 Current Stock Status"
            size="small"
            headStyle={{
              background: 'linear-gradient(90deg, #f0f2f5 0%, #ffffff 100%)',
              borderBottom: '2px solid #1890ff',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {MOCK_SYRINGE_DATA.map((syringe) => {
                const stockPercentage =
                  (syringe.current_stock / syringe.max_capacity) * 100;
                const getStockColor = () => {
                  if (syringe.status === 'urgent') return '#ff4d4f';
                  if (syringe.status === 'low') return '#faad14';
                  if (syringe.status === 'full') return '#1890ff';
                  return '#52c41a';
                };

                const getStatusText = () => {
                  if (syringe.status === 'urgent') return 'Mendesak';
                  if (syringe.status === 'low') return 'Rendah';
                  if (syringe.status === 'full') return 'Penuh';
                  return 'Normal';
                };

                return (
                  <Card
                    key={syringe.id}
                    hoverable
                    onClick={() => handleSyringeClick(syringe)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 12,
                      background:
                        'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                      border: `2px solid ${getStockColor()}`,
                      boxShadow: `0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px ${getStockColor()}20`,
                      transition: 'all 0.3s ease',
                      overflow: 'hidden',
                    }}
                    bodyStyle={{ padding: 20 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${getStockColor()}15, ${getStockColor()}25)`,
                          flexShrink: 0,
                        }}
                      >
                        <DatabaseOutlined
                          style={{ fontSize: 24, color: getStockColor() }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#262626',
                            marginBottom: 4,
                          }}
                        >
                          {syringe.location}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#8c8c8c',
                            marginBottom: 8,
                          }}
                        >
                          Last Updated:{' '}
                          {dayjs(syringe.last_updated).format('DD MMM, HH:mm')}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: '24px',
                              fontWeight: 700,
                              color: getStockColor(),
                            }}
                          >
                            {syringe.current_stock}
                          </span>
                          <span
                            style={{
                              fontSize: '12px',
                              color: '#595959',
                            }}
                          >
                            / {syringe.max_capacity} units
                          </span>
                          <Tag
                            color={getStockColor()}
                            style={{
                              borderRadius: 12,
                              fontSize: '10px',
                              fontWeight: 600,
                              marginLeft: 'auto',
                            }}
                          >
                            {getStatusText()}
                          </Tag>
                        </div>
                        <Progress
                          percent={stockPercentage}
                          strokeColor={getStockColor()}
                          strokeWidth={6}
                          showInfo={false}
                          style={{ marginTop: 8 }}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="📋 Recent Activity Logs"
            size="small"
            headStyle={{
              background: 'linear-gradient(90deg, #f0f2f5 0%, #ffffff 100%)',
              borderBottom: '2px solid #52c41a',
            }}
          >
            <Table
              columns={auditLogsColumns}
              dataSource={MOCK_AUDIT_LOGS}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              size="small"
              scroll={{ y: 400 }}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      <SyringeManagement
        visible={syringeModalVisible}
        onClose={() => setSyringeModalVisible(false)}
        syringeData={selectedSyringe}
        onUpdate={handleSyringeUpdate}
      />
    </PageContainer>
  );
};

export default LaboratorySyringe;
