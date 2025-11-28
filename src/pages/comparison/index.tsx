import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  SettingOutlined,
  SyncOutlined,
  TagsOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import {
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  message,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Tooltip,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import {
  fetchComparisonSampleOrders,
  fetchComparisonSummary,
  processComparisonResult,
  type ComparisonSampleOrder,
  type ComparisonSummary,
} from '../../services/comparison';
import AverageCOQModal from '../../components/AverageCOQModal';
import ComparisonTestModal from '../../components/ComparisonTestModal';
import DetailModal from '../../components/DetailModal';

// Interface untuk data comparison records (untuk modal compatibility)
interface ComparisonRecord {
  id: string;
  sample_id: string;
  order_number: string;
  sample_type: string;
  vessel_name: string;
  tank_number: string;
  lab_completion_date: string;
  comparison_status: 'pending' | 'ready' | 'in_progress' | 'completed';
  product_qc_status: 'not_started' | 'completed';
  tank_value_status: 'not_started' | 'completed';
  lab_tester_status: 'not_started' | 'completed';
  comparison_test_status: 'not_started' | 'completed';
  test_category: 'Short Test' | 'IBS' | 'CoA' | 'Soak Test';
  priority: 'normal' | 'urgent';
  created_at: string;
  updated_at: string;
  lab_technician?: string;
  comparison_technician?: string;
  notes?: string;
  release_status?: 'Success' | 'Repeat';
  release_notes?: string;
  release_date?: string;
}

// Helper to convert API status to comparison status
const mapStatusToComparisonStatus = (status: string): ComparisonRecord['comparison_status'] => {
  switch (status) {
    case 'Ready':
      return 'ready';
    case 'InProgress':
      return 'in_progress';
    case 'Completed':
    case 'CompletedTesting':
      return 'completed';
    default:
      return 'pending';
  }
};

// Helper to convert API data to ComparisonRecord for modal compatibility
const mapApiToComparisonRecord = (order: ComparisonSampleOrder): ComparisonRecord => ({
  id: String(order.id),
  sample_id: order.nomorNpc,
  order_number: order.orderNo,
  sample_type: order.typeLoadName,
  vessel_name: order.shipName || '-',
  tank_number: order.tankiName,
  lab_completion_date: order.updatedAt,
  comparison_status: mapStatusToComparisonStatus(order.status),
  product_qc_status: 'completed', // Based on workflow, not directly available
  tank_value_status: order.workflow.averageCoq ? 'completed' : 'not_started',
  lab_tester_status: order.workflow.labTester ? 'completed' : 'not_started',
  comparison_test_status: order.workflow.comparationTest ? 'completed' : 'not_started',
  test_category: order.categoryTestName as ComparisonRecord['test_category'],
  priority: order.priority as 'normal' | 'urgent',
  created_at: order.createdAt,
  updated_at: order.updatedAt,
});

const Comparison: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  // Product QC action moved to Ship Management page
  const [averageCOQVisible, setAverageCOQVisible] = useState(false);
  const [comparisonTestVisible, setComparisonTestVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ComparisonRecord | null>(
    null,
  );

  // API state
  const [summary, setSummary] = useState<ComparisonSummary>({
    totalRecords: 0,
    ready: 0,
    inProgress: 0,
    completed: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Search state with default date today
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState<dayjs.Dayjs>(dayjs().startOf('day'));
  const [endDate, setEndDate] = useState<dayjs.Dayjs>(dayjs().endOf('day'));

  // Fetch summary on mount
  useEffect(() => {
    const loadSummary = async () => {
      setSummaryLoading(true);
      try {
        const data = await fetchComparisonSummary();
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch comparison summary:', error);
        message.error('Gagal memuat summary data');
      } finally {
        setSummaryLoading(false);
      }
    };

    loadSummary();
  }, []);

  // Refresh summary function
  const refreshSummary = async () => {
    setSummaryLoading(true);
    try {
      const data = await fetchComparisonSummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to refresh comparison summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Handler functions
  // Product QC handlers removed (moved to Ship Management)

  const handleInputTankValue = (record: ComparisonRecord) => {
    setSelectedRecord(record);
    setAverageCOQVisible(true);
  };

  const handleAverageCOQSubmit = (data: any) => {
    console.log('Average COQ Data submitted:', data);
    // Here you would normally save to backend
    // Update the record status to completed
    message.success('Average COQ completed successfully!');
    actionRef.current?.reload();
    refreshSummary();
  };

  const handleGenerateComparison = async (record: ComparisonRecord) => {
    // Check if prerequisites are completed (Product QC moved to Ship Management)
    if (
      record.tank_value_status !== 'completed' ||
      record.lab_tester_status !== 'completed'
    ) {
      message.warning(
        'Average COQ dan Lab Tester harus diselesaikan terlebih dahulu sebelum generate comparison',
      );
      return;
    }

    // Show loading message
    const loadingMessage = message.loading(
      'Generating comparison results...',
      0,
    );

    try {
      const response = await processComparisonResult({
        sampleOrderId: parseInt(record.id, 10),
      });

      loadingMessage();

      if (response?.status) {
        message.success('Comparison results berhasil di-generate!');
        // Trigger table reload
        actionRef.current?.reload();
        refreshSummary();
      } else {
        message.error(response?.message || 'Gagal generate comparison results');
      }
    } catch (error) {
      loadingMessage();
      console.error('Failed to generate comparison:', error);
      message.error('Gagal generate comparison results');
    }
  };

  const handleViewComparison = (record: ComparisonRecord) => {
    setSelectedRecord(record);
    setComparisonTestVisible(true);
  };

  const handleViewDetail = (record: ComparisonRecord) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleRelease = (releaseData: {
    status: 'Success' | 'Repeat';
    notes: string;
  }) => {
    console.log('Release Data:', releaseData);
    message.success(
      `Sample ${releaseData.status === 'Success' ? 'successfully released' : 'marked for repeat'}!`,
    );

    // In real app, this would be sent to backend
    actionRef.current?.reload();
    refreshSummary();
  };

  // Get status color functions
  const getComparisonStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'ready':
        return 'processing';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getComparisonStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'ready':
        return 'Ready';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
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
      default:
        return 'default';
    }
  };

  const getTestCategoryStatus = (
    category: ComparisonRecord['test_category'],
  ) => {
    switch (category) {
      case 'Short Test':
        return 'processing' as const;
      case 'IBS':
        return 'warning' as const;
      case 'CoA':
        return 'success' as const;
      case 'Soak Test':
      default:
        return 'default' as const;
    }
  };

  const getTaskStatusIcon = (status: string) => {
    return status === 'completed' ? (
      <CheckCircleOutlined style={{ color: '#52c41a' }} />
    ) : (
      <CloseCircleOutlined style={{ color: '#d9d9d9' }} />
    );
  };

  const getWorkflowStatusIcon = (record: ComparisonRecord) => {
    const coqCompleted = record.tank_value_status === 'completed';
    const labTesterCompleted = record.lab_tester_status === 'completed';
    const comparisonCompleted = record.comparison_test_status === 'completed';

    if (comparisonCompleted) {
      return (
        <CheckCircleOutlined style={{ color: '#722ed1', fontSize: '16px' }} />
      );
    } else if (coqCompleted && labTesterCompleted) {
      return (
        <ThunderboltOutlined style={{ color: '#fa8c16', fontSize: '16px' }} />
      );
    } else {
      return <SyncOutlined style={{ color: '#8c8c8c', fontSize: '16px' }} />;
    }
  };

  const getWorkflowStatusText = (record: ComparisonRecord) => {
    const coqCompleted = record.tank_value_status === 'completed';
    const labTesterCompleted = record.lab_tester_status === 'completed';
    const comparisonCompleted = record.comparison_test_status === 'completed';

    if (comparisonCompleted) {
      return { text: 'Results Available', color: '#722ed1' };
    } else if (coqCompleted && labTesterCompleted) {
      return { text: 'Ready to Generate', color: '#fa8c16' };
    } else {
      return { text: 'Pending Prerequisites', color: '#8c8c8c' };
    }
  };

  // Table columns
  const columns: ProColumns<ComparisonRecord>[] = [
    {
      title: 'Sample Information',
      key: 'sample_info',
      width: 220,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div
            style={{
              fontWeight: 600,
              fontSize: '14px',
              marginBottom: 4,
              color: '#262626',
            }}
          >
            {record.sample_id}
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 6 }}>
            {record.order_number}
          </div>
          <div style={{ fontSize: '13px', color: '#595959', marginBottom: 4 }}>
            {record.sample_type}
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.vessel_name} • {record.tank_number}
          </div>
        </div>
      ),
    },
    {
      title: 'Lab Completion',
      dataIndex: 'lab_completion_date',
      key: 'lab_completion_date',
      width: 140,
      render: (_, record) => (
        <div>
          {record.lab_completion_date ? (
            <>
              <div
                style={{ fontSize: '13px', fontWeight: 500, color: '#262626' }}
              >
                {dayjs(record.lab_completion_date).format('DD MMM YYYY')}
              </div>
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                {dayjs(record.lab_completion_date).format('HH:mm')}
              </div>
            </>
          ) : (
            <div
              style={{
                fontSize: '13px',
                color: '#8c8c8c',
                textAlign: 'center',
              }}
            >
              -
            </div>
          )}
        </div>
      ),
      sorter: true,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (_, record) => (
        <Tag
          color={getPriorityColor(record.priority)}
          style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '4px 8px',
            borderRadius: 6,
          }}
        >
          {record.priority}
        </Tag>
      ),
      filters: [
        { text: 'Normal', value: 'normal' },
        { text: 'Urgent', value: 'urgent' },
      ],
    },
    {
      title: 'Test Category',
      dataIndex: 'test_category',
      key: 'test_category',
      width: 140,
      render: (_, record) => (
        <Badge
          status={getTestCategoryStatus(record.test_category)}
          text={record.test_category}
        />
      ),
      filters: [
        { text: 'Short Test', value: 'Short Test' },
        { text: 'IBS', value: 'IBS' },
        { text: 'CoA', value: 'CoA' },
        { text: 'Soak Test', value: 'Soak Test' },
      ],
    },
    {
      title: 'Task Status',
      key: 'task_status',
      width: 160,
      render: (_, record) => (
        <div>
          <div
            style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}
          >
            {getTaskStatusIcon(record.tank_value_status)}
            <span style={{ marginLeft: 8, fontSize: '12px' }}>Average COQ</span>
          </div>
          <div
            style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}
          >
            {getTaskStatusIcon(record.lab_tester_status)}
            <span style={{ marginLeft: 8, fontSize: '12px' }}>Lab Tester</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {getTaskStatusIcon(record.comparison_test_status)}
            <span style={{ marginLeft: 8, fontSize: '12px' }}>
              Comparison Test
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Workflow Status',
      key: 'workflow_status',
      width: 150,
      render: (_, record) => {
        const status = getWorkflowStatusText(record);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {getWorkflowStatusIcon(record)}
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: status.color,
                  lineHeight: 1.2,
                }}
              >
                {status.text}
              </div>
              <div style={{ fontSize: '10px', color: '#8c8c8c' }}>
                {record.comparison_test_status === 'completed'
                  ? 'Click View Results'
                  : record.tank_value_status === 'completed' &&
                      record.lab_tester_status === 'completed'
                    ? 'Click Generate'
                    : 'Complete tasks first'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', gap: 4 }}>
            {/* Product QC action moved to Ship Management */}
            <Tooltip title={
              record.comparison_test_status === 'completed'
                ? 'Tidak dapat edit COQ setelah Comparison Result di-generate'
                : record.tank_value_status === 'completed'
                  ? 'Edit Average COQ'
                  : 'Input Average COQ'
            }>
              <Button
                type={
                  record.tank_value_status === 'completed'
                    ? 'default'
                    : 'primary'
                }
                size="small"
                icon={<SettingOutlined />}
                onClick={() => handleInputTankValue(record)}
                disabled={record.comparison_test_status === 'completed'}
                style={{
                  flex: 1,
                  fontSize: '11px',
                  height: 28,
                  backgroundColor:
                    record.comparison_test_status === 'completed'
                      ? '#f0f0f0'
                        : '#52c41a',
                  borderColor:
                    record.comparison_test_status === 'completed'
                      ? '#d9d9d9'
                      : '#52c41a',
                  color:
                    record.comparison_test_status === 'completed'
                      ? '#bfbfbf'
                      : '#fff',
                }}
              >
                COQ
              </Button>
            </Tooltip>
          </div>

          {/* Generate Comparison / View Results Button */}
          {record.comparison_test_status === 'completed' ? (
            <Tooltip title="Lihat Hasil Komparasi">
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewComparison(record)}
                style={{
                  fontSize: '11px',
                  height: 28,
                  backgroundColor: '#722ed1',
                  borderColor: '#722ed1',
                  color: '#fff',
                }}
              >
                View Results
              </Button>
            </Tooltip>
          ) : (
            <Tooltip
              title={
                record.tank_value_status !== 'completed' ||
                record.lab_tester_status !== 'completed'
                  ? 'Selesaikan Average COQ dan Lab Tester terlebih dahulu'
                  : 'Generate hasil komparasi otomatis'
              }
            >
              <Button
                type="primary"
                size="small"
                icon={<ThunderboltOutlined />}
                onClick={() => handleGenerateComparison(record)}
                disabled={
                  record.tank_value_status !== 'completed' ||
                  record.lab_tester_status !== 'completed'
                }
                style={{
                  fontSize: '11px',
                  height: 28,
                  backgroundColor:
                    record.tank_value_status !== 'completed' ||
                    record.lab_tester_status !== 'completed'
                      ? '#f0f0f0'
                      : '#fa8c16',
                  borderColor:
                    record.tank_value_status !== 'completed' ||
                    record.lab_tester_status !== 'completed'
                      ? '#d9d9d9'
                      : '#fa8c16',
                  color:
                    record.tank_value_status !== 'completed' ||
                    record.lab_tester_status !== 'completed'
                      ? '#8c8c8c'
                      : '#fff',
                }}
              >
                Generate
              </Button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Module Komparasi"
      content="Kelola proses komparasi sampel setelah selesai pengujian laboratorium"
    >
      {/* Summary Cards */}
      <Spin spinning={summaryLoading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6} md={6}>
            <Card>
              <Statistic
                title="Total Records"
                value={summary.totalRecords}
                prefix={<FileTextOutlined style={{ color: '#0073fe' }} />}
                valueStyle={{ color: '#0073fe', fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6} md={6}>
            <Card>
              <Statistic
                title="Ready"
                value={summary.ready}
                prefix={<SyncOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6} md={6}>
            <Card>
              <Statistic
                title="In Progress"
                value={summary.inProgress}
                prefix={<TagsOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14', fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6} md={6}>
            <Card>
              <Statistic
                title="Completed"
                value={summary.completed}
                prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1', fontSize: '20px' }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* Search Card */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Space>
            <span>Search:</span>
            <Input.Search
              placeholder="Cari NPC, Order No..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={() => actionRef.current?.reload()}
              style={{ width: 250 }}
              allowClear
            />
          </Space>
          <Space>
            <span>Start:</span>
            <DatePicker
              showTime
              value={startDate}
              onChange={(date) => setStartDate(date || dayjs().startOf('day'))}
              format="YYYY-MM-DD HH:mm"
              placeholder="Start Date"
              style={{ width: 180 }}
            />
          </Space>
          <Space>
            <span>End:</span>
            <DatePicker
              showTime
              value={endDate}
              onChange={(date) => setEndDate(date || dayjs().endOf('day'))}
              format="YYYY-MM-DD HH:mm"
              placeholder="End Date"
              style={{ width: 180 }}
            />
          </Space>
          <Button type="primary" onClick={() => actionRef.current?.reload()}>
            Cari
          </Button>
          <Button onClick={() => {
            setSearchText('');
            setStartDate(dayjs().startOf('day'));
            setEndDate(dayjs().endOf('day'));
            actionRef.current?.reload();
          }}>
            Reset
          </Button>
        </Space>
      </Card>

      {/* Main Table */}
      <ProTable<ComparisonRecord>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        columns={columns}
        request={async (params) => {
          try {
            const response = await fetchComparisonSampleOrders({
              page: params.current ?? 1,
              pageSize: params.pageSize ?? 10,
              search: searchText || undefined,
              startDate: startDate.format('YYYY-MM-DD'),
              endDate: endDate.format('YYYY-MM-DD'),
            });

            // Map API response to ComparisonRecord format
            const data = (response?.data ?? []).map(mapApiToComparisonRecord);

            return {
              data,
              success: response?.status ?? true,
              total: response?.meta?.pagination?.totalData ?? 0,
            };
          } catch (error) {
            console.error('Failed to fetch comparison data:', error);
            message.error('Gagal memuat data komparasi');
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
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} records`,
        }}
        dateFormatter="string"
        headerTitle="Daftar Komparasi Sampel"
        toolBarRender={() => [
          <Button key="refresh" onClick={() => {
            actionRef.current?.reload();
            refreshSummary();
          }}>
            Refresh
          </Button>,
          <Button key="export" type="default">
            Export Excel
          </Button>,
          <Button key="report" type="primary">
            Generate Report
          </Button>,
        ]}
        scroll={{ x: 'max-content' }}
        size="small"
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
      />

      {/* Product QC moved to Ship Management */}

      {/* Average COQ Modal */}
      <AverageCOQModal
        visible={averageCOQVisible}
        onClose={() => {
          setAverageCOQVisible(false);
          setSelectedRecord(null);
        }}
        sampleData={selectedRecord}
        onSubmit={handleAverageCOQSubmit}
      />

      {/* Comparison Test Modal */}
      <ComparisonTestModal
        visible={comparisonTestVisible}
        onClose={() => {
          setComparisonTestVisible(false);
          setSelectedRecord(null);
        }}
        sampleData={selectedRecord}
      />

      {/* Detail Modal */}
      <DetailModal
        visible={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedRecord(null);
        }}
        sampleData={selectedRecord}
        onRelease={handleRelease}
      />
    </PageContainer>
  );
};

export default Comparison;
