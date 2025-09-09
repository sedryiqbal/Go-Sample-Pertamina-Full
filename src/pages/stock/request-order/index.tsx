import {
  CalendarOutlined,
  CarOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  FormOutlined,
  PlusOutlined,
  ShoppingOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Calendar,
  Card,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Tabs,
  Tag,
  Upload,
} from 'antd';
import type { UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

interface RequestOrderRecord {
  id: string;
  request_number: string;
  vessel_name: string;
  tank_number: string;
  sample_type: string;
  category: 'import' | 'local' | 'reference';
  quantity: number;
  unit: string;
  estimated_arrival: string;
  lab_location: string;
  estimated_delivery_time: number;
  priority: 'normal' | 'urgent' | 'critical';
  status:
    | 'pending'
    | 'confirmed'
    | 'picked_up'
    | 'in_transit'
    | 'delivered'
    | 'cancelled';
  memo_file?: string;
  photo_file?: string;
  notes?: string;
  created_at: string;
  pickup_time?: string;
  delivery_time?: string;
  current_location?: string;
  company_sender?: string;
  sender_name?: string;
  sender_phone?: string;
  sample_officer?: string;
}

interface StockOrderRecord {
  id: string;
  order_number: string;
  sample_date: string;
  sample_type: string;
  vessel_name: string;
  tank_number: string;
  quantity: number;
  unit: string;
  lab_location: string;
  estimated_delivery_time: number;
  category_test: string;
  estimated_arrival_time: string;
  memo_file?: string;
  photo_sample?: string;
  priority: 'normal' | 'urgent' | 'critical';
  status:
    | 'pending'
    | 'confirmed'
    | 'picked_up'
    | 'in_transit'
    | 'delivered'
    | 'cancelled';
  notes?: string;
  created_at: string;
  pickup_time?: string;
  delivery_time?: string;
  current_location?: string;
}

const RequestOrderStock: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('request');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerType, setDrawerType] = useState<'request' | 'stock'>('request');
  const [calendarView, setCalendarView] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [editingRecord, setEditingRecord] = useState<
    RequestOrderRecord | StockOrderRecord | undefined
  >();
  const requestActionRef = useRef<ActionType>(null);
  const stockActionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();
  const [memoFileList, setMemoFileList] = useState<UploadFile[]>([]);
  const [photoFileList, setPhotoFileList] = useState<UploadFile[]>([]);

  const categoryOptions = [
    { label: 'Import Sample', value: 'import' },
    { label: 'Local Sample', value: 'local' },
    { label: 'Reference Sample', value: 'reference' },
  ];

  const sampleTypeOptions = [
    { label: 'JET A-1', value: 'jet-a1' },
    { label: 'Avgas', value: 'avgas' },
    { label: 'Diesel', value: 'diesel' },
    { label: 'Gasoline', value: 'gasoline' },
    { label: 'Crude Oil', value: 'crude_oil' },
  ];

  const priorityOptions = [
    { label: 'Normal', value: 'normal' },
    { label: 'Urgent', value: 'urgent' },
    { label: 'Critical', value: 'critical' },
  ];

  const labLocationOptions = [
    { label: 'LPUJ - Priok (1 jam)', value: 'lpuj-priok', time: 1 },
    { label: 'Lemigas - Jakarta (1 jam)', value: 'lemigas-jakarta', time: 1 },
    { label: 'Balongan - Balongan (6 jam)', value: 'balongan', time: 6 },
  ];

  const categoryTestOptions = [
    { label: 'Quality Analysis', value: 'quality-analysis' },
    { label: 'Basic Testing', value: 'basic-testing' },
    { label: 'Comprehensive Testing', value: 'comprehensive-testing' },
    { label: 'Emergency Testing', value: 'emergency-testing' },
  ];

  const sampleOfficerOptions = [
    { label: 'Moch. Aby Gazal', value: 'aby-gazal' },
    { label: 'Sedry Muhammad Iqbal', value: 'sedry-iqbal' },
    { label: 'Ahmad Santoso', value: 'ahmad-santoso' },
  ];

  const handleMemoFileChange: UploadProps['onChange'] = ({
    fileList: newFileList,
  }) => {
    setMemoFileList(newFileList);
  };

  const handlePhotoFileChange: UploadProps['onChange'] = ({
    fileList: newFileList,
  }) => {
    setPhotoFileList(newFileList);
  };

  // Calendar data for available stock
  const getAvailableStock = (value: Dayjs) => {
    const stockByDate: {
      [key: string]: Array<{
        type: 'success' | 'warning' | 'error';
        content: string;
        details: any;
      }>;
    } = {
      '2025-08-06': [
        {
          type: 'success',
          content: 'JET A-1 - MT. Commodore One',
          details: {
            vessel_name: 'MT. Commodore One',
            tank_number: 'T.107',
            sample_type: 'JET A-1',
            available_quantity: 25,
            unit: 'botol',
            expiry_date: '2025-09-05',
          },
        },
        {
          type: 'warning',
          content: 'Avgas - MT. Pioneer',
          details: {
            vessel_name: 'MT. Pioneer',
            tank_number: 'T.203',
            sample_type: 'Avgas',
            available_quantity: 5,
            unit: 'botol',
            expiry_date: '2025-09-04',
          },
        },
      ],
      '2025-08-07': [
        {
          type: 'success',
          content: 'Diesel - MT. Explorer',
          details: {
            vessel_name: 'MT. Explorer',
            tank_number: 'T.301',
            sample_type: 'Diesel',
            available_quantity: 15,
            unit: 'botol',
            expiry_date: '2025-09-07',
          },
        },
      ],
      '2025-08-08': [
        {
          type: 'success',
          content: 'JET A-1 - MT. Commodore Two',
          details: {
            vessel_name: 'MT. Commodore Two',
            tank_number: 'T.108',
            sample_type: 'JET A-1',
            available_quantity: 30,
            unit: 'botol',
            expiry_date: '2025-09-08',
          },
        },
        {
          type: 'success',
          content: 'Avgas - MT. Phoenix',
          details: {
            vessel_name: 'MT. Phoenix',
            tank_number: 'T.205',
            sample_type: 'Avgas',
            available_quantity: 12,
            unit: 'botol',
            expiry_date: '2025-09-08',
          },
        },
      ],
    };

    return stockByDate[value.format('YYYY-MM-DD')] || [];
  };

  const dateCellRender = (value: Dayjs) => {
    const stockData = getAvailableStock(value);
    return (
      <div
        style={{
          fontSize: '10px',
          lineHeight: '12px',
          overflowY: 'auto',
          maxHeight: '90px',
          padding: '4px 2px',
        }}
      >
        {stockData.map((item, index) => (
          <div
            key={`${item.type}-${index}`}
            onClick={() => handleStockSelect(item)}
            style={{
              display: 'block',
              marginBottom: 4,
              cursor: 'pointer',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={item.content}
          >
            <Badge status={item.type} text={item.content} />
          </div>
        ))}
      </div>
    );
  };

  const handleStockSelect = (stockItem: any) => {
    setSelectedStock(stockItem);
    setSelectedDate(selectedDate);
    setDrawerType('stock');
    setEditingRecord(undefined);
    form.setFieldsValue({
      sample_date: selectedDate,
      sample_type: stockItem.details.sample_type,
      vessel_name: stockItem.details.vessel_name,
      tank_number: stockItem.details.tank_number,
      available_quantity: stockItem.details.available_quantity,
      unit: stockItem.details.unit,
      quantity: 1,
      priority: 'normal',
    });
    setDrawerVisible(true);
  };

  const handleCreateRequest = () => {
    setDrawerType('request');
    setEditingRecord(undefined);
    setSelectedStock(null);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleCreateStockOrder = () => {
    if (!selectedDate) {
      message.warning('Pilih tanggal terlebih dahulu');
      return;
    }

    const stockData = getAvailableStock(selectedDate);
    if (stockData.length === 0) {
      message.warning('Tidak ada stock tersedia pada tanggal yang dipilih');
      return;
    }

    // Show modal to select stock
    Modal.info({
      title: `Stock Tersedia - ${selectedDate.format('DD/MM/YYYY')}`,
      width: 600,
      content: (
        <div style={{ marginTop: 16 }}>
          {stockData.map((item) => (
            <Card
              key={
                item.details.vessel_name +
                item.details.tank_number +
                item.details.sample_type
              }
              size="small"
              style={{ marginBottom: 8, cursor: 'pointer' }}
              onClick={() => {
                Modal.destroyAll();
                handleStockSelect(item);
              }}
              hoverable
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {item.details.sample_type} - {item.details.vessel_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {item.details.tank_number} •{' '}
                    {item.details.available_quantity} {item.details.unit}
                  </div>
                </div>
                <Badge status={item.type} />
              </div>
            </Card>
          ))}
        </div>
      ),
      okText: 'Tutup',
    });
  };

  const handleEdit = (record: RequestOrderRecord | StockOrderRecord) => {
    setEditingRecord(record);

    // Determine if it's a request or stock order based on the presence of certain fields
    if ('request_number' in record) {
      setDrawerType('request');
      form.setFieldsValue({
        ...record,
        estimated_arrival: record.estimated_arrival
          ? dayjs(record.estimated_arrival)
          : null,
      });
    } else {
      setDrawerType('stock');
      form.setFieldsValue({
        ...record,
        sample_date: record.sample_date ? dayjs(record.sample_date) : null,
        estimated_arrival_time: record.estimated_arrival_time
          ? dayjs(record.estimated_arrival_time)
          : null,
      });
    }
    setDrawerVisible(true);
  };

  const handleDelete = (record: RequestOrderRecord | StockOrderRecord) => {
    const recordNumber =
      'request_number' in record ? record.request_number : record.order_number;
    const recordType = 'request_number' in record ? 'request' : 'pesanan';

    Modal.confirm({
      title: 'Konfirmasi Hapus',
      content: `Apakah Anda yakin ingin menghapus ${recordType} ${recordNumber}?`,
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk() {
        message.success(`${recordType} ${recordNumber} berhasil dihapus`);
        if ('request_number' in record) {
          requestActionRef.current?.reload();
        } else {
          stockActionRef.current?.reload();
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (drawerType === 'request') {
        const requestNumber = `RQ-${dayjs().format('YYYYMMDD')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        const labLocation = labLocationOptions.find(
          (lab) => lab.value === values.lab_location,
        );

        const _requestData = {
          ...values,
          request_number: requestNumber,
          estimated_arrival:
            values.estimated_arrival?.format('YYYY-MM-DD HH:mm'),
          estimated_delivery_time: labLocation?.time || 1,
          status: 'pending',
          created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        };

        if (editingRecord && 'request_number' in editingRecord) {
          message.success('Request berhasil diperbarui');
        } else {
          message.success(
            `Request berhasil dibuat dengan nomor: ${requestNumber}`,
          );
        }
        requestActionRef.current?.reload();
      } else {
        const orderNumber = `SO-${dayjs().format('YYYYMMDD')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        const labLocation = labLocationOptions.find(
          (lab) => lab.value === values.lab_location,
        );

        const _orderData = {
          ...values,
          order_number: orderNumber,
          sample_date: values.sample_date?.format('YYYY-MM-DD'),
          estimated_delivery_time: labLocation?.time || 1,
          status: 'pending',
          created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          memo_file: memoFileList.length > 0 ? memoFileList[0].name : undefined,
          photo_sample:
            photoFileList.length > 0 ? photoFileList[0].name : undefined,
        };

        if (editingRecord && 'order_number' in editingRecord) {
          message.success('Pesanan stock berhasil diperbarui');
        } else {
          message.success(
            `Pesanan stock berhasil dibuat dengan nomor: ${orderNumber}`,
          );
        }
        stockActionRef.current?.reload();
      }

      setDrawerVisible(false);
      form.resetFields();
      setSelectedStock(null);
      setMemoFileList([]);
      setPhotoFileList([]);
    } catch (_error) {
      message.error('Gagal menyimpan data');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'import':
        return 'blue';
      case 'local':
        return 'green';
      case 'reference':
        return 'purple';
      default:
        return 'default';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'confirmed':
        return 'processing';
      case 'picked_up':
        return 'warning';
      case 'in_transit':
        return 'warning';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'picked_up':
        return 'Diambil';
      case 'in_transit':
        return 'Dalam Perjalanan';
      case 'delivered':
        return 'Terkirim';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const requestColumns: ProColumns<RequestOrderRecord>[] = [
    {
      title: 'No. Request',
      dataIndex: 'request_number',
      key: 'request_number',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{record.request_number}</span>
          <Tag color={getPriorityColor(record.priority)}>
            {record.priority.toUpperCase()}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Detail Sampel',
      dataIndex: 'sample_type',
      key: 'sample_type',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.sample_type}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.vessel_name} • {record.tank_number}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.quantity} {record.unit}
          </div>
          <Tag color={getCategoryColor(record.category)}>{record.category}</Tag>
        </div>
      ),
    },
    {
      title: 'Pengirim',
      dataIndex: 'sender_name',
      key: 'sender_name',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.sender_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.company_sender}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.sender_phone}
          </div>
        </div>
      ),
    },
    {
      title: 'Estimasi Kedatangan',
      dataIndex: 'estimated_arrival',
      key: 'estimated_arrival',
      valueType: 'dateTime',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ClockCircleOutlined style={{ color: '#9fe400', marginRight: 4 }} />
          <span>
            {dayjs(record.estimated_arrival).format('DD/MM/YYYY HH:mm')}
          </span>
        </div>
      ),
      sorter: true,
    },
    {
      title: 'Lab Tujuan',
      dataIndex: 'lab_location',
      key: 'lab_location',
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EnvironmentOutlined style={{ color: '#fd0017', marginRight: 4 }} />
            <span>{record.lab_location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
            <ClockCircleOutlined
              style={{ color: '#9fe400', marginRight: 4, fontSize: '12px' }}
            />
            <span style={{ fontSize: '12px', color: '#666' }}>
              {record.estimated_delivery_time} jam
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Sample Officer',
      dataIndex: 'sample_officer',
      key: 'sample_officer',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusLabel(record.status)}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Dikonfirmasi', value: 'confirmed' },
        { text: 'Diambil', value: 'picked_up' },
        { text: 'Dalam Perjalanan', value: 'in_transit' },
        { text: 'Terkirim', value: 'delivered' },
        { text: 'Dibatalkan', value: 'cancelled' },
      ],
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Hapus
          </Button>
        </Space>
      ),
    },
  ];

  const stockColumns: ProColumns<StockOrderRecord>[] = [
    {
      title: 'No. Pesanan',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{record.order_number}</span>
          <Tag color={getPriorityColor(record.priority)}>
            {record.priority.toUpperCase()}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Tanggal Sampel',
      dataIndex: 'sample_date',
      key: 'sample_date',
      valueType: 'date',
      sorter: true,
    },
    {
      title: 'Detail Sampel',
      dataIndex: 'sample_type',
      key: 'sample_type',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.sample_type}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.vessel_name} • {record.tank_number}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.quantity} {record.unit}
          </div>
        </div>
      ),
    },
    {
      title: 'Lab Tujuan',
      dataIndex: 'lab_location',
      key: 'lab_location',
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EnvironmentOutlined style={{ color: '#fd0017', marginRight: 4 }} />
            <span>{record.lab_location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
            <ClockCircleOutlined
              style={{ color: '#9fe400', marginRight: 4, fontSize: '12px' }}
            />
            <span style={{ fontSize: '12px', color: '#666' }}>
              {record.estimated_delivery_time} jam
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Category Test',
      dataIndex: 'category_test',
      key: 'category_test',
    },
    {
      title: 'Estimasi Waktu Sampai',
      dataIndex: 'estimated_arrival_time',
      key: 'estimated_arrival_time',
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusLabel(record.status)}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Dikonfirmasi', value: 'confirmed' },
        { text: 'Diambil', value: 'picked_up' },
        { text: 'Dalam Perjalanan', value: 'in_transit' },
        { text: 'Terkirim', value: 'delivered' },
        { text: 'Dibatalkan', value: 'cancelled' },
      ],
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Hapus
          </Button>
        </Space>
      ),
    },
  ];

  const mockRequestData: RequestOrderRecord[] = [
    {
      id: '1',
      request_number: 'RQ-20250806-001',
      vessel_name: 'MT. Commodore One',
      tank_number: 'T.107',
      sample_type: 'JET A-1',
      category: 'import',
      quantity: 4,
      unit: 'botol',
      company_sender: 'SHAFTI',
      sender_name: 'Moch. Aby Gazal',
      sender_phone: '+62-21-12345678',
      estimated_arrival: '2025-08-06 10:00',
      lab_location: 'LPUJ - Priok',
      estimated_delivery_time: 1,
      priority: 'urgent',
      status: 'in_transit',
      sample_officer: 'Moch. Aby Gazal',
      created_at: '2025-08-06 08:30:00',
      pickup_time: '2025-08-06 09:00:00',
      memo_file: 'memo_227_NPC_SKH_2025.pdf',
      photo_file: 'sample_photo_001.jpg',
      notes: 'Sampel untuk pengujian segera',
    },
    {
      id: '2',
      request_number: 'RQ-20250806-002',
      vessel_name: 'MT. Pioneer',
      tank_number: 'T.203',
      sample_type: 'Avgas',
      category: 'local',
      quantity: 3,
      unit: 'botol',
      company_sender: 'Southeast Aviation',
      sender_name: 'Ahmad Rahman',
      sender_phone: '+60-12345678',
      estimated_arrival: '2025-08-06 14:00',
      lab_location: 'Lemigas - Jakarta',
      estimated_delivery_time: 1,
      priority: 'normal',
      status: 'confirmed',
      sample_officer: 'Ahmad Santoso',
      created_at: '2025-08-06 10:15:00',
      notes: 'Request dari partner Malaysia',
    },
  ];

  const mockStockData: StockOrderRecord[] = [
    {
      id: '1',
      order_number: 'SO-20250806-001',
      sample_date: '2025-08-06',
      sample_type: 'JET A-1',
      vessel_name: 'MT. Commodore One',
      tank_number: 'T.107',
      quantity: 4,
      unit: 'botol',
      lab_location: 'LPUJ - Priok',
      estimated_delivery_time: 1,
      priority: 'urgent',
      status: 'in_transit',
      category_test: 'Quality Analysis',
      estimated_arrival_time: '2025-08-06 14:00',
      memo_file: 'memo_sample_1.pdf',
      photo_sample: 'photo_sample_1.jpg',
      created_at: '2025-08-06 08:30:00',
      pickup_time: '2025-08-06 09:00:00',
      current_location: 'Jalan Tol Cikampek KM 15',
    },
    {
      id: '2',
      order_number: 'SO-20250806-002',
      sample_date: '2025-08-06',
      sample_type: 'Avgas',
      vessel_name: 'MT. Pioneer',
      tank_number: 'T.203',
      quantity: 3,
      unit: 'botol',
      lab_location: 'Lemigas - Jakarta',
      estimated_delivery_time: 1,
      priority: 'normal',
      status: 'confirmed',
      category_test: 'Basic Testing',
      estimated_arrival_time: '2025-08-06 16:00',
      created_at: '2025-08-06 10:15:00',
    },
  ];

  const requestSummary = {
    total: mockRequestData.length,
    pending: mockRequestData.filter((item) => item.status === 'pending').length,
    in_progress: mockRequestData.filter((item) =>
      ['confirmed', 'picked_up', 'in_transit'].includes(item.status),
    ).length,
    delivered: mockRequestData.filter((item) => item.status === 'delivered')
      .length,
  };

  const stockSummary = {
    total: mockStockData.length,
    pending: mockStockData.filter((item) => item.status === 'pending').length,
    in_progress: mockStockData.filter((item) =>
      ['confirmed', 'picked_up', 'in_transit'].includes(item.status),
    ).length,
    delivered: mockStockData.filter((item) => item.status === 'delivered')
      .length,
  };

  const tabItems = [
    {
      key: 'request',
      label: 'Request Stock',
      children: (
        <>
          {/* Summary Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Total Request"
                  value={requestSummary.total}
                  prefix={<FormOutlined style={{ color: '#0073fe' }} />}
                  valueStyle={{ color: '#0073fe' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Pending"
                  value={requestSummary.pending}
                  prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Dalam Proses"
                  value={requestSummary.in_progress}
                  prefix={<CarOutlined style={{ color: '#9fe400' }} />}
                  valueStyle={{ color: '#9fe400' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Terkirim"
                  value={requestSummary.delivered}
                  prefix={<ShoppingOutlined style={{ color: '#fd0017' }} />}
                  valueStyle={{ color: '#fd0017' }}
                />
              </Card>
            </Col>
          </Row>

          <ProTable<RequestOrderRecord>
            actionRef={requestActionRef}
            rowKey="id"
            search={{
              labelWidth: 'auto',
            }}
            columns={requestColumns}
            dataSource={mockRequestData}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            dateFormatter="string"
            headerTitle="Daftar Request"
            toolBarRender={() => [
              <Button key="template" type="default">
                Download Template
              </Button>,
              <Button key="track" type="default">
                Tracking Status
              </Button>,
              <Button key="export" type="default">
                Export Excel
              </Button>,
            ]}
          />
        </>
      ),
    },
    {
      key: 'stock',
      label: 'Order Stock',
      children: (
        <>
          {/* Summary Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Total Pesanan"
                  value={stockSummary.total}
                  prefix={<ShoppingOutlined style={{ color: '#0073fe' }} />}
                  valueStyle={{ color: '#0073fe' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Pending"
                  value={stockSummary.pending}
                  prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Dalam Proses"
                  value={stockSummary.in_progress}
                  prefix={<CarOutlined style={{ color: '#9fe400' }} />}
                  valueStyle={{ color: '#9fe400' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <Statistic
                  title="Terkirim"
                  value={stockSummary.delivered}
                  prefix={<ShoppingOutlined style={{ color: '#fd0017' }} />}
                  valueStyle={{ color: '#fd0017' }}
                />
              </Card>
            </Col>
          </Row>

          {activeTab === 'stock' && calendarView ? (
            /* Calendar View */
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarOutlined
                    style={{ marginRight: 8, color: '#fd0017' }}
                  />
                  Kalender Stock Tersedia - Klik untuk Pesan
                </div>
              }
            >
              <Calendar
                mode="month"
                cellRender={dateCellRender}
                value={selectedDate}
                onChange={setSelectedDate}
                style={{ height: 600 }}
              />
            </Card>
          ) : (
            /* Table View */
            <ProTable<StockOrderRecord>
              actionRef={stockActionRef}
              rowKey="id"
              search={{
                labelWidth: 'auto',
              }}
              columns={stockColumns}
              dataSource={mockStockData}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              dateFormatter="string"
              headerTitle="Daftar Pesanan Stock"
              toolBarRender={() => [
                <Button key="track" type="default">
                  Tracking Status
                </Button>,
                <Button key="export" type="default">
                  Export Excel
                </Button>,
              ]}
            />
          )}
        </>
      ),
    },
  ];

  return (
    <PageContainer
      title="Request & Order Stock"
      content="Kelola request sampel baru dan pesanan dari stock yang tersedia"
      extra={[
        activeTab === 'stock' && (
          <Button
            key="view"
            icon={<CalendarOutlined />}
            onClick={() => setCalendarView(!calendarView)}
          >
            {calendarView ? 'View Tabel' : 'View Kalender'}
          </Button>
        ),
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={
            activeTab === 'request'
              ? handleCreateRequest
              : handleCreateStockOrder
          }
          style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
        >
          {activeTab === 'request' ? 'Buat Request Baru' : 'Buat Pesanan Stock'}
        </Button>,
      ]}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Drawer
        title={
          drawerType === 'request'
            ? editingRecord && 'request_number' in editingRecord
              ? 'Edit Request'
              : 'Buat Request Baru'
            : editingRecord && 'order_number' in editingRecord
              ? 'Edit Pesanan Stock'
              : 'Buat Pesanan Stock Baru'
        }
        width={700}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
          setSelectedStock(null);
          setMemoFileList([]);
          setPhotoFileList([]);
        }}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>Batal</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
            >
              {drawerType === 'request' ? 'Buat Request' : 'Buat Pesanan'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {drawerType === 'request' ? (
            // Request Form
            <>
              {/* Sample Information */}
              <Card
                title="Informasi Sampel"
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="vessel_name"
                      label="Nama Kapal/Tangki"
                      rules={[
                        { required: true, message: 'Nama kapal wajib diisi' },
                      ]}
                    >
                      <Input placeholder="MT. Commodore One" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="tank_number"
                      label="Nomor Tangki"
                      rules={[
                        { required: true, message: 'Nomor tangki wajib diisi' },
                      ]}
                    >
                      <Input placeholder="T.107" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="sample_type"
                      label="Jenis Sampel"
                      rules={[
                        {
                          required: true,
                          message: 'Jenis sampel wajib dipilih',
                        },
                      ]}
                    >
                      <Select
                        placeholder="Pilih jenis sampel"
                        options={sampleTypeOptions}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="category"
                      label="Kategori"
                      rules={[
                        { required: true, message: 'Kategori wajib dipilih' },
                      ]}
                    >
                      <Select
                        placeholder="Pilih kategori"
                        options={categoryOptions}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="priority"
                      label="Prioritas"
                      rules={[
                        { required: true, message: 'Prioritas wajib dipilih' },
                      ]}
                    >
                      <Select
                        placeholder="Pilih prioritas"
                        options={priorityOptions}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="quantity"
                      label="Jumlah Sampel"
                      rules={[
                        {
                          required: true,
                          message: 'Jumlah sampel wajib diisi',
                        },
                      ]}
                    >
                      <InputNumber
                        min={1}
                        placeholder="4"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="unit"
                      label="Satuan"
                      rules={[
                        { required: true, message: 'Satuan wajib dipilih' },
                      ]}
                    >
                      <Select placeholder="Pilih satuan">
                        <Select.Option value="botol">Botol</Select.Option>
                        <Select.Option value="liter">Liter</Select.Option>
                        <Select.Option value="ml">ml</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="estimated_arrival"
                      label="Estimasi Kedatangan"
                      rules={[
                        {
                          required: true,
                          message: 'Estimasi kedatangan wajib diisi',
                        },
                      ]}
                    >
                      <DatePicker
                        showTime
                        format="DD/MM/YYYY HH:mm"
                        style={{ width: '100%' }}
                        getPopupContainer={(_trigger) => document.body}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Sender Information */}
              <Card
                title="Informasi Pengirim"
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="company_sender"
                      label="Perusahaan Pengirim"
                      rules={[
                        {
                          required: true,
                          message: 'Perusahaan pengirim wajib diisi',
                        },
                      ]}
                    >
                      <Input placeholder="SHAFTI" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="sender_name"
                      label="Nama Pengirim"
                      rules={[
                        {
                          required: true,
                          message: 'Nama pengirim wajib diisi',
                        },
                      ]}
                    >
                      <Input placeholder="Moch. Aby Gazal" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="sender_phone"
                      label="Telepon Pengirim"
                      rules={[
                        {
                          required: true,
                          message: 'Telepon pengirim wajib diisi',
                        },
                      ]}
                    >
                      <Input placeholder="+62-21-12345678" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="sample_officer"
                      label="Sample Officer"
                      rules={[
                        {
                          required: true,
                          message: 'Sample officer wajib dipilih',
                        },
                      ]}
                    >
                      <Select
                        placeholder="Pilih sample officer"
                        options={sampleOfficerOptions}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Delivery Information */}
              <Card
                title="Informasi Pengiriman"
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Form.Item
                  name="lab_location"
                  label="Laboratorium Tujuan"
                  rules={[
                    {
                      required: true,
                      message: 'Laboratorium tujuan wajib dipilih',
                    },
                  ]}
                >
                  <Select
                    placeholder="Pilih laboratorium tujuan"
                    onChange={(value) => {
                      const lab = labLocationOptions.find(
                        (lab) => lab.value === value,
                      );
                      if (lab) {
                        form.setFieldsValue({
                          estimated_delivery_time: lab.time,
                        });
                      }
                    }}
                  >
                    {labLocationOptions.map((lab) => (
                      <Select.Option key={lab.value} value={lab.value}>
                        {lab.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Card>

              {/* File Attachments */}
              <Card title="Lampiran" size="small" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="memo_file"
                      label="Memo File"
                      valuePropName="fileList"
                      getValueFromEvent={(e) => e?.fileList}
                    >
                      <Upload
                        name="memo"
                        listType="text"
                        maxCount={1}
                        beforeUpload={() => false}
                        onChange={handleMemoFileChange}
                        fileList={memoFileList}
                      >
                        <Button icon={<UploadOutlined />}>Upload Memo</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="photo_file"
                      label="Foto Sampel"
                      valuePropName="fileList"
                      getValueFromEvent={(e) => e?.fileList}
                    >
                      <Upload
                        name="photo"
                        listType="picture"
                        maxCount={1}
                        beforeUpload={() => false}
                        onChange={handlePhotoFileChange}
                        fileList={photoFileList}
                      >
                        <Button icon={<UploadOutlined />}>Upload Foto</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Form.Item name="notes" label="Catatan Tambahan">
                <Input.TextArea
                  rows={3}
                  placeholder="Catatan khusus untuk request ini..."
                />
              </Form.Item>

              {/* Process Information */}
              <Card title="Informasi Proses" size="small">
                <Steps
                  size="small"
                  current={0}
                  items={[
                    {
                      title: 'Registrasi',
                      description: 'Request dibuat',
                    },
                    {
                      title: 'Konfirmasi',
                      description: 'Request dikonfirmasi',
                    },
                    {
                      title: 'Pengambilan',
                      description: 'Sampel diambil',
                    },
                    {
                      title: 'Pengiriman',
                      description: 'Sampai di lab',
                    },
                  ]}
                />
              </Card>
            </>
          ) : (
            // Stock Order Form
            <>
              {selectedStock && (
                <Card
                  title="Stock Terpilih"
                  size="small"
                  style={{ marginBottom: 16, backgroundColor: '#f6ffed' }}
                >
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {selectedStock.details.sample_type}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {selectedStock.details.vessel_name} •{' '}
                        {selectedStock.details.tank_number}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#9fe400', fontWeight: 500 }}>
                        {selectedStock.details.available_quantity}{' '}
                        {selectedStock.details.unit}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Tersedia
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <Form.Item
                name="sample_date"
                label="Tanggal Sampel"
                rules={[
                  { required: true, message: 'Tanggal sampel wajib diisi' },
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  disabled={!!selectedStock}
                  getPopupContainer={(_trigger) => document.body}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="sample_type"
                    label="Jenis Sampel"
                    rules={[
                      { required: true, message: 'Jenis sampel wajib diisi' },
                    ]}
                  >
                    <Input disabled={!!selectedStock} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="vessel_name"
                    label="Nama Kapal"
                    rules={[
                      { required: true, message: 'Nama kapal wajib diisi' },
                    ]}
                  >
                    <Input disabled={!!selectedStock} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="tank_number"
                    label="Nomor Tangki"
                    rules={[
                      { required: true, message: 'Nomor tangki wajib diisi' },
                    ]}
                  >
                    <Input disabled={!!selectedStock} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="quantity"
                    label="Jumlah Dibutuhkan"
                    rules={[{ required: true, message: 'Jumlah wajib diisi' }]}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="unit"
                    label="Satuan"
                    rules={[{ required: true, message: 'Satuan wajib diisi' }]}
                  >
                    <Input disabled={!!selectedStock} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="lab_location"
                label="Laboratorium Tujuan"
                rules={[
                  {
                    required: true,
                    message: 'Laboratorium tujuan wajib dipilih',
                  },
                ]}
              >
                <Select
                  placeholder="Pilih laboratorium tujuan"
                  onChange={(value) => {
                    const lab = labLocationOptions.find(
                      (lab) => lab.value === value,
                    );
                    if (lab) {
                      form.setFieldsValue({
                        estimated_delivery_time: lab.time,
                      });
                    }
                  }}
                >
                  {labLocationOptions.map((lab) => (
                    <Select.Option key={lab.value} value={lab.value}>
                      {lab.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="category_test"
                label="Category Test"
                rules={[
                  { required: true, message: 'Category test wajib dipilih' },
                ]}
              >
                <Select
                  placeholder="Pilih category test"
                  options={categoryTestOptions}
                />
              </Form.Item>

              <Form.Item
                name="estimated_arrival_time"
                label="Estimasi Waktu Sampai"
                rules={[
                  {
                    required: true,
                    message: 'Estimasi waktu sampai wajib diisi',
                  },
                ]}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                  getPopupContainer={(_trigger) => document.body}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="memo_file"
                    label="Memo File"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => {
                      if (Array.isArray(e)) {
                        return e;
                      }
                      return e?.fileList;
                    }}
                  >
                    <Upload.Dragger
                      name="memoFile"
                      multiple={false}
                      beforeUpload={() => false}
                      onChange={handleMemoFileChange}
                      fileList={memoFileList}
                    >
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined />
                      </p>
                      <p className="ant-upload-text">Drag & Drop File</p>
                      <p className="ant-upload-hint">
                        Dukungan untuk single upload.
                      </p>
                    </Upload.Dragger>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="photo_sample"
                    label="Foto Sample"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => {
                      if (Array.isArray(e)) {
                        return e;
                      }
                      return e?.fileList;
                    }}
                  >
                    <Upload.Dragger
                      name="photoSample"
                      multiple={false}
                      beforeUpload={() => false}
                      onChange={handlePhotoFileChange}
                      fileList={photoFileList}
                    >
                      <p className="ant-upload-drag-icon">
                        <UploadOutlined />
                      </p>
                      <p className="ant-upload-text">Drag & Drop File</p>
                      <p className="ant-upload-hint">
                        Dukungan untuk single upload.
                      </p>
                    </Upload.Dragger>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="priority"
                label="Prioritas"
                rules={[{ required: true, message: 'Prioritas wajib dipilih' }]}
              >
                <Select
                  placeholder="Pilih prioritas"
                  options={priorityOptions}
                />
              </Form.Item>

              <Form.Item name="notes" label="Catatan">
                <Input.TextArea
                  rows={3}
                  placeholder="Catatan khusus untuk pesanan ini..."
                />
              </Form.Item>

              {/* Process Steps */}
              <Card title="Tahapan Proses" size="small">
                <Steps
                  size="small"
                  current={0}
                  items={[
                    {
                      title: 'Konfirmasi',
                      description: 'Pesanan dikonfirmasi',
                    },
                    {
                      title: 'Pengambilan',
                      description: 'Sampel diambil',
                    },
                    {
                      title: 'Pengiriman',
                      description: 'Dalam perjalanan ke lab',
                    },
                    {
                      title: 'Selesai',
                      description: 'Sampel sampai di lab',
                    },
                  ]}
                />
              </Card>
            </>
          )}
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default RequestOrderStock;
