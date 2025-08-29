import {
  CloseOutlined,
  MinusOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  InputNumber,
  message,
  Space,
  Statistic,
} from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';

export interface SiringData {
  id: string;
  location: string;
  current_stock: number;
  min_threshold: number;
  max_capacity: number;
  last_updated: string;
  status: 'normal' | 'low' | 'critical' | 'full';
}

interface SiringManagementProps {
  visible: boolean;
  onClose: () => void;
  siringData?: SiringData;
  onUpdate: (data: SiringData) => void;
}

const useStyles = createStyles(({ token }) => {
  return {
    siringCard: {
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
    actionSection: {
      padding: '16px',
      backgroundColor: token.colorBgContainer,
      borderRadius: token.borderRadius,
      marginBottom: 16,
    },
    quickActions: {
      display: 'flex',
      gap: '8px',
      marginBottom: 16,
    },
    stockInput: {
      width: '100%',
      textAlign: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
    },
  };
});

const SiringManagement: React.FC<SiringManagementProps> = ({
  visible,
  onClose,
  siringData,
  onUpdate,
}) => {
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const [currentStock, setCurrentStock] = useState(
    siringData?.current_stock || 0,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#52c41a';
      case 'low':
        return '#faad14';
      case 'critical':
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
      case 'critical':
        return 'Kritis';
      case 'full':
        return 'Penuh';
      default:
        return 'Tidak Diketahui';
    }
  };

  const handleQuickAdd = (amount: number) => {
    const newStock = Math.min(
      currentStock + amount,
      siringData?.max_capacity || 100,
    );
    setCurrentStock(newStock);
    form.setFieldsValue({ current_stock: newStock });
  };

  const handleQuickSubtract = (amount: number) => {
    const newStock = Math.max(currentStock - amount, 0);
    setCurrentStock(newStock);
    form.setFieldsValue({ current_stock: newStock });
  };

  const handleSave = async (values: any) => {
    try {
      if (siringData) {
        const updatedData: SiringData = {
          ...siringData,
          current_stock: values.current_stock,
          last_updated: new Date().toISOString(),
          status: getStockStatus(values.current_stock),
        };
        onUpdate(updatedData);
        message.success('Stock siring berhasil diperbarui');
        onClose();
      }
    } catch (_error) {
      message.error('Gagal memperbarui stock siring');
    }
  };

  const getStockStatus = (stock: number): SiringData['status'] => {
    if (!siringData) return 'normal';

    const capacity = siringData.max_capacity;
    const threshold = siringData.min_threshold;

    if (stock >= capacity * 0.9) return 'full';
    if (stock <= threshold) return 'critical';
    if (stock <= threshold * 1.5) return 'low';
    return 'normal';
  };

  const getStockPercentage = () => {
    if (!siringData) return 0;
    return Math.round((currentStock / siringData.max_capacity) * 100);
  };

  React.useEffect(() => {
    if (siringData) {
      setCurrentStock(siringData.current_stock);
      form.setFieldsValue({
        current_stock: siringData.current_stock,
      });
    }
  }, [siringData, form]);

  if (!siringData) return null;

  return (
    <Drawer
      title="Manajemen Stock Siring"
      width={480}
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
            Simpan
          </Button>
        </Space>
      }
    >
      {/* Siring Information */}
      <Card title="Informasi Siring" size="small" style={{ marginBottom: 16 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Lokasi">
            {siringData.location}
          </Descriptions.Item>
          <Descriptions.Item label="Kapasitas Maksimal">
            {siringData.max_capacity} unit
          </Descriptions.Item>
          <Descriptions.Item label="Batas Minimum">
            {siringData.min_threshold} unit
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <span
              className={styles.statusBadge}
              style={{
                backgroundColor: getStatusColor(siringData.status),
                color: '#fff',
              }}
            >
              {getStatusText(siringData.status)}
            </span>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Current Stock Display */}
      <Card
        title="Stock Saat Ini"
        size="small"
        style={{ marginBottom: 16, textAlign: 'center' }}
      >
        <Statistic
          title=""
          value={currentStock}
          suffix={`/ ${siringData.max_capacity} unit`}
          valueStyle={{
            fontSize: '24px',
            color: getStatusColor(getStockStatus(currentStock)),
          }}
        />
        <div
          style={{
            marginTop: 8,
            fontSize: '14px',
            color: '#666',
          }}
        >
          {getStockPercentage()}% dari kapasitas
        </div>
      </Card>

      {/* Quick Actions */}
      <div className={styles.actionSection}>
        <h4 style={{ marginBottom: 12 }}>Aksi Cepat</h4>
        <div className={styles.quickActions}>
          <Button
            icon={<MinusOutlined />}
            onClick={() => handleQuickSubtract(1)}
            disabled={currentStock <= 0}
          >
            -1
          </Button>
          <Button
            icon={<MinusOutlined />}
            onClick={() => handleQuickSubtract(5)}
            disabled={currentStock <= 0}
          >
            -5
          </Button>
          <Button
            icon={<MinusOutlined />}
            onClick={() => handleQuickSubtract(10)}
            disabled={currentStock <= 0}
          >
            -10
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => handleQuickAdd(1)}
            disabled={currentStock >= siringData.max_capacity}
          >
            +1
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => handleQuickAdd(5)}
            disabled={currentStock >= siringData.max_capacity}
          >
            +5
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => handleQuickAdd(10)}
            disabled={currentStock >= siringData.max_capacity}
          >
            +10
          </Button>
        </div>
      </div>

      {/* Manual Input Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          current_stock: siringData.current_stock,
        }}
      >
        <Form.Item
          name="current_stock"
          label="Input Manual Stock"
          rules={[
            { required: true, message: 'Stock wajib diisi' },
            {
              type: 'number',
              min: 0,
              max: siringData.max_capacity,
              message: `Stock harus antara 0 - ${siringData.max_capacity}`,
            },
          ]}
        >
          <InputNumber
            min={0}
            max={siringData.max_capacity}
            className={styles.stockInput}
            onChange={(value) => setCurrentStock(value || 0)}
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* Warning Messages */}
        {currentStock <= siringData.min_threshold && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#fff2e8',
              border: '1px solid #ffd591',
              borderRadius: '4px',
              color: '#d46b08',
              fontSize: '12px',
              marginTop: 8,
            }}
          >
            ⚠️ Stock berada di bawah batas minimum!
          </div>
        )}

        {currentStock >= siringData.max_capacity * 0.9 && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: '4px',
              color: '#0958d9',
              fontSize: '12px',
              marginTop: 8,
            }}
          >
            ℹ️ Stock mendekati kapasitas maksimal
          </div>
        )}
      </Form>

      {/* Stock History Preview */}
      <Card title="Riwayat Terakhir" size="small" style={{ marginTop: 16 }}>
        <div style={{ fontSize: '12px', color: '#666' }}>
          <div>Terakhir diperbarui:</div>
          <div style={{ fontWeight: 500, color: '#333' }}>
            {new Date(siringData.last_updated).toLocaleString('id-ID')}
          </div>
        </div>
      </Card>
    </Drawer>
  );
};

export default SiringManagement;
