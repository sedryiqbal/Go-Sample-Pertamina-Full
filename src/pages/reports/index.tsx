import {
  BarChartOutlined,
  CalendarOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  ExperimentOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  DatePicker,
  message,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';

const { RangePicker } = DatePicker;

interface ReportData {
  id: string;
  reportType: string;
  dateRange: string;
  laboratory: string;
  totalSamples: number;
  completedTests: number;
  pendingTests: number;
  status: 'generating' | 'ready' | 'sent';
  generatedBy: string;
  createdAt: string;
}

const Reports: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [selectedReportType, setSelectedReportType] = useState('daily');
  const [selectedLaboratory, setSelectedLaboratory] = useState('all');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(7, 'days'),
    dayjs(),
  ]);

  const columns: ProColumns<ReportData>[] = [
    {
      title: 'Jenis Laporan',
      dataIndex: 'reportType',
      key: 'reportType',
      render: (_, record) => {
        const typeConfig = {
          daily: { text: 'Harian', color: 'blue' },
          weekly: { text: 'Mingguan', color: 'green' },
          monthly: { text: 'Bulanan', color: 'orange' },
          custom: { text: 'Custom', color: 'purple' },
        };
        const config = typeConfig[record.reportType as keyof typeof typeConfig];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
    {
      title: 'Periode',
      dataIndex: 'dateRange',
      key: 'dateRange',
    },
    {
      title: 'Laboratorium',
      dataIndex: 'laboratory',
      key: 'laboratory',
    },
    {
      title: 'Total Sampel',
      dataIndex: 'totalSamples',
      key: 'totalSamples',
      render: (_, record) => (
        <Space>
          <DatabaseOutlined style={{ color: '#1890ff' }} />
          {record.totalSamples}
        </Space>
      ),
    },
    {
      title: 'Progress Pengujian',
      key: 'progress',
      render: (_, record) => {
        const percentage = Math.round(
          (record.completedTests / record.totalSamples) * 100,
        );
        return (
          <div>
            <Progress
              percent={percentage}
              size="small"
              status={percentage === 100 ? 'success' : 'active'}
            />
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.completedTests}/{record.totalSamples} selesai
            </div>
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        const statusConfig = {
          generating: { text: 'Generating...', color: 'processing' },
          ready: { text: 'Siap Download', color: 'success' },
          sent: { text: 'Terkirim', color: 'default' },
        };
        const config = statusConfig[record.status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Dibuat Oleh',
      dataIndex: 'generatedBy',
      key: 'generatedBy',
    },
    {
      title: 'Tanggal Dibuat',
      dataIndex: 'createdAt',
      key: 'createdAt',
      valueType: 'dateTime',
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<FilePdfOutlined />}
            disabled={record.status === 'generating'}
            onClick={() => handleDownloadPDF(record)}
          />
          <Button
            type="text"
            icon={<FileExcelOutlined />}
            disabled={record.status === 'generating'}
            onClick={() => handleDownloadExcel(record)}
          />
          <Button
            type="text"
            icon={<PrinterOutlined />}
            disabled={record.status === 'generating'}
            onClick={() => handlePrint(record)}
          />
        </Space>
      ),
    },
  ];

  const handleDownloadPDF = (record: ReportData) => {
    message.success(
      `Downloading PDF report: ${record.reportType} - ${record.dateRange}`,
    );
  };

  const handleDownloadExcel = (record: ReportData) => {
    message.success(
      `Downloading Excel report: ${record.reportType} - ${record.dateRange}`,
    );
  };

  const handlePrint = (record: ReportData) => {
    message.success(
      `Printing report: ${record.reportType} - ${record.dateRange}`,
    );
  };

  const handleGenerateReport = () => {
    message.loading('Generating report...', 2);
    setTimeout(() => {
      message.success('Report berhasil dibuat!');
      actionRef.current?.reload();
    }, 2000);
  };

  // Mock data request
  const fetchReports = async () => {
    const mockData: ReportData[] = [
      {
        id: '1',
        reportType: 'daily',
        dateRange: '2025-08-06',
        laboratory: 'LPUJ',
        totalSamples: 15,
        completedTests: 15,
        pendingTests: 0,
        status: 'ready',
        generatedBy: 'Admin User',
        createdAt: '2025-08-06T16:00:00Z',
      },
      {
        id: '2',
        reportType: 'weekly',
        dateRange: '2025-08-01 - 2025-08-07',
        laboratory: 'All Laboratories',
        totalSamples: 87,
        completedTests: 78,
        pendingTests: 9,
        status: 'ready',
        generatedBy: 'Report System',
        createdAt: '2025-08-06T09:00:00Z',
      },
      {
        id: '3',
        reportType: 'monthly',
        dateRange: '2025-07-01 - 2025-07-31',
        laboratory: 'All Laboratories',
        totalSamples: 342,
        completedTests: 340,
        pendingTests: 2,
        status: 'sent',
        generatedBy: 'Report System',
        createdAt: '2025-08-01T08:00:00Z',
      },
      {
        id: '4',
        reportType: 'custom',
        dateRange: '2025-08-01 - 2025-08-05',
        laboratory: 'Lemigas',
        totalSamples: 23,
        completedTests: 20,
        pendingTests: 3,
        status: 'generating',
        generatedBy: 'Lab Manager',
        createdAt: '2025-08-06T14:30:00Z',
      },
    ];

    return {
      data: mockData,
      success: true,
      total: mockData.length,
    };
  };

  return (
    <PageContainer
      title="Reports"
      content="Generate dan kelola laporan pengujian sample"
    >
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8} md={6}>
          <Card>
            <Statistic
              title="Total Reports"
              value={156}
              prefix={<BarChartOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Card>
            <Statistic
              title="This Month"
              value={24}
              prefix={<CalendarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Card>
            <Statistic
              title="Pending"
              value={3}
              prefix={<ExperimentOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Card>
            <Statistic
              title="Auto Generated"
              value={89}
              prefix={<DatabaseOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Report Generator */}
      <Card
        title="Generate New Report"
        style={{ marginBottom: 24 }}
        extra={
          <Button
            type="primary"
            icon={<BarChartOutlined />}
            onClick={handleGenerateReport}
          >
            Generate Report
          </Button>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8} md={6}>
            <div>
              <label
                htmlFor="report-type-select"
                style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
              >
                Jenis Laporan
              </label>
              <Select
                id="report-type-select"
                value={selectedReportType}
                onChange={setSelectedReportType}
                style={{ width: '100%' }}
                placeholder="Pilih jenis laporan"
              >
                <Select.Option value="daily">Laporan Harian</Select.Option>
                <Select.Option value="weekly">Laporan Mingguan</Select.Option>
                <Select.Option value="monthly">Laporan Bulanan</Select.Option>
                <Select.Option value="custom">Custom Range</Select.Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <div>
              <label
                htmlFor="laboratory-select"
                style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
              >
                Laboratorium
              </label>
              <Select
                id="laboratory-select"
                value={selectedLaboratory}
                onChange={setSelectedLaboratory}
                style={{ width: '100%' }}
                placeholder="Pilih laboratorium"
              >
                <Select.Option value="all">Semua Laboratorium</Select.Option>
                <Select.Option value="LPUJ">LPUJ</Select.Option>
                <Select.Option value="Lemigas">Lemigas</Select.Option>
                <Select.Option value="Balongan">Balongan</Select.Option>
                <Select.Option value="PPPTMGB">PPPTMGB</Select.Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={8} md={12}>
            <div>
              <label
                htmlFor="date-range-picker"
                style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
              >
                Periode Tanggal
              </label>
              <RangePicker
                id="date-range-picker"
                value={dateRange}
                onChange={(dates) => {
                  if (dates?.[0] && dates?.[1]) {
                    setDateRange([dates[0], dates[1]]);
                  }
                }}
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Reports Table */}
      <ProTable<ReportData>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={fetchReports}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle="Daftar Laporan"
        toolBarRender={() => [
          <Button
            key="template"
            icon={<DownloadOutlined />}
            onClick={() => message.info('Downloading report templates')}
          >
            Template
          </Button>,
          <Button
            key="schedule"
            onClick={() => message.info('Configure automatic report schedule')}
          >
            Schedule Reports
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default Reports;
