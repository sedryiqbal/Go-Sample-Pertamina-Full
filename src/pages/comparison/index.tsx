import { PageContainer } from '@ant-design/pro-components';
import { 
  Card, 
  Tabs, 
  Button, 
  Upload, 
  message, 
  Typography, 
  Space, 
  Progress, 
  Tag,
  Alert,
  List,
  Row,
  Col
} from 'antd';
import { 
  FileAddOutlined, 
  FilePdfOutlined, 
  DiffOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useState } from 'react';
import type { UploadProps } from 'antd';

const { Title, Text } = Typography;

interface ComparisonResult {
  id: string;
  parameter: string;
  standardValue: string;
  actualValue: string;
  unit: string;
  status: 'pass' | 'warning' | 'fail';
  difference: string;
}

interface DocumentComparison {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  comparisonStatus: 'pending' | 'completed' | 'error';
  similarityScore?: number;
}

const Comparison: React.FC = () => {
  const [activeTab, setActiveTab] = useState('quality');
  const [qualityResults] = useState<ComparisonResult[]>([
    {
      id: '1',
      parameter: 'Density at 15°C',
      standardValue: '775-840',
      actualValue: '785.2',
      unit: 'kg/m³',
      status: 'pass',
      difference: 'Within range',
    },
    {
      id: '2',
      parameter: 'Viscosity at -20°C',
      standardValue: 'Max 8.0',
      actualValue: '7.8',
      unit: 'mm²/s',
      status: 'pass',
      difference: '-0.2 from max',
    },
    {
      id: '3',
      parameter: 'Flash Point',
      standardValue: 'Min 38',
      actualValue: '42',
      unit: '°C',
      status: 'pass',
      difference: '+4 above min',
    },
    {
      id: '4',
      parameter: 'Water Content',
      standardValue: 'Max 0.003',
      actualValue: '0.0045',
      unit: '%v/v',
      status: 'fail',
      difference: '+0.0015 above max',
    },
  ]);

  const [documents] = useState<DocumentComparison[]>([
    {
      id: '1',
      fileName: 'COA_LPUJ_20250806_001.pdf',
      fileType: 'Certificate of Analysis',
      uploadDate: '2025-08-06 14:30',
      comparisonStatus: 'completed',
      similarityScore: 98.5,
    },
    {
      id: '2',
      fileName: 'Test_Report_LMG_20250805.pdf',
      fileType: 'Test Report',
      uploadDate: '2025-08-05 16:15',
      comparisonStatus: 'completed',
      similarityScore: 95.2,
    },
    {
      id: '3',
      fileName: 'Analysis_Results_BLG.pdf',
      fileType: 'Analysis Results',
      uploadDate: '2025-08-04 10:00',
      comparisonStatus: 'pending',
    },
  ]);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    accept: '.pdf,.doc,.docx,.xls,.xlsx',
    beforeUpload: (file) => {
      const isValidType = file.type === 'application/pdf' || 
                         file.type.includes('document') || 
                         file.type.includes('sheet');
      if (!isValidType) {
        message.error('Hanya file PDF, Word, dan Excel yang diperbolehkan!');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('Ukuran file tidak boleh lebih dari 10MB!');
        return false;
      }
      return false; // Prevent auto upload for demo
    },
    onChange: (info) => {
      message.success(`${info.file.name} berhasil diupload untuk perbandingan`);
    },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'success';
      case 'warning': return 'warning';
      case 'fail': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircleOutlined />;
      case 'warning': return <ExclamationCircleOutlined />;
      case 'fail': return <CloseCircleOutlined />;
      default: return null;
    }
  };

  const renderQualityCheck = () => (
    <div>
      <Alert
        message="Quality Check Summary"
        description="Hasil perbandingan parameter kualitas sampel dengan standar yang berlaku"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
              <Title level={3} style={{ margin: '8px 0', color: '#52c41a' }}>3</Title>
              <Text>Parameter Lulus</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ExclamationCircleOutlined style={{ fontSize: 32, color: '#faad14' }} />
              <Title level={3} style={{ margin: '8px 0', color: '#faad14' }}>0</Title>
              <Text>Peringatan</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CloseCircleOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
              <Title level={3} style={{ margin: '8px 0', color: '#ff4d4f' }}>1</Title>
              <Text>Parameter Gagal</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Detail Perbandingan Parameter">
        <List
          dataSource={qualityResults}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button 
                  key={`detail-${item.id}`}
                  type="link" 
                  size="small"
                  onClick={() => message.info(`Detail untuk ${item.parameter}`)}
                >
                  Detail
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={getStatusIcon(item.status)}
                title={
                  <Space>
                    {item.parameter}
                    <Tag color={getStatusColor(item.status)}>
                      {item.status === 'pass' ? 'Lulus' : 
                       item.status === 'warning' ? 'Peringatan' : 'Gagal'}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    <Text>Standar: {item.standardValue} {item.unit}</Text>
                    <br />
                    <Text>Aktual: <strong>{item.actualValue} {item.unit}</strong></Text>
                    <br />
                    <Text type="secondary">{item.difference}</Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Space>
          <Button 
            type="primary" 
            icon={<FilePdfOutlined />}
            onClick={() => message.success('Generating quality comparison report...')}
          >
            Generate Report PDF
          </Button>
          <Button 
            icon={<DownloadOutlined />}
            onClick={() => message.success('Downloading detailed analysis...')}
          >
            Download Analysis
          </Button>
        </Space>
      </div>
    </div>
  );

  const renderDocumentComparison = () => (
    <div>
      <Alert
        message="Document Comparison Tool"
        description="Upload dan bandingkan dokumen untuk mengidentifikasi perbedaan dan kesamaan"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Upload Dokumen" style={{ height: '100%' }}>
            <Upload.Dragger {...uploadProps} style={{ marginBottom: 16 }}>
              <p className="ant-upload-drag-icon">
                <FileAddOutlined />
              </p>
              <p className="ant-upload-text">Klik atau drag file ke area ini</p>
              <p className="ant-upload-hint">
                Mendukung PDF, Word, dan Excel. Maksimal 10MB per file.
              </p>
            </Upload.Dragger>
            
            <Space>
              <Button 
                type="primary" 
                icon={<DiffOutlined />}
                onClick={() => message.success('Starting document comparison...')}
              >
                Start Comparison
              </Button>
              <Button 
                icon={<UploadOutlined />}
                onClick={() => message.info('Select documents to compare')}
              >
                Compare Selected
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Riwayat Perbandingan" style={{ height: '100%' }}>
            <List
              dataSource={documents}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button 
                      key={`download-${item.id}`}
                      type="link" 
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => message.success(`Downloading ${item.fileName}`)}
                    >
                      Download
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<FilePdfOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                    title={item.fileName}
                    description={
                      <div>
                        <Text type="secondary">{item.fileType}</Text>
                        <br />
                        <Text type="secondary">Upload: {item.uploadDate}</Text>
                        <br />
                        {item.comparisonStatus === 'completed' && item.similarityScore && (
                          <div style={{ marginTop: 8 }}>
                            <Text>Similarity Score:</Text>
                            <Progress 
                              percent={item.similarityScore} 
                              size="small"
                              status={item.similarityScore > 90 ? 'success' : 'normal'}
                            />
                          </div>
                        )}
                        {item.comparisonStatus === 'pending' && (
                          <Tag color="processing">Processing...</Tag>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <PageContainer
      title="Comparison Module"
      content="Modul perbandingan untuk quality check dan analisis dokumen"
    >
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'quality',
              label: (
                <span>
                  <CheckCircleOutlined />
                  Product Quality Check
                </span>
              ),
              children: renderQualityCheck(),
            },
            {
              key: 'document',
              label: (
                <span>
                  <FilePdfOutlined />
                  Document Comparison
                </span>
              ),
              children: renderDocumentComparison(),
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
};

export default Comparison;
