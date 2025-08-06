import { PageContainer } from '@ant-design/pro-components';
import { 
  Card, 
  Row, 
  Col, 
  Timeline, 
  Tag, 
  Badge, 
  Progress, 
  Statistic, 
  Alert,
  Typography,
  Space,
  Button,
  Table
} from 'antd';
import { 
  EyeOutlined,
  CarOutlined,
  ExperimentOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface SampleStatus {
  id: string;
  code: string;
  productType: string;
  shipName: string;
  currentStatus: string;
  location: string;
  estimatedArrival?: string;
  progress: number;
  issues: string[];
  lastUpdate: string;
}

interface ActivityLog {
  id: string;
  sampleCode: string;
  activity: string;
  status: 'success' | 'warning' | 'error' | 'processing';
  timestamp: string;
  location?: string;
  details?: string;
}

const Monitoring: React.FC = () => {
  const [realTimeData, setRealTimeData] = useState<SampleStatus[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock real-time data
  useEffect(() => {
    const fetchRealTimeData = () => {
      const mockData: SampleStatus[] = [
        {
          id: '1',
          code: 'TRANS-20250806-001',
          productType: 'JET A-1',
          shipName: 'MT. Commodore One',
          currentStatus: 'in-transit',
          location: 'Tol Jakarta-Cikampek KM 15',
          estimatedArrival: '16:30',
          progress: 45,
          issues: ['Kemacetan lalu lintas'],
          lastUpdate: '14:30',
        },
        {
          id: '2',
          code: 'LPUJ-20250806-002',
          productType: 'JET A-1',
          shipName: 'MT. Commodore One',
          currentStatus: 'testing',
          location: 'Lab LPUJ - Density Testing',
          progress: 65,
          issues: [],
          lastUpdate: '14:25',
        },
        {
          id: '3',
          code: 'LMG-20250805-003',
          productType: 'Avgas',
          shipName: 'MT. Pioneer',
          currentStatus: 'completed',
          location: 'Lab Lemigas - Storage',
          progress: 100,
          issues: [],
          lastUpdate: '12:15',
        },
        {
          id: '4',
          code: 'REQ-20250806-004',
          productType: 'JET A-1',
          shipName: 'MT. Explorer',
          currentStatus: 'pending-pickup',
          location: 'Pertamina Aviation Soekarno-Hatta',
          estimatedArrival: '18:00',
          progress: 10,
          issues: ['Menunggu konfirmasi Sample Officer'],
          lastUpdate: '13:45',
        },
      ];

      const mockLogs: ActivityLog[] = [
        {
          id: '1',
          sampleCode: 'LPUJ-20250806-002',
          activity: 'Pengujian density selesai',
          status: 'success',
          timestamp: '14:25',
          location: 'Lab LPUJ',
          details: 'Hasil: 0.795 g/cm³',
        },
        {
          id: '2',
          sampleCode: 'TRANS-20250806-001',
          activity: 'Update lokasi: Terkena kemacetan',
          status: 'warning',
          timestamp: '14:20',
          location: 'Tol Jakarta-Cikampek KM 15',
          details: 'Estimasi keterlambatan 30 menit',
        },
        {
          id: '3',
          sampleCode: 'REQ-20250806-004',
          activity: 'Pemesanan baru dibuat',
          status: 'processing',
          timestamp: '13:45',
          location: 'SHAFTHI Office',
        },
        {
          id: '4',
          sampleCode: 'LPUJ-20250806-002',
          activity: 'Mulai pengujian viscosity',
          status: 'processing',
          timestamp: '13:30',
          location: 'Lab LPUJ',
        },
        {
          id: '5',
          sampleCode: 'LMG-20250805-003',
          activity: 'Komparasi selesai - OnSpec',
          status: 'success',
          timestamp: '12:15',
          location: 'Lab Lemigas',
          details: 'Status: Release untuk pembongkaran',
        },
      ];

      setRealTimeData(mockData);
      setActivityLogs(mockLogs);
    };

    fetchRealTimeData();
    
    // Update every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // In real app, this would fetch fresh data
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      'pending-pickup': 'blue',
      'in-transit': 'orange',
      'testing': 'purple',
      'completed': 'green',
      'failed': 'red',
    };
    return statusColors[status as keyof typeof statusColors] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const statusIcons = {
      'pending-pickup': <ClockCircleOutlined />,
      'in-transit': <CarOutlined />,
      'testing': <ExperimentOutlined />,
      'completed': <CheckCircleOutlined />,
      'failed': <WarningOutlined />,
    };
    return statusIcons[status as keyof typeof statusIcons] || <SyncOutlined />;
  };

  const columns: ColumnsType<SampleStatus> = [
    {
      title: 'Kode Sampel',
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: 'Produk',
      dataIndex: 'productType',
      key: 'productType',
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'currentStatus',
      key: 'currentStatus',
      width: 150,
      render: (status: string) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status.replace('-', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Lokasi',
      dataIndex: 'location',
      key: 'location',
      render: (location: string) => (
        <Space>
          <EnvironmentOutlined style={{ color: '#fd0017' }} />
          <Text>{location}</Text>
        </Space>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number) => (
        <Progress 
          percent={progress} 
          size="small" 
          strokeColor="#9fe400"
        />
      ),
    },
    {
      title: 'ETA',
      dataIndex: 'estimatedArrival',
      key: 'estimatedArrival',
      width: 80,
      render: (eta: string) => eta || '-',
    },
    {
      title: 'Issues',
      dataIndex: 'issues',
      key: 'issues',
      render: (issues: string[]) => (
        issues.length > 0 ? (
          <Badge count={issues.length} showZero={false}>
            <WarningOutlined style={{ color: '#faad14' }} />
          </Badge>
        ) : (
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
        )
      ),
    },
  ];

  const expandedRowRender = (record: SampleStatus) => (
    <div style={{ padding: '16px 24px', background: '#fafafa' }}>
      <Row gutter={16}>
        <Col span={12}>
          <Title level={5}>Detail Sampel</Title>
          <p><strong>Kapal:</strong> {record.shipName}</p>
          <p><strong>Last Update:</strong> {record.lastUpdate}</p>
        </Col>
        <Col span={12}>
          <Title level={5}>Issues</Title>
          {record.issues.length > 0 ? (
            record.issues.map((issue) => (
              <Alert
                key={issue}
                message={issue}
                type="warning"
                style={{ marginBottom: 8 }}
              />
            ))
          ) : (
            <Text type="secondary">Tidak ada masalah</Text>
          )}
        </Col>
      </Row>
    </div>
  );

  return (
    <PageContainer
      title="Monitoring Real-Time"
      content="Pantau status dan lokasi sampel secara real-time"
      extra={[
        <Button
          key="refresh"
          icon={<SyncOutlined />}
          onClick={refreshData}
          loading={loading}
        >
          Refresh
        </Button>,
      ]}
    >
      <Row gutter={[16, 16]}>
        {/* Statistics Cards */}
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Sampel Aktif"
              value={realTimeData.length}
              prefix={<EyeOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Dalam Perjalanan"
              value={realTimeData.filter(item => item.currentStatus === 'in-transit').length}
              prefix={<CarOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Sedang Diuji"
              value={realTimeData.filter(item => item.currentStatus === 'testing').length}
              prefix={<ExperimentOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Selesai"
              value={realTimeData.filter(item => item.currentStatus === 'completed').length}
              prefix={<CheckCircleOutlined style={{ color: '#9fe400' }} />}
              valueStyle={{ color: '#9fe400' }}
            />
          </Card>
        </Col>

        {/* Real-time Status Table */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <EyeOutlined style={{ color: '#fd0017' }} />
                Status Sampel Real-Time
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={realTimeData}
              rowKey="id"
              expandable={{
                expandedRowRender,
                rowExpandable: (record) => record.issues.length > 0 || true,
              }}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Activity Timeline */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <ClockCircleOutlined style={{ color: '#9fe400' }} />
                Activity Log
              </Space>
            }
          >
            <Timeline
              mode="left"
              items={activityLogs.map(log => ({
                color: log.status === 'success' ? 'green' : 
                       log.status === 'warning' ? 'orange' : 
                       log.status === 'error' ? 'red' : 'blue',
                children: (
                  <div>
                    <div style={{ marginBottom: 4 }}>
                      <Text strong>{log.sampleCode}</Text>
                      <Tag 
                        style={{ marginLeft: 8 }}
                        color={log.status === 'success' ? 'green' : 
                               log.status === 'warning' ? 'orange' : 
                               log.status === 'error' ? 'red' : 'blue'}
                      >
                        {log.timestamp}
                      </Tag>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <Text>{log.activity}</Text>
                    </div>
                    {log.location && (
                      <div style={{ marginBottom: 4 }}>
                        <EnvironmentOutlined style={{ marginRight: 4, color: '#666' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {log.location}
                        </Text>
                      </div>
                    )}
                    {log.details && (
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {log.details}
                        </Text>
                      </div>
                    )}
                  </div>
                ),
              }))}
            />
          </Card>
        </Col>

        {/* Issues Alert */}
        <Col xs={24}>
          <Card title="Alert & Issues">
            {realTimeData
              .filter(item => item.issues.length > 0)
              .map(item => (
                <Alert
                  key={item.id}
                  message={`${item.code} - ${item.currentStatus.toUpperCase()}`}
                  description={
                    <div>
                      <div><strong>Lokasi:</strong> {item.location}</div>
                      <div><strong>Issues:</strong></div>
                      <ul>
                        {item.issues.map((issue) => (
                          <li key={issue}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  }
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                  action={
                    <Space direction="vertical">
                      <Button size="small" type="dashed">
                        Update Status
                      </Button>
                      <Button size="small" type="dashed">
                        Contact Driver
                      </Button>
                    </Space>
                  }
                />
              ))}
            
            {realTimeData.filter(item => item.issues.length > 0).length === 0 && (
              <Alert
                message="Semua Sampel Berjalan Normal"
                description="Tidak ada issues atau masalah yang terdeteksi pada saat ini."
                type="success"
                showIcon
              />
            )}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Monitoring;
