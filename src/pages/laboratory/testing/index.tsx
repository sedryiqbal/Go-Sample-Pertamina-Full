import {
  DatabaseOutlined,
  ExperimentOutlined,
  HistoryOutlined,
  SyncOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ActionType as ProActionType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  Collapse,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Progress,
  Row,
  Space,
  Statistic,
  Steps,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import { history } from 'umi';

// Components
import type { ActionType as LabActionType } from '@/components/LaboratoryActionModal';
import LaboratoryActionModal from '@/components/LaboratoryActionModal';
import SyringeManagement from '@/components/SyringeManagement';
// Local imports
import { getTableColumns } from './columns';
import TestingReportModal from './components/TestingReportModal';
import { TEST_PARAMETERS } from './constants/testParameters';
import {
  MOCK_AUDIT_LOGS,
  MOCK_SYRINGE_DATA,
  MOCK_TESTING_DATA,
} from './data/mockData';
import type { AuditLog, SyringeData, TestingRecord } from './types';
import {
  getFilteredData,
  getPriorityColor,
  getProgressColor,
  getStatusColor,
  getStatusLabel,
  getTabCount,
  getTestingSummary,
} from './utils/helpers';

const { Title, Text } = Typography;

const LaboratoryTesting: React.FC = () => {
  // State management
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<
    TestingRecord | undefined
  >();
  const [editingRecord, setEditingRecord] = useState<
    TestingRecord | undefined
  >();
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [currentActionType, setCurrentActionType] =
    useState<LabActionType>('confirm_sample');
  const [syringeModalVisible, setSyringeModalVisible] = useState(false);
  const [selectedSyringe, setSelectedSyringe] = useState<
    SyringeData | undefined
  >();
  const [activeTab, setActiveTab] = useState('all');
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportRecord, setReportRecord] = useState<TestingRecord | undefined>();

  const actionRef = useRef<ProActionType>(null);
  const [form] = Form.useForm();

  // Testing status options
  const testingStatusOptions = [
    { label: 'Received', value: 'received' },
    { label: 'Registered', value: 'registered' },
    { label: 'Testing', value: 'testing' },
    { label: 'Waiting Equipment', value: 'waiting_equipment' },
    { label: 'Completed', value: 'completed' },
    { label: 'Failed', value: 'failed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Proses', value: 'proses' },
  ];

  // Event handlers
  const handleLabAction = (
    record: TestingRecord,
    actionType: LabActionType,
  ) => {
    setEditingRecord(record);
    setCurrentActionType(actionType);
    setActionModalVisible(true);
  };

  const handleActionSubmit = async (actionType: LabActionType, data: any) => {
    console.log('Action submitted:', actionType, data);
    // TODO: Implement API call to save final data and proceed to next stage
    actionRef.current?.reload();
  };

  const handleActionSave = async (actionType: LabActionType, data: any) => {
    console.log('Action saved temporarily:', actionType, data);
    // TODO: Implement API call to save temporary data
    try {
      // Simulate API call for saving temporary data
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Data berhasil disimpan sementara');
    } catch (error) {
      message.error('Gagal menyimpan data sementara');
    }
  };

  const handleSyringeClick = (syringe: SyringeData) => {
    setSelectedSyringe(syringe);
    setSyringeModalVisible(true);
  };

  const handleSyringeUpdate = (updatedSyringe: SyringeData) => {
    console.log('Syringe updated:', updatedSyringe);
    message.success('Stock syringe berhasil diperbarui');
  };

  const handleViewReport = (record: TestingRecord) => {
    setReportRecord(record);
    setReportModalVisible(true);
  };

  const handleView = (record: TestingRecord) => {
    setViewingRecord(record);
    setEditingRecord(undefined);
    setDrawerVisible(true);
  };

  const handleEdit = (record: TestingRecord) => {
    setEditingRecord(record);
    setViewingRecord(undefined);
    form.setFieldsValue(record);
    setDrawerVisible(true);
  };

  const handleInputTest = (record: TestingRecord) => {
    handleLabAction(record, 'input_result');
  };

  const handleConfirmSample = (record: TestingRecord) => {
    handleLabAction(record, 'confirm_sample');
  };

  const handleStartTesting = (record: TestingRecord) => {
    handleLabAction(record, 'waiting_test');
  };

  const handleViewDetail = (record: TestingRecord) => {
    history.push(`/laboratory/testing/detail/${record.id}`);
  };

  const handleSubmit = async (_values: any) => {
    try {
      if (editingRecord) {
        message.success('Data pengujian berhasil diperbarui');
      } else {
        message.success('Data pengujian berhasil ditambahkan');
      }
      setDrawerVisible(false);
      form.resetFields();
      actionRef.current?.reload();
    } catch (_error) {
      message.error('Gagal menyimpan data pengujian');
    }
  };

  const handleStatusUpdate = (_record: TestingRecord, newStatus: string) => {
    Modal.confirm({
      title: 'Update Status',
      content: `Apakah Anda yakin ingin mengubah status menjadi "${newStatus}"?`,
      onOk() {
        message.success(`Status berhasil diubah menjadi ${newStatus}`);
        actionRef.current?.reload();
      },
    });
  };

  // Get filtered data and counts
  const filteredData = getFilteredData(MOCK_TESTING_DATA, activeTab);
  const summary = getTestingSummary(MOCK_TESTING_DATA);

  // Audit Logs Table Columns
  const auditLogsColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp: string) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: '12px' }}>
            {dayjs(timestamp).format('DD MMM YYYY')}
          </div>
          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
            {dayjs(timestamp).format('HH:mm:ss')}
          </div>
        </div>
      ),
      sorter: (a: AuditLog, b: AuditLog) =>
        dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (action: string, record: AuditLog) => (
        <Tag
          color={
            record.type === 'success'
              ? 'success'
              : record.type === 'warning'
                ? 'warning'
                : record.type === 'error'
                  ? 'error'
                  : 'processing'
          }
          style={{ fontSize: '11px', fontWeight: 500 }}
        >
          {action}
        </Tag>
      ),
      filters: [
        { text: 'Stock Updated', value: 'Stock Updated' },
        { text: 'Stock Usage', value: 'Stock Usage' },
        { text: 'Stock Replenishment', value: 'Stock Replenishment' },
        { text: 'Low Stock Alert', value: 'Low Stock Alert' },
        { text: 'Critical Stock Alert', value: 'Critical Stock Alert' },
        { text: 'Equipment Maintenance', value: 'Equipment Maintenance' },
      ],
      onFilter: (value: any, record: AuditLog) => record.action === value,
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: 140,
      render: (user: string) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            borderRadius: 6,
            background: user === 'System' ? '#f0f0f0' : '#e6f7ff',
            border: `1px solid ${user === 'System' ? '#d9d9d9' : '#bae7ff'}`,
          }}
        >
          <UserOutlined style={{ marginRight: 6, fontSize: '12px' }} />
          <span style={{ fontSize: '12px', fontWeight: 500 }}>{user}</span>
        </div>
      ),
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (details: string) => (
        <span style={{ fontSize: '12px' }}>{details}</span>
      ),
    },
  ];

  // Table columns with handlers
  const columns = getTableColumns(
    handleView,
    handleInputTest,
    handleViewReport,
    handleConfirmSample,
    handleStartTesting,
  );

  return (
    <PageContainer
      header={{
        title: 'Laboratory Testing',
        breadcrumb: {
          items: [
            { path: '/', breadcrumbName: 'Home' },
            { path: '/laboratory', breadcrumbName: 'Laboratory Management' },
            { path: '/laboratory/testing', breadcrumbName: 'Testing' },
          ],
        },
      }}
    >
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Samples"
              value={summary.total}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Received"
              value={summary.received}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Testing"
              value={summary.testing}
              prefix={<SyncOutlined spin />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed"
              value={summary.completed}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Syringe Management */}
      <Collapse
        items={[
          {
            key: '0',
            label: (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DatabaseOutlined
                  style={{ color: '#1890ff', fontSize: '16px' }}
                />
                <span style={{ fontWeight: 600, fontSize: '16px' }}>
                  🧪 Syringe Stock Management
                </span>
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  {MOCK_SYRINGE_DATA.length} Location
                  {MOCK_SYRINGE_DATA.length > 1 ? 's' : ''}
                </Tag>
              </div>
            ),
            children: (
              <Row gutter={[24, 24]}>
                {/* Left Column - Current Stock */}
                <Col xs={24} lg={12}>
                  <Card
                    title="📊 Current Stock Status"
                    size="small"
                    headStyle={{
                      background:
                        'linear-gradient(90deg, #f0f2f5 0%, #ffffff 100%)',
                      borderBottom: '2px solid #1890ff',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                      }}
                    >
                      {MOCK_SYRINGE_DATA.map((syringe) => {
                        const stockPercentage =
                          (syringe.current_stock / syringe.max_capacity) * 100;
                        const getStockColor = () => {
                          if (syringe.status === 'urgent') return '#ff4d4f';
                          if (syringe.status === 'low') return '#faad14';
                          if (syringe.status === 'full') return '#1890ff';
                          return '#52c41a';
                        };

                        const getStatusText = () => {
                          if (syringe.status === 'urgent') return 'Mendesak';
                          if (syringe.status === 'low') return 'Rendah';
                          if (syringe.status === 'full') return 'Penuh';
                          return 'Normal';
                        };

                        return (
                          <Card
                            key={syringe.id}
                            hoverable
                            onClick={() => handleSyringeClick(syringe)}
                            style={{
                              cursor: 'pointer',
                              borderRadius: 12,
                              background:
                                'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                              border: `2px solid ${getStockColor()}`,
                              boxShadow: `0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px ${getStockColor()}20`,
                              transition: 'all 0.3s ease',
                              overflow: 'hidden',
                            }}
                            bodyStyle={{ padding: '20px' }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 56,
                                  height: 56,
                                  borderRadius: '50%',
                                  background: `linear-gradient(135deg, ${getStockColor()}15, ${getStockColor()}25)`,
                                  flexShrink: 0,
                                }}
                              >
                                <DatabaseOutlined
                                  style={{
                                    fontSize: 24,
                                    color: getStockColor(),
                                  }}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    color: '#262626',
                                    marginBottom: 4,
                                  }}
                                >
                                  {syringe.location}
                                </div>
                                <div
                                  style={{
                                    fontSize: '11px',
                                    color: '#8c8c8c',
                                    marginBottom: 8,
                                  }}
                                >
                                  Last Updated:{' '}
                                  {dayjs(syringe.last_updated).format(
                                    'DD MMM, HH:mm',
                                  )}
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: '24px',
                                      fontWeight: 700,
                                      color: getStockColor(),
                                    }}
                                  >
                                    {syringe.current_stock}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '12px',
                                      color: '#595959',
                                    }}
                                  >
                                    / {syringe.max_capacity} units
                                  </span>
                                  <Tag
                                    color={getStockColor()}
                                    style={{
                                      borderRadius: 12,
                                      fontSize: '10px',
                                      fontWeight: 600,
                                      marginLeft: 'auto',
                                    }}
                                  >
                                    {getStatusText()}
                                  </Tag>
                                </div>
                                <Progress
                                  percent={stockPercentage}
                                  strokeColor={getStockColor()}
                                  strokeWidth={6}
                                  showInfo={false}
                                  style={{ marginTop: 8 }}
                                />
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </Card>
                </Col>

                {/* Right Column - Audit Logs */}
                <Col xs={24} lg={12}>
                  <Card
                    title="📋 Recent Activity Logs"
                    size="small"
                    headStyle={{
                      background:
                        'linear-gradient(90deg, #f0f2f5 0%, #ffffff 100%)',
                      borderBottom: '2px solid #52c41a',
                    }}
                  >
                    <Table
                      columns={auditLogsColumns}
                      dataSource={MOCK_AUDIT_LOGS}
                      pagination={{ pageSize: 8, showSizeChanger: false }}
                      size="small"
                      scroll={{ y: 400 }}
                    />
                  </Card>
                </Col>
              </Row>
            ),
          },
        ]}
        defaultActiveKey={['1']}
        expandIconPosition="end"
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)',
          border: '1px solid #e8f4fd',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      />

      {/* Main Table */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'all',
              label: `All Samples (${getTabCount(MOCK_TESTING_DATA, 'all')})`,
            },
            {
              key: 'pending',
              label: `Pending (${getTabCount(MOCK_TESTING_DATA, 'pending')})`,
            },
            {
              key: 'process',
              label: `In Process (${getTabCount(MOCK_TESTING_DATA, 'process')})`,
            },
            {
              key: 'completed',
              label: `Completed (${getTabCount(MOCK_TESTING_DATA, 'completed')})`,
            },
          ]}
        />

        <ProTable<TestingRecord>
          columns={columns}
          actionRef={actionRef}
          dataSource={filteredData}
          rowKey="id"
          search={{
            labelWidth: 'auto',
          }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
          }}
          dateFormatter="string"
          headerTitle="Testing Records"
          toolBarRender={() => [
            <Button
              key="refresh"
              onClick={() => {
                actionRef.current?.reload();
              }}
            >
              Refresh
            </Button>,
          ]}
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title={viewingRecord ? 'Detail Sample' : 'Edit Sample'}
        width={800}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
        }}
        open={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          editingRecord ? (
            <div style={{ textAlign: 'right' }}>
              <Button
                onClick={() => {
                  setDrawerVisible(false);
                  form.resetFields();
                }}
                style={{ marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button onClick={() => form.submit()} type="primary">
                Submit
              </Button>
            </div>
          ) : undefined
        }
      >
        {viewingRecord ? (
          /* View Mode */
          <div>
            <Card
              title="Informasi Sampel"
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Sample ID">
                  {viewingRecord.sample_id}
                </Descriptions.Item>
                <Descriptions.Item label="Order Number">
                  {viewingRecord.order_number}
                </Descriptions.Item>
                <Descriptions.Item label="Jenis Sampel">
                  {viewingRecord.sample_type}
                </Descriptions.Item>
                <Descriptions.Item label="Kapal/Tangki">
                  {viewingRecord.vessel_name} • {viewingRecord.tank_number}
                </Descriptions.Item>
                <Descriptions.Item label="Diterima">
                  {dayjs(viewingRecord.received_date).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Prioritas">
                  <Tag color={getPriorityColor(viewingRecord.priority)}>
                    {viewingRecord.priority.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              title="Status Pengujian"
              size="small"
              style={{ marginBottom: 16 }}
            >
              <div style={{ marginBottom: 16 }}>
                <Progress
                  percent={viewingRecord.progress_percentage}
                  strokeColor={getProgressColor(
                    viewingRecord.progress_percentage,
                  )}
                  status={
                    viewingRecord.testing_status === 'completed'
                      ? 'success'
                      : 'active'
                  }
                />
              </div>

              <Steps
                size="small"
                current={
                  viewingRecord.testing_status === 'shipped'
                    ? 0
                    : viewingRecord.testing_status === 'registered'
                      ? 1
                      : viewingRecord.testing_status === 'testing'
                        ? 2
                        : viewingRecord.testing_status === 'completed'
                          ? 3
                          : 1
                }
                status={
                  viewingRecord.testing_status === 'waiting_equipment'
                    ? 'error'
                    : 'process'
                }
                items={[
                  {
                    title: 'Diterima',
                    description: 'Sample diterima lab',
                  },
                  {
                    title: 'Registrasi',
                    description: 'Sampel didaftarkan',
                  },
                  {
                    title: 'Pengujian',
                    description: 'Proses pengujian',
                  },
                  {
                    title: 'Selesai',
                    description: 'Pengujian selesai',
                  },
                ]}
              />
            </Card>

            <Card title="Informasi Lab" size="small">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Estimasi Selesai">
                  {viewingRecord.estimated_completion
                    ? dayjs(viewingRecord.estimated_completion).format(
                        'DD/MM/YYYY HH:mm',
                      )
                    : 'Invalid Date'}
                </Descriptions.Item>
                <Descriptions.Item label="Actual Selesai">
                  {viewingRecord.actual_completion
                    ? dayjs(viewingRecord.actual_completion).format(
                        'DD/MM/YYYY HH:mm',
                      )
                    : '-'}
                </Descriptions.Item>
              </Descriptions>
              {viewingRecord.quality_notes && (
                <div style={{ marginTop: 12 }}>
                  <strong>Catatan:</strong>
                  <div
                    style={{
                      padding: 8,
                      backgroundColor: '#f0f0f0',
                      borderRadius: 4,
                      marginTop: 4,
                    }}
                  >
                    {viewingRecord.quality_notes}
                  </div>
                </div>
              )}
            </Card>
          </div>
        ) : editingRecord ? (
          /* Edit Mode */
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Card
              title="Update Status & Progress"
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="progress_percentage"
                    label="Progress (%)"
                    rules={[
                      { required: true, message: 'Progress wajib diisi' },
                    ]}
                  >
                    <InputNumber min={0} max={100} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Form.Item name="quality_notes" label="Catatan Kualitas">
              <Input.TextArea
                rows={4}
                placeholder="Catatan mengenai kondisi sampel, alat yang digunakan, atau hasil pengujian..."
              />
            </Form.Item>

            {/* Quick Status Update Buttons */}
            <Card title="Quick Actions" size="small">
              <Space wrap>
                <Button
                  type="default"
                  onClick={() =>
                    editingRecord &&
                    handleStatusUpdate(editingRecord, 'registered')
                  }
                >
                  Mark as Registered
                </Button>
                <Button
                  type="default"
                  onClick={() =>
                    editingRecord &&
                    handleStatusUpdate(editingRecord, 'testing')
                  }
                >
                  Start Testing
                </Button>
                <Button
                  type="default"
                  onClick={() =>
                    editingRecord &&
                    handleStatusUpdate(editingRecord, 'completed')
                  }
                >
                  Mark as Completed
                </Button>
              </Space>
            </Card>
          </Form>
        ) : null}
      </Drawer>

      {/* Laboratory Action Modal */}
      <LaboratoryActionModal
        visible={actionModalVisible}
        onClose={() => setActionModalVisible(false)}
        onSubmit={handleActionSubmit}
        onSave={handleActionSave}
        record={editingRecord}
        actionType={currentActionType}
      />

      {/* Testing Report Modal */}
      <TestingReportModal
        visible={reportModalVisible}
        record={reportRecord || null}
        onClose={() => {
          setReportModalVisible(false);
          setReportRecord(undefined);
        }}
      />

      {/* Syringe Management Modal */}
      <SyringeManagement
        visible={syringeModalVisible}
        onClose={() => setSyringeModalVisible(false)}
        syringeData={selectedSyringe}
        onUpdate={handleSyringeUpdate}
      />
    </PageContainer>
  );
};

export default LaboratoryTesting;
