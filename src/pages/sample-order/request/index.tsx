import { PageContainer } from '@ant-design/pro-components';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  Button, 
  Row, 
  Col, 
  Upload, 
  message, 
  Divider,
  Space,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  UploadOutlined, 
  ExperimentOutlined,
  CarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useState } from 'react';
import type { UploadFile } from 'antd/es/upload/interface';

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;

const SampleOrderRequest: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [photoList, setPhotoList] = useState<UploadFile[]>([]);

  const laboratoryOptions = [
    { value: 'lpuj', label: 'LPUJ - Priok', estimatedTime: '1 jam' },
    { value: 'lemigas', label: 'Lemigas - Jakarta', estimatedTime: '1 jam' },
    { value: 'balongan', label: 'Balongan - Balongan', estimatedTime: '6 jam' },
  ];

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      console.log('Form values:', values);
      console.log('Files:', fileList);
      console.log('Photos:', photoList);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success('Pemesanan sampel berhasil dibuat!');
      form.resetFields();
      setFileList([]);
      setPhotoList([]);
    } catch {
      message.error('Gagal membuat pemesanan sampel');
    } finally {
      setLoading(false);
    }
  };

  const handleLabChange = (value: string) => {
    const lab = laboratoryOptions.find(lab => lab.value === value);
    if (lab) {
      form.setFieldsValue({ estimatedTime: lab.estimatedTime });
    }
  };

  const uploadProps = {
    beforeUpload: () => false, // Prevent auto upload
    fileList,
    onChange: ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
      setFileList(newFileList);
    },
  };

  const photoUploadProps = {
    beforeUpload: () => false,
    fileList: photoList,
    onChange: ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
      setPhotoList(newFileList);
    },
    listType: 'picture-card' as const,
  };

  return (
    <PageContainer
      title="Pemesanan Request Sample"
      content="Input langsung data sample untuk pengujian laboratorium"
    >
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            sampleQuantity: 4,
            unit: 'Botol',
            sampleType: 'JET A-1',
            senderCompany: 'SHAFTHI',
          }}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24}>
              <Title level={4}>
                <ExperimentOutlined style={{ color: '#fd0017', marginRight: 8 }} />
                Informasi Sampel
              </Title>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="requestNumber"
                label="Nomor Permintaan"
                rules={[{ required: true, message: 'Nomor permintaan wajib diisi' }]}
              >
                <Input placeholder="Contoh: 227/NPC/SKH/2025" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="requestDate"
                label="Tanggal Permintaan"
                rules={[{ required: true, message: 'Tanggal permintaan wajib diisi' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="shipName"
                label="Nama Kapal"
                rules={[{ required: true, message: 'Nama kapal wajib diisi' }]}
              >
                <Input placeholder="Contoh: MT. Commodore One" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="tankNumber"
                label="Nomor Tangki"
                rules={[{ required: true, message: 'Nomor tangki wajib diisi' }]}
              >
                <Input placeholder="Contoh: T.107" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="sampleQuantity"
                label="Jumlah Sample"
                rules={[{ required: true, message: 'Jumlah sample wajib diisi' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="unit"
                label="Satuan"
                rules={[{ required: true, message: 'Satuan wajib dipilih' }]}
              >
                <Select>
                  <Option value="Botol">Botol</Option>
                  <Option value="Liter">Liter</Option>
                  <Option value="Gallon">Gallon</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="sampleType"
                label="Jenis Sampel"
                rules={[{ required: true, message: 'Jenis sampel wajib dipilih' }]}
              >
                <Select>
                  <Option value="JET A-1">JET A-1</Option>
                  <Option value="Avgas">Avgas</Option>
                  <Option value="Diesel">Diesel</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Divider />
              <Title level={4}>
                <CarOutlined style={{ color: '#9fe400', marginRight: 8 }} />
                Informasi Pengirim
              </Title>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="senderCompany"
                label="Perusahaan Pengirim Sampel"
                rules={[{ required: true, message: 'Perusahaan pengirim wajib diisi' }]}
              >
                <Input placeholder="Contoh: SHAFTHI" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="senderName"
                label="Nama Pengirim Sampel"
                rules={[{ required: true, message: 'Nama pengirim wajib diisi' }]}
              >
                <Input placeholder="Contoh: Moch. Aby Gazal" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Divider />
              <Title level={4}>
                <ClockCircleOutlined style={{ color: '#0073fe', marginRight: 8 }} />
                Informasi Laboratorium
              </Title>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="laboratory"
                label="Laboratorium Tujuan"
                rules={[{ required: true, message: 'Laboratorium wajib dipilih' }]}
              >
                <Select placeholder="Pilih laboratorium" onChange={handleLabChange}>
                  {laboratoryOptions.map(lab => (
                    <Option key={lab.value} value={lab.value}>
                      {lab.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="estimatedTime"
                label="Estimasi Waktu Pengantaran"
              >
                <Input disabled placeholder="Otomatis terisi berdasarkan laboratorium" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="estimatedArrival"
                label="Estimasi Kedatangan Sampel"
                rules={[{ required: true, message: 'Estimasi kedatangan wajib diisi' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }} 
                  placeholder="Pilih tanggal dan waktu"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="priority"
                label="Prioritas"
                rules={[{ required: true, message: 'Prioritas wajib dipilih' }]}
              >
                <Select placeholder="Pilih prioritas">
                  <Option value="normal">Normal</Option>
                  <Option value="urgent">Urgent</Option>
                  <Option value="critical">Critical</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="memo"
                label="Memo/Catatan"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Tambahkan catatan atau instruksi khusus..."
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="memoFile"
                label="Lampiran Memo"
              >
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Upload File</Button>
                </Upload>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Format: PDF, DOC, DOCX (Max: 10MB)
                </Text>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="photos"
                label="Foto Sampel"
              >
                <Upload {...photoUploadProps}>
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Format: JPG, PNG (Max: 5MB per file)
                </Text>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Divider />
              <Space style={{ width: '100%', justifyContent: 'center' }}>
                <Button onClick={() => form.resetFields()}>
                  Reset
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  size="large"
                  style={{ minWidth: 120 }}
                >
                  Submit Pemesanan
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </PageContainer>
  );
};

export default SampleOrderRequest;
