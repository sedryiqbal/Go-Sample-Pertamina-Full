import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FilePdfOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  message,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { useParams } from 'umi';

const { Title, Text } = Typography;

interface TestResult {
  no: number;
  property: string;
  units: string;
  method: string;
  results: string;
  specification?: string;
  status?: 'passed' | 'failed' | 'pending';
}

interface TestRecord {
  id: string;
  sampleCode: string;
  productType: string;
  requestDate: string;
  testDate: string;
  laboratory: string;
  technician: string;
  status: 'completed' | 'in-progress' | 'pending';
  testResults: TestResult[];
}

const LaboratoryTestingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [testRecord, setTestRecord] = useState<TestRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const fetchTestRecord = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockTestRecord: TestRecord = {
          id: id || '1',
          sampleCode: `AVT-${id || '001'}`,
          productType: 'Aviation Turbine Fuel (ATF)',
          requestDate: '2024-01-15',
          testDate: '2024-01-16',
          laboratory: 'Quality Control Laboratory',
          technician: 'Dr. Ahmad Surya',
          status: 'completed',
          testResults: [
            {
              no: 1,
              property: 'Odor',
              units: '-',
              method: 'ASTM D1094',
              results: 'Acceptable',
              specification: 'No objectionable odor',
              status: 'passed',
            },
            {
              no: 2,
              property: 'Sulphur Content',
              units: 'mg/kg',
              method: 'ASTM D5453',
              results: '2.8',
              specification: 'Max 3.0',
              status: 'passed',
            },
            {
              no: 3,
              property: 'Distillation IBP',
              units: '°C',
              method: 'ASTM D86',
              results: '145',
              specification: 'Min 130',
              status: 'passed',
            },
            {
              no: 4,
              property: 'Distillation 10%',
              units: '°C',
              method: 'ASTM D86',
              results: '165',
              specification: 'Max 205',
              status: 'passed',
            },
            {
              no: 5,
              property: 'Distillation 50%',
              units: '°C',
              method: 'ASTM D86',
              results: '190',
              specification: 'Max 300',
              status: 'passed',
            },
            {
              no: 6,
              property: 'Distillation 90%',
              units: '°C',
              method: 'ASTM D86',
              results: '245',
              specification: 'Max 300',
              status: 'passed',
            },
            {
              no: 7,
              property: 'Distillation FBP',
              units: '°C',
              method: 'ASTM D86',
              results: '280',
              specification: 'Max 300',
              status: 'passed',
            },
            {
              no: 8,
              property: 'Flash Point Abel',
              units: '°C',
              method: 'ASTM D56',
              results: '42',
              specification: 'Min 38',
              status: 'passed',
            },
            {
              no: 9,
              property: 'Density at 15°C',
              units: 'kg/m³',
              method: 'ASTM D4052',
              results: '795',
              specification: '775-840',
              status: 'passed',
            },
            {
              no: 10,
              property: 'Freezing Point',
              units: '°C',
              method: 'ASTM D2386',
              results: '-52',
              specification: 'Max -47',
              status: 'passed',
            },
            {
              no: 11,
              property: 'Viscosity at -20°C',
              units: 'mm²/s',
              method: 'ASTM D445',
              results: '7.8',
              specification: 'Max 8.0',
              status: 'passed',
            },
            {
              no: 12,
              property: 'Net Heat of Combustion',
              units: 'MJ/kg',
              method: 'ASTM D240',
              results: '43.2',
              specification: 'Min 42.8',
              status: 'passed',
            },
            {
              no: 13,
              property: 'Copper Strip Corrosion',
              units: '-',
              method: 'ASTM D130',
              results: '1a',
              specification: 'Max 1',
              status: 'passed',
            },
            {
              no: 14,
              property: 'Existent Gum',
              units: 'mg/100mL',
              method: 'ASTM D381',
              results: '4.2',
              specification: 'Max 7.0',
              status: 'passed',
            },
          ],
        };

        setTestRecord(mockTestRecord);
      } catch (error) {
        message.error('Failed to load test record');
      } finally {
        setLoading(false);
      }
    };

    fetchTestRecord();
  }, [id]);

  const columns: ColumnsType<TestResult> = [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
      width: 60,
      align: 'center',
    },
    {
      title: 'Property',
      dataIndex: 'property',
      key: 'property',
      width: 200,
    },
    {
      title: 'Units',
      dataIndex: 'units',
      key: 'units',
      width: 80,
      align: 'center',
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      width: 120,
    },
    {
      title: 'Results',
      dataIndex: 'results',
      key: 'results',
      width: 100,
      align: 'center',
      render: (value: string, record: TestResult) => (
        <Space>
          <Text strong>{value}</Text>
          {record.status === 'passed' && (
            <Tooltip title="Passed">
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
            </Tooltip>
          )}
          {record.status === 'failed' && (
            <Tooltip title="Failed">
              <CheckCircleOutlined style={{ color: '#ff4d4f' }} />
            </Tooltip>
          )}
          {record.status === 'pending' && (
            <Tooltip title="Pending">
              <ClockCircleOutlined style={{ color: '#faad14' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Specification',
      dataIndex: 'specification',
      key: 'specification',
      width: 150,
      render: (value: string) => <Text type="secondary">{value}</Text>,
    },
  ];

  const handleGoBack = () => {
    window.history.back();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    message.info('PDF export functionality will be implemented');
  };

  const handleEdit = () => {
    message.info('Edit functionality will be implemented');
  };

  if (loading) {
    return (
      <Card loading={loading} style={{ margin: 24 }}>
        Loading test record...
      </Card>
    );
  }

  if (!testRecord) {
    return (
      <Card style={{ margin: 24 }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Title level={4}>Test record not found</Title>
          <Button onClick={handleGoBack}>Go Back</Button>
        </div>
      </Card>
    );
  }

  const getStatusTag = (status: string) => {
    const statusConfig = {
      completed: { color: 'green', text: 'Completed' },
      'in-progress': { color: 'blue', text: 'In Progress' },
      pending: { color: 'orange', text: 'Pending' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const passedTests = testRecord.testResults.filter(
    (test) => test.status === 'passed',
  ).length;
  const totalTests = testRecord.testResults.length;

  return (
    <div style={{ margin: 24 }}>
      {/* Header */}
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleGoBack}>
              Back
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              Laboratory Test Report
            </Title>
          </Space>
          <Space>
            <Button icon={<EditOutlined />} onClick={handleEdit}>
              Edit
            </Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              Print
            </Button>
            <Button
              type="primary"
              icon={<FilePdfOutlined />}
              onClick={handleExportPDF}
            >
              Export PDF
            </Button>
          </Space>
        </div>
      </Card>

      {/* Sample Information */}
      <Card title="Sample Information" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Sample Code">
                <Text strong>{testRecord.sampleCode}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Product Type">
                {testRecord.productType}
              </Descriptions.Item>
              <Descriptions.Item label="Request Date">
                {testRecord.requestDate}
              </Descriptions.Item>
              <Descriptions.Item label="Test Date">
                {testRecord.testDate}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Laboratory">
                {testRecord.laboratory}
              </Descriptions.Item>
              <Descriptions.Item label="Technician">
                {testRecord.technician}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {getStatusTag(testRecord.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Test Results">
                <Text strong style={{ color: '#52c41a' }}>
                  {passedTests}/{totalTests} Passed
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Test Results Table */}
      <Card title="Test Results" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={testRecord.testResults}
          rowKey="no"
          pagination={false}
          size="middle"
          bordered
          scroll={{ x: 800 }}
          style={{ marginTop: 16 }}
        />
      </Card>

      {/* Summary */}
      <Card title="Test Summary" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Title level={2} style={{ color: '#52c41a', margin: 0 }}>
                {passedTests}
              </Title>
              <Text>Tests Passed</Text>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Title level={2} style={{ color: '#1890ff', margin: 0 }}>
                {totalTests}
              </Title>
              <Text>Total Tests</Text>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Title level={2} style={{ color: '#52c41a', margin: 0 }}>
                {Math.round((passedTests / totalTests) * 100)}%
              </Title>
              <Text>Success Rate</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Footer Notes */}
      <Card style={{ marginTop: 16 }}>
        <Text type="secondary">
          <strong>Notes:</strong> This report contains the complete analysis
          results for the submitted sample. All tests were performed according
          to ASTM standards and industry specifications. For any questions
          regarding this report, please contact the laboratory technician.
        </Text>
      </Card>
    </div>
  );
};

export default LaboratoryTestingDetail;
