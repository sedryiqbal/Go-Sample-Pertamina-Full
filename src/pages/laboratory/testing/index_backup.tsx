import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ExperimentOutlined,
  EyeOutlined,
  FileTextOutlined,
  HistoryOutlined,
  PrinterOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type {
  ActionType as ProActionType,
  ProColumns,
} from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Progress,
  Result,
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
import type { ActionType as LabActionType } from '@/components/LaboratoryActionModal';
import LaboratoryActionModal from '@/components/LaboratoryActionModal';
import SyringeManagement, {
  type SyringeData,
} from '@/components/SyringeManagement';

interface TestingRecord {
  id: string;
  sample_id: string;
  order_number: string;
  sample_type: string;
  vessel_name: string;
  tank_number: string;
  received_date: string;
  testing_status:
    | 'received'
    | 'registered'
    | 'testing'
    | 'waiting_equipment'
    | 'completed'
    | 'failed'
    | 'pending'
    | 'shipped'
    | 'proses';
  lab_technician: string;
  equipment_used?: string;
  test_parameters: string[];
  test_results: { [key: string]: any };
  progress_percentage: number;
  priority: 'normal' | 'urgent' | 'critical';
  estimated_completion: string;
  actual_completion?: string;
  quality_notes?: string;
  created_at: string;
  updated_at: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

const LaboratoryTesting: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<
    TestingRecord | undefined
  >();
  const [editingRecord, setEditingRecord] = useState<
    TestingRecord | undefined
  >();

  // New state for action modal and syringe management
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [currentActionType, setCurrentActionType] =
    useState<LabActionType>('confirm_sample');
  const [syringeModalVisible, setSyringeModalVisible] = useState(false);
  const [selectedSyringe, setSelectedSyringe] = useState<
    SyringeData | undefined
  >();

  // Tab state
  const [activeTab, setActiveTab] = useState('all');

