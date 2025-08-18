import {
  AlertOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ExperimentOutlined,
  EyeOutlined,
  ReloadOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Badge,
  Button,
  Card,
  Col,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  Timeline,
} from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

interface MonitoringRecord {
  id: string;
  tracking_number: string;
  sample_type: string;
  vessel_name: string;
  order_type: 'stock' | 'request';
  current_status:
    | 'pending'
    | 'picked_up'
    | 'in_transit'
    | 'lab_received'
    | 'testing'
    | 'completed'
    | 'cancelled';
  current_location: string;
  lab_destination: string;
  sample_officer: string;
  priority: 'normal' | 'urgent' | 'critical';
  estimated_arrival: string;
  actual_arrival?: string;
  progress_percentage: number;
  last_update: string;
  timeline_events: Array<{
    timestamp: string;
    status: string;
    location: string;
    description: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>;
}

const Monitoring: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [refreshing, setRefreshing] = useState(false);
  const actionRef = useRef<ActionType>();

  const statusOptions = [
    { label: 'Semua Status', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Diambil', value: 'picked_up' },
    { label: 'Dalam Perjalanan', value: 'in_transit' },
    { label: 'Lab Terima', value: 'lab_received' },
    { label: 'Pengujian', value: 'testing' },
    { label: 'Selesai', value: 'completed' },
  ];

  const dateFilterOptions = [
    { label: 'Hari Ini', value: 'today' },
    { label: '3 Hari Terakhir', value: '3days' },
    { label: '1 Minggu Terakhir', value: '1week' },
    { label: '1 Bulan Terakhir', value: '1month' },
  ];

  const handleViewDetail = (record: MonitoringRecord) => {
    history.push(`/monitoring/detail/${record.id}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      actionRef.current?.reload();
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'picked_up':
        return 'processing';
      case 'in_transit':
        return 'warning';
      case 'lab_received':
        return 'processing';
      case 'testing':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'picked_up':
        return 'Diambil';
      case 'in_transit':
        return 'Dalam Perjalanan';
      case 'lab_received':
        return 'Lab Terima';
      case 'testing':
        return 'Pengujian';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'normal':
        return 'default';
      case 'urgent':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getProgressColor = (percentage: number, status: string) => {
    if (status === 'completed') return '#9fe400';
    if (status === 'cancelled') return '#fd0017';
    if (percentage >= 80) return '#9fe400';
    if (percentage >= 60) return '#faad14';
    if (percentage >= 40) return '#1890ff';
    return '#fd0017';
  };

  const columns: ProColumns<MonitoringRecord>[] = [
    {
      title: 'Tracking Number',
      dataIndex: 'tracking_number',
      key: 'tracking_number',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{record.tracking_number}</span>
          <Tag
            color={record.order_type === 'stock' ? 'blue' : 'green'}
            size="small"
          >
            {record.order_type === 'stock' ? 'STOCK' : 'REQUEST'}
          </Tag>
          <Tag color={getPriorityColor(record.priority)} size="small">
            {record.priority.toUpperCase()}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Detail Sampel',
      dataIndex: 'sample_type',
      key: 'sample_type',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.sample_type}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.vessel_name}
          </div>
        </div>
      ),
    },
    {
      title: 'Lokasi Saat Ini',
      dataIndex: 'current_location',
      key: 'current_location',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <EnvironmentOutlined style={{ color: '#fd0017', marginRight: 4 }} />
          <span>{record.current_location}</span>
        </div>
      ),
    },
    {
      title: 'Tujuan Lab',
      dataIndex: 'lab_destination',
      key: 'lab_destination',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ExperimentOutlined style={{ color: '#9fe400', marginRight: 4 }} />
          <span>{record.lab_destination}</span>
        </div>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress_percentage',
      key: 'progress_percentage',
      render: (_, record) => (
        <div>
          <Progress
            percent={record.progress_percentage}
            size="small"
            strokeColor={getProgressColor(
              record.progress_percentage,
              record.current_status,
            )}
            showInfo={false}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
            {record.progress_percentage}%
          </div>
        </div>
      ),
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'current_status',
      key: 'current_status',
      render: (_, record) => (
        <Badge
          status={getStatusColor(record.current_status)}
          text={getStatusLabel(record.current_status)}
        />
      ),
      filters: statusOptions
        .slice(1)
        .map((item) => ({ text: item.label, value: item.value })),
    },
    {
      title: 'Sample Officer',
      dataIndex: 'sample_officer',
      key: 'sample_officer',
    },
    {
      title: 'Estimasi Tiba',
      dataIndex: 'estimated_arrival',
      key: 'estimated_arrival',
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ClockCircleOutlined style={{ color: '#9fe400', marginRight: 4 }} />
            <span>{dayjs(record.estimated_arrival).format('DD/MM HH:mm')}</span>
          </div>
          {record.actual_arrival && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              Aktual: {dayjs(record.actual_arrival).format('DD/MM HH:mm')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Last Update',
      dataIndex: 'last_update',
      key: 'last_update',
      render: (_, record) => (
        <span style={{ fontSize: '12px', color: '#666' }}>
          {dayjs(record.last_update).fromNow()}
        </span>
      ),
      sorter: true,
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Detail
        </Button>
      ),
    },
  ];

  const mockData: MonitoringRecord[] = [
    {
      id: '1',
      tracking_number: 'TRK-20250806-001',
      sample_type: 'JET A-1',
      vessel_name: 'MT. Commodore One',
      order_type: 'stock',
      current_status: 'in_transit',
      current_location: 'Jalan Tol Cikampek KM 15',
      lab_destination: 'LPUJ - Priok',
      sample_officer: 'Moch. Aby Gazal',
      priority: 'urgent',
      estimated_arrival: '2025-08-06 11:30',
      progress_percentage: 65,
      last_update: '2025-08-06 10:45:00',
      timeline_events: [
        {
          timestamp: '2025-08-06 08:30:00',
          status: 'pending',
          location: 'SHAFTI',
          description: 'Pesanan dibuat',
          type: 'info',
        },
        {
          timestamp: '2025-08-06 09:00:00',
          status: 'picked_up',
          location: 'SHAFTI',
          description: 'Sampel diambil oleh Sample Officer',
          type: 'success',
        },
        {
          timestamp: '2025-08-06 09:30:00',
          status: 'in_transit',
          location: 'Jalan Raya Jakarta-Cikampek',
          description: 'Perjalanan menuju lab dimulai',
          type: 'info',
        },
        {
          timestamp: '2025-08-06 10:45:00',
          status: 'in_transit',
          location: 'Jalan Tol Cikampek KM 15',
          description: 'Update lokasi - dalam perjalanan normal',
          type: 'info',
        },
      ],
    },
    {
      id: '2',
      tracking_number: 'TRK-20250806-002',
      sample_type: 'Avgas',
      vessel_name: 'MT. Pioneer',
      order_type: 'request',
      current_status: 'testing',
      current_location: 'Lemigas - Jakarta',
      lab_destination: 'Lemigas - Jakarta',
      sample_officer: 'Ahmad Santoso',
      priority: 'normal',
      estimated_arrival: '2025-08-06 16:00',
      actual_arrival: '2025-08-06 13:30',
      progress_percentage: 85,
      last_update: '2025-08-06 14:30:00',
      timeline_events: [
        {
          timestamp: '2025-08-06 10:15:00',
          status: 'pending',
          location: 'SHAFTI',
          description: 'Request dibuat',
          type: 'info',
        },
        {
          timestamp: '2025-08-06 11:00:00',
          status: 'picked_up',
          location: 'SHAFTI',
          description: 'Sampel diambil',
          type: 'success',
        },
        {
          timestamp: '2025-08-06 13:30:00',
          status: 'lab_received',
          location: 'Lemigas - Jakarta',
          description: 'Sampel diterima lab, lebih cepat dari estimasi',
          type: 'success',
        },
        {
          timestamp: '2025-08-06 14:00:00',
          status: 'testing',
          location: 'Lemigas - Jakarta',
          description: 'Pengujian dimulai',
          type: 'info',
        },
      ],
    },
    {
      id: '3',
      tracking_number: 'TRK-20250805-001',
      sample_type: 'Diesel',
      vessel_name: 'MT. Explorer',
      order_type: 'stock',
      current_status: 'completed',
      current_location: 'Balongan Testing Center',
      lab_destination: 'Balongan Testing Center',
      sample_officer: 'Sedry Muhammad Iqbal',
      priority: 'normal',
      estimated_arrival: '2025-08-05 16:00',
      actual_arrival: '2025-08-05 15:30',
      progress_percentage: 100,
      last_update: '2025-08-05 17:00:00',
      timeline_events: [
        {
          timestamp: '2025-08-05 09:00:00',
          status: 'pending',
          location: 'SHAFTI',
          description: 'Pesanan stock dibuat',
          type: 'info',
        },
        {
          timestamp: '2025-08-05 09:30:00',
          status: 'picked_up',
          location: 'SHAFTI',
          description: 'Sampel diambil',
          type: 'success',
        },
        {
          timestamp: '2025-08-05 15:30:00',
          status: 'lab_received',
          location: 'Balongan Testing Center',
          description: 'Sampel sampai di lab Balongan',
          type: 'success',
        },
        {
          timestamp: '2025-08-05 16:00:00',
          status: 'testing',
          location: 'Balongan Testing Center',
          description: 'Pengujian dimulai',
          type: 'info',
        },
        {
          timestamp: '2025-08-05 17:00:00',
          status: 'completed',
          location: 'Balongan Testing Center',
          description: 'Pengujian selesai - hasil OnSpec',
          type: 'success',
        },
      ],
    },
  ];

  // Calculate summary data
  const summary = {
    total: mockData.length,
    in_transit: mockData.filter((item) =>
      ['picked_up', 'in_transit'].includes(item.current_status),
    ).length,
    at_lab: mockData.filter((item) =>
      ['lab_received', 'testing'].includes(item.current_status),
    ).length,
    completed: mockData.filter((item) => item.current_status === 'completed')
      .length,
    delayed: mockData.filter((item) => {
      if (!item.actual_arrival) return false;
      return dayjs(item.actual_arrival).isAfter(dayjs(item.estimated_arrival));
    }).length,
  };

  const alertData = [
    {
      type: 'warning' as const,
      message: 'TRK-20250806-003 - Terlambat 30 menit dari estimasi',
      time: '5 menit yang lalu',
      timestamp: '2025-08-06 10:40:00',
    },
    {
      type: 'error' as const,
      message: 'TRK-20250806-004 - Macet total di Jalan Tol Japek KM 20',
      time: '10 menit yang lalu',
      timestamp: '2025-08-06 10:35:00',
    },
    {
      type: 'success' as const,
      message: 'TRK-20250806-002 - Sampel sampai di lab lebih awal',
      time: '15 menit yang lalu',
      timestamp: '2025-08-06 10:20:00',
    },
  ];

  return (
    <PageContainer
      title="Monitoring Real-Time"
      content="Pantau status dan lokasi sampel secara real-time dari pengambilan hingga selesai pengujian"
      extra={[
        <Select
          key="status"
          value={selectedStatus}
          onChange={setSelectedStatus}
          options={statusOptions}
          style={{ width: 150 }}
        />,
        <Select
          key="date"
          value={selectedDate}
          onChange={setSelectedDate}
          options={dateFilterOptions}
          style={{ width: 150 }}
        />,
        <Button
          key="refresh"
          icon={<ReloadOutlined spin={refreshing} />}
          onClick={handleRefresh}
          loading={refreshing}
        >
          Refresh
        </Button>,
      ]}
    >
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Tracking"
              value={summary.total}
              prefix={<EyeOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Dalam Perjalanan"
              value={summary.in_transit}
              prefix={<CarOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Di Lab"
              value={summary.at_lab}
              prefix={<ExperimentOutlined style={{ color: '#9fe400' }} />}
              valueStyle={{ color: '#9fe400' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Selesai"
              value={summary.completed}
              prefix={<CheckCircleOutlined style={{ color: '#fd0017' }} />}
              valueStyle={{ color: '#fd0017' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Real-time Alerts */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AlertOutlined style={{ marginRight: 8, color: '#fd0017' }} />
            Alert Real-Time
          </div>
        }
        size="small"
        style={{ marginBottom: 24 }}
      >
        <Timeline size="small">
          {alertData.map((alert) => (
            <Timeline.Item
              key={alert.timestamp}
              color={
                alert.type === 'success'
                  ? 'green'
                  : alert.type === 'warning'
                    ? 'orange'
                    : 'red'
              }
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{alert.message}</span>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {alert.time}
                </span>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      {/* Main Monitoring Table */}
      <ProTable<MonitoringRecord>
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        columns={columns}
        dataSource={mockData.filter(
          (item) =>
            selectedStatus === 'all' || item.current_status === selectedStatus,
        )}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle="Status Tracking Sampel"
        toolBarRender={() => [
          <Button key="map" type="default">
            View Map
          </Button>,
          <Button key="export" type="default">
            Export Report
          </Button>,
        ]}
        options={{
          reload: true,
          density: true,
          fullScreen: true,
        }}
      />

      {/* Real-time Status Updates */}
      <Card
        title="Live Status Updates"
        size="small"
        extra={
          <Tag color="success">
            <SyncOutlined spin /> Live
          </Tag>
        }
      >
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          {mockData
            .sort(
              (a, b) =>
                dayjs(b.last_update).unix() - dayjs(a.last_update).unix(),
            )
            .slice(0, 5)
            .map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontWeight: 500 }}>
                    {item.tracking_number}
                  </span>
                  <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                  <Badge
                    status={getStatusColor(item.current_status)}
                    text={getStatusLabel(item.current_status)}
                  />
                  <span style={{ margin: '0 8px', color: '#666' }}>•</span>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {item.current_location}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {dayjs(item.last_update).format('HH:mm')}
                </span>
              </div>
            ))}
        </div>
      </Card>
    </PageContainer>
  );
};

export default Monitoring;
