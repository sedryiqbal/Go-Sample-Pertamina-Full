import { DatabaseOutlined, SaveOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Space,
  Statistic,
  Tag,
} from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';

export interface StadisData {
  id: string;
  location: string;
  current_stock: number;
  min_threshold: number;
  max_capacity: number;
  last_updated: string;
  status: 'normal' | 'low' | 'urgent' | 'full';
}

export interface AuditLog {
  id: string;
  action: string;
  previous_stock: number;
  new_stock: number;
  user: string;
  timestamp: string;
  notes?: string;
}

const useStyles = createStyles(({ token }) => {
  return {
    stadisCard: {
      marginBottom: 16,
      cursor: 'pointer',
      transition: 'all 0.3s',
      '&:hover': {
        boxShadow: token.boxShadowTertiary,
        borderColor: token.colorPrimary,
      },
    },
    statusBadge: {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 500,
    },
    stockInput: {
      width: '100%',
      textAlign: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
    },
  };
});

const Stadis: React.FC = () => {
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const [currentStock, setCurrentStock] = useState(150);

  // Mock data for demonstration
  const stadisData: StadisData = {
    id: 'ST001',
    location: 'Gudang A - Area 1',
    current_stock: 150,
    min_threshold: 50,
    max_capacity: 500,
    last_updated: '2025-09-20T10:30:00.000Z',
    status: 'normal',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#52c41a';
      case 'low':
        return '#faad14';
      case 'urgent':
        return '#ff4d4f';
      case 'full':
        return '#1890ff';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'low':
        return 'Stock Rendah';
      case 'urgent':
        return 'Mendesak';
      case 'full':
        return 'Penuh';
      default:
        return 'Tidak Diketahui';
    }
  };

  const handleSave = async (values: any) => {
    try {
      const updatedData: StadisData = {
        ...stadisData,
        current_stock: values.current_stock,
        last_updated: new Date().toISOString(),
        status: getStockStatus(values.current_stock),
      };

      // Create audit log entry for this change
      const auditEntry: AuditLog = {
        id: Date.now().toString(),
        action: 'Stock Update',
        previous_stock: stadisData.current_stock,
        new_stock: values.current_stock,
        user: 'Current User', // This should come from authentication context
        timestamp: new Date().toISOString(),
        notes: values.notes,
      };

      // In a real app, you would save the audit log to backend
      console.log('Audit Log:', auditEntry);
      console.log('Updated Data:', updatedData);

      message.success('Stock stadis berhasil diperbarui');
      form.resetFields();
    } catch (_error) {
      message.error('Gagal memperbarui stock stadis');
    }
  };

  const getStockStatus = (stock: number): StadisData['status'] => {
    const capacity = stadisData.max_capacity;
    const threshold = stadisData.min_threshold;

    if (stock >= capacity * 0.9) return 'full';
    if (stock <= threshold) return 'urgent';
    if (stock <= threshold * 1.5) return 'low';
    return 'normal';
  };

  const getStockPercentage = () => {
    return Math.round((currentStock / stadisData.max_capacity) * 100);
  };

  // Mock audit log data for stadis
  const mockAuditLogs = [
    {
      id: '1',
      action: 'Stock Update',
      previous_stock: 140,
      new_stock: 150,
      user: 'Admin Lab',
      timestamp: '2025-09-20 10:30:00',
      notes: 'Penambahan stock stadis setelah pengiriman baru',
    },
    {
      id: '2',
      action: 'Stock Adjustment',
      previous_stock: 160,
      new_stock: 140,
      user: 'Supervisor Lab',
      timestamp: '2025-09-19 14:15:00',
      notes: 'Koreksi stock setelah audit fisik mingguan',
    },
    {
      id: '3',
      action: 'Stock Usage',
      previous_stock: 175,
      new_stock: 160,
      user: 'Teknisi Lab',
      timestamp: '2025-09-18 11:00:00',
      notes: 'Penggunaan stadis untuk testing sample JET-A1',
    },
    {
      id: '4',
      action: 'Emergency Restock',
      previous_stock: 35,
      new_stock: 175,
      user: 'Manager Lab',
      timestamp: '2025-09-17 08:45:00',
      notes: 'Restocking darurat karena stock hampir habis',
    },
    {
      id: '5',
      action: 'Stock Usage',
      previous_stock: 45,
      new_stock: 35,
      user: 'Teknisi Lab',
      timestamp: '2025-09-16 16:30:00',
      notes: 'Penggunaan stadis untuk testing sample Avgas',
    },
  ];

  React.useEffect(() => {
    setCurrentStock(stadisData.current_stock);
    form.setFieldsValue({
      current_stock: stadisData.current_stock,
    });
  }, [stadisData, form]);

  return (
    <PageContainer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DatabaseOutlined style={{ color: '#fd0017' }} />
          <span>Manajemen Stock Stadis</span>
        </div>
      }
      content="Kelola dan update stock stadis dengan sistem audit trail yang lengkap"
      extra={[
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => form.submit()}
          style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
        >
          Simpan Perubahan
        </Button>,
      ]}
    >
      {/* Two Column Layout */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {/* Current Stock Display */}
        <Col xs={24} lg={12}>
          <Card
            title="Stock Stadis Saat Ini"
            style={{ height: '100%', textAlign: 'center' }}
            headStyle={{ backgroundColor: '#fafafa' }}
          >
            <Statistic
              title=""
              value={currentStock}
              suffix={`/ ${stadisData.max_capacity} pail`}
              valueStyle={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: getStatusColor(getStockStatus(currentStock)),
              }}
            />
            <div
              style={{
                marginTop: 12,
                fontSize: '16px',
                fontWeight: '500',
                color: '#666',
              }}
            >
              {getStockPercentage()}% dari kapasitas maksimal
            </div>

            <div
              style={{
                marginTop: 16,
                padding: '16px',
                backgroundColor: '#fafafa',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#999',
                    marginBottom: '4px',
                  }}
                >
                  Status
                </div>
                <span
                  className={styles.statusBadge}
                  style={{
                    backgroundColor: getStatusColor(stadisData.status),
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  {getStatusText(stadisData.status)}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#999',
                    marginBottom: '4px',
                  }}
                >
                  Batas Min
                </div>
                <div
                  style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}
                >
                  {stadisData.min_threshold} pail
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Manual Input Form */}
        <Col xs={24} lg={12}>
          <Card
            title="Update Stock Stadis"
            style={{ height: '100%' }}
            headStyle={{ backgroundColor: '#fafafa' }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                current_stock: stadisData.current_stock,
              }}
            >
              <Form.Item
                name="current_stock"
                label="Jumlah Stock Baru"
                rules={[
                  { required: true, message: 'Stock wajib diisi' },
                  {
                    type: 'number',
                    min: 0,
                    max: stadisData.max_capacity,
                    message: `Stock harus antara 0 - ${stadisData.max_capacity} pail`,
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  max={stadisData.max_capacity}
                  className={styles.stockInput}
                  onChange={(value) => setCurrentStock(value || 0)}
                  style={{
                    width: '100%',
                    fontSize: '18px',
                    padding: '8px 12px',
                    textAlign: 'center',
                  }}
                  placeholder={`Masukkan jumlah stock (0 - ${stadisData.max_capacity} pail)`}
                />
              </Form.Item>

              <Form.Item
                name="notes"
                label="Catatan Perubahan"
                rules={[
                  { required: true, message: 'Catatan perubahan wajib diisi' },
                ]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Masukkan catatan untuk perubahan stock ini (alasan, sumber, dll.)"
                  style={{
                    fontSize: '14px',
                  }}
                />
              </Form.Item>

              {/* Warning Messages */}
              {currentStock <= stadisData.min_threshold && (
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#fff7e6',
                    border: '1px solid #ffd591',
                    borderRadius: '8px',
                    color: '#d46b08',
                    fontSize: '13px',
                    marginTop: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>⚠️</span>
                  <div>
                    <div style={{ fontWeight: '500' }}>
                      Peringatan Stock Rendah!
                    </div>
                    <div style={{ marginTop: '2px', fontSize: '12px' }}>
                      Stock berada di bawah batas minimum (
                      {stadisData.min_threshold} pail)
                    </div>
                  </div>
                </div>
              )}

              {currentStock >= stadisData.max_capacity * 0.9 && (
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#e6f7ff',
                    border: '1px solid #91d5ff',
                    borderRadius: '8px',
                    color: '#0958d9',
                    fontSize: '13px',
                    marginTop: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>ℹ️</span>
                  <div>
                    <div style={{ fontWeight: '500' }}>Informasi Kapasitas</div>
                    <div style={{ marginTop: '2px', fontSize: '12px' }}>
                      Stock mendekati kapasitas maksimal (
                      {stadisData.max_capacity} pail)
                    </div>
                  </div>
                </div>
              )}
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Audit Log Section */}
      <Card
        title="Audit Log Stadis Stock"
        size="default"
        style={{ marginTop: 24 }}
        extra={
          <Button type="default" size="small">
            Export Log
          </Button>
        }
      >
        <ProTable
          rowKey="id"
          search={false}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true,
            size: 'small',
          }}
          toolBarRender={false}
          columns={[
            {
              title: 'Waktu',
              dataIndex: 'timestamp',
              key: 'timestamp',
              width: 140,
              sorter: true,
            },
            {
              title: 'Aksi',
              dataIndex: 'action',
              key: 'action',
              width: 120,
              render: (_, record) => (
                <Tag
                  color={
                    record.action.includes('Update')
                      ? 'blue'
                      : record.action.includes('Usage')
                        ? 'orange'
                        : record.action.includes('Adjustment')
                          ? 'green'
                          : record.action.includes('Emergency')
                            ? 'red'
                            : 'default'
                  }
                >
                  {record.action}
                </Tag>
              ),
            },
            {
              title: 'Stock Sebelum',
              dataIndex: 'previous_stock',
              key: 'previous_stock',
              width: 120,
              render: (_, record) => `${record.previous_stock} pail`,
              align: 'center',
            },
            {
              title: 'Stock Sesudah',
              dataIndex: 'new_stock',
              key: 'new_stock',
              width: 120,
              render: (_, record) => `${record.new_stock} pail`,
              align: 'center',
            },
            {
              title: 'Selisih',
              key: 'difference',
              width: 100,
              render: (_, record: any) => {
                const diff = record.new_stock - record.previous_stock;
                return (
                  <span
                    style={{
                      color:
                        diff > 0 ? '#52c41a' : diff < 0 ? '#ff4d4f' : '#666',
                      fontWeight: 500,
                    }}
                  >
                    {diff > 0 ? '+' : ''}
                    {diff}
                  </span>
                );
              },
              align: 'center',
            },
            {
              title: 'User',
              dataIndex: 'user',
              key: 'user',
              width: 120,
              render: (_, record) => (
                <Space>
                  <span style={{ fontSize: '12px', color: '#666' }}>👤</span>
                  {record.user}
                </Space>
              ),
            },
            {
              title: 'Catatan',
              dataIndex: 'notes',
              key: 'notes',
              ellipsis: true,
            },
          ]}
          dataSource={mockAuditLogs}
          size="small"
        />
      </Card>
    </PageContainer>
  );
};

export default Stadis;
