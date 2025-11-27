import {
  DatabaseOutlined,
  ExperimentOutlined,
  HistoryOutlined,
  SyncOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ActionType as ProActionType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { request } from '@umijs/max';
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
import React, { useEffect, useRef, useState } from 'react';
import { history } from 'umi';

// Components
import type { ActionType as LabActionType } from '@/components/LaboratoryActionModal';
import LaboratoryActionModal from '@/components/LaboratoryActionModal';
import SyringeManagement from '@/components/SyringeManagement';
// Local imports
import { getTableColumns } from './columns';
import TestingReportModal from './components/TestingReportModal';
import { TEST_PARAMETERS } from './constants/testParameters';
import { MOCK_AUDIT_LOGS, MOCK_SYRINGE_DATA } from './data/mockData';
import type { AuditLog, SyringeData, TestingRecord } from './types';
import {
  getPriorityColor,
  getProgressColor,
  getStatusColor,
  getStatusLabel,
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
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    pending: 0,
    process: 0,
    completed: 0,
  });
  const [summary, setSummary] = useState(getTestingSummary([]));
  const [unitOptions, setUnitOptions] = useState<
    { label: string; value: string; id?: number }[]
  >([]);

  const actionRef = useRef<ProActionType>(null);
  const [form] = Form.useForm();

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
    if (!editingRecord) return;

    try {
      if (actionType === 'confirm_sample') {
        await request(
          `/api/LabTesting/sample-orders/${editingRecord.id}/confirm`,
          {
            method: 'POST',
            data: {
              comment:
                data?.description ||
                data?.comment ||
                'Konfirmasi sampel oleh laboratorium',
            },
          },
        );
        message.success('Sampel berhasil dikonfirmasi');
      } else if (actionType === 'waiting_test') {
        const estimated =
          data?.estimated_completion && dayjs(data.estimated_completion);
        if (!estimated || !estimated.isValid()) {
          throw new Error('Estimasi selesai tidak valid');
        }

        await request(
          `/api/LabTesting/sample-orders/${editingRecord.id}/register`,
          {
            method: 'POST',
            data: {
              estimatedCompletionDate: estimated.toISOString(),
              comment:
                data?.description ||
                data?.comment ||
                'Penjadwalan pengujian sampel',
            },
          },
        );
        message.success('Sampel berhasil dijadwalkan untuk pengujian');
      } else if (actionType === 'input_result') {
        const targetId = data?.sampleOrderId ?? editingRecord.id;
        if (!targetId) {
          throw new Error('Sample order tidak ditemukan');
        }

        const testsPayload = Array.isArray(data?.tests)
          ? data.tests.filter(
            (test: any) =>
              typeof test?.propertyTestId === 'number' &&
              typeof test?.value === 'number',
          )
          : [];

        if (!testsPayload.length) {
          message.error('Hasil pengujian belum diisi');
          return;
        }

        await request(`/api/LabTesting/sample-orders/${targetId}/tests`, {
          method: 'POST',
          data: { tests: testsPayload },
        });

        await request(
          `/api/LabTesting/sample-orders/${targetId}/complete`,
          {
            method: 'POST',
            data: {
              comment:
                data?.recommendations ||
                data?.comment ||
                'Hasil pengujian dikonfirmasi',
            },
          },
        );

        message.success('Hasil pengujian berhasil dikonfirmasi');
      } else {
        message.success('Aksi berhasil diproses');
      }

      setActionModalVisible(false);
      setEditingRecord(undefined);
      actionRef.current?.reload();
    } catch (error: any) {
      const errorMessage =
        error?.data?.Message ||
        error?.data?.message ||
        error?.message ||
        'Gagal memproses aksi';
      message.error(errorMessage);
    }
  };

  const handleActionSave = async (actionType: LabActionType, data: any) => {
    if (actionType !== 'input_result') {
      message.info('Data berhasil disimpan sementara');
      return;
    }

    const targetId = data?.sampleOrderId ?? editingRecord?.id;
    if (!targetId) {
      message.error('Sample order tidak ditemukan');
      return;
    }

    const testsPayload = Array.isArray(data?.tests)
      ? data.tests.filter(
        (test: any) =>
          typeof test?.propertyTestId === 'number' &&
          typeof test?.value === 'number',
      )
      : [];

    if (!testsPayload.length) {
      message.warning('Tidak ada data pengujian yang dapat disimpan');
      return;
    }

    try {
      await request(`/api/LabTesting/sample-orders/${targetId}/tests`, {
        method: 'POST',
        data: { tests: testsPayload },
      });
      message.success('Data hasil pengujian berhasil disimpan');
    } catch (error: any) {
      const errorMessage =
        error?.data?.Message ||
        error?.data?.message ||
        error?.message ||
        'Gagal menyimpan data sementara';
      message.error(errorMessage);
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

  const getStatusQueryByTab = (tabKey: string) => {
    if (tabKey === 'pending') return 'PENDING';
    if (tabKey === 'process') return 'IN_PROCESS';
    if (tabKey === 'completed') return 'COMPLETED';
    return '';
  };

  const normalizeDateValue = (value?: string | null) => {
    if (!value || value === '-' || value === '') return undefined;
    return value;
  };

  const formatDateTime = (value?: string | null) => {
    if (!value || value === '-' || value === '') return '-';
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : value;
  };

  const getLabStatusDetails = (record?: TestingRecord) => [
    {
      key: 'confirmed',
      label: 'Dikonfirmasi',
      color: '#52c41a',
      at: record?.confirmedAt,
      by: record?.confirmedBy,
      reason: record?.confirmedReason,
    },
    {
      key: 'registered',
      label: 'Terdaftar',
      color: '#1890ff',
      at: record?.registeredAt,
      by: record?.registeredBy,
      reason: record?.registeredReason,
    },
    {
      key: 'tested',
      label: 'Sedang Diuji',
      color: '#faad14',
      at: record?.testedAt,
      by: record?.testedBy,
    },
    {
      key: 'completed',
      label: 'Selesai',
      color: '#389e0d',
      at: record?.completedAt,
      by: record?.completedBy,
      reason: record?.completedReason,
    },
    {
      key: 'canceled',
      label: 'Dibatalkan',
      color: '#ff4d4f',
      at: record?.canceledAt,
      by: record?.canceledBy,
      reason: record?.canceledReason,
    },
  ];

  useEffect(() => {
    actionRef.current?.reload();
  }, [activeTab]);

  useEffect(() => {
    const fetchUnitOptions = async () => {
      try {
        const response = await request('/api/Satuans/by-flags', {
          method: 'GET',
          params: { isTests: true },
        });
        const options =
          (response?.data || []).map((item: any) => ({
            label: item.name,
            value: item.name,
            id: item.id,
          })) || [];
        setUnitOptions(options);
      } catch (error) {
        console.error('Failed to fetch satuan list', error);
      }
    };

    fetchUnitOptions();
  }, []);

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
              label: `All Samples (${tabCounts.all})`,
            },
            {
              key: 'pending',
              label: `Pending (${tabCounts.pending})`,
            },
            {
              key: 'process',
              label: `In Process (${tabCounts.process})`,
            },
            {
              key: 'completed',
              label: `Completed (${tabCounts.completed})`,
            },
          ]}
        />

        <ProTable<TestingRecord>
          columns={columns}
          actionRef={actionRef}
          request={async (params) => {
            const statusParam = getStatusQueryByTab(activeTab);
            const page = params?.current ?? 1;
            const pageSize = params?.pageSize ?? 10;

            try {
              const response = await request('/api/LabTesting/sample-orders/', {
                method: 'GET',
                params: {
                  page,
                  pageSize,
                  status: statusParam,
                },
              });

              const mapStatusCodeToTestingStatus = (
                statusCode: number | null,
              ) => {
                if (statusCode === null || Number.isNaN(statusCode))
                  return 'pending';
                if (statusCode >= 0 && statusCode <= 3) return 'shipped';
                if (statusCode === 4) return 'pending';
                if (statusCode === 5) return 'registered';
                if (statusCode === 6) return 'testing';
                if (statusCode >= 7 && statusCode <= 9) return 'completed';
                if (statusCode === 10) return 'failed';
                return 'pending';
              };

              const mapStatusCodeToProgress = (statusCode: number | null) => {
                if (statusCode === null || Number.isNaN(statusCode)) return 0;
                if (statusCode >= 0 && statusCode <= 2) return 20;
                if (statusCode === 3) return 40;
                if (statusCode === 4) return 50;
                if (statusCode === 5) return 60;
                if (statusCode === 6) return 80;
                if (statusCode >= 7 && statusCode <= 9) return 100;
                if (statusCode === 10) return 0;
                return 0;
              };

              const records: TestingRecord[] = (response?.data || []).map(
                (item: any) => {
                  const statusCode =
                    typeof item.status === 'number'
                      ? item.status
                      : Number(item.status);

                  const testingStatus =
                    mapStatusCodeToTestingStatus(statusCode);

                  return {
                    ...item,
                    id: item.id,
                    status: statusCode,
                    // map API fields to legacy table fields
                    sample_id: item.orderNo || `ORD-${item.id}`,
                    order_number: item.orderNo,
                    sample_type: item.sample?.typeLoadName || '-',
                    shipName: item.sample?.shipName || '-',
                    categoryTestId: item.categoryTestId,
                    testing_status: testingStatus,
                    received_date: normalizeDateValue(
                      item.receivedAt || item.received_at,
                    ),
                    estimated_completion: normalizeDateValue(
                      item.estimatedCompletionDate ||
                      item.estimated_completion ||
                      item.etaArival,
                    ),
                    progress_percentage: mapStatusCodeToProgress(statusCode),
                    priority: (item.priority as any) || 'normal',
                    notes: item.notes,
                    created_at: item.createdAt,
                  };
                },
              );

              const total =
                response?.meta?.pagination?.totalData ??
                response?.total ??
                records.length;

              setSummary(getTestingSummary(records));
              setTabCounts((prev) => ({
                ...prev,
                [activeTab === 'process' ? 'process' : activeTab]: total,
                ...(statusParam === '' ? { all: total } : {}),
              }));

              return {
                data: records,
                success: true,
                total,
              };
            } catch (error) {
              message.error('Gagal mengambil data sample orders');
              return {
                data: [],
                success: false,
              };
            }
          }}
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
                <Descriptions.Item label="Nomor NPC">
                  {viewingRecord.nomorNpc}
                </Descriptions.Item>
                <Descriptions.Item label="Order Number">
                  {viewingRecord.order_number}
                </Descriptions.Item>
                <Descriptions.Item label="Jenis Sampel">
                  {viewingRecord.sample_type}
                </Descriptions.Item>
                <Descriptions.Item label="Kategori Tes">
                  {viewingRecord.categoryTestName ? (
                    <Tag color="blue">{viewingRecord.categoryTestName}</Tag>
                  ) : (
                    '-'
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Kapal/Tangki">
                  {viewingRecord.sample?.shipName || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Diterima">
                  {viewingRecord.received_date &&
                    dayjs(viewingRecord.received_date).isValid()
                    ? dayjs(viewingRecord.received_date).format('DD/MM/YYYY')
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Prioritas">
                  <Tag color={getPriorityColor(viewingRecord.priority)}>
                    {viewingRecord.priority.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Dibuat Pada">
                  {viewingRecord.createdAt
                    ? dayjs(viewingRecord.createdAt).format(
                      'DD/MM/YYYY HH:mm',
                    )
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Catatan">
                  {viewingRecord.notes || '-'}
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
                  percent={viewingRecord.progress_percentage || 0}
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
                  {viewingRecord.estimated_completion &&
                    dayjs(viewingRecord.estimated_completion).isValid()
                    ? dayjs(viewingRecord.estimated_completion).format(
                      'DD/MM/YYYY HH:mm',
                    )
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Actual Selesai">
                  {viewingRecord.completedAt
                    ? dayjs(viewingRecord.completedAt).format(
                      'DD/MM/YYYY HH:mm',
                    )
                    : '-'}
                </Descriptions.Item>
              </Descriptions>
              <div style={{ marginTop: 12 }}>
                <Text strong style={{ fontSize: '12px', color: '#595959' }}>
                  Riwayat Status Laboratorium
                </Text>
                <div style={{ marginTop: 8 }}>
                  {getLabStatusDetails(viewingRecord).map((detail) => (
                    <div
                      key={detail.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '6px 0',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <div style={{ width: 120 }}>
                        <Text style={{ fontWeight: 500 }}>{detail.label}</Text>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                          {formatDateTime(detail.at)}
                        </div>
                        <div style={{ fontSize: 12 }}>
                          <Text type="secondary">Oleh:</Text>{' '}
                          {detail.by && detail.by !== '-' ? detail.by : '-'}
                        </div>
                        {detail.reason &&
                          detail.reason !== '-' &&
                          detail.reason.trim() !== '' && (
                            <div style={{ fontSize: 12, marginTop: 2 }}>
                              <Text type="secondary">Catatan:</Text>{' '}
                              {detail.reason}
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
        unitOptions={unitOptions}
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
