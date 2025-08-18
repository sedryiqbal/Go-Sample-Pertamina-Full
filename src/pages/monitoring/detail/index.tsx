import {
  ArrowLeftOutlined,
  CarOutlined,
  ClockCircleOutlined,
  EditOutlined,
  EnvironmentOutlined,
  MessageOutlined,
  PhoneOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Modal,
  message,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Tag,
  Timeline,
} from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useState } from 'react';

dayjs.extend(relativeTime);

interface DetailMonitoringData {
  id: string;
  tracking_number: string;
  sample_type: string;
  vessel_name: string;
  tank_number: string;
  order_type: 'stock' | 'request';
  order_number: string;
  current_status: string;
  current_location: string;
  lab_destination: string;
  sample_officer: string;
  priority: 'normal' | 'urgent' | 'critical';
  estimated_arrival: string;
  actual_arrival?: string;
  progress_percentage: number;
  last_update: string;
  contact_info: {
    officer_phone: string;
    lab_phone: string;
    emergency_contact: string;
  };
  timeline_events: Array<{
    timestamp: string;
    status: string;
    location: string;
    description: string;
    type: 'info' | 'success' | 'warning' | 'error';
    details?: string;
    updated_by?: string;
  }>;
  route_info: {
    origin: string;
    destination: string;
    distance: string;
    estimated_duration: string;
    current_position: string;
    traffic_condition: 'normal' | 'heavy' | 'jam';
  };
  sample_details: {
    quantity: number;
    unit: string;
    category: string;
    temperature_condition: string;
    special_handling?: string;
  };
}

