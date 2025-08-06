import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  message,
  Descriptions,
  Card,
  Steps,
  Progress
} from 'antd';
import { 
  ExperimentOutlined, 
  EditOutlined, 
  EyeOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useRef, useState } from 'react';

interface TestSample {
  id: string;
  sampleCode: string;
  productType: string;
  shipName: string;
  laboratory: string;
  receivedDate: string;
  testStatus: 'received' | 'testing' | 'completed' | 'failed';
  testProgress: number;
  testResults?: {
    density?: number;
    viscosity?: number;
    waterContent?: number;
    flashPoint?: number;
  };
  currentEquipment?: string;
  estimatedCompletion?: string;
}

const LaboratoryTesting: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSample, setSelectedSample] = useState<TestSample | null>(null);

  const columns: ProColumns<TestSample>[] = [
    {
      title: 'Kode Sampel',
      dataIndex: 'sampleCode',
      key: 'sampleCode',
      copyable: true,
    },
    {
      title: 'Jenis Produk',
      dataIndex: 'productType',
      key: 'productType',
      valueEnum: {
        'JET A-1': { text: 'JET A-1', status: 'Processing' },
        'Avgas': { text: 'Avgas', status: 'Success' },
        'Diesel': { text: 'Diesel', status: 'Warning' },
      },
    },
    {
      title: 'Kapal',
      dataIndex: 'shipName',
      key: 'shipName',
    },
    {
      title: 'Laboratorium',
      dataIndex: 'laboratory',
      key: 'laboratory',
    },
    {
      title: 'Tanggal Diterima',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      valueType: 'date',
    },
    {
      title: 'Status Pengujian',
      dataIndex: 'testStatus',
      key: 'testStatus',
      render: (_, record) => {
        const statusConfig = {
          received: { color: 'blue', text: 'Diterima', icon: <SyncOutlined /> },
          testing: { color: 'orange', text: 'Sedang Diuji', icon: <ExperimentOutlined /> },
          completed: { color: 'green', text: 'Selesai', icon: <CheckCircleOutlined /> },
          failed: { color: 'red', text: 'Gagal', icon: <ExperimentOutlined /> },
        };
        const config = statusConfig[record.testStatus];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Progress',
      dataIndex: 'testProgress',
      key: 'testProgress',
      render: (_, record) => (
        <Progress 
          percent={record.testProgress} 
          size="small" 
          strokeColor="#9fe400"
          style={{ width: 100 }}
        />
      ),
    },
    {
      title: 'Alat Saat Ini',
      dataIndex: 'currentEquipment',
      key: 'currentEquipment',
      render: (_, record) => record.currentEquipment || '-',
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          />
          {record.testStatus !== 'completed' && (
            <Button
              type="text"
              icon={record.testStatus === 'received' ? <PlayCircleOutlined /> : <EditOutlined />}
              onClick={() => handleStartTest(record)}
            />
          )}
        </Space>
      ),
    },
  ];

  const handleViewDetail = (sample: TestSample) => {
    setSelectedSample(sample);
    setDetailModalVisible(true);
  };

  const handleStartTest = (sample: TestSample) => {
    setSelectedSample(sample);
    if (sample.testStatus === 'received') {
      form.setFieldsValue({
        sampleCode: sample.sampleCode,
        currentEquipment: '',
        testStatus: 'testing',
      });
    } else {
      form.setFieldsValue({
        sampleCode: sample.sampleCode,
        currentEquipment: sample.currentEquipment,
        testStatus: sample.testStatus,
        ...sample.testResults,
      });
    }
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      await form.validateFields();
      message.success('Status pengujian berhasil diperbarui');
      setModalVisible(false);
      form.resetFields();
      actionRef.current?.reload();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedSample(null);
    form.resetFields();
  };

  const handleDetailModalCancel = () => {
    setDetailModalVisible(false);
    setSelectedSample(null);
  };

  // Mock data request
  const fetchSamples = async () => {
    const mockSamples: TestSample[] = [
      {
        id: '1',
        sampleCode: 'LPUJ-20250806-001',
        productType: 'JET A-1',
        shipName: 'MT. Commodore One',
        laboratory: 'LPUJ',
        receivedDate: '2025-08-06',
        testStatus: 'testing',
        testProgress: 65,
        currentEquipment: 'Density Meter DMM-5000',
        estimatedCompletion: '2025-08-06 16:00',
        testResults: {
          density: 0.795,
          waterContent: 0.003,
        },
      },
      {
        id: '2',
        sampleCode: 'LMG-20250805-002',
        productType: 'Avgas',
        shipName: 'MT. Pioneer',
        laboratory: 'Lemigas',
        receivedDate: '2025-08-05',
        testStatus: 'completed',
        testProgress: 100,
        testResults: {
          density: 0.720,
          viscosity: 1.2,
          waterContent: 0.002,
          flashPoint: 38,
        },
      },
      {
        id: '3',
        sampleCode: 'LPUJ-20250806-003',
        productType: 'JET A-1',
        shipName: 'MT. Explorer',
        laboratory: 'LPUJ',
        receivedDate: '2025-08-06',
        testStatus: 'received',
        testProgress: 0,
      },
    ];

    return {
      data: mockSamples,
      success: true,
      total: mockSamples.length,
    };
  };

  const getTestSteps = (status: string, progress: number) => {
    const steps = [
      { title: 'Diterima', description: 'Sampel diterima lab' },
      { title: 'Persiapan', description: 'Persiapan alat dan material' },
      { title: 'Pengujian', description: 'Proses pengujian berlangsung' },
      { title: 'Analisis', description: 'Analisis hasil pengujian' },
      { title: 'Selesai', description: 'Pengujian selesai' },
    ];

    let current = 0;
    if (status === 'testing') {
      current = Math.floor((progress / 100) * (steps.length - 1)) + 1;
    } else if (status === 'completed') {
      current = steps.length - 1;
    }

    return { steps, current };
  };

  return (
    <PageContainer
      title="Pengujian Laboratorium"
      content="Kelola proses pengujian sampel di laboratorium"
    >
      <ProTable<TestSample>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={fetchSamples}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle="Daftar Sampel dalam Pengujian"
      />

      {/* Testing Modal */}
      <Modal
        title={`${selectedSample?.testStatus === 'received' ? 'Mulai' : 'Update'} Pengujian - ${selectedSample?.sampleCode}`}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="sampleCode"
            label="Kode Sampel"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="testStatus"
            label="Status Pengujian"
            rules={[{ required: true, message: 'Status wajib dipilih' }]}
          >
            <Select placeholder="Pilih status">
              <Select.Option value="testing">Sedang Diuji</Select.Option>
              <Select.Option value="completed">Selesai</Select.Option>
              <Select.Option value="failed">Gagal</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="currentEquipment"
            label="Alat yang Digunakan"
          >
            <Select placeholder="Pilih alat pengujian">
              <Select.Option value="Density Meter DMM-5000">Density Meter DMM-5000</Select.Option>
              <Select.Option value="Viscometer VIS-300">Viscometer VIS-300</Select.Option>
              <Select.Option value="Karl Fischer KF-200">Karl Fischer KF-200</Select.Option>
              <Select.Option value="Flash Point Tester FPT-100">Flash Point Tester FPT-100</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Hasil Pengujian">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item
                name="density"
                label="Density (g/cm³)"
                style={{ marginBottom: 8 }}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  step={0.001}
                  precision={3}
                  placeholder="0.000"
                />
              </Form.Item>

              <Form.Item
                name="viscosity"
                label="Kinematic Viscosity (mm²/s)"
                style={{ marginBottom: 8 }}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  step={0.1}
                  precision={1}
                  placeholder="0.0"
                />
              </Form.Item>

              <Form.Item
                name="waterContent"
                label="Water Content (%)"
                style={{ marginBottom: 8 }}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  step={0.001}
                  precision={3}
                  placeholder="0.000"
                />
              </Form.Item>

              <Form.Item
                name="flashPoint"
                label="Flash Point (°C)"
                style={{ marginBottom: 0 }}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  placeholder="0"
                />
              </Form.Item>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={`Detail Pengujian - ${selectedSample?.sampleCode}`}
        open={detailModalVisible}
        onCancel={handleDetailModalCancel}
        footer={[
          <Button key="close" onClick={handleDetailModalCancel}>
            Tutup
          </Button>,
        ]}
        width={800}
      >
        {selectedSample && (
          <div>
            <Card title="Informasi Sampel" style={{ marginBottom: 16 }}>
              <Descriptions column={2}>
                <Descriptions.Item label="Kode Sampel">{selectedSample.sampleCode}</Descriptions.Item>
                <Descriptions.Item label="Jenis Produk">{selectedSample.productType}</Descriptions.Item>
                <Descriptions.Item label="Kapal">{selectedSample.shipName}</Descriptions.Item>
                <Descriptions.Item label="Laboratorium">{selectedSample.laboratory}</Descriptions.Item>
                <Descriptions.Item label="Tanggal Diterima">{selectedSample.receivedDate}</Descriptions.Item>
                <Descriptions.Item label="Estimasi Selesai">{selectedSample.estimatedCompletion || '-'}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Progress Pengujian" style={{ marginBottom: 16 }}>
              {(() => {
                const { steps, current } = getTestSteps(selectedSample.testStatus, selectedSample.testProgress);
                return (
                  <Steps
                    current={current}
                    items={steps}
                    direction="vertical"
                    size="small"
                  />
                );
              })()}
            </Card>

            {selectedSample.testResults && (
              <Card title="Hasil Pengujian">
                <Descriptions column={2}>
                  <Descriptions.Item label="Density">
                    {selectedSample.testResults.density ? `${selectedSample.testResults.density} g/cm³` : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Kinematic Viscosity">
                    {selectedSample.testResults.viscosity ? `${selectedSample.testResults.viscosity} mm²/s` : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Water Content">
                    {selectedSample.testResults.waterContent ? `${selectedSample.testResults.waterContent}%` : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Flash Point">
                    {selectedSample.testResults.flashPoint ? `${selectedSample.testResults.flashPoint}°C` : '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default LaboratoryTesting;
