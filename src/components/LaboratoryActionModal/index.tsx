import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  message,
  Space,
  Steps,
  Tag,
  Typography,
} from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import React from 'react';

const { TextArea } = Input;
const { Title, Text } = Typography;

export type ActionType =
  | 'confirm_sample'
  | 'waiting_test'
  | 'process_test'
  | 'input_result'
  | 'complete_test';

export interface TestingRecord {
  id: string;
  sample_id: string;
  order_number: string;
  sample_type: string;
  vessel_name: string;
  tank_number: string;
  testing_status: string;
  lab_technician: string;
  progress_percentage: number;
  priority: string;
  estimated_completion: string;
}

interface LaboratoryActionModalProps {
  visible: boolean;
  onClose: () => void;
  actionType: ActionType;
  record?: TestingRecord;
  onSubmit: (actionType: ActionType, data: any) => void;
}

const useStyles = createStyles(({ token }) => {
  return {
    actionDrawer: {
      '.ant-drawer-header': {
        borderBottom: `1px solid ${token.colorBorder}`,
      },
    },
    recordInfo: {
      backgroundColor: token.colorBgContainer,
      padding: '16px',
      borderRadius: token.borderRadius,
      marginBottom: '16px',
      border: `1px solid ${token.colorBorder}`,
    },
    actionForm: {
      '.ant-form-item-label > label': {
        fontWeight: 500,
      },
    },
    statusStep: {
      marginBottom: '24px',
    },
  };
});

