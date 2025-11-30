import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExperimentOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { App, Col, Row, Spin } from 'antd';
import React from 'react';
import type { DashboardSummaryData } from '@/services/dashboard/api';
import { getDashboardSummary } from '@/services/dashboard/api';

// Import modular components
import {
  RecentActivities,
  SampleCalendar,
  StatCard,
  TestResultsSummary,
  WeeklyTestResults,
} from './components';

const Dashboard: React.FC = () => {
  const { message } = App.useApp();
  const { data: summaryData, loading: summaryLoading } = useRequest(
    getDashboardSummary,
    {
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Gagal memuat ringkasan dashboard';
        message.error(errorMessage);
      },
    },
  );

  const summary: DashboardSummaryData = {
    totalSamplePengujianLab: summaryData?.totalSamplePengujianLab ?? 0,
    totalBerhasilDiuji: summaryData?.totalBerhasilDiuji ?? 0,
    sedangDiprosesUji: summaryData?.sedangDiprosesUji ?? 0,
    totalRepeatSample: summaryData?.totalRepeatSample ?? 0,
    persentaseBerhasil: summaryData?.persentaseBerhasil ?? 0,
    persentaseRepeat: summaryData?.persentaseRepeat ?? 0,
  };

  return (
    <PageContainer
      title="Dashboard Go Sample"
      content="Monitoring dan analisis sampel Pertamina Aviation Soekarno-Hatta"
    >
      <Spin spinning={summaryLoading}>
        <Row gutter={[16, 16]}>
          {/* Top Statistics Cards */}
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Sample Pengujian Lab"
              value={summary.totalSamplePengujianLab}
              icon={<ExperimentOutlined />}
              color="#1890ff"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Berhasil Di uji"
              value={summary.totalBerhasilDiuji}
              icon={<CheckCircleOutlined />}
              color="#52c41a"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Sedang di proses Uji"
              value={summary.sedangDiprosesUji}
              icon={<SyncOutlined spin />}
              color="#faad14"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Repeat Sample"
              value={summary.totalRepeatSample}
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
            <TestResultsSummary
              successRate={summary.persentaseBerhasil}
              failureRate={summary.persentaseRepeat}
            />
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
      </Spin>
    </PageContainer>
  );
};

export default Dashboard;

