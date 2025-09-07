import { CloseOutlined, SaveOutlined } from '@ant-design/icons';
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

export interface SyringeData {
  id: string;
  location: string;
  current_stock: number;
  min_threshold: number;
  max_capacity: number;
  last_updated: string;
  status: 'normal' | 'low' | 'urgent' | 'full';
}

interface SyringeManagementProps {
  visible: boolean;
  onClose: () => void;
  syringeData?: SyringeData;
  onUpdate: (data: SyringeData) => void;
}

const useStyles = createStyles(({ token }) => {
  return {
    syringeCard: {
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

const SyringeManagement: React.FC<SyringeManagementProps> = ({
  visible,
  onClose,
  syringeData,
  onUpdate,
}) => {
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const [currentStock, setCurrentStock] = useState(
    syringeData?.current_stock || 0,
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
      if (syringeData) {
        const updatedData: SyringeData = {
          ...syringeData,
          current_stock: values.current_stock,
          last_updated: new Date().toISOString(),
          status: getStockStatus(values.current_stock),
        };
        onUpdate(updatedData);
        message.success('Stock syringe berhasil diperbarui');
        onClose();
      }
    } catch (_error) {
      message.error('Gagal memperbarui stock syringe');
    }
  };

  const getStockStatus = (stock: number): SyringeData['status'] => {
    if (!syringeData) return 'normal';

    const capacity = syringeData.max_capacity;
    const threshold = syringeData.min_threshold;

    if (stock >= capacity * 0.9) return 'full';
    if (stock <= threshold) return 'urgent';
    if (stock <= threshold * 1.5) return 'low';
    return 'normal';
  };

  const getStockPercentage = () => {
    if (!syringeData) return 0;
    return Math.round((currentStock / syringeData.max_capacity) * 100);
  };

  React.useEffect(() => {
    if (syringeData) {
      setCurrentStock(syringeData.current_stock);
      form.setFieldsValue({
        current_stock: syringeData.current_stock,
      });
    }
  }, [syringeData, form]);

  if (!syringeData) return null;

  return (
    <Drawer
      title="Manajemen Stock Syringe"
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
      {/* Syringe Information */}
      <Card title="Informasi Syringe" size="small" style={{ marginBottom: 16 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Lokasi">
            {syringeData.location}
          </Descriptions.Item>
          <Descriptions.Item label="Kapasitas Maksimal">
            {syringeData.max_capacity} unit
          </Descriptions.Item>
          <Descriptions.Item label="Batas Minimum">
            {syringeData.min_threshold} unit
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <span
              className={styles.statusBadge}
              style={{
                backgroundColor: getStatusColor(syringeData.status),
                color: '#fff',
              }}
            >
              {getStatusText(syringeData.status)}
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
          suffix={`/ ${syringeData.max_capacity} unit`}
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

      {/* Manual Input Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          current_stock: syringeData.current_stock,
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
              max: syringeData.max_capacity,
              message: `Stock harus antara 0 - ${syringeData.max_capacity}`,
            },
          ]}
        >
          <InputNumber
            min={0}
            max={syringeData.max_capacity}
            className={styles.stockInput}
            onChange={(value) => setCurrentStock(value || 0)}
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* Warning Messages */}
        {currentStock <= syringeData.min_threshold && (
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

        {currentStock >= syringeData.max_capacity * 0.9 && (
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
            {new Date(syringeData.last_updated).toLocaleString('id-ID')}
          </div>
        </div>
      </Card>
    </Drawer>
  );
};

export default SyringeManagement;
