import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExperimentOutlined,
  EyeOutlined,
  FileDoneOutlined,
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
import { Button, Card, Col, message, Row, Statistic, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import AverageCOQModal from '../../components/AverageCOQModal';
import ComparisonTestModal from '../../components/ComparisonTestModal';
import DetailModal from '../../components/DetailModal';
import ProductQCModal from '../../components/ProductQCModal';

// Interface untuk data comparison records
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

const Comparison: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [productQCVisible, setProductQCVisible] = useState(false);
  const [averageCOQVisible, setAverageCOQVisible] = useState(false);
  const [comparisonTestVisible, setComparisonTestVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ComparisonRecord | null>(
    null,
  );

  // Mock data untuk comparison records
  const mockComparisonData: ComparisonRecord[] = [
    {
      id: '1',
      sample_id: 'SMPL-20250906-001',
      order_number: 'SO-20250906-001',
      sample_type: 'JET A-1',
      vessel_name: 'MT. Commodore One',
      tank_number: 'T.107',
      lab_completion_date: '',
      comparison_status: 'pending',
      product_qc_status: 'not_started',
      tank_value_status: 'not_started',
      lab_tester_status: 'not_started',
      comparison_test_status: 'not_started',
      priority: 'urgent',
      created_at: '2025-09-06 10:00:00',
      updated_at: '2025-09-06 15:30:00',
    },
    {
      id: '2',
      sample_id: 'SMPL-20250906-002',
      order_number: 'SO-20250906-002',
      sample_type: 'Avgas',
      vessel_name: 'MT. Pioneer',
      tank_number: 'T.203',
      lab_completion_date: '2025-09-06 14:15:00',
      comparison_status: 'ready',
      product_qc_status: 'completed',
      tank_value_status: 'completed',
      lab_tester_status: 'completed',
      comparison_test_status: 'not_started',
      priority: 'normal',
      created_at: '2025-09-06 11:00:00',
      updated_at: '2025-09-06 16:00:00',
      comparison_technician: 'Drs. Wijaya Kusuma',
      notes:
        'Ready for comparison generation - QC, COQ, and Lab Test completed',
    },
    {
      id: '3',
      sample_id: 'SMPL-20250905-001',
      order_number: 'SO-20250905-001',
      sample_type: 'Diesel',
      vessel_name: 'MT. Explorer',
      tank_number: 'T.301',
      lab_completion_date: '2025-09-05 16:30:00',
      comparison_status: 'completed',
      product_qc_status: 'completed',
      tank_value_status: 'completed',
      lab_tester_status: 'completed',
      comparison_test_status: 'completed',
      priority: 'normal',
      created_at: '2025-09-05 09:00:00',
      updated_at: '2025-09-05 17:45:00',
      comparison_technician: 'Dr. Sari Dewi',
      notes:
        'Comparison completed successfully, all parameters within acceptable range',
      release_status: 'Success',
      release_notes:
        'All parameters within specification, released for distribution',
      release_date: '2025-09-05 18:00:00',
    },
    {
      id: '4',
      sample_id: 'SMPL-20250904-003',
      order_number: 'SO-20250904-003',
      sample_type: 'Gasoline',
      vessel_name: 'MT. Navigator',
      tank_number: 'T.405',
      lab_completion_date: '2025-09-04 13:20:00',
      comparison_status: 'completed',
      product_qc_status: 'completed',
      tank_value_status: 'completed',
      lab_tester_status: 'completed',
      comparison_test_status: 'completed',
      priority: 'normal',
      created_at: '2025-09-04 08:00:00',
      updated_at: '2025-09-04 13:20:00',
      release_status: 'Repeat',
      release_notes:
        'Density values slightly outside acceptable range, requires retesting',
      release_date: '2025-09-04 14:30:00',
    },
    {
      id: '5',
      sample_id: 'SMPL-20250907-001',
      order_number: 'SO-20250907-001',
      sample_type: 'Kerosene',
      vessel_name: 'MT. Atlantic Star',
      tank_number: 'T.502',
      lab_completion_date: '2025-09-07 11:45:00',
      comparison_status: 'completed',
      product_qc_status: 'completed',
      tank_value_status: 'completed',
      lab_tester_status: 'completed',
      comparison_test_status: 'completed',
      priority: 'urgent',
      created_at: '2025-09-07 08:30:00',
      updated_at: '2025-09-07 15:20:00',
      comparison_technician: 'Dr. Ahmad Rizky',
      notes:
        'Comparison analysis completed, awaiting release decision based on quality parameters',
      // Tidak ada release_status, release_notes, atau release_date - menunjukkan belum dirilis
    },
  ];

  // Handler functions
  const handleProductQC = (record: ComparisonRecord) => {
    setSelectedRecord(record);
    setProductQCVisible(true);
  };

  const handleProductQCSubmit = (data: any) => {
    console.log('Product QC Data submitted:', data);
    // Here you would normally save to backend
    // Update the record status to completed
    message.success('Product QC completed successfully!');
    actionRef.current?.reload();
  };

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
  };

  const handleLabTester = (record: ComparisonRecord) => {
    // Simulate lab tester action
    const loadingMessage = message.loading(
      'Processing Lab Tester status...',
      0,
    );

    setTimeout(() => {
      loadingMessage();
      message.success('Lab Tester status updated successfully!');

      // Update record status - in real app, this would come from backend
      const _updatedData = mockComparisonData.map((item) =>
        item.id === record.id
          ? {
              ...item,
              lab_tester_status: 'completed',
              updated_at: new Date().toISOString(),
            }
          : item,
      );

      // Trigger table reload
      actionRef.current?.reload();
    }, 1500);
  };

  const handleGenerateComparison = (record: ComparisonRecord) => {
    // Check if all three prerequisites are completed
    if (
      record.product_qc_status !== 'completed' ||
      record.tank_value_status !== 'completed' ||
      record.lab_tester_status !== 'completed'
    ) {
      message.warning(
        'Product QC, Average COQ, dan Lab Tester harus diselesaikan terlebih dahulu sebelum generate comparison',
      );
      return;
    }

    // Show loading message
    const loadingMessage = message.loading(
      'Generating comparison results...',
      0,
    );

    // Simulate backend API call for generating comparison
    setTimeout(() => {
      loadingMessage();
      message.success('Comparison results berhasil di-generate!');

      // Update record status - in real app, this would come from backend
      const _updatedData = mockComparisonData.map((item) =>
        item.id === record.id
          ? {
              ...item,
              comparison_test_status: 'completed',
              comparison_status: 'completed',
              updated_at: new Date().toISOString(),
            }
          : item,
      );

      // Trigger table reload
      actionRef.current?.reload();
    }, 2000);
  };

  const handleViewComparison = (record: ComparisonRecord) => {
    if (record.comparison_test_status !== 'completed') {
      message.warning(
        'Comparison test belum di-generate. Silakan generate terlebih dahulu.',
      );
      return;
    }
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

    // Update record status in real app, this would be sent to backend
    // For now, we'll just simulate the update
    const recordIndex = mockComparisonData.findIndex(
      (item) => item.id === selectedRecord?.id,
    );
    if (recordIndex !== -1) {
      mockComparisonData[recordIndex] = {
        ...mockComparisonData[recordIndex],
        release_status: releaseData.status,
        release_notes: releaseData.notes,
        release_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    actionRef.current?.reload();
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

  const getTaskStatusIcon = (status: string) => {
    return status === 'completed' ? (
      <CheckCircleOutlined style={{ color: '#52c41a' }} />
    ) : (
      <CloseCircleOutlined style={{ color: '#d9d9d9' }} />
    );
  };

  const getWorkflowStatusIcon = (record: ComparisonRecord) => {
    const qcCompleted = record.product_qc_status === 'completed';
    const coqCompleted = record.tank_value_status === 'completed';
    const labTesterCompleted = record.lab_tester_status === 'completed';
    const comparisonCompleted = record.comparison_test_status === 'completed';

    if (comparisonCompleted) {
      return (
        <CheckCircleOutlined style={{ color: '#722ed1', fontSize: '16px' }} />
      );
    } else if (qcCompleted && coqCompleted && labTesterCompleted) {
      return (
        <ThunderboltOutlined style={{ color: '#fa8c16', fontSize: '16px' }} />
      );
    } else {
      return <SyncOutlined style={{ color: '#8c8c8c', fontSize: '16px' }} />;
    }
  };

  const getWorkflowStatusText = (record: ComparisonRecord) => {
    const qcCompleted = record.product_qc_status === 'completed';
    const coqCompleted = record.tank_value_status === 'completed';
    const labTesterCompleted = record.lab_tester_status === 'completed';
    const comparisonCompleted = record.comparison_test_status === 'completed';

    if (comparisonCompleted) {
      return { text: 'Results Available', color: '#722ed1' };
    } else if (qcCompleted && coqCompleted && labTesterCompleted) {
      return { text: 'Ready to Generate', color: '#fa8c16' };
    } else {
      return { text: 'Pending Prerequisites', color: '#8c8c8c' };
    }
  };

  // Calculate summary statistics
  const summary = {
    total: mockComparisonData.length,
    pending: mockComparisonData.filter(
      (item) => item.comparison_status === 'pending',
    ).length,
    ready: mockComparisonData.filter(
      (item) => item.comparison_status === 'ready',
    ).length,
    in_progress: mockComparisonData.filter(
      (item) => item.comparison_status === 'in_progress',
    ).length,
    completed: mockComparisonData.filter(
      (item) => item.comparison_status === 'completed',
    ).length,
    released_success: mockComparisonData.filter(
      (item) => item.release_status === 'Success',
    ).length,
    released_repeat: mockComparisonData.filter(
      (item) => item.release_status === 'Repeat',
    ).length,
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
          {record.priority.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Normal', value: 'normal' },
        { text: 'Urgent', value: 'urgent' },
      ],
    },
    {
      title: 'Task Status',
      key: 'task_status',
      width: 180,
      render: (_, record) => (
        <div>
          <div
            style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}
          >
            {getTaskStatusIcon(record.product_qc_status)}
            <span style={{ marginLeft: 8, fontSize: '12px' }}>Product QC</span>
          </div>
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
                  : record.product_qc_status === 'completed' &&
                      record.tank_value_status === 'completed'
                    ? 'Click Generate'
                    : 'Complete tasks first'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Comparison Status',
      dataIndex: 'comparison_status',
      key: 'comparison_status',
      width: 140,
      render: (_, record) => (
        <Tag
          color={getComparisonStatusColor(record.comparison_status)}
          style={{
            fontSize: '12px',
            fontWeight: 500,
            padding: '6px 12px',
            borderRadius: 8,
            border: 'none',
          }}
        >
          {getComparisonStatusText(record.comparison_status)}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Ready', value: 'ready' },
        { text: 'In Progress', value: 'in_progress' },
        { text: 'Completed', value: 'completed' },
      ],
    },
    {
      title: 'Release Status',
      key: 'release_status',
      width: 120,
      render: (_, record) => {
        if (
          !record.release_status ||
          record.comparison_test_status !== 'completed'
        ) {
          return <span style={{ color: '#8c8c8c', fontSize: '12px' }}>-</span>;
        }

        return (
          <Tag
            color={record.release_status === 'Success' ? 'success' : 'warning'}
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: 6,
            }}
          >
            {record.release_status}
          </Tag>
        );
      },
      filters: [
        { text: 'Success', value: 'Success' },
        { text: 'Repeat', value: 'Repeat' },
      ],
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
            <Tooltip title="Product QC">
              <Button
                type={
                  record.product_qc_status === 'completed'
                    ? 'default'
                    : 'primary'
                }
                size="small"
                icon={<FileDoneOutlined />}
                onClick={() => handleProductQC(record)}
                style={{
                  flex: 1,
                  fontSize: '11px',
                  height: 28,
                  backgroundColor:
                    record.product_qc_status === 'completed'
                      ? '#f0f0f0'
                      : '#1890ff',
                  borderColor:
                    record.product_qc_status === 'completed'
                      ? '#d9d9d9'
                      : '#1890ff',
                  color:
                    record.product_qc_status === 'completed'
                      ? '#8c8c8c'
                      : '#fff',
                }}
              >
                QC
              </Button>
            </Tooltip>
            <Tooltip title="Average COQ">
              <Button
                type={
                  record.tank_value_status === 'completed'
                    ? 'default'
                    : 'primary'
                }
                size="small"
                icon={<SettingOutlined />}
                onClick={() => handleInputTankValue(record)}
                style={{
                  flex: 1,
                  fontSize: '11px',
                  height: 28,
                  backgroundColor:
                    record.tank_value_status === 'completed'
                      ? '#f0f0f0'
                      : '#52c41a',
                  borderColor:
                    record.tank_value_status === 'completed'
                      ? '#d9d9d9'
                      : '#52c41a',
                  color:
                    record.tank_value_status === 'completed'
                      ? '#8c8c8c'
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
                record.product_qc_status !== 'completed' ||
                record.tank_value_status !== 'completed' ||
                record.lab_tester_status !== 'completed'
                  ? 'Selesaikan Product QC, Average COQ, dan Lab Tester terlebih dahulu'
                  : 'Generate hasil komparasi otomatis'
              }
            >
              <Button
                type="primary"
                size="small"
                icon={<ThunderboltOutlined />}
                onClick={() => handleGenerateComparison(record)}
                disabled={
                  record.product_qc_status !== 'completed' ||
                  record.tank_value_status !== 'completed' ||
                  record.lab_tester_status !== 'completed'
                }
                style={{
                  fontSize: '11px',
                  height: 28,
                  backgroundColor:
                    record.product_qc_status !== 'completed' ||
                    record.tank_value_status !== 'completed' ||
                    record.lab_tester_status !== 'completed'
                      ? '#f0f0f0'
                      : '#fa8c16',
                  borderColor:
                    record.product_qc_status !== 'completed' ||
                    record.tank_value_status !== 'completed' ||
                    record.lab_tester_status !== 'completed'
                      ? '#d9d9d9'
                      : '#fa8c16',
                  color:
                    record.product_qc_status !== 'completed' ||
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

          {/* Detail Button */}
          <Button
            type="dashed"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            style={{
              fontSize: '11px',
              height: 28,
              color: '#595959',
              borderColor: '#d9d9d9',
            }}
          >
            View Detail
          </Button>
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
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6} md={4}>
          <Card>
            <Statistic
              title="Total Records"
              value={summary.total}
              prefix={<FileTextOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} md={4}>
          <Card>
            <Statistic
              title="Ready"
              value={summary.ready}
              prefix={<SyncOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} md={4}>
          <Card>
            <Statistic
              title="In Progress"
              value={summary.in_progress}
              prefix={<TagsOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} md={4}>
          <Card>
            <Statistic
              title="Completed"
              value={summary.completed}
              prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} md={4}>
          <Card>
            <Statistic
              title="Released Success"
              value={summary.released_success}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} md={4}>
          <Card>
            <Statistic
              title="Need Repeat"
              value={summary.released_repeat}
              prefix={<ExperimentOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <ProTable<ComparisonRecord>
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          searchText: 'Cari',
          resetText: 'Reset',
        }}
        columns={columns}
        dataSource={mockComparisonData}
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
          <Button key="refresh" onClick={() => actionRef.current?.reload()}>
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

      {/* Product QC Modal */}
      <ProductQCModal
        visible={productQCVisible}
        onClose={() => {
          setProductQCVisible(false);
          setSelectedRecord(null);
        }}
        sampleData={selectedRecord}
        onSubmit={handleProductQCSubmit}
      />

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