const LaboratoryActionModal: React.FC<LaboratoryActionModalProps> = ({
  visible,
  onClose,
  actionType,
  record,
  onSubmit,
}) => {
  const { styles } = useStyles();
  const [form] = Form.useForm();

  const getActionConfig = (type: ActionType) => {
    switch (type) {
      case 'confirm_sample':
        return {
          title: 'Konfirmasi Sample',
          icon: <CheckCircleOutlined />,
          color: '#52c41a',
          description: 'Konfirmasi penerimaan dan registrasi sampel',
          fields: ['description'],
        };
      case 'waiting_test':
        return {
          title: 'Menunggu Pengujian',
          icon: <ClockCircleOutlined />,
          color: '#faad14',
          description: 'Set status menunggu pengujian dengan estimasi waktu',
          fields: ['description', 'estimated_completion'],
        };
      case 'process_test':
        return {
          title: 'Proses Pengujian',
          icon: <SyncOutlined />,
          color: '#1890ff',
          description: 'Konfirmasi pengujian sedang berlangsung',
          fields: ['description'],
        };
      case 'input_result':
        return {
          title: 'Input Hasil Pengujian',
          icon: <FileTextOutlined />,
          color: '#722ed1',
          description: 'Input hasil pengujian sampel',
          fields: ['test_results', 'quality_notes'],
        };
      case 'complete_test':
        return {
          title: 'Selesai Pengujian',
          icon: <ExperimentOutlined />,
          color: '#fd0017',
          description: 'Menyelesaikan proses pengujian',
          fields: ['final_notes'],
        };
      default:
        return {
          title: 'Aksi',
          icon: <CheckCircleOutlined />,
          color: '#1890ff',
          description: '',
          fields: [],
        };
    }
  };

  const getCurrentStep = (status: string) => {
    switch (status) {
      case 'received':
        return 0;
      case 'registered':
        return 1;
      case 'testing':
        return 2;
      case 'waiting_equipment':
        return 2;
      case 'completed':
        return 3;
      default:
        return 0;
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      await onSubmit(actionType, {
        ...values,
        sample_id: record?.sample_id,
        timestamp: dayjs().toISOString(),
      });

      message.success('Aksi berhasil dilakukan');
      form.resetFields();
      onClose();
    } catch (_error) {
      message.error('Gagal melakukan aksi');
    }
  };

  const config = getActionConfig(actionType);

  return (
    <Drawer
      title={
        <Space>
          <span style={{ color: config.color }}>{config.icon}</span>
          {config.title}
        </Space>
      }
      width={600}
      open={visible}
      onClose={onClose}
      className={styles.actionDrawer}
      extra={
        <Space>
          <Button onClick={onClose}>Batal</Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            style={{ backgroundColor: config.color, borderColor: config.color }}
          >
            Konfirmasi
          </Button>
        </Space>
      }
    >
      {/* Record Information */}
      {record && (
        <div className={styles.recordInfo}>
          <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
            Informasi Sampel
          </Title>
          <Space direction="vertical" size={4}>
            <Text>
              <strong>Sample ID:</strong> {record.sample_id}
            </Text>
            <Text>
              <strong>Order Number:</strong> {record.order_number}
            </Text>
            <Text>
              <strong>Jenis Sampel:</strong> {record.sample_type}
            </Text>
            <Text>
              <strong>Kapal/Tangki:</strong> {record.vessel_name} •{' '}
              {record.tank_number}
            </Text>
            <Text>
              <strong>Lab Technician:</strong> {record.lab_technician}
            </Text>
            <div style={{ marginTop: 8 }}>
              <Tag color={record.priority === 'urgent' ? 'orange' : 'default'}>
                {record.priority.toUpperCase()}
              </Tag>
            </div>
          </Space>
        </div>
      )}

      {/* Progress Steps */}
      <div className={styles.statusStep}>
        <Title level={5}>Status Pengujian</Title>
        <Steps
          size="small"
          current={getCurrentStep(record?.testing_status || '')}
          items={[
            {
              title: 'Diterima',
              description: 'Sampel diterima lab',
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
      </div>

      {/* Action Description */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5}>Deskripsi Aksi</Title>
        <Text type="secondary">{config.description}</Text>
      </div>

      {/* Action Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className={styles.actionForm}
      >
        {config.fields.includes('description') && (
          <Form.Item
            name="description"
            label="Deskripsi"
            rules={[
              {
                required: true,
                message: 'Deskripsi wajib diisi',
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Masukkan deskripsi untuk aksi ini..."
            />
          </Form.Item>
        )}

        {config.fields.includes('estimated_completion') && (
          <Form.Item
            name="estimated_completion"
            label="Estimasi Selesai"
            rules={[
              {
                required: true,
                message: 'Estimasi waktu selesai wajib diisi',
              },
            ]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Pilih estimasi waktu selesai"
            />
          </Form.Item>
        )}

        {config.fields.includes('test_results') && (
          <Form.Item
            name="test_results"
            label="Hasil Pengujian"
            rules={[
              {
                required: true,
                message: 'Hasil pengujian wajib diisi',
              },
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Masukkan hasil pengujian detail...
Contoh:
- Kadar Air: 25 ppm (PASS)
- Viskositas: 1.5 cSt (PASS)
- Densitas: 800 kg/m³ (PASS)"
            />
          </Form.Item>
        )}

        {config.fields.includes('quality_notes') && (
          <Form.Item name="quality_notes" label="Catatan Kualitas">
            <TextArea
              rows={3}
              placeholder="Catatan tambahan mengenai kualitas sampel atau proses pengujian..."
            />
          </Form.Item>
        )}

        {config.fields.includes('final_notes') && (
          <Form.Item
            name="final_notes"
            label="Catatan Akhir"
            rules={[
              {
                required: true,
                message: 'Catatan akhir wajib diisi',
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Masukkan catatan akhir dan kesimpulan pengujian..."
            />
          </Form.Item>
        )}

        {/* Action-specific additional fields */}
        {actionType === 'confirm_sample' && (
          <div
            style={{
              backgroundColor: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: '6px',
              padding: '12px',
              marginTop: '16px',
            }}
          >
            <Text style={{ color: '#389e0d', fontSize: '12px' }}>
              💡 <strong>Info:</strong> Setelah konfirmasi, sampel akan masuk ke
              tahap registrasi dan siap untuk dijadwalkan pengujian.
            </Text>
          </div>
        )}

        {actionType === 'waiting_test' && (
          <div
            style={{
              backgroundColor: '#fffbe6',
              border: '1px solid #ffe58f',
              borderRadius: '6px',
              padding: '12px',
              marginTop: '16px',
            }}
          >
            <Text style={{ color: '#d48806', fontSize: '12px' }}>
              ⏱️ <strong>Info:</strong> Status akan berubah menjadi "Menunggu
              Pengujian" dengan estimasi waktu yang telah ditentukan.
            </Text>
          </div>
        )}

        {actionType === 'process_test' && (
          <div
            style={{
              backgroundColor: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: '6px',
              padding: '12px',
              marginTop: '16px',
            }}
          >
            <Text style={{ color: '#0958d9', fontSize: '12px' }}>
              🔬 <strong>Info:</strong> Pengujian dimulai. Progress akan
              diupdate secara berkala.
            </Text>
          </div>
        )}

        {actionType === 'input_result' && (
          <div
            style={{
              backgroundColor: '#f9f0ff',
              border: '1px solid #d3adf7',
              borderRadius: '6px',
              padding: '12px',
              marginTop: '16px',
            }}
          >
            <Text style={{ color: '#531dab', fontSize: '12px' }}>
              📋 <strong>Info:</strong> Input hasil pengujian dengan detail
              parameter yang telah diuji.
            </Text>
          </div>
        )}

        {actionType === 'complete_test' && (
          <div
            style={{
              backgroundColor: '#fff2e8',
              border: '1px solid #ffd591',
              borderRadius: '6px',
              padding: '12px',
              marginTop: '16px',
            }}
          >
            <Text style={{ color: '#d46b08', fontSize: '12px' }}>
              ✅ <strong>Info:</strong> Pengujian akan diselesaikan dan hasil
              akan tersedia untuk laporan.
            </Text>
          </div>
        )}
      </Form>
    </Drawer>
  );
};

export default LaboratoryActionModal;