  // Report modal state
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportRecord, setReportRecord] = useState<TestingRecord | undefined>();

  const actionRef = useRef<ProActionType>(null);
  const [form] = Form.useForm();
  const { Title, Text } = Typography;

  // Test Parameters - Same as LaboratoryActionModal
  const testParameters = [
    {
      name: 'Distillation',
      key: 'distillation',
      unit: '%vol',
      standard: 'ASTM D86-17',
      min: 0,
      max: 100,
      method: 'ASTM D86-17',
    },
    {
      name: 'IBP',
      key: 'ibp',
      unit: '°C',
      standard: 'ASTM D86-17',
      min: 100,
      max: 200,
      method: 'ASTM D86-17',
    },
    {
      name: '10%',
      key: 'ten_percent',
      unit: '°C',
      standard: '',
      min: 120,
      max: 180,
      method: 'ASTM D86-17',
    },
    {
      name: '50%',
      key: 'fifty_percent',
      unit: '°C',
      standard: '',
      min: 150,
      max: 220,
      method: 'ASTM D86-17',
    },
    {
      name: '90%',
      key: 'ninety_percent',
      unit: '°C',
      standard: '',
      min: 180,
      max: 250,
      method: 'ASTM D86-17',
    },
    {
      name: 'FBP',
      key: 'fbp',
      unit: '°C',
      standard: '',
      min: 200,
      max: 300,
      method: 'ASTM D86-17',
    },
    {
      name: 'Residue',
      key: 'residue',
      unit: '%vol',
      standard: '',
      min: 0,
      max: 5,
      method: 'ASTM D86-17',
    },
    {
      name: 'Loss',
      key: 'loss',
      unit: '%vol',
      standard: '',
      min: 0,
      max: 2,
      method: 'ASTM D86-17',
    },
    {
      name: 'Flash Point Abel',
      key: 'flash_point_abel',
      unit: '°C',
      standard: 'BS EN ISO 13736:2008',
      min: 38,
      max: 100,
      method: 'BS EN ISO 13736:2008',
    },
    {
      name: 'Density at 15°C',
      key: 'density_15c',
      unit: 'kg/m³',
      standard: 'ASTM D4052-22',
      min: 775,
      max: 840,
      method: 'ASTM D4052-22',
    },
    {
      name: 'Freezing Point',
      key: 'freezing_point',
      unit: '°C',
      standard: 'ASTM D2386-19',
      min: -50,
      max: -40,
      method: 'ASTM D2386-19',
    },
    {
      name: 'FSII-P.A with SDA',
      key: 'fsii_pa_sda',
      unit: 'mg/kg',
      standard: 'ASTM D5006-22',
      min: 0,
      max: 200,
      method: 'ASTM D5006-22',
    },
    {
      name: 'Copper Strip Corrosion (2h/100°C)',
      key: 'copper_strip_corrosion',
      unit: 'class',
      standard: 'ASTM D130-19',
      min: 1,
      max: 4,
      method: 'ASTM D130-19',
    },
    {
      name: 'Existent Gum (unwashed)',
      key: 'existent_gum',
      unit: 'mg/100ml',
      standard: 'ASTM D381-22',
      min: 0,
      max: 7,
      method: 'ASTM D381-22',
    },
  ];

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

  // Mock Syringe data
  const mockSyringeData: SyringeData[] = [
    {
      id: '1',
      location: 'Laboratory Storage',
      current_stock: 15,
      min_threshold: 5,
      max_capacity: 50,
      last_updated: '2025-08-29T08:30:00Z',
      status: 'normal',
    },
  ];

  // Mock Audit Logs
  const mockAuditLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: '2025-09-08T10:30:00Z',
      action: 'Stock Updated',
      user: 'Dr. Ahmad Laboratorium',
      details: 'Updated stock from 12 to 15 units',
      type: 'success',
    },
    {
      id: '2',
      timestamp: '2025-09-08T09:15:00Z',
      action: 'Stock Usage',
      user: 'Ir. Budi Santoso',
      details: 'Used 3 syringes for sample testing',
      type: 'info',
    },
    {
      id: '3',
      timestamp: '2025-09-08T08:45:00Z',
      action: 'Low Stock Alert',
      user: 'System',
      details: 'Stock level reached minimum threshold',
      type: 'warning',
    },
    {
      id: '4',
      timestamp: '2025-09-07T16:20:00Z',
      action: 'Stock Replenishment',
      user: 'Drs. Cahaya Wijaya',
      details: 'Added 20 units to inventory',
      type: 'success',
    },
    {
      id: '5',
      timestamp: '2025-09-07T14:15:00Z',
      action: 'Stock Usage',
      user: 'Dr. Siti Rahayu',
      details: 'Used 5 syringes for urgent testing',
      type: 'info',
    },
    {
      id: '6',
      timestamp: '2025-09-07T11:30:00Z',
      action: 'Equipment Maintenance',
      user: 'Technical Team',
      details: 'Performed routine maintenance on storage unit',
      type: 'info',
    },
    {
      id: '7',
      timestamp: '2025-09-06T16:45:00Z',
      action: 'Stock Updated',
      user: 'Dr. Ahmad Laboratorium',
      details: 'Manual stock adjustment after audit',
      type: 'success',
    },
    {
      id: '8',
      timestamp: '2025-09-06T09:20:00Z',
      action: 'Critical Stock Alert',
      user: 'System',
      details: 'Stock level critically low - immediate action required',
      type: 'error',
    },
  ];

  // Action handlers
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
    // Here you would normally send the data to your backend
    // For now, just update the local state and show success message
    actionRef.current?.reload();
  };

  const handleSyringeClick = (syringe: SyringeData) => {
    setSelectedSyringe(syringe);
    setSyringeModalVisible(true);
  };

  const handleSyringeUpdate = (updatedSyringe: SyringeData) => {
    console.log('Syringe updated:', updatedSyringe);
    // Update your syringe data here
    message.success('Stock syringe berhasil diperbarui');
  };

  const handleSaveTestResult = async (record: TestingRecord) => {
    try {
      // Here you would normally save the test result to your backend
      console.log('Saving test result for:', record.sample_id);
      message.success(
        `Hasil pengujian untuk ${record.sample_id} berhasil disimpan`,
      );
      actionRef.current?.reload();
    } catch (error) {
      message.error('Gagal menyimpan hasil pengujian');
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shipped':
        return 'default';
      case 'pending':
        return 'warning';
      case 'registered':
        return 'processing';
      case 'testing':
        return 'processing';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'received':
        return 'Diterima';
      case 'registered':
        return 'Terdaftar';
      case 'testing':
        return 'Sedang Diuji';
      case 'completed':
        return 'Selesai';
      case 'failed':
        return 'Gagal';
      case 'pending':
        return 'Pending';
      case 'shipped':
        return 'Shipped';
      case 'proses':
        return 'Proses';
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
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return '#9fe400';
    if (percentage >= 50) return '#1890ff';
    if (percentage >= 40) return '#faad14';
    return '#808080';
  };

  // Filter data based on active tab
  const getFilteredData = () => {
    if (activeTab === 'all') return mockData;
    if (activeTab === 'pending')
      return mockData.filter((item) =>
        ['received', 'registered', 'pending'].includes(item.testing_status),
      );
    if (activeTab === 'process')
      return mockData.filter((item) =>
        ['testing', 'proses'].includes(item.testing_status),
      );
    if (activeTab === 'completed')
      return mockData.filter((item) => item.testing_status === 'completed');
    return mockData;
  };

  const getTabCount = (tabKey: string) => {
    if (tabKey === 'all') return mockData.length;
    if (tabKey === 'pending')
      return mockData.filter((item) =>
        ['received', 'registered', 'pending'].includes(item.testing_status),
      ).length;
    if (tabKey === 'process')
      return mockData.filter((item) =>
        ['testing', 'proses'].includes(item.testing_status),
      ).length;
    if (tabKey === 'completed')
      return mockData.filter((item) => item.testing_status === 'completed')
        .length;
    return 0;
  };

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
          <UserOutlined
            style={{
              fontSize: '12px',
              color: user === 'System' ? '#8c8c8c' : '#1890ff',
              marginRight: 6,
            }}
          />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: user === 'System' ? '#595959' : '#0c4a6e',
            }}
          >
            {user}
          </span>
        </div>
      ),
      filters: [
        { text: 'Dr. Ahmad Laboratorium', value: 'Dr. Ahmad Laboratorium' },
        { text: 'Ir. Budi Santoso', value: 'Ir. Budi Santoso' },
        { text: 'Drs. Cahaya Wijaya', value: 'Drs. Cahaya Wijaya' },
        { text: 'Dr. Siti Rahayu', value: 'Dr. Siti Rahayu' },
        { text: 'Technical Team', value: 'Technical Team' },
        { text: 'System', value: 'System' },
      ],
      onFilter: (value: any, record: AuditLog) => record.user === value,
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      render: (details: string) => (
        <div
          style={{
            fontSize: '13px',
            color: '#595959',
            lineHeight: 1.4,
          }}
        >
          {details}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 6px',
            borderRadius: 12,
            background:
              type === 'success'
                ? '#f6ffed'
                : type === 'warning'
                  ? '#fffbe6'
                  : type === 'error'
                    ? '#fff2f0'
                    : '#e6f7ff',
            border: `1px solid ${
              type === 'success'
                ? '#d9f7be'
                : type === 'warning'
                  ? '#ffe58f'
                  : type === 'error'
                    ? '#ffccc7'
                    : '#bae7ff'
            }`,
            fontSize: '10px',
            fontWeight: 600,
            color:
              type === 'success'
                ? '#52c41a'
                : type === 'warning'
                  ? '#faad14'
                  : type === 'error'
                    ? '#ff4d4f'
                    : '#1890ff',
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background:
                type === 'success'
                  ? '#52c41a'
                  : type === 'warning'
                    ? '#faad14'
                    : type === 'error'
                      ? '#ff4d4f'
                      : '#1890ff',
              marginRight: 4,
            }}
          />
          {type.toUpperCase()}
        </div>
      ),
      filters: [
        { text: 'Success', value: 'success' },
        { text: 'Info', value: 'info' },
        { text: 'Warning', value: 'warning' },
        { text: 'Error', value: 'error' },
      ],
      onFilter: (value: any, record: AuditLog) => record.type === value,
    },
  ];

  const columns: ProColumns<TestingRecord>[] = [
    {
      title: 'Sample ID',
      dataIndex: 'sample_id',
      key: 'sample_id',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: 4 }}>
            {record.sample_id}
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 6 }}>
            {record.order_number}
          </div>
          <Tag
            color={getPriorityColor(record.priority)}
            style={{
              fontSize: '10px',
              fontWeight: 500,
              border: 'none',
              borderRadius: 4,
            }}
          >
            {record.priority.toUpperCase()}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Detail Sampel',
      dataIndex: 'sample_type',
      key: 'sample_type',
      width: 200,
      render: (_, record) => (
        <div>
          <div
            style={{
              fontWeight: 500,
              fontSize: '14px',
              color: '#262626',
              marginBottom: 4,
            }}
          >
            {record.sample_type}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: '#8c8c8c',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>{record.vessel_name}</span>
            <span>•</span>
            <span>{record.tank_number}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Tanggal Diterima',
      dataIndex: 'received_date',
      key: 'received_date',
      width: 140,
      render: (_, record) => (
        <div style={{ fontSize: '13px', fontWeight: 500 }}>
          {dayjs(record.received_date).format('DD MMM YYYY')}
        </div>
      ),
      sorter: true,
    },
    {
      title: 'Progress',
      dataIndex: 'progress_percentage',
      key: 'progress_percentage',
      width: 140,
      render: (_, record) => (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 500 }}>
              {record.progress_percentage}%
            </span>
          </div>
          <Progress
            percent={record.progress_percentage}
            size="small"
            strokeColor={getProgressColor(record.progress_percentage)}
            showInfo={false}
            strokeWidth={6}
          />
        </div>
      ),
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'testing_status',
      key: 'testing_status',
      width: 120,
      render: (_, record) => (
        <Tag
          color={getStatusColor(record.testing_status)}
          style={{
            fontSize: '12px',
            fontWeight: 500,
            padding: '4px 8px',
            borderRadius: 6,
            border: 'none',
          }}
        >
          {getStatusLabel(record.testing_status)}
        </Tag>
      ),
      filters: testingStatusOptions.map((item) => ({
        text: item.label,
        value: item.value,
      })),
    },
    {
      title: 'Estimasi Selesai',
      dataIndex: 'estimated_completion',
      key: 'estimated_completion',
      width: 160,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: 2 }}>
            {record.estimated_completion
              ? dayjs(record.estimated_completion).format('DD/MM/YYYY')
              : '-'}
          </div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.estimated_completion
              ? dayjs(record.estimated_completion).format('HH:mm')
              : ''}
          </div>
          {record.actual_completion && (
            <div
              style={{
                fontSize: '11px',
                color: '#52c41a',
                fontWeight: 500,
                marginTop: 2,
              }}
            >
              ✓ Selesai: {dayjs(record.actual_completion).format('DD/MM HH:mm')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 160,
      fixed: 'right',
      render: (_, record) => {
        // Get status-specific action button
        const getStatusAction = () => {
          switch (record.testing_status) {
            case 'pending':
              return (
                <Button
                  key="confirm"
                  type="primary"
                  size="small"
                  onClick={() => handleLabAction(record, 'confirm_sample')}
                  style={{
                    backgroundColor: '#faad14',
                    borderColor: '#faad14',
                    fontSize: '11px',
                    height: 26,
                    width: '100%',
                    marginBottom: 4,
                  }}
                >
                  Konfirmasi Sample
                </Button>
              );
            case 'registered':
              return (
                <Button
                  key="waiting"
                  type="primary"
                  size="small"
                  onClick={() => handleLabAction(record, 'waiting_test')}
                  style={{
                    backgroundColor: '#1890ff',
                    borderColor: '#1890ff',
                    fontSize: '11px',
                    height: 26,
                    width: '100%',
                    marginBottom: 4,
                  }}
                >
                  Mulai Pengujian
                </Button>
              );
            case 'testing':
              return (
                <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                  <Button
                    key="input"
                    type="primary"
                    size="small"
                    onClick={() => handleLabAction(record, 'input_result')}
                    style={{
                      backgroundColor: '#52c41a',
                      borderColor: '#52c41a',
                      fontSize: '11px',
                      height: 26,
                      flex: 1,
                    }}
                  >
                    Input Hasil
                  </Button>
                  <Button
                    key="save"
                    type="default"
                    size="small"
                    onClick={() => handleSaveTestResult(record)}
                    style={{
                      fontSize: '11px',
                      height: 26,
                      minWidth: 50,
                      borderColor: '#52c41a',
                      color: '#52c41a',
                    }}
                  >
                    Save
                  </Button>
                </div>
              );
            default:
              return null;
          }
        };

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {getStatusAction()}

            {/* Standard Actions */}
            <div style={{ display: 'flex', gap: 2 }}>
              <Button
                size="small"
                icon={<FileTextOutlined />}
                onClick={() => handleViewReport(record)}
                disabled={record.progress_percentage < 75}
                style={{
                  fontSize: '11px',
                  height: 24,
                  flex: 1,
                  color:
                    record.progress_percentage >= 75 ? '#1890ff' : '#d9d9d9',
                  borderColor:
                    record.progress_percentage >= 75 ? '#1890ff' : '#d9d9d9',
                }}
              >
                Report
              </Button>
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleView(record)}
                style={{
                  fontSize: '11px',
                  height: 24,
                  flex: 1,
                }}
              >
                Detail
              </Button>
            </div>
          </div>
        );
      },
    },
  ];

  const mockData: TestingRecord[] = [
    {
      id: '4',
      sample_id: 'SMPL-20250806-005',
      order_number: 'SO-20250806-005',
      sample_type: 'Gasoline',
      vessel_name: 'MT. Navigator',
      tank_number: 'T.405',
      received_date: '2025-08-06',
      testing_status: 'shipped',
      lab_technician: 'Dr. Siti Rahayu',
      equipment_used: '',
      test_parameters: ['octane_rating', 'density', 'vapor_pressure'],
      test_results: {},
      progress_percentage: 20,
      priority: 'normal',
      estimated_completion: '',
      quality_notes:
        'Sample shipped to external laboratory for specialized testing',
      created_at: '2025-08-06 13:00:00',
      updated_at: '2025-08-06 16:00:00',
    },
    {
      id: '1',
      sample_id: 'SMPL-20250806-001',
      order_number: 'SO-20250806-001',
      sample_type: 'JET A-1',
      vessel_name: 'MT. Commodore One',
      tank_number: 'T.107',
      received_date: '2025-08-06',
      testing_status: 'pending',
      lab_technician: 'Dr. Ahmad Laboratorium',
      equipment_used: 'Viscometer Alat A',
      test_parameters: ['water_content', 'viscosity', 'density', 'flash_point'],
      test_results: {
        water_content: {
          value: 25,
          unit: 'ppm',
          status: 'pass',
          limit: '≤30',
          method: 'ASTM D6304',
        },
        viscosity: {
          value: 1.5,
          unit: 'cSt',
          status: 'pass',
          limit: '1.25-1.9',
          method: 'ASTM D445',
        },
        density: {
          value: 800,
          unit: 'kg/m³',
          status: 'pass',
          limit: '775-840',
          method: 'ASTM D4052',
        },
        flash_point: {
          value: 42,
          unit: '°C',
          status: 'pass',
          limit: '≥38',
          method: 'ASTM D93',
        },
      },
      progress_percentage: 40,
      priority: 'urgent',
      estimated_completion: '2025-08-06 18:00',
      created_at: '2025-08-06 10:00:00',
      updated_at: '2025-08-06 14:30:00',
    },
    {
      id: '1',
      sample_id: 'SMPL-20250806-001',
      order_number: 'SO-20250806-001',
      sample_type: 'JET A-1',
      vessel_name: 'MT. Commodore One',
      tank_number: 'T.107',
      received_date: '2025-08-06',
      testing_status: 'registered',
      lab_technician: 'Dr. Ahmad Laboratorium',
      equipment_used: 'Viscometer Alat A',
      test_parameters: ['water_content', 'viscosity', 'density', 'flash_point'],
      test_results: {
        water_content: { value: 25, unit: 'ppm', status: 'pass' },
        viscosity: { value: 1.5, unit: 'cSt', status: 'pass' },
        density: { value: 800, unit: 'kg/m³', status: 'pass' },
      },
      progress_percentage: 60,
      priority: 'urgent',
      estimated_completion: '2025-08-06 18:00',
      created_at: '2025-08-06 10:00:00',
      updated_at: '2025-08-06 14:30:00',
    },
    {
      id: '2',
      sample_id: 'SMPL-20250806-002',
      order_number: 'RQ-20250806-002',
      sample_type: 'Avgas',
      vessel_name: 'MT. Pioneer',
      tank_number: 'T.203',
      received_date: '2025-08-06',
      testing_status: 'testing',
      lab_technician: 'Ir. Budi Santoso',
      test_parameters: [
        'distillation',
        'ibp',
        'ten_percent',
        'fifty_percent',
        'ninety_percent',
      ],
      test_results: {
        distillation: {
          value: 98.5,
          unit: '%vol',
          status: 'pass',
          limit: '95-100',
          method: 'ASTM D86-17',
        },
        ibp: {
          value: 145,
          unit: '°C',
          status: 'pass',
          limit: '100-200',
          method: 'ASTM D86-17',
        },
        ten_percent: {
          value: 155,
          unit: '°C',
          status: 'pass',
          limit: '120-180',
          method: 'ASTM D86-17',
        },
        fifty_percent: {
          value: 185,
          unit: '°C',
          status: 'pass',
          limit: '150-220',
          method: 'ASTM D86-17',
        },
        ninety_percent: {
          value: 215,
          unit: '°C',
          status: 'pass',
          limit: '180-250',
          method: 'ASTM D86-17',
        },
        fbp: {
          value: 265,
          unit: '°C',
          status: 'pass',
          limit: '200-300',
          method: 'ASTM D86-17',
        },
        residue: {
          value: 1.2,
          unit: '%vol',
          status: 'pass',
          limit: '0-5',
          method: 'ASTM D86-17',
        },
        loss: {
          value: 0.8,
          unit: '%vol',
          status: 'pass',
          limit: '0-2',
          method: 'ASTM D86-17',
        },
      },
      progress_percentage: 75,
      priority: 'normal',
      estimated_completion: '2025-08-07 12:00',
      quality_notes: 'Menunggu ketersediaan alat GC-MS',
      created_at: '2025-08-06 11:00:00',
      updated_at: '2025-08-06 15:00:00',
    },
    {
      id: '3',
      sample_id: 'SMPL-20250805-001',
      order_number: 'SO-20250805-001',
      sample_type: 'Diesel',
      vessel_name: 'MT. Explorer',
      tank_number: 'T.301',
      received_date: '2025-08-05',
      testing_status: 'completed',
      lab_technician: 'Drs. Cahaya Wijaya',
      equipment_used: 'Flash Point Tester',
      test_parameters: [
        'distillation',
        'ibp',
        'ten_percent',
        'fifty_percent',
        'ninety_percent',
        'fbp',
        'residue',
        'loss',
        'flash_point_abel',
        'density_15c',
        'freezing_point',
        'fsii_pa_sda',
        'copper_strip_corrosion',
        'existent_gum',
      ],
      test_results: {
        distillation: {
          value: 99.2,
          unit: '%vol',
          status: 'pass',
          limit: '95-100',
          method: 'ASTM D86-17',
        },
        ibp: {
          value: 155,
          unit: '°C',
          status: 'pass',
          limit: '100-200',
          method: 'ASTM D86-17',
        },
        ten_percent: {
          value: 165,
          unit: '°C',
          status: 'pass',
          limit: '120-180',
          method: 'ASTM D86-17',
        },
        fifty_percent: {
          value: 195,
          unit: '°C',
          status: 'pass',
          limit: '150-220',
          method: 'ASTM D86-17',
        },
        ninety_percent: {
          value: 225,
          unit: '°C',
          status: 'pass',
          limit: '180-250',
          method: 'ASTM D86-17',
        },
        fbp: {
          value: 275,
          unit: '°C',
          status: 'pass',
          limit: '200-300',
          method: 'ASTM D86-17',
        },
        residue: {
          value: 0.8,
          unit: '%vol',
          status: 'pass',
          limit: '0-5',
          method: 'ASTM D86-17',
        },
        loss: {
          value: 0.5,
          unit: '%vol',
          status: 'pass',
          limit: '0-2',
          method: 'ASTM D86-17',
        },
        flash_point_abel: {
          value: 42,
          unit: '°C',
          status: 'pass',
          limit: '38-100',
          method: 'BS EN ISO 13736:2008',
        },
        density_15c: {
          value: 810,
          unit: 'kg/m³',
          status: 'pass',
          limit: '775-840',
          method: 'ASTM D4052-22',
        },
        freezing_point: {
          value: -45,
          unit: '°C',
          status: 'pass',
          limit: '-50 to -40',
          method: 'ASTM D2386-19',
        },
        fsii_pa_sda: {
          value: 150,
          unit: 'mg/kg',
          status: 'pass',
          limit: '0-200',
          method: 'ASTM D5006-22',
        },
        copper_strip_corrosion: {
          value: 1,
          unit: 'class',
          status: 'pass',
          limit: '1-4',
          method: 'ASTM D130-19',
        },
        existent_gum: {
          value: 5,
          unit: 'mg/100ml',
          status: 'pass',
          limit: '0-7',
          method: 'ASTM D381-22',
        },
      },
      progress_percentage: 100,
      priority: 'normal',
      estimated_completion: '2025-08-05 16:00',
      actual_completion: '2025-08-05 15:30',
      created_at: '2025-08-05 09:00:00',
      updated_at: '2025-08-05 15:30:00',
    },
  ];

  const testingSummary = {
    total: mockData.length,
    received: mockData.filter((item) => item.testing_status === 'received')
      .length,
    testing: mockData.filter((item) =>
      ['registered', 'testing'].includes(item.testing_status),
    ).length,
    syringes: mockSyringeData[0]?.current_stock || 0,
    completed: mockData.filter((item) => item.testing_status === 'completed')
      .length,
  };

  return (
    <PageContainer
      title="Pengujian Laboratorium"
      content="Kelola proses pengujian sampel dengan tracking real-time dan hasil analisis"
    >
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Sampel"
              value={testingSummary.total}
              prefix={<ExperimentOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Sedang Diuji"
              value={testingSummary.testing}
              prefix={<SyncOutlined spin style={{ color: '#9fe400' }} />}
              valueStyle={{ color: '#9fe400' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Stock Syringe"
              value={testingSummary.syringes}
              prefix={<DatabaseOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Selesai"
              value={testingSummary.completed}
              prefix={<CheckCircleOutlined style={{ color: '#fd0017' }} />}
              valueStyle={{ color: '#fd0017' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs for Testing Records */}
      <Card style={{ marginBottom: 24 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'all',
              label: (
                <Space>
                  <ExperimentOutlined />
                  <span>All Records</span>
                  <Badge
                    count={getTabCount('all')}
                    style={{ backgroundColor: '#52c41a' }}
                  />
                </Space>
              ),
            },
            {
              key: 'pending',
              label: (
                <Space>
                  <CheckCircleOutlined />
                  <span>Pending</span>
                  <Badge
                    count={getTabCount('pending')}
                    style={{ backgroundColor: '#1890ff' }}
                  />
                </Space>
              ),
            },
            {
              key: 'process',
              label: (
                <Space>
                  <SyncOutlined />
                  <span>Proses</span>
                  <Badge
                    count={getTabCount('process')}
                    style={{ backgroundColor: '#faad14' }}
                  />
                </Space>
              ),
            },
            {
              key: 'completed',
              label: (
                <Space>
                  <CheckCircleOutlined />
                  <span>Selesai</span>
                  <Badge
                    count={getTabCount('completed')}
                    style={{ backgroundColor: '#52c41a' }}
                  />
                </Space>
              ),
            },
            {
              key: 'syringe',
              label: (
                <Space>
                  <DatabaseOutlined />
                  <span>Manajemen Syringe</span>
                </Space>
              ),
            },
          ]}
        />

        {/* Tab Content */}
        {activeTab === 'syringe' ? (
          <div style={{ padding: '24px 0' }}>
            {/* Syringe Card - Centered */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 32,
              }}
            >
              <div style={{ maxWidth: '400px', width: '100%' }}>
                {mockSyringeData.map((syringe) => {
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
                        borderRadius: 16,
                        background:
                          'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                        border: `2px solid ${getStockColor()}`,
                        boxShadow: `0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px ${getStockColor()}20`,
                        transition: 'all 0.3s ease',
                        overflow: 'hidden',
                      }}
                      bodyStyle={{ padding: '24px' }}
                    >
                      {/* Header Section */}
                      <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${getStockColor()}15, ${getStockColor()}25)`,
                            marginBottom: 16,
                          }}
                        >
                          <DatabaseOutlined
                            style={{
                              fontSize: 28,
                              color: getStockColor(),
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#262626',
                            marginBottom: 4,
                          }}
                        >
                          {syringe.location}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#8c8c8c',
                            fontWeight: 500,
                          }}
                        >
                          Last Updated:{' '}
                          {dayjs(syringe.last_updated).format('DD MMM, HH:mm')}
                        </div>
                      </div>

                      {/* Stock Display */}
                      <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <div
                          style={{
                            fontSize: '36px',
                            fontWeight: 700,
                            color: getStockColor(),
                            lineHeight: 1,
                            marginBottom: 8,
                          }}
                        >
                          {syringe.current_stock}
                          <span
                            style={{
                              fontSize: '18px',
                              color: '#8c8c8c',
                              fontWeight: 500,
                              marginLeft: 4,
                            }}
                          >
                            / {syringe.max_capacity}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '14px',
                            color: '#595959',
                            fontWeight: 500,
                          }}
                        >
                          Stock Available
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ marginBottom: 20 }}>
                        <Progress
                          percent={stockPercentage}
                          strokeColor={{
                            '0%': getStockColor(),
                            '100%': getStockColor(),
                          }}
                          trailColor="#f0f0f0"
                          strokeWidth={12}
                          showInfo={false}
                          style={{ marginBottom: 8 }}
                        />
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                            color: '#8c8c8c',
                          }}
                        >
                          <span>Min: {syringe.min_threshold}</span>
                          <span>{stockPercentage.toFixed(1)}%</span>
                          <span>Max: {syringe.max_capacity}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '8px 16px',
                            borderRadius: 20,
                            background: `${getStockColor()}15`,
                            border: `1px solid ${getStockColor()}30`,
                            fontSize: '13px',
                            fontWeight: 600,
                            color: getStockColor(),
                          }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: getStockColor(),
                              marginRight: 8,
                            }}
                          />
                          {getStatusText()}
                        </div>
                      </div>

                      {/* Click to Update Text */}
                      <div
                        style={{
                          textAlign: 'center',
                          marginTop: 16,
                          padding: '12px',
                          borderRadius: 8,
                          background: '#fafafa',
                          border: '1px dashed #d9d9d9',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#8c8c8c',
                            fontWeight: 500,
                          }}
                        >
                          🖱️ Click to Update Stock
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Audit Logs Section - Full Width */}
            <Card
              title={
                <Space>
                  <HistoryOutlined style={{ color: '#1890ff' }} />
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>
                    Audit Logs
                  </span>
                </Space>
              }
              size="small"
              style={{
                borderRadius: 12,
                border: '1px solid #e8e8e8',
                background: '#fafafa',
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Table
                columns={auditLogsColumns}
                dataSource={mockAuditLogs}
                rowKey="id"
                size="small"
                pagination={{
                  pageSize: 5,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} items`,
                  pageSizeOptions: ['5', '10', '20'],
                }}
                scroll={{ x: 'max-content' }}
                style={{
                  background: '#ffffff',
                  borderRadius: 8,
                }}
              />
            </Card>
          </div>
        ) : null}
      </Card>

      <ProTable<TestingRecord>
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        columns={columns}
        dataSource={getFilteredData()}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle={`Daftar Pengujian - ${
          activeTab === 'all'
            ? 'Semua Record'
            : activeTab === 'pending'
              ? 'Pending'
              : activeTab === 'process'
                ? 'Proses'
                : activeTab === 'completed'
                  ? 'Selesai'
                  : 'Manajemen Syringe'
        }`}
        toolBarRender={() => [
          <Button key="export" type="default">
            Export Excel
          </Button>,
        ]}
        style={{ display: activeTab === 'syringe' ? 'none' : 'block' }}
      />

      <Drawer
        title={viewingRecord ? 'Detail Pengujian' : 'Update Pengujian'}
        width={800}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
          setViewingRecord(undefined);
          setEditingRecord(undefined);
        }}
        extra={
          viewingRecord ? null : (
            <Space>
              <Button onClick={() => setDrawerVisible(false)}>Batal</Button>
              <Button
                type="primary"
                onClick={() => form.submit()}
                style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
              >
                Simpan
              </Button>
            </Space>
          )
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
                  {dayjs(viewingRecord.estimated_completion).format(
                    'DD/MM/YYYY HH:mm',
                  )}
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
        ) : (
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
                    handleStatusUpdate(editingRecord, 'waiting_equipment')
                  }
                >
                  Equipment Wait
                </Button>
                <Button
                  type="primary"
                  style={{ backgroundColor: '#9fe400', borderColor: '#9fe400' }}
                  onClick={() =>
                    editingRecord &&
                    handleStatusUpdate(editingRecord, 'completed')
                  }
                >
                  Mark Complete
                </Button>
              </Space>
            </Card>
          </Form>
        )}
      </Drawer>

      {/* Laboratory Action Modal */}
      <LaboratoryActionModal
        visible={actionModalVisible}
        onClose={() => setActionModalVisible(false)}
        actionType={currentActionType}
        record={editingRecord}
        onSubmit={handleActionSubmit}
      />

      {/* Syringe Management Modal */}
      <SyringeManagement
        visible={syringeModalVisible}
        onClose={() => setSyringeModalVisible(false)}
        syringeData={selectedSyringe}
        onUpdate={handleSyringeUpdate}
      />

      {/* Report Modal */}
      <Modal
        title={null}
        open={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        width={900}
        footer={null}
        style={{ top: 20 }}
        bodyStyle={{ padding: 0 }}
      >
        {reportRecord && (
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: 0,
            }}
          >
            {/* Header Section */}
            <div
              style={{
                padding: '32px 40px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  opacity: 0.1,
                }}
              >
                <TrophyOutlined style={{ fontSize: 120 }} />
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <Title
                      level={2}
                      style={{
                        color: 'white',
                        margin: 0,
                        fontSize: '28px',
                        fontWeight: 700,
                      }}
                    >
                      LAPORAN PENGUJIAN
                    </Title>
                    <Text
                      style={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '16px',
                        fontWeight: 500,
                      }}
                    >
                      Laboratory Testing Report
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        padding: '8px 16px',
                        borderRadius: 20,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                      }}
                    >
                      <SafetyCertificateOutlined
                        style={{ marginRight: 8, fontSize: 16 }}
                      />
                      <Text style={{ color: 'white', fontWeight: 600 }}>
                        CERTIFIED
                      </Text>
                    </div>
                  </div>
                </div>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <div
                      style={{
                        background: 'rgba(255,255,255,0.15)',
                        padding: '16px 20px',
                        borderRadius: 12,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <Text
                        style={{
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: '12px',
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                        }}
                      >
                        Sample ID
                      </Text>
                      <div
                        style={{
                          color: 'white',
                          fontSize: '18px',
                          fontWeight: 700,
                          marginTop: 4,
                        }}
                      >
                        {reportRecord.sample_id}
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div
                      style={{
                        background: 'rgba(255,255,255,0.15)',
                        padding: '16px 20px',
                        borderRadius: 12,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <Text
                        style={{
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: '12px',
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                        }}
                      >
                        Sample Type
                      </Text>
                      <div
                        style={{
                          color: 'white',
                          fontSize: '18px',
                          fontWeight: 700,
                          marginTop: 4,
                        }}
                      >
                        {reportRecord.sample_type}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>

            {/* Content Section */}
            <div style={{ background: 'white', padding: '32px 40px' }}>
              {/* Sample Information */}
              <Card
                title={
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <ExperimentOutlined
                      style={{ color: '#667eea', fontSize: 20 }}
                    />
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#262626',
                      }}
                    >
                      Sample Information
                    </span>
                  </div>
                }
                style={{
                  marginBottom: 24,
                  borderRadius: 12,
                  border: '1px solid #e8e8e8',
                }}
                bodyStyle={{ padding: '20px 24px' }}
              >
                <Row gutter={[32, 16]}>
                  <Col span={8}>
                    <Descriptions column={1} size="small" colon={false}>
                      <Descriptions.Item
                        label={
                          <Text
                            style={{
                              color: '#8c8c8c',
                              fontSize: '12px',
                              fontWeight: 500,
                            }}
                          >
                            ORDER NUMBER
                          </Text>
                        }
                      >
                        <Text
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#262626',
                          }}
                        >
                          {reportRecord.order_number}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          <Text
                            style={{
                              color: '#8c8c8c',
                              fontSize: '12px',
                              fontWeight: 500,
                            }}
                          >
                            VESSEL
                          </Text>
                        }
                      >
                        <Text
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#262626',
                          }}
                        >
                          {reportRecord.vessel_name}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                  <Col span={8}>
                    <Descriptions column={1} size="small" colon={false}>
                      <Descriptions.Item
                        label={
                          <Text
                            style={{
                              color: '#8c8c8c',
                              fontSize: '12px',
                              fontWeight: 500,
                            }}
                          >
                            TANK NUMBER
                          </Text>
                        }
                      >
                        <Text
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#262626',
                          }}
                        >
                          {reportRecord.tank_number}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          <Text
                            style={{
                              color: '#8c8c8c',
                              fontSize: '12px',
                              fontWeight: 500,
                            }}
                          >
                            TECHNICIAN
                          </Text>
                        }
                      >
                        <Text
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#262626',
                          }}
                        >
                          {reportRecord.lab_technician}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                  <Col span={8}>
                    <Descriptions column={1} size="small" colon={false}>
                      <Descriptions.Item
                        label={
                          <Text
                            style={{
                              color: '#8c8c8c',
                              fontSize: '12px',
                              fontWeight: 500,
                            }}
                          >
                            RECEIVED DATE
                          </Text>
                        }
                      >
                        <Text
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#262626',
                          }}
                        >
                          {dayjs(reportRecord.received_date).format(
                            'DD MMM YYYY',
                          )}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          <Text
                            style={{
                              color: '#8c8c8c',
                              fontSize: '12px',
                              fontWeight: 500,
                            }}
                          >
                            COMPLETION
                          </Text>
                        }
                      >
                        <Text
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#262626',
                          }}
                        >
                          {reportRecord.actual_completion
                            ? dayjs(reportRecord.actual_completion).format(
                                'DD MMM YYYY HH:mm',
                              )
                            : dayjs(reportRecord.estimated_completion).format(
                                'DD MMM YYYY HH:mm',
                              )}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>
                </Row>
              </Card>

              {/* Test Results */}
              <Card
                title={
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <FileTextOutlined
                      style={{ color: '#667eea', fontSize: 20 }}
                    />
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#262626',
                      }}
                    >
                      Test Results
                    </span>
                  </div>
                }
                style={{
                  marginBottom: 24,
                  borderRadius: 12,
                  border: '1px solid #e8e8e8',
                }}
                bodyStyle={{ padding: '20px 24px' }}
              >
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  {Object.entries(reportRecord.test_results).map(
                    ([key, result]: [string, any]) => {
                      // Find the parameter definition from testParameters
                      const paramDef = testParameters.find(
                        (param) => param.key === key,
                      );

                      // Determine status based on testParameters range if not provided
                      const getActualStatus = () => {
                        if (result.status) return result.status;
                        if (paramDef && result.value !== undefined) {
                          const value = parseFloat(result.value);
                          if (value >= paramDef.min && value <= paramDef.max) {
                            return 'pass';
                          } else {
                            return 'fail';
                          }
                        }
                        return 'unknown';
                      };

                      const actualStatus = getActualStatus();

                      const getStatusIcon = (status: string) => {
                        switch (status) {
                          case 'pass':
                            return (
                              <CheckCircleOutlined
                                style={{ color: '#52c41a', fontSize: 18 }}
                              />
                            );
                          case 'fail':
                            return (
                              <CloseCircleOutlined
                                style={{ color: '#ff4d4f', fontSize: 18 }}
                              />
                            );
                          default:
                            return (
                              <ExclamationCircleOutlined
                                style={{ color: '#faad14', fontSize: 18 }}
                              />
                            );
                        }
                      };

                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'pass':
                            return '#f6ffed';
                          case 'fail':
                            return '#fff2f0';
                          default:
                            return '#fffbe6';
                        }
                      };

                      const getBorderColor = (status: string) => {
                        switch (status) {
                          case 'pass':
                            return '#b7eb8f';
                          case 'fail':
                            return '#ffccc7';
                          default:
                            return '#ffe58f';
                        }
                      };

                      return (
                        <div
                          key={key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '16px 20px',
                            background: getStatusColor(actualStatus),
                            border: `1px solid ${getBorderColor(actualStatus)}`,
                            borderRadius: 12,
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <div style={{ marginRight: 16 }}>
                            {getStatusIcon(actualStatus)}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    color: '#262626',
                                    marginBottom: 4,
                                  }}
                                >
                                  {paramDef
                                    ? paramDef.name
                                    : key
                                        .split('_')
                                        .map(
                                          (word) =>
                                            word.charAt(0).toUpperCase() +
                                            word.slice(1),
                                        )
                                        .join(' ')}
                                </div>
                                <div
                                  style={{
                                    fontSize: '12px',
                                    color: '#8c8c8c',
                                    fontWeight: 500,
                                  }}
                                >
                                  Method:{' '}
                                  {paramDef
                                    ? paramDef.method
                                    : result.method || 'N/A'}
                                </div>
                                {paramDef && paramDef.standard && (
                                  <div
                                    style={{
                                      fontSize: '11px',
                                      color: '#595959',
                                      fontWeight: 500,
                                      marginTop: 2,
                                    }}
                                  >
                                    Standard: {paramDef.standard}
                                  </div>
                                )}
                              </div>

                              <div
                                style={{ textAlign: 'center', marginLeft: 20 }}
                              >
                                <div
                                  style={{
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: '#262626',
                                  }}
                                >
                                  {result.value}{' '}
                                  {paramDef ? paramDef.unit : result.unit}
                                </div>
                                <div
                                  style={{
                                    fontSize: '12px',
                                    color: '#8c8c8c',
                                    fontWeight: 500,
                                  }}
                                >
                                  Limit:{' '}
                                  {result.limit ||
                                    (paramDef
                                      ? `${paramDef.min}-${paramDef.max}`
                                      : 'N/A')}
                                </div>
                                {paramDef && (
                                  <div
                                    style={{
                                      fontSize: '10px',
                                      color: '#8c8c8c',
                                      marginTop: 2,
                                    }}
                                  >
                                    Range: {paramDef.min} - {paramDef.max}{' '}
                                    {paramDef.unit}
                                  </div>
                                )}
                              </div>

                              <div style={{ marginLeft: 20 }}>
                                <Tag
                                  color={
                                    actualStatus === 'pass'
                                      ? 'success'
                                      : actualStatus === 'fail'
                                        ? 'error'
                                        : 'warning'
                                  }
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    padding: '4px 12px',
                                    borderRadius: 16,
                                    border: 'none',
                                  }}
                                >
                                  {actualStatus.toUpperCase()}
                                </Tag>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>

                {/* Available Test Parameters Table */}
                <Divider
                  orientation="left"
                  style={{ marginTop: 32, marginBottom: 16 }}
                >
                  <Text
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#667eea',
                    }}
                  >
                    Available Test Parameters for {reportRecord.sample_type}
                  </Text>
                </Divider>

                <div
                  style={{
                    background: '#fafafa',
                    borderRadius: 8,
                    padding: '16px',
                    border: '1px solid #e8e8e8',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 100px 140px 180px 100px',
                      gap: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#8c8c8c',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      paddingBottom: '8px',
                      borderBottom: '2px solid #e8e8e8',
                      marginBottom: '12px',
                    }}
                  >
                    <div>Parameter</div>
                    <div>Unit</div>
                    <div>Method</div>
                    <div>Range</div>
                    <div>Status</div>
                  </div>

                  {testParameters.map((param, index) => {
                    const hasResult = reportRecord.test_results[param.key];
                    const resultValue = hasResult
                      ? reportRecord.test_results[param.key].value
                      : null;
                    const isInRange =
                      resultValue !== null
                        ? parseFloat(resultValue) >= param.min &&
                          parseFloat(resultValue) <= param.max
                        : null;

                    return (
                      <div
                        key={param.key}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 100px 140px 180px 100px',
                          gap: '12px',
                          padding: '8px 0',
                          borderBottom:
                            index < testParameters.length - 1
                              ? '1px solid #f0f0f0'
                              : 'none',
                          alignItems: 'center',
                          fontSize: '13px',
                        }}
                      >
                        <div style={{ fontWeight: 500, color: '#262626' }}>
                          {param.name}
                        </div>
                        <div style={{ color: '#595959' }}>{param.unit}</div>
                        <div style={{ color: '#595959', fontSize: '11px' }}>
                          {param.method}
                        </div>
                        <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                          {param.min} - {param.max} {param.unit}
                        </div>
                        <div>
                          {hasResult ? (
                            <Tag
                              color={isInRange ? 'success' : 'error'}
                              style={{ fontSize: '10px', fontWeight: 600 }}
                            >
                              {resultValue} {param.unit}
                            </Tag>
                          ) : (
                            <Tag color="default" style={{ fontSize: '10px' }}>
                              Not Tested
                            </Tag>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Overall Result */}
              <Card
                style={{
                  borderRadius: 12,
                  border: '1px solid #e8e8e8',
                  background:
                    'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <Result
                  icon={
                    <TrophyOutlined
                      style={{ color: '#52c41a', fontSize: 48 }}
                    />
                  }
                  title={
                    <span
                      style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#262626',
                      }}
                    >
                      PENGUJIAN BERHASIL
                    </span>
                  }
                  subTitle={
                    <div style={{ color: '#595959', fontSize: '14px' }}>
                      <div>
                        Semua parameter pengujian telah memenuhi standar yang
                        ditetapkan
                      </div>
                      <div style={{ marginTop: 8, fontWeight: 500 }}>
                        Progress: {reportRecord.progress_percentage}% • Status:{' '}
                        <Tag color="success" style={{ marginLeft: 4 }}>
                          {getStatusLabel(reportRecord.testing_status)}
                        </Tag>
                      </div>
                    </div>
                  }
                  extra={[
                    <Button
                      key="print"
                      type="primary"
                      icon={<PrinterOutlined />}
                      style={{
                        background:
                          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: 8,
                        height: 40,
                        fontWeight: 600,
                      }}
                    >
                      Print Report
                    </Button>,
                    <Button
                      key="download"
                      icon={<DownloadOutlined />}
                      style={{
                        borderColor: '#667eea',
                        color: '#667eea',
                        borderRadius: 8,
                        height: 40,
                        fontWeight: 600,
                      }}
                    >
                      Download PDF
                    </Button>,
                  ]}
                />
              </Card>

              {/* Footer */}
              <div
                style={{
                  textAlign: 'center',
                  marginTop: 32,
                  paddingTop: 24,
                  borderTop: '2px dashed #e8e8e8',
                  color: '#8c8c8c',
                }}
              >
                <Text style={{ fontSize: '12px', fontWeight: 500 }}>
                  Report generated on {dayjs().format('DD MMMM YYYY, HH:mm:ss')}{' '}
                  • PT Pertamina Patra Niaga Laboratory
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default LaboratoryTesting;
