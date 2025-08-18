import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExperimentOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Col, Row } from 'antd';
import React from 'react';

// Import modular components
import {
  RecentActivities,
  SampleCalendar,
  StatCard,
  TestResultsSummary,
  WeeklyTestResults,
} from './components';

const Dashboard: React.FC = () => {
  return (
    <PageContainer
      title="Dashboard Go Sample"
      content="Monitoring dan analisis sampel Pertamina Aviation Soekarno-Hatta"
    >
      <Row gutter={[16, 16]}>
        {/* Top Statistics Cards */}
        <Col xs={24} sm={12} lg={6} xl={4}>
          <StatCard
            title="Total Sample Pengujian Lab"
            value={125}
            icon={<ExperimentOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6} xl={4}>
          <StatCard
            title="Total Siring Ready Detail Ready / Not Ready"
            value="98/27"
            icon={<CheckCircleOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={6} xl={4}>
          <StatCard
            title="Total Berhasil Di uji"
            value={98}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={6} xl={4}>
          <StatCard
            title="Sedang di proses Uji"
            value={15}
            icon={<SyncOutlined spin />}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} lg={6} xl={4}>
          <StatCard
            title="Total Gagal Di uji"
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