const MonitoringDetail: React.FC = () => {
  const { id } = useParams();
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data - in real app, this would be fetched based on ID
  const detailData: DetailMonitoringData = {
    id: id || '1',
    tracking_number: 'TRK-20250806-001',
    sample_type: 'JET A-1',
    vessel_name: 'MT. Commodore One',
    tank_number: 'T.107',
    order_type: 'stock',
    order_number: 'SO-20250806-001',
    current_status: 'in_transit',
    current_location: 'Jalan Tol Cikampek KM 15',
    lab_destination: 'LPUJ - Priok',
    sample_officer: 'Moch. Aby Gazal',
    priority: 'urgent',
    estimated_arrival: '2025-08-06 11:30',
    progress_percentage: 65,
    last_update: '2025-08-06 10:45:00',
    contact_info: {
      officer_phone: '+62-812-3456-7890',
      lab_phone: '+62-21-1234-5678',
      emergency_contact: '+62-811-9999-8888',
    },
    timeline_events: [
      {
        timestamp: '2025-08-06 08:30:00',
        status: 'pending',
        location: 'SHAFTI',
        description: 'Pesanan stock dibuat',
        type: 'info',
        details: 'Pesanan dibuat melalui sistem kalender stock',
        updated_by: 'System Auto',
      },
      {
        timestamp: '2025-08-06 09:00:00',
        status: 'picked_up',
        location: 'SHAFTI',
        description: 'Sampel diambil oleh Sample Officer',
        type: 'success',
        details:
          'Sampel JET A-1 4 botol diambil dari storage. Kondisi normal, tidak ada kerusakan.',
        updated_by: 'Moch. Aby Gazal',
      },
      {
        timestamp: '2025-08-06 09:30:00',
        status: 'in_transit',
        location: 'Jalan Raya Jakarta-Cikampek',
        description: 'Perjalanan menuju lab dimulai',
        type: 'info',
        details: 'Kondisi lalu lintas normal, estimasi tiba sesuai rencana',
        updated_by: 'Moch. Aby Gazal',
      },
      {
        timestamp: '2025-08-06 10:15:00',
        status: 'in_transit',
        location: 'Jalan Tol Cikampek KM 10',
        description: 'Update lokasi otomatis',
        type: 'info',
        details: 'GPS tracking update',
        updated_by: 'System Auto',
      },
      {
        timestamp: '2025-08-06 10:45:00',
        status: 'in_transit',
        location: 'Jalan Tol Cikampek KM 15',
        description: 'Lalu lintas mulai padat, kemungkinan terlambat 15 menit',
        type: 'warning',
        details: 'Terjadi kemacetan di KM 18-20, mencari rute alternatif',
        updated_by: 'Moch. Aby Gazal',
      },
    ],
    route_info: {
      origin: 'SHAFTI - Soekarno Hatta',
      destination: 'LPUJ - Tanjung Priok',
      distance: '35 km',
      estimated_duration: '2 jam 30 menit',
      current_position: 'Jalan Tol Cikampek KM 15',
      traffic_condition: 'heavy',
    },
    sample_details: {
      quantity: 4,
      unit: 'botol',
      category: 'Import Sample',
      temperature_condition: 'Room Temperature',
      special_handling: 'Avoid direct sunlight, handle with care',
    },
  };

  const handleBack = () => {
    history.goBack();
  };

  const handleUpdateLocation = async (_values: any) => {
    try {
      message.success('Lokasi berhasil diupdate');
      setUpdateModalVisible(false);
      form.resetFields();
    } catch (_error) {
      message.error('Gagal update lokasi');
    }
  };

  const handleEmergencyContact = (type: string) => {
    Modal.confirm({
      title: `Hubungi ${type}`,
      content: 'Apakah Anda ingin menghubungi kontak ini?',
      onOk() {
        message.info(`Menghubungi ${type}...`);
      },
    });
  };

  const _getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'picked_up':
        return 'processing';
      case 'in_transit':
        return 'warning';
      case 'lab_received':
        return 'processing';
      case 'testing':
        return 'warning';
      case 'completed':
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
      case 'picked_up':
        return 'Diambil';
      case 'in_transit':
        return 'Dalam Perjalanan';
      case 'lab_received':
        return 'Lab Terima';
      case 'testing':
        return 'Pengujian';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
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

  const getTrafficColor = (condition: string) => {
    switch (condition) {
      case 'normal':
        return 'success';
      case 'heavy':
        return 'warning';
      case 'jam':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCurrentStep = (status: string) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'picked_up':
        return 1;
      case 'in_transit':
        return 2;
      case 'lab_received':
        return 3;
      case 'testing':
        return 4;
      case 'completed':
        return 5;
      default:
        return 0;
    }
  };

  return (
    <PageContainer
      title={`Detail Tracking: ${detailData.tracking_number}`}
      content={`Monitoring real-time untuk sampel ${detailData.sample_type} dari ${detailData.vessel_name}`}
      extra={[
        <Button key="back" icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Kembali
        </Button>,
        <Button
          key="update"
          type="primary"
          icon={<EditOutlined />}
          onClick={() => setUpdateModalVisible(true)}
          style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
        >
          Update Lokasi
        </Button>,
        <Button
          key="contact"
          icon={<PhoneOutlined />}
          onClick={() => setContactModalVisible(true)}
        >
          Kontak Darurat
        </Button>,
      ]}
    >
      {/* Alert for urgent updates */}
      {detailData.priority === 'urgent' && (
        <Alert
          message="Prioritas Urgent"
          description="Sampel ini memiliki prioritas urgent. Pastikan monitoring dilakukan secara intensif."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Status Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Status Saat Ini"
              value={getStatusLabel(detailData.current_status)}
              prefix={<CarOutlined style={{ color: '#fd0017' }} />}
              valueStyle={{ color: '#fd0017' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Progress"
              value={detailData.progress_percentage}
              suffix="%"
              prefix={<ClockCircleOutlined style={{ color: '#9fe400' }} />}
              valueStyle={{ color: '#9fe400' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="ETA"
              value={dayjs(detailData.estimated_arrival).format('HH:mm')}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Last Update"
              value={dayjs(detailData.last_update).fromNow()}
              prefix={<ReloadOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Left Column */}
        <Col xs={24} lg={12}>
          {/* Progress Steps */}
          <Card title="Progress Tracking" style={{ marginBottom: 16 }}>
            <Progress
              percent={detailData.progress_percentage}
              strokeColor="#9fe400"
              trailColor="#f0f0f0"
              style={{ marginBottom: 16 }}
            />
            <Steps
              direction="vertical"
              size="small"
              current={getCurrentStep(detailData.current_status)}
              items={[
                {
                  title: 'Pesanan Dibuat',
                  description: 'Pesanan stock/request dibuat',
                },
                {
                  title: 'Sampel Diambil',
                  description: 'Sample officer mengambil sampel',
                },
                {
                  title: 'Dalam Perjalanan',
                  description: 'Perjalanan menuju laboratorium',
                },
                {
                  title: 'Lab Terima',
                  description: 'Sampel diterima laboratorium',
                },
                {
                  title: 'Pengujian',
                  description: 'Proses pengujian berlangsung',
                },
                {
                  title: 'Selesai',
                  description: 'Hasil pengujian tersedia',
                },
              ]}
            />
          </Card>

          {/* Sample Information */}
          <Card title="Informasi Sampel" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Order Number">
                {detailData.order_number}
              </Descriptions.Item>
              <Descriptions.Item label="Sample Type">
                {detailData.sample_type}
              </Descriptions.Item>
              <Descriptions.Item label="Vessel/Tank">
                {detailData.vessel_name} • {detailData.tank_number}
              </Descriptions.Item>
              <Descriptions.Item label="Quantity">
                {detailData.sample_details.quantity}{' '}
                {detailData.sample_details.unit}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {detailData.sample_details.category}
              </Descriptions.Item>
              <Descriptions.Item label="Temperature">
                {detailData.sample_details.temperature_condition}
              </Descriptions.Item>
              <Descriptions.Item label="Special Handling">
                {detailData.sample_details.special_handling || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                <Tag color={getPriorityColor(detailData.priority)}>
                  {detailData.priority.toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Route Information */}
          <Card title="Informasi Rute" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Asal">
                {detailData.route_info.origin}
              </Descriptions.Item>
              <Descriptions.Item label="Tujuan">
                {detailData.route_info.destination}
              </Descriptions.Item>
              <Descriptions.Item label="Jarak">
                {detailData.route_info.distance}
              </Descriptions.Item>
              <Descriptions.Item label="Estimasi Durasi">
                {detailData.route_info.estimated_duration}
              </Descriptions.Item>
              <Descriptions.Item label="Posisi Saat Ini">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <EnvironmentOutlined
                    style={{ color: '#fd0017', marginRight: 4 }}
                  />
                  {detailData.route_info.current_position}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Kondisi Lalu Lintas">
                <Badge
                  status={getTrafficColor(
                    detailData.route_info.traffic_condition,
                  )}
                  text={
                    detailData.route_info.traffic_condition === 'normal'
                      ? 'Normal'
                      : detailData.route_info.traffic_condition === 'heavy'
                        ? 'Padat'
                        : 'Macet'
                  }
                />
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={12}>
          {/* Timeline */}
          <Card title="Timeline Real-Time" style={{ marginBottom: 16 }}>
            <Timeline>
              {detailData.timeline_events.map((event) => (
                <Timeline.Item
                  key={event.timestamp}
                  color={
                    event.type === 'success'
                      ? 'green'
                      : event.type === 'warning'
                        ? 'orange'
                        : event.type === 'error'
                          ? 'red'
                          : 'blue'
                  }
                >
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                      {event.description}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        marginBottom: 4,
                      }}
                    >
                      <EnvironmentOutlined style={{ marginRight: 4 }} />
                      {event.location}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        marginBottom: 4,
                      }}
                    >
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {dayjs(event.timestamp).format('DD/MM/YYYY HH:mm')}
                    </div>
                    {event.details && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#666',
                          backgroundColor: '#f8f8f8',
                          padding: 8,
                          borderRadius: 4,
                          marginTop: 4,
                        }}
                      >
                        {event.details}
                      </div>
                    )}
                    {event.updated_by && (
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#999',
                          marginTop: 4,
                        }}
                      >
                        Updated by: {event.updated_by}
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>

          {/* Contact Information */}
          <Card title="Informasi Kontak" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>Sample Officer</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {detailData.sample_officer}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {detailData.contact_info.officer_phone}
                  </div>
                </div>
                <Button
                  size="small"
                  icon={<PhoneOutlined />}
                  onClick={() => handleEmergencyContact('Sample Officer')}
                >
                  Call
                </Button>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>
                    Lab {detailData.lab_destination}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {detailData.contact_info.lab_phone}
                  </div>
                </div>
                <Button
                  size="small"
                  icon={<PhoneOutlined />}
                  onClick={() => handleEmergencyContact('Lab')}
                >
                  Call
                </Button>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>Emergency Contact</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {detailData.contact_info.emergency_contact}
                  </div>
                </div>
                <Button
                  size="small"
                  icon={<PhoneOutlined />}
                  danger
                  onClick={() => handleEmergencyContact('Emergency')}
                >
                  Emergency
                </Button>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Update Location Modal */}
      <Modal
        title="Update Lokasi"
        open={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateLocation}>
          <Form.Item
            name="location"
            label="Lokasi Saat Ini"
            rules={[{ required: true, message: 'Lokasi wajib diisi' }]}
          >
            <Input placeholder="Jalan Tol Cikampek KM 20" />
          </Form.Item>
          <Form.Item
            name="status_update"
            label="Update Status"
            rules={[{ required: true, message: 'Status update wajib diisi' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Deskripsi kondisi saat ini..."
            />
          </Form.Item>
          <Form.Item name="traffic_condition" label="Kondisi Lalu Lintas">
            <Select placeholder="Pilih kondisi">
              <Select.Option value="normal">Normal</Select.Option>
              <Select.Option value="heavy">Padat</Select.Option>
              <Select.Option value="jam">Macet</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Contact Modal */}
      <Modal
        title="Kontak Darurat"
        open={contactModalVisible}
        onCancel={() => setContactModalVisible(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            block
            size="large"
            icon={<PhoneOutlined />}
            onClick={() => handleEmergencyContact('Sample Officer')}
          >
            Call Sample Officer: {detailData.contact_info.officer_phone}
          </Button>

          <Button
            block
            size="large"
            icon={<PhoneOutlined />}
            onClick={() => handleEmergencyContact('Lab')}
          >
            Call Lab: {detailData.contact_info.lab_phone}
          </Button>

          <Button
            block
            size="large"
            danger
            icon={<PhoneOutlined />}
            onClick={() => handleEmergencyContact('Emergency')}
          >
            Emergency: {detailData.contact_info.emergency_contact}
          </Button>

          <Button
            block
            size="large"
            icon={<MessageOutlined />}
            onClick={() => message.info('Opening WhatsApp...')}
          >
            WhatsApp Group Monitoring
          </Button>
        </Space>
      </Modal>
    </PageContainer>
  );
};

export default MonitoringDetail;
