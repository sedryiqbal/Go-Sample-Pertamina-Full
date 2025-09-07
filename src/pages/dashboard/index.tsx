import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExperimentOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import { PageContainer } from '@ant-design/pro-components';
import { Badge, Calendar, Card, Col, Row, Statistic } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useState } from 'react';

// Import modular components
import {
  RecentActivities,
  SampleCalendar,
  StatCard,
  TestResultsSummary,
  WeeklyTestResults,
} from './components';

const Dashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  // Mock data for charts
  const lineChartData = [
    { date: '2025-07-30', success: 12, failed: 3, type: 'Berhasil', value: 12 },
    { date: '2025-07-30', success: 12, failed: 3, type: 'Gagal', value: 3 },
    { date: '2025-07-31', success: 15, failed: 2, type: 'Berhasil', value: 15 },
    { date: '2025-07-31', success: 15, failed: 2, type: 'Gagal', value: 2 },
    { date: '2025-08-01', success: 18, failed: 1, type: 'Berhasil', value: 18 },
    { date: '2025-08-01', success: 18, failed: 1, type: 'Gagal', value: 1 },
    { date: '2025-08-02', success: 14, failed: 4, type: 'Berhasil', value: 14 },
    { date: '2025-08-02', success: 14, failed: 4, type: 'Gagal', value: 4 },
    { date: '2025-08-03', success: 16, failed: 2, type: 'Berhasil', value: 16 },
    { date: '2025-08-03', success: 16, failed: 2, type: 'Gagal', value: 2 },
    { date: '2025-08-04', success: 13, failed: 3, type: 'Berhasil', value: 13 },
    { date: '2025-08-04', success: 13, failed: 3, type: 'Gagal', value: 3 },
    { date: '2025-08-05', success: 19, failed: 1, type: 'Berhasil', value: 19 },
    { date: '2025-08-05', success: 19, failed: 1, type: 'Gagal', value: 1 },
  ];

  const pieChartData = [
    { type: 'Berhasil', value: 107, percent: 0.87 },
    { type: 'Gagal', value: 16, percent: 0.13 },
  ];

  const lineConfig = {
    data: lineChartData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    color: ['#9fe400', '#fd0017'],
    point: {
      size: 4,
    },
    smooth: true,
    height: 300,
  };

  const pieConfig = {
    data: pieChartData,
    angleField: 'value',
    colorField: 'type',
    color: ['#9fe400', '#fd0017'],
    radius: 0.8,
    label: {
      type: 'outer',
      content: (data: any) =>
        `${data.type}: ${(data.percent * 100).toFixed(0)}%`,
    },
    height: 300,
  };

  // Calendar data for stock estimation
  const getListData = (value: Dayjs) => {
    const stockData: {
      [key: string]: Array<{
        type: 'success' | 'warning' | 'error';
        content: string;
      }>;
    } = {
      '2025-08-06': [
        { type: 'success', content: 'Stock Tersedia - JET A-1' },
        { type: 'warning', content: 'Stock Terbatas - Avgas' },
      ],
      '2025-08-07': [{ type: 'error', content: 'Stock Kosong - JET A-1' }],
      '2025-08-08': [
        { type: 'success', content: 'Stock Tersedia - JET A-1' },
        { type: 'success', content: 'Stock Tersedia - Avgas' },
      ],
      '2025-08-09': [{ type: 'warning', content: 'Stock Terbatas - JET A-1' }],
      '2025-08-10': [{ type: 'success', content: 'Stock Tersedia - JET A-1' }],
    };

    return stockData[value.format('YYYY-MM-DD')] || [];
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <div
        style={{
          fontSize: '10px',
          lineHeight: '12px',
          overflow: 'hidden',
          height: '100%',
          padding: '2px',
        }}
      >
        {listData.map((item, index) => (
          <Badge
            key={`${item.type}-${item.content}-${index}`}
            status={item.type}
            text={item.content.split(' - ')[0]}
            style={{
              fontSize: '9px',
              display: 'block',
              marginBottom: '1px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          />
        ))}
      </div>
    );
  };
  return (
    <PageContainer
      title="Dashboard Go Sample"
      content="Monitoring dan analisis sampel Pertamina Aviation Soekarno-Hatta"
    >
      <Row gutter={[16, 16]}>
        {/* Top Statistics Cards */}
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Sample Pengujian Lab"
            value={125}
            icon={<ExperimentOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Berhasil Di uji"
            value={98}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Sedang di proses Uji"
            value={15}
            icon={<SyncOutlined spin />}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Repeat Sample"
            value={12}
            icon={<CloseCircleOutlined />}
            color="#ff4d4f"
          />
        </Col>

        {/* Calendar Section */}
        <Col xs={24} lg={14}>
          <SampleCalendar />
        </Col>

        {/* Success/Failure Summary */}
        <Col xs={24} lg={10}>
          <TestResultsSummary />
        </Col>

        {/* Weekly Results Chart */}
        <Col xs={24}>
          <WeeklyTestResults />
        </Col>

        {/* Recent Activities */}
        <Col xs={24}>
          <RecentActivities />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Dashboard;
