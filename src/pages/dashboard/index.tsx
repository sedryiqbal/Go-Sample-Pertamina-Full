import {
  CalendarOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import { PageContainer } from '@ant-design/pro-components';
import { Badge, Calendar, Card, Col, Row, Statistic } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';

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
        {/* Statistics Cards */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Pengujian Lab"
              value={123}
              prefix={<ExperimentOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Sudah Diuji"
              value={107}
              prefix={<CheckCircleOutlined style={{ color: '#9fe400' }} />}
              valueStyle={{ color: '#9fe400' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Sedang Diproses"
              value={16}
              prefix={<SyncOutlined spin style={{ color: '#fd0017' }} />}
              valueStyle={{ color: '#fd0017' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Berhasil"
              value={107}
              suffix="/ 123"
              prefix={<CheckCircleOutlined style={{ color: '#9fe400' }} />}
              valueStyle={{ color: '#9fe400' }}
            />
          </Card>
        </Col>

        {/* Calendar */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CalendarOutlined
                  style={{ marginRight: 8, color: '#fd0017' }}
                />
                Estimasi Ketersediaan Stock
              </div>
            }
          >
            <div style={{ overflow: 'hidden' }}>
              <Calendar
                mode="month"
                cellRender={dateCellRender}
                value={selectedDate}
                onChange={setSelectedDate}
                style={{
                  height: 400,
                  width: '100%',
                }}
              />
            </div>
          </Card>
        </Col>

        {/* Pie Chart */}
        <Col xs={24} lg={10}>
          <Card title="Total Pengujian Berhasil & Gagal">
            <Pie {...pieConfig} />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div>
                  <div style={{ color: '#9fe400', fontWeight: 'bold' }}>
                    Berhasil
                  </div>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#9fe400',
                    }}
                  >
                    107
                  </div>
                  <div style={{ color: '#666' }}>87%</div>
                </div>
                <div>
                  <div style={{ color: '#fd0017', fontWeight: 'bold' }}>
                    Gagal
                  </div>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#fd0017',
                    }}
                  >
                    16
                  </div>
                  <div style={{ color: '#666' }}>13%</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Line Chart */}
        <Col xs={24}>
          <Card title="Pengujian 7 Hari Terakhir">
            <Line {...lineConfig} />
          </Card>
        </Col>

        {/* Recent Activities */}
        <Col xs={24}>
          <Card title="Aktivitas Terbaru">
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {[
                {
                  time: '10:30',
                  action:
                    'Sampel JET A-1 dari MT. Commodore One diterima lab LPUJ',
                  status: 'success',
                },
                {
                  time: '09:45',
                  action: 'Pengujian sampel Avgas dari MT. Pioneer selesai',
                  status: 'success',
                },
                {
                  time: '09:15',
                  action: 'Komparasi dokumen sampel JET A-1 - OnSpec',
                  status: 'success',
                },
                {
                  time: '08:30',
                  action: 'Pengantaran sampel ke lab Lemigas dalam perjalanan',
                  status: 'processing',
                },
                {
                  time: '08:00',
                  action: 'Pemesanan sampel baru dari MT. Explorer',
                  status: 'warning',
                },
              ].map((item) => (
                <div
                  key={`${item.time}-${item.action}`}
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      color: '#666',
                      fontSize: '12px',
                      marginRight: 16,
                    }}
                  >
                    {item.time}
                  </div>
                  <div style={{ flex: 1 }}>{item.action}</div>
                  <Badge
                    status={item.status as any}
                    text={
                      item.status === 'success'
                        ? 'Selesai'
                        : item.status === 'processing'
                          ? 'Proses'
                          : 'Pending'
                    }
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Dashboard;
