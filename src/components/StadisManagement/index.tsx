import {
  CloseOutlined,
  DatabaseOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Space,
  Statistic,
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

interface StadisManagementProps {
  visible: boolean;
  onClose: () => void;
  stadisData?: StadisData;
  onUpdate: (data: StadisData) => void;
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

const StadisManagement: React.FC<StadisManagementProps> = ({
  visible,
  onClose,
  stadisData,
  onUpdate,
}) => {
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const [currentStock, setCurrentStock] = useState(
    stadisData?.current_stock || 0,
  );

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
      if (stadisData) {
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

        onUpdate(updatedData);
        message.success('Stock stadis berhasil diperbarui');
        onClose();
      }
    } catch (_error) {
      message.error('Gagal memperbarui stock stadis');
    }
  };

  const getStockStatus = (stock: number): StadisData['status'] => {
    if (!stadisData) return 'normal';

    const capacity = stadisData.max_capacity;
    const threshold = stadisData.min_threshold;

    if (stock >= capacity * 0.9) return 'full';
    if (stock <= threshold) return 'urgent';
    if (stock <= threshold * 1.5) return 'low';
    return 'normal';
  };

  const getStockPercentage = () => {
    if (!stadisData) return 0;
    return Math.round((currentStock / stadisData.max_capacity) * 100);
  };

  React.useEffect(() => {
    if (stadisData) {
      setCurrentStock(stadisData.current_stock);
      form.setFieldsValue({
        current_stock: stadisData.current_stock,
      });
    }
  }, [stadisData, form]);

  if (!stadisData) return null;

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DatabaseOutlined style={{ color: '#fd0017' }} />
          <span>Manajemen Stock Stadis</span>
        </div>
      }
      width={520}
      open={visible}
      onClose={onClose}
      extra={
        <Space>
          <Button icon={<CloseOutlined />} onClick={onClose}>
            Tutup
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
            style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
          >
            Simpan Perubahan
          </Button>
        </Space>
      }
    >
      {/* Current Stock Display */}
      <Card
        title="Stock Stadis Saat Ini"
        style={{ marginBottom: 24, textAlign: 'center' }}
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
          <div>
            <div
              style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}
            >
              Lokasi
            </div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
              {stadisData.location}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}
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
              style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}
            >
              Batas Min
            </div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
              {stadisData.min_threshold} pail
            </div>
          </div>
        </div>
      </Card>

      {/* Manual Input Form */}
      <Card
        title="Update Stock Stadis"
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
                  Stock mendekati kapasitas maksimal ({stadisData.max_capacity}{' '}
                  pail)
                </div>
              </div>
            </div>
          )}
        </Form>
      </Card>

      {/* Stock History Preview */}
      <Card title="Riwayat Terakhir" size="small" style={{ marginTop: 16 }}>
        <div style={{ fontSize: '12px', color: '#666' }}>
          <div>Terakhir diperbarui:</div>
          <div style={{ fontWeight: 500, color: '#333' }}>
            {new Date(stadisData.last_updated).toLocaleString('id-ID')}
          </div>
        </div>
      </Card>
    </Drawer>
  );
};

export default StadisManagement;
