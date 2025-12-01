import {
  ArrowLeftOutlined,
  CarOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Descriptions,
  message,
  Progress,
  Row,
  Space,
  Spin,
  Statistic,
  Steps,
  Tag,
  Timeline,
} from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useCallback, useEffect, useState } from 'react';
import {
  getMonitoringSampleOrderDetail,
  MonitoringStatus,
} from '@/services/monitoring';
import type { MonitoringSampleOrderDetail } from '@/services/monitoring';

dayjs.extend(relativeTime);

const MonitoringDetail: React.FC = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [detailData, setDetailData] = useState<MonitoringSampleOrderDetail | null>(null);
  const driverInfo = detailData?.contactInfo?.driverInfo;

  const fetchDetailData = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await getMonitoringSampleOrderDetail(id);
      setDetailData(response.data);
    } catch (error) {
      console.error('Failed to fetch detail data:', error);
      message.error('Gagal memuat detail monitoring');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetailData();
  }, [fetchDetailData]);

  const handleBack = () => {
    history.back();
  };

  const handleRefresh = async () => {
    await fetchDetailData();
    message.success('Data berhasil diperbarui');
  };

  const handleContact = (type: string, phone?: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    } else {
      message.info(`Menghubungi ${type}...`);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
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

  const getCurrentStep = (statusValue: number) => {
    // Map status value to step
    // 0: Pending, 1: WaitingPickupSample, 2: InTransit, 3: Delivered
    // 4: ConfirmSampleInLab, 5: RegisteredLabSample, 6: StartTesting
    // 7: CompletedTesting, 8: Comparation, 9: CompletedComparation, 10: Canceled
    if (statusValue <= MonitoringStatus.Pending) return 0;
    if (statusValue === MonitoringStatus.WaitingPickupSample) return 1;
    if (statusValue === MonitoringStatus.InTransit) return 2;
    if (statusValue === MonitoringStatus.Delivered) return 3;
    if (statusValue <= MonitoringStatus.RegisteredLabSample) return 4;
    if (statusValue <= MonitoringStatus.CompletedTesting) return 5;
    if (statusValue >= MonitoringStatus.Comparation) return 6;
    return 0;
  };

  const getTimelineColor = (_oldStatus: string, newStatus: string) => {
    // Determine color based on status transition
    if (newStatus.toLowerCase().includes('completed') || 
        newStatus.toLowerCase().includes('delivered') ||
        newStatus.toLowerCase().includes('confirmed')) {
      return 'green';
    }
    if (newStatus.toLowerCase().includes('canceled')) {
      return 'red';
    }
    if (newStatus.toLowerCase().includes('transit') || 
        newStatus.toLowerCase().includes('testing')) {
      return 'orange';
    }
    return 'blue';
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: 100 }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  if (!detailData) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: 100 }}>
          <p>Data tidak ditemukan</p>
          <Button onClick={handleBack}>Kembali</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Detail Tracking: ${detailData.sampleInfo.orderNumber}`}
      content={`Monitoring real-time untuk sampel ${detailData.sampleInfo.sampleType}`}
      extra={[
        <Button key="back" icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Kembali
        </Button>,
        <Button
          key="refresh"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>,
      ]}
    >
      {/* Status Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Status Saat Ini"
              value={detailData.information.currentStatus}
              prefix={<CarOutlined style={{ color: '#fd0017' }} />}
              valueStyle={{ color: '#fd0017', fontSize: 16 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Progress"
              value={detailData.information.progress}
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
              value={detailData.sampleInfo.etaArival ? dayjs(detailData.sampleInfo.etaArival).format('DD/MM HH:mm') : '-'}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Last Update"
              value={detailData.information.lastUpdatedFormatted || dayjs(detailData.information.lastUpdated).fromNow()}
              prefix={<ReloadOutlined style={{ color: '#0073fe' }} />}
              valueStyle={{ color: '#0073fe', fontSize: 14 }}
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
              percent={detailData.information.progress}
              strokeColor="#9fe400"
              trailColor="#f0f0f0"
              style={{ marginBottom: 16 }}
            />
            <Steps
              direction="vertical"
              size="small"
              current={getCurrentStep(detailData.information.statusValue)}
              items={[
                {
                  title: 'Pesanan Dibuat',
                  description: 'Pesanan stock/request dibuat',
                },
                {
                  title: 'Menunggu Pickup',
                  description: 'Menunggu pengambilan sampel',
                },
                {
                  title: 'Dalam Perjalanan',
                  description: 'Perjalanan menuju laboratorium',
                },
                {
                  title: 'Terkirim',
                  description: 'Sampel telah dikirim',
                },
                {
                  title: 'Diterima Lab',
                  description: 'Sampel diterima & terdaftar di lab',
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
                {detailData.sampleInfo.orderNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Sample Type">
                {detailData.sampleInfo.sampleType}
              </Descriptions.Item>
              <Descriptions.Item label="Vessel/Tank">
                {detailData.sampleInfo.vesselTank}
              </Descriptions.Item>
              <Descriptions.Item label="Quantity">
                {detailData.sampleInfo.quantity}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {detailData.sampleInfo.category}
              </Descriptions.Item>
              <Descriptions.Item label="Nomor NPC">
                {detailData.sampleInfo.nomorNpc || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Tanggal Order">
                {detailData.sampleInfo.tanggalOrder 
                  ? dayjs(detailData.sampleInfo.tanggalOrder).format('DD/MM/YYYY HH:mm')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="ETA Arrival">
                {detailData.sampleInfo.etaArival 
                  ? dayjs(detailData.sampleInfo.etaArival).format('DD/MM/YYYY HH:mm')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                <Tag color={getPriorityColor(detailData.sampleInfo.priority)}>
                  {detailData.sampleInfo.priority?.toUpperCase() || 'NORMAL'}
                </Tag>
              </Descriptions.Item>
              {detailData.sampleInfo.notes && (
                <Descriptions.Item label="Notes">
                  {detailData.sampleInfo.notes}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Contact Information */}
          <Card title="Informasi Kontak" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* Lab Info */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>
                    Lab: {detailData.contactInfo.labInfo.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {detailData.contactInfo.labInfo.description}
                  </div>
                </div>
              </div>

              {/* Driver Info */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                }}
              >
                {driverInfo ? (
                  <>
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        <UserOutlined style={{ marginRight: 8 }} />
                        Driver: {driverInfo.name || '-'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {driverInfo.email || 'Email belum tersedia'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {driverInfo.phone || 'Telepon belum tersedia'}
                      </div>
                    </div>
                    <Button
                      size="small"
                      icon={<PhoneOutlined />}
                      disabled={!driverInfo.phone}
                      onClick={() => handleContact('Driver', driverInfo.phone)}
                    >
                      Call
                    </Button>
                  </>
                ) : (
                  <div style={{ fontStyle: 'italic', color: '#999' }}>
                    Informasi driver belum tersedia
                  </div>
                )}
              </div>
            </Space>
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={12}>
          {/* Timeline */}
          <Card title="Timeline Real-Time" style={{ marginBottom: 16 }}>
            <Timeline>
              {detailData.timeline.map((event, index) => (
                <Timeline.Item
                  key={`${event.timeValue}-${index}`}
                  color={getTimelineColor(event.oldStatus, event.newStatus)}
                >
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                      {event.oldStatus} → {event.newStatus}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        marginBottom: 4,
                      }}
                    >
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {event.time}
                    </div>
                    {event.comment && (
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
                        {event.comment}
                      </div>
                    )}
                    {event.userName && event.userName !== '-' && (
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#999',
                          marginTop: 4,
                        }}
                      >
                        <UserOutlined style={{ marginRight: 4 }} />
                        Updated by: {event.userName}
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default MonitoringDetail;
