import {
  CarOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  ExperimentOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Badge,
  Button,
  Card,
  Col,
  message,
  Progress,
  Row,
  Select,
  Spin,
  Statistic,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  getMonitoringCountCards,
  getMonitoringSampleOrders,
  MonitoringStatus,
  MonitoringStatusLabels,
} from '@/services/monitoring';
import type {
  MonitoringCountCards,
  MonitoringSampleOrder,
} from '@/services/monitoring';
import { fetchShips } from '@/services/ships/api';
import type { Ship } from '@/services/ships/typings';

dayjs.extend(relativeTime);

const Monitoring: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedShipId, setSelectedShipId] = useState<number | undefined>(
    undefined,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsData, setCardsData] = useState<MonitoringCountCards>({
    totalSamples: 0,
    samplesInTransit: 0,
    samplesInLab: 0,
    samplesCompleted: 0,
  });
  const [shipList, setShipList] = useState<Ship[]>([]);
  const [shipsLoading, setShipsLoading] = useState(false);
  const actionRef = useRef<ActionType>(null);

  // Status options based on API enum
  const statusOptions = [
    { label: 'Semua Status', value: 'all' },
    { label: 'Pending', value: String(MonitoringStatus.Pending) },
    {
      label: 'Menunggu Pickup',
      value: String(MonitoringStatus.WaitingPickupSample),
    },
    { label: 'Dalam Perjalanan', value: String(MonitoringStatus.InTransit) },
    { label: 'Terkirim', value: String(MonitoringStatus.Delivered) },
    {
      label: 'Sampel Diterima Lab',
      value: String(MonitoringStatus.ConfirmSampleInLab),
    },
    {
      label: 'Terdaftar di Lab',
      value: String(MonitoringStatus.RegisteredLabSample),
    },
    { label: 'Pengujian Dimulai', value: String(MonitoringStatus.StartTesting) },
    {
      label: 'Pengujian Selesai',
      value: String(MonitoringStatus.CompletedTesting),
    },
    { label: 'Perbandingan', value: String(MonitoringStatus.Comparation) },
    {
      label: 'Perbandingan Selesai',
      value: String(MonitoringStatus.CompletedComparation),
    },
    { label: 'Dibatalkan', value: String(MonitoringStatus.Canceled) },
  ];

  // Fetch count cards data
  const fetchCardsData = useCallback(async () => {
    setCardsLoading(true);
    try {
      const response = await getMonitoringCountCards();
      setCardsData(response.data);
    } catch (error) {
      console.error('Failed to fetch cards data:', error);
      message.error('Gagal memuat data statistik');
    } finally {
      setCardsLoading(false);
    }
  }, []);

  // Fetch ship list for dropdown filter
  const fetchShipList = useCallback(async () => {
    setShipsLoading(true);
    try {
      const response = await fetchShips({ pageSize: 1000 });
      setShipList(response.data);
    } catch (error) {
      console.error('Failed to fetch ship list:', error);
    } finally {
      setShipsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCardsData();
    fetchShipList();
  }, [fetchCardsData, fetchShipList]);

  const handleViewDetail = (record: MonitoringSampleOrder) => {
    history.push(`/monitoring/detail/${record.id}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCardsData();
      actionRef.current?.reload();
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadgeColor = (statusValue: number) => {
    switch (statusValue) {
      case MonitoringStatus.Pending:
        return '#d9d9d9';
      case MonitoringStatus.WaitingPickupSample:
        return '#1890ff';
      case MonitoringStatus.InTransit:
        return '#faad14';
      case MonitoringStatus.Delivered:
        return '#52c41a';
      case MonitoringStatus.ConfirmSampleInLab:
      case MonitoringStatus.RegisteredLabSample:
        return '#1890ff';
      case MonitoringStatus.StartTesting:
        return '#faad14';
      case MonitoringStatus.CompletedTesting:
        return '#52c41a';
      case MonitoringStatus.Comparation:
        return '#722ed1';
      case MonitoringStatus.CompletedComparation:
        return '#52c41a';
      case MonitoringStatus.Canceled:
        return '#ff4d4f';
      default:
        return '#d9d9d9';
    }
  };

  const getProgressColor = (percentage: number, statusValue: number) => {
    if (
      statusValue === MonitoringStatus.CompletedTesting ||
      statusValue === MonitoringStatus.CompletedComparation
    )
      return '#9fe400';
    if (statusValue === MonitoringStatus.Canceled) return '#fd0017';
    if (percentage >= 80) return '#9fe400';
    if (percentage >= 60) return '#faad14';
    if (percentage >= 40) return '#1890ff';
    return '#fd0017';
  };

  const mapStatusToProgress = (statusValue: number) => {
    switch (statusValue) {
      case 0:
        return 10;
      case 1:
        return 20;
      case 2:
        return 30;
      case 3:
        return 40;
      case 4:
        return 50;
      case 5:
        return 60;
      case 6:
        return 70;
      case 7:
        return 80;
      case 8:
      case 9:
        return 90;
      case 10:
      case 11:
      case 12:
        return 100;
      default:
        return 0;
    }
  };

  const columns: ProColumns<MonitoringSampleOrder>[] = [
    {
      title: 'Order No',
      dataIndex: 'orderNo',
      key: 'orderNo',
      render: (_, record) => (
        <span style={{ fontWeight: 500 }}>{record.orderNo}</span>
      ),
    },
    {
      title: 'Tipe Sampel',
      dataIndex: 'sampleType',
      key: 'sampleType',
      render: (_, record) => (
        <div style={{ fontWeight: 500 }}>{record.sampleType}</div>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (_, record) => {
        const percent = mapStatusToProgress(record.statusValue);
        return (
          <div>
            <Progress
              percent={percent}
              size="small"
              strokeColor={getProgressColor(percent, record.statusValue)}
              showInfo={false}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
              {percent}%
            </div>
          </div>
        );
      },
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => (
        <Tag
          color={getStatusBadgeColor(record.statusValue)}
          style={{
            fontWeight: 600,
            borderRadius: 16,
            padding: '2px 12px',
            textTransform: 'capitalize',
          }}
        >
          {record.status ||
            MonitoringStatusLabels[record.statusValue] ||
            'Unknown'}
        </Tag>
      ),
      filters: statusOptions
        .slice(1)
        .map((item) => ({ text: item.label, value: item.value })),
    },
    {
      title: 'Last Update',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (_, record) => (
        <span style={{ fontSize: '12px', color: '#666' }}>
          {dayjs(record.lastUpdated).fromNow()}
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

  return (
    <PageContainer
      title="Monitoring Real-Time"
      content="Pantau status dan lokasi sampel secara real-time dari pengambilan hingga selesai pengujian"
      extra={[
        <Select
          key="status"
          value={selectedStatus}
          onChange={(value) => {
            setSelectedStatus(value);
            actionRef.current?.reload();
          }}
          options={statusOptions}
          style={{ width: 180 }}
          placeholder="Filter Status"
        />,
        <Select
          key="ship"
          value={selectedShipId}
          onChange={(value) => {
            setSelectedShipId(value);
            actionRef.current?.reload();
          }}
          options={[
            { label: 'Semua Kapal', value: undefined },
            ...shipList.map((ship) => ({
              label: ship.name,
              value: Number(ship.id),
            })),
          ]}
          style={{ width: 180 }}
          placeholder="Filter Kapal"
          loading={shipsLoading}
          allowClear
          showSearch
          filterOption={(input, option) =>
            (option?.label?.toString() ?? '')
              .toLowerCase()
              .includes(input.toLowerCase())
          }
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
      <Spin spinning={cardsLoading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Total Sampel"
                value={cardsData.totalSamples}
                prefix={<EyeOutlined style={{ color: '#0073fe' }} />}
                valueStyle={{ color: '#0073fe' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Dalam Perjalanan"
                value={cardsData.samplesInTransit}
                prefix={<CarOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Di Lab"
                value={cardsData.samplesInLab}
                prefix={<ExperimentOutlined style={{ color: '#9fe400' }} />}
                valueStyle={{ color: '#9fe400' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Selesai"
                value={cardsData.samplesCompleted}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* Main Monitoring Table */}
      <ProTable<MonitoringSampleOrder>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        columns={columns}
        request={async (params, sort) => {
          try {
            const response = await getMonitoringSampleOrders({
              Page: params.current || 1,
              PageSize: params.pageSize || 10,
              Status: selectedStatus !== 'all' ? selectedStatus : undefined,
              ShipId: selectedShipId,
              Search: params.keyword,
              SortBy: sort && Object.keys(sort).length > 0
                ? Object.keys(sort)[0]
                : undefined,
              SortDescending: sort && Object.keys(sort).length > 0
                ? Object.values(sort)[0] === 'descend'
                : undefined,
            });

            return {
              data: response.data,
              success: true,
              total: response.pagination.totalData,
            };
          } catch (error) {
            console.error('Failed to fetch sample orders:', error);
            message.error('Gagal memuat data sample orders');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle="Status Tracking Sampel"
        toolBarRender={() => [
          <Button key="export" type="default">
            Export Report
          </Button>,
        ]}
        options={{
          reload: true,
          density: true,
          fullScreen: true,
        }}
        onRow={(record) => ({
          onClick: () => handleViewDetail(record),
          style: { cursor: 'pointer' },
        })}
      />
    </PageContainer>
  );
};

export default Monitoring;
