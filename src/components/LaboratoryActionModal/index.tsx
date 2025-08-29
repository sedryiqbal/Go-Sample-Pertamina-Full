import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Steps,
  Switch,
  Tag,
  Typography,
} from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import React, { useState } from 'react';

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
  const [isUrgent, setIsUrgent] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string>();

  // Equipment options with availability status
  const equipmentOptions = [
    { label: 'Viscometer Alat A', value: 'viscometer-a', available: true },
    { label: 'Viscometer Alat B', value: 'viscometer-b', available: false },
    { label: 'Flash Point Tester', value: 'flash-point', available: true },
    { label: 'Karl Fischer Titrator', value: 'karl-fischer', available: true },
    { label: 'Density Meter', value: 'density-meter', available: false },
    { label: 'Freeze Point Tester', value: 'freeze-point', available: true },
    { label: 'GC-MS System', value: 'gc-ms', available: true },
  ];

  // Test result parameters with expected values
  const testParameters = [
    {
      name: 'Kadar Air',
      key: 'water_content',
      unit: 'ppm',
      standard: '< 30',
      min: 0,
      max: 100,
    },
    {
      name: 'Viskositas',
      key: 'viscosity',
      unit: 'cSt',
      standard: '1.0-3.0',
      min: 0.5,
      max: 5.0,
    },
    {
      name: 'Densitas',
      key: 'density',
      unit: 'kg/m³',
      standard: '775-840',
      min: 700,
      max: 900,
    },
    {
      name: 'Flash Point',
      key: 'flash_point',
      unit: '°C',
      standard: '> 38',
      min: 30,
      max: 100,
    },
  ];

  const getActionConfig = (type: ActionType) => {
    switch (type) {
      case 'confirm_sample':
        return {
          title: 'Konfirmasi Sample',
          icon: <CheckCircleOutlined />,
          color: '#52c41a',
          description:
            'Konfirmasi penerimaan dan registrasi sampel untuk memulai proses pengujian',
          fields: ['description', 'priority_notes'],
          helpText:
            'Pastikan kondisi sampel sesuai dengan standar penerimaan laboratorium',
        };
      case 'waiting_test':
        return {
          title: 'Menunggu Pengujian',
          icon: <ClockCircleOutlined />,
          color: '#faad14',
          description:
            'Jadwalkan pengujian dengan estimasi waktu dan equipment yang diperlukan',
          fields: [
            'description',
            'estimated_completion',
            'equipment_needed',
            'urgency',
          ],
          helpText:
            'Perkirakan waktu berdasarkan kompleksitas pengujian dan ketersediaan alat',
        };
      case 'process_test':
        return {
          title: 'Proses Pengujian',
          icon: <SyncOutlined />,
          color: '#1890ff',
          description:
            'Mulai proses pengujian dan monitor progress secara real-time',
          fields: ['description', 'equipment_used', 'technician_notes'],
          helpText:
            'Dokumentasikan setiap tahap pengujian untuk keperluan audit',
        };
      case 'input_result':
        return {
          title: 'Input Hasil Pengujian',
          icon: <FileTextOutlined />,
          color: '#722ed1',
          description:
            'Input hasil pengujian dengan detail parameter yang telah dianalisis',
          fields: [
            'test_results_detailed',
            'quality_assessment',
            'recommendations',
          ],
          helpText:
            'Pastikan semua parameter telah diuji sesuai dengan standar yang berlaku',
        };
      case 'complete_test':
        return {
          title: 'Selesai Pengujian',
          icon: <ExperimentOutlined />,
          color: '#fd0017',
          description:
            'Finalisasi dan validasi hasil pengujian untuk laporan akhir',
          fields: ['final_summary', 'certification_status', 'next_actions'],
          helpText:
            'Review semua data dan pastikan hasil dapat dipertanggungjawabkan',
        };
      default:
        return {
          title: 'Aksi',
          icon: <CheckCircleOutlined />,
          color: '#1890ff',
          description: '',
          fields: [],
          helpText: '',
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
      // Format data based on action type
      const formattedData = {
        ...values,
        sample_id: record?.sample_id,
        timestamp: dayjs().toISOString(),
        actionType,
      };

      // Special formatting for different action types
      if (actionType === 'input_result' && values.test_results_detailed) {
        formattedData.test_results = values.test_results_detailed;
      }

      if (actionType === 'waiting_test' && values.estimated_completion) {
        formattedData.estimated_completion =
          values.estimated_completion.toISOString();
      }

      await onSubmit(actionType, formattedData);

      message.success(`${config.title} berhasil dilakukan`);
      form.resetFields();
      setIsUrgent(false);
      setSelectedEquipment(undefined);
      onClose();
    } catch (_error) {
      message.error(`Gagal melakukan ${config.title.toLowerCase()}`);
    }
  };

  // Helper function for placeholder text
  const getPlaceholderText = (type: ActionType) => {
    switch (type) {
      case 'confirm_sample':
        return 'Sampel telah diterima dalam kondisi baik, siap untuk pengujian selanjutnya';
      case 'waiting_test':
        return 'Jadwalkan pengujian sesuai dengan prioritas dan ketersediaan equipment';
      case 'process_test':
        return 'Memulai proses pengujian sesuai dengan prosedur standar laboratorium';
      case 'input_result':
        return 'Dokumentasikan semua hasil pengujian dengan detail dan akurat';
      case 'complete_test':
        return 'Finalisasi pengujian dengan review menyeluruh terhadap semua data';
      default:
        return 'Masukkan deskripsi kegiatan yang dilakukan';
    }
  };

  // Helper function for action alerts
  const getActionAlert = (
    type: ActionType,
    urgent: boolean,
    equipment?: string,
  ) => {
    const alertConfigs = {
      confirm_sample: {
        type: 'success' as const,
        message: 'Konfirmasi Penerimaan Sampel',
        description:
          'Setelah konfirmasi, sampel akan masuk ke tahap registrasi dan siap untuk dijadwalkan pengujian.',
      },
      waiting_test: {
        type: urgent ? ('warning' as const) : ('info' as const),
        message: urgent
          ? 'Pengujian Prioritas Tinggi'
          : 'Penjadwalan Pengujian',
        description: urgent
          ? 'Pengujian akan diprioritaskan. Pastikan equipment tersedia dan teknisi siap.'
          : 'Status akan berubah menjadi "Menunggu Pengujian" dengan estimasi waktu yang telah ditentukan.',
      },
      process_test: {
        type: 'info' as const,
        message: 'Proses Pengujian Dimulai',
        description: equipment
          ? `Pengujian dimulai menggunakan ${equipment}. Progress akan diupdate secara berkala.`
          : 'Pengujian dimulai. Progress akan diupdate secara berkala.',
      },
      input_result: {
        type: 'warning' as const,
        message: 'Input Hasil Pengujian',
        description:
          'Pastikan semua parameter telah diuji sesuai dengan standar yang berlaku. Data akan divalidasi secara otomatis.',
      },
      complete_test: {
        type: 'success' as const,
        message: 'Finalisasi Pengujian',
        description:
          'Pengujian akan diselesaikan dan hasil akan tersedia untuk laporan. Pastikan semua data telah direview.',
      },
    };

    const config = alertConfigs[type];
    if (!config) return null;

    return (
      <Alert
        type={config.type}
        message={config.message}
        description={config.description}
        showIcon
        style={{ marginTop: 16 }}
      />
    );
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
      <Card size="small" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <InfoCircleOutlined style={{ color: config.color, marginRight: 8 }} />
          <Title level={5} style={{ margin: 0 }}>
            Deskripsi Aksi
          </Title>
        </div>
        <Text type="secondary">{config.description}</Text>
        {config.helpText && (
          <Alert
            message={config.helpText}
            type="info"
            showIcon
            style={{ marginTop: 12 }}
            banner
          />
        )}
      </Card>

      {/* Action Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className={styles.actionForm}
        initialValues={{
          urgency: false,
          certification_status: 'passed',
        }}
      >
        {/* Common Description Field */}
        {config.fields.includes('description') && (
          <Form.Item
            name="description"
            label="Deskripsi Kegiatan"
            rules={[
              {
                required: true,
                message: 'Deskripsi wajib diisi',
              },
              {
                min: 10,
                message: 'Deskripsi minimal 10 karakter',
              },
            ]}
            tooltip="Jelaskan secara detail kegiatan yang dilakukan"
          >
            <TextArea
              rows={3}
              placeholder={`Contoh: ${getPlaceholderText(actionType)}`}
              showCount
              maxLength={500}
            />
          </Form.Item>
        )}

        {/* Priority Notes for Confirm Sample */}
        {config.fields.includes('priority_notes') && (
          <Form.Item
            name="priority_notes"
            label="Catatan Prioritas & Kondisi Sampel"
            tooltip="Dokumentasikan kondisi fisik sampel dan tingkat prioritas"
          >
            <TextArea
              rows={2}
              placeholder="Contoh: Sampel dalam kondisi baik, prioritas normal, tidak ada kontaminasi visual"
              showCount
              maxLength={200}
            />
          </Form.Item>
        )}

        {/* Estimated Completion for Waiting Test */}
        {config.fields.includes('estimated_completion') && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="estimated_completion"
                label="Estimasi Selesai"
                rules={[
                  {
                    required: true,
                    message: 'Estimasi waktu selesai wajib diisi',
                  },
                ]}
                tooltip="Perkirakan waktu berdasarkan kompleksitas pengujian"
              >
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                  placeholder="Pilih estimasi waktu selesai"
                  disabledDate={(current) =>
                    current && current < dayjs().startOf('day')
                  }
                  showNow={false}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="urgency"
                label="Pengujian Mendesak"
                valuePropName="checked"
                tooltip="Centang jika pengujian memerlukan prioritas tinggi"
              >
                <Switch
                  checkedChildren="Urgent"
                  unCheckedChildren="Normal"
                  onChange={setIsUrgent}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        {/* Equipment Selection */}
        {config.fields.includes('equipment_needed') && (
          <Form.Item
            name="equipment_needed"
            label="Equipment yang Diperlukan"
            rules={[
              {
                required: true,
                message: 'Equipment wajib dipilih',
              },
            ]}
            tooltip="Pilih equipment berdasarkan jenis pengujian yang akan dilakukan"
          >
            <Select
              placeholder="Pilih equipment untuk pengujian"
              onChange={setSelectedEquipment}
              optionRender={(option) => (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{option.label}</span>
                  <Tag
                    color={
                      equipmentOptions.find((eq) => eq.value === option.value)
                        ?.available
                        ? 'green'
                        : 'red'
                    }
                  >
                    {equipmentOptions.find((eq) => eq.value === option.value)
                      ?.available
                      ? 'Tersedia'
                      : 'Tidak Tersedia'}
                  </Tag>
                </div>
              )}
            >
              {equipmentOptions.map((equipment) => (
                <Select.Option
                  key={equipment.value}
                  value={equipment.value}
                  disabled={!equipment.available}
                >
                  {equipment.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {config.fields.includes('equipment_used') && (
          <Form.Item
            name="equipment_used"
            label="Equipment yang Digunakan"
            rules={[
              {
                required: true,
                message: 'Equipment yang digunakan wajib diisi',
              },
            ]}
          >
            <Select
              placeholder="Pilih equipment yang sedang digunakan"
              onChange={setSelectedEquipment}
            >
              {equipmentOptions
                .filter((eq) => eq.available)
                .map((equipment) => (
                  <Select.Option key={equipment.value} value={equipment.value}>
                    {equipment.label}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        )}

        {/* Technician Notes */}
        {config.fields.includes('technician_notes') && (
          <Form.Item
            name="technician_notes"
            label="Catatan Teknisi"
            tooltip="Dokumentasikan observasi dan catatan khusus selama pengujian"
          >
            <TextArea
              rows={3}
              placeholder="Contoh: Pengujian berjalan normal, suhu ruangan 25°C, kelembaban 60%, tidak ada masalah pada equipment"
              showCount
              maxLength={300}
            />
          </Form.Item>
        )}

        {/* Detailed Test Results */}
        {config.fields.includes('test_results_detailed') && (
          <Card
            title="Input Hasil Pengujian Detail"
            size="small"
            style={{ marginBottom: 16 }}
          >
            {testParameters.map((param, index) => (
              <Row gutter={16} key={param.key} style={{ marginBottom: 12 }}>
                <Col span={8}>
                  <Form.Item
                    name={['test_results_detailed', param.key, 'value']}
                    label={`${param.name} (${param.unit})`}
                    rules={[
                      {
                        required: true,
                        message: `${param.name} wajib diisi`,
                      },
                    ]}
                  >
                    <InputNumber
                      min={param.min}
                      max={param.max}
                      step={param.key === 'density' ? 1 : 0.1}
                      style={{ width: '100%' }}
                      placeholder={`${param.min}-${param.max}`}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name={['test_results_detailed', param.key, 'status']}
                    label="Status"
                    rules={[
                      {
                        required: true,
                        message: 'Status wajib dipilih',
                      },
                    ]}
                  >
                    <Select placeholder="Pilih status">
                      <Select.Option value="pass">PASS</Select.Option>
                      <Select.Option value="fail">FAIL</Select.Option>
                      <Select.Option value="borderline">
                        BORDERLINE
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <div
                    style={{ fontSize: '12px', color: '#666', marginTop: 32 }}
                  >
                    Standard: {param.standard}
                  </div>
                </Col>
              </Row>
            ))}
          </Card>
        )}

        {/* Quality Assessment */}
        {config.fields.includes('quality_assessment') && (
          <Form.Item
            name="quality_assessment"
            label="Penilaian Kualitas"
            rules={[
              {
                required: true,
                message: 'Penilaian kualitas wajib diisi',
              },
            ]}
            tooltip="Berikan penilaian menyeluruh terhadap kualitas sampel"
          >
            <Select placeholder="Pilih penilaian kualitas">
              <Select.Option value="excellent">
                Excellent - Semua parameter di atas standar
              </Select.Option>
              <Select.Option value="good">
                Good - Semua parameter memenuhi standar
              </Select.Option>
              <Select.Option value="acceptable">
                Acceptable - Parameter dalam batas toleransi
              </Select.Option>
              <Select.Option value="poor">
                Poor - Beberapa parameter tidak memenuhi standar
              </Select.Option>
              <Select.Option value="failed">
                Failed - Tidak memenuhi standar minimum
              </Select.Option>
            </Select>
          </Form.Item>
        )}

        {/* Recommendations */}
        {config.fields.includes('recommendations') && (
          <Form.Item
            name="recommendations"
            label="Rekomendasi"
            tooltip="Berikan rekomendasi untuk tindak lanjut berdasarkan hasil pengujian"
          >
            <TextArea
              rows={3}
              placeholder="Contoh: Sampel memenuhi standar untuk digunakan, disarankan untuk monitoring berkala"
              showCount
              maxLength={400}
            />
          </Form.Item>
        )}

        {/* Final Summary */}
        {config.fields.includes('final_summary') && (
          <Form.Item
            name="final_summary"
            label="Ringkasan Akhir"
            rules={[
              {
                required: true,
                message: 'Ringkasan akhir wajib diisi',
              },
              {
                min: 20,
                message: 'Ringkasan minimal 20 karakter',
              },
            ]}
            tooltip="Ringkas semua hasil pengujian dan kesimpulan"
          >
            <TextArea
              rows={4}
              placeholder="Contoh: Pengujian sampel JET A-1 telah selesai dilakukan dengan hasil semua parameter memenuhi standar ASTM. Sampel dinyatakan layak untuk digunakan."
              showCount
              maxLength={600}
            />
          </Form.Item>
        )}

        {/* Certification Status */}
        {config.fields.includes('certification_status') && (
          <Form.Item
            name="certification_status"
            label="Status Sertifikasi"
            rules={[
              {
                required: true,
                message: 'Status sertifikasi wajib dipilih',
              },
            ]}
          >
            <Select placeholder="Pilih status sertifikasi">
              <Select.Option value="passed">
                PASSED - Lulus semua pengujian
              </Select.Option>
              <Select.Option value="passed_conditional">
                PASSED (CONDITIONAL) - Lulus dengan syarat
              </Select.Option>
              <Select.Option value="failed">
                FAILED - Tidak lulus pengujian
              </Select.Option>
              <Select.Option value="retest_required">
                RETEST REQUIRED - Perlu pengujian ulang
              </Select.Option>
            </Select>
          </Form.Item>
        )}

        {/* Next Actions */}
        {config.fields.includes('next_actions') && (
          <Form.Item
            name="next_actions"
            label="Tindak Lanjut"
            tooltip="Tentukan langkah selanjutnya yang perlu dilakukan"
          >
            <Select
              mode="multiple"
              placeholder="Pilih tindak lanjut yang diperlukan"
              options={[
                { label: 'Generate Laporan', value: 'generate_report' },
                { label: 'Kirim ke Customer', value: 'send_to_customer' },
                { label: 'Arsip Sampel', value: 'archive_sample' },
                { label: 'Monitoring Berkala', value: 'regular_monitoring' },
                { label: 'Pengujian Tambahan', value: 'additional_testing' },
                { label: 'Review Manajemen', value: 'management_review' },
              ]}
            />
          </Form.Item>
        )}

        <Divider />

        {/* Action-specific alerts */}
        {getActionAlert(actionType, isUrgent, selectedEquipment)}
      </Form>
    </Drawer>
  );
};

export default LaboratoryActionModal;
