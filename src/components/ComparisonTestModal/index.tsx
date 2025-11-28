import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExperimentOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { Card, Col, message, Modal, Row, Spin, Statistic, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { fetchComparisonResult } from '../../services/comparison';
import type { ComparisonResult } from '../../services/comparison';

const { Text, Title } = Typography;

// Interface untuk data comparison test
interface ComparisonTestData {
  key: string;
  properties: string;
  limits: string;
  avg_coq: number | string | null;
  tr_short_test: number | string | null;
  difference: number | string | null;
  allowable_difference: string;
  status: 'onspec' | 'offspec';
  isHeader?: boolean;
}

interface ComparisonTestModalProps {
  visible: boolean;
  onClose: () => void;
  sampleData: any;
}

const ComparisonTestModal: React.FC<ComparisonTestModalProps> = ({
  visible,
  onClose,
  sampleData,
}) => {
  const [comparisonData, setComparisonData] = useState<ComparisonTestData[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultInfo, setResultInfo] = useState<ComparisonResult | null>(null);

  // Fetch comparison result data
  useEffect(() => {
    const loadData = async () => {
      if (!visible || !sampleData?.id) return;

      setLoading(true);
      try {
        const sampleOrderId = parseInt(sampleData.id, 10);
        const result = await fetchComparisonResult(sampleOrderId);

        if (result) {
          setResultInfo(result);
          
          // Map API result to table format
          const tableData: ComparisonTestData[] = result.results.map((item) => ({
            key: `property_${item.propertyTestId}`,
            properties: item.propertyName,
            limits: 'Report', // This could come from API if available
            avg_coq: item.avgCoq,
            tr_short_test: item.labTestingCoq,
            difference: item.difference,
            allowable_difference: 'Referred to Limits', // This could come from API if available
            status: item.isOnSpecification ? 'onspec' : 'offspec',
          }));

          setComparisonData(tableData);
        } else {
          setComparisonData([]);
          message.warning('Tidak ada data comparison result');
        }
      } catch (error) {
        console.error('Failed to fetch comparison result:', error);
        message.error('Gagal memuat data comparison result');
        setComparisonData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [visible, sampleData?.id]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setComparisonData([]);
      setResultInfo(null);
    }
  }, [visible]);

  // Calculate statistics from result info or fallback to calculated values
  const stats = {
    total: resultInfo?.totalParameters ?? comparisonData.filter((item) => !item.isHeader).length,
    onspec: resultInfo?.onSpecification ?? comparisonData.filter(
      (item) => !item.isHeader && item.status === 'onspec',
    ).length,
    offspec: resultInfo?.offSpecification ?? comparisonData.filter(
      (item) => !item.isHeader && item.status === 'offspec',
    ).length,
  };

  // Display info from API or sampleData
  const displayInfo = {
    sampleId: resultInfo?.sampleId || sampleData?.sample_id || '-',
    orderNo: resultInfo?.orderNo || sampleData?.order_number || '-',
    sampleType: resultInfo?.sampleType || sampleData?.sample_type || '-',
    vesselName: resultInfo?.vesselName || sampleData?.vessel_name || '-',
    labName: resultInfo?.labName || '-',
    createdBy: resultInfo?.createdBy || '-',
    createdAt: resultInfo?.createdAt || '-',
  };

  // Generate table columns
  const columns: ColumnsType<ComparisonTestData> = [
    {
      title: 'Properties',
      dataIndex: 'properties',
      key: 'properties',
      width: 180,
      fixed: 'left',
      render: (text, record) => (
        <div
          style={{
            fontWeight: record.isHeader ? 600 : 500,
            fontSize: record.isHeader ? '14px' : '13px',
            color: record.isHeader ? '#262626' : '#595959',
            backgroundColor: record.isHeader ? '#ffeaa7' : 'transparent',
            padding: record.isHeader ? '8px 12px' : '4px 0',
            margin: record.isHeader ? '-8px -12px' : '0',
            borderRadius: record.isHeader ? 4 : 0,
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: 'Limits',
      dataIndex: 'limits',
      key: 'limits',
      width: 200,
      render: (text, _record) => (
        <div
          style={{
            fontSize: '12px',
            color: '#595959',
            fontWeight: 500,
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: 'Avg COQ',
      dataIndex: 'avg_coq',
      key: 'avg_coq',
      width: 100,
      align: 'center',
      render: (value, record) => {
        if (record.isHeader || value === null) return null;
        return (
          <div
            style={{
              fontWeight: 600,
              fontSize: '13px',
              color: '#262626',
            }}
          >
            {typeof value === 'string' ? value : value.toFixed(1)}
          </div>
        );
      },
    },
    {
      title: 'TR Short Test',
      dataIndex: 'tr_short_test',
      key: 'tr_short_test',
      width: 120,
      align: 'center',
      render: (value, record) => {
        if (record.isHeader || value === null) return null;
        return (
          <div
            style={{
              fontWeight: 600,
              fontSize: '13px',
              color: '#1890ff',
            }}
          >
            {typeof value === 'string' ? value : value.toFixed(1)}
          </div>
        );
      },
    },
    {
      title: 'Difference',
      dataIndex: 'difference',
      key: 'difference',
      width: 100,
      align: 'center',
      render: (value, record) => {
        if (record.isHeader || value === null) return null;

        const isOffspec = record.status === 'offspec';
        return (
          <div
            style={{
              fontWeight: 600,
              fontSize: '13px',
              color: '#fff',
              backgroundColor: isOffspec ? '#ff4d4f' : '#52c41a',
              padding: '4px 8px',
              borderRadius: 4,
              textAlign: 'center',
            }}
          >
            {typeof value === 'string' ? value : value.toFixed(1)}
          </div>
        );
      },
    },
    {
      title: 'Allowable Difference',
      dataIndex: 'allowable_difference',
      key: 'allowable_difference',
      width: 160,
      render: (text, _record) => (
        <div
          style={{
            fontSize: '12px',
            color: '#595959',
            fontWeight: 500,
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status, record) => {
        if (record.isHeader) return null;

        return (
          <Tag
            color={status === 'onspec' ? 'green' : 'red'}
            style={{
              fontWeight: 600,
              fontSize: '11px',
              padding: '4px 8px',
              borderRadius: 6,
              border: 'none',
            }}
          >
            {status === 'onspec' ? 'ONSPEC' : 'OFFSPEC'}
          </Tag>
        );
      },
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ExperimentOutlined style={{ color: '#fa8c16', fontSize: '18px' }} />
          <div>
            <Title level={4} style={{ margin: 0, color: '#262626' }}>
              Comparison Test Results
            </Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {displayInfo.sampleId} • {displayInfo.sampleType}
            </Text>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={1300}
      style={{ top: 20 }}
      footer={null}
    >
      <Spin spinning={loading} tip="Memuat data...">
        <div style={{ maxHeight: '75vh', overflowY: 'auto', padding: '0 4px' }}>
          {/* Sample Information Header */}
          <Card
            size="small"
            style={{
              marginBottom: 16,
              background: 'linear-gradient(135deg, #fff7e6 0%, #f0f6ff 100%)',
              border: '1px solid #ffd591',
            }}
          >
            <Row gutter={16}>
              <Col span={6}>
                <Text strong style={{ color: '#fa8c16' }}>
                  Sample ID:
                </Text>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>
                  {displayInfo.sampleId}
                </div>
              </Col>
              <Col span={6}>
                <Text strong style={{ color: '#fa8c16' }}>
                  Order Number:
                </Text>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>
                  {displayInfo.orderNo}
                </div>
              </Col>
              <Col span={6}>
                <Text strong style={{ color: '#fa8c16' }}>
                  Sample Type:
                </Text>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>
                  {displayInfo.sampleType}
                </div>
              </Col>
              <Col span={6}>
                <Text strong style={{ color: '#fa8c16' }}>
                  Vessel:
                </Text>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>
                  {displayInfo.vesselName}
                </div>
              </Col>
            </Row>
            {resultInfo && (
              <Row gutter={16} style={{ marginTop: 12 }}>
                <Col span={6}>
                  <Text strong style={{ color: '#fa8c16' }}>
                    Lab:
                  </Text>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>
                    {displayInfo.labName}
                  </div>
                </Col>
                <Col span={6}>
                  <Text strong style={{ color: '#fa8c16' }}>
                    Created By:
                  </Text>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>
                    {displayInfo.createdBy}
                  </div>
                </Col>
              </Row>
            )}
          </Card>

        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card
              size="small"
              style={{
                textAlign: 'center',
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
              }}
            >
              <Statistic
                title="Total Parameters"
                value={stats.total}
                prefix={<InfoCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{
                  color: '#52c41a',
                  fontSize: '20px',
                  fontWeight: 700,
                }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              size="small"
              style={{
                textAlign: 'center',
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
              }}
            >
              <Statistic
                title="On Specification"
                value={stats.onspec}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{
                  color: '#52c41a',
                  fontSize: '20px',
                  fontWeight: 700,
                }}
                suffix={
                  <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    /{stats.total}
                  </span>
                }
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              size="small"
              style={{
                textAlign: 'center',
                background: stats.offspec > 0 ? '#fff2f0' : '#f6ffed',
                border: `1px solid ${stats.offspec > 0 ? '#ffccc7' : '#b7eb8f'}`,
              }}
            >
              <Statistic
                title="Off Specification"
                value={stats.offspec}
                prefix={
                  <CloseCircleOutlined
                    style={{ color: stats.offspec > 0 ? '#ff4d4f' : '#52c41a' }}
                  />
                }
                valueStyle={{
                  color: stats.offspec > 0 ? '#ff4d4f' : '#52c41a',
                  fontSize: '20px',
                  fontWeight: 700,
                }}
                suffix={
                  <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    /{stats.total}
                  </span>
                }
              />
            </Card>
          </Col>
        </Row>

        {/* Comparison Results Table */}
        <Card
          size="small"
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ExperimentOutlined style={{ color: '#fa8c16' }} />
              <span style={{ fontWeight: 600, color: '#262626' }}>
                Detailed Comparison Results
              </span>
            </div>
          }
          style={{
            borderRadius: 8,
            border: '1px solid #d9d9d9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
          headStyle={{
            background: 'linear-gradient(135deg, #fff7e6 0%, #f6ffed 100%)',
            borderBottom: '1px solid #e8e8e8',
          }}
        >
          <style>
            {`
              .comparison-table .ant-table-thead > tr > th {
                background: linear-gradient(135deg, #95d475 0%, #7cb46c 100%) !important;
                font-weight: 600;
                text-align: center;
                border: 1px solid #73c653 !important;
                color: #000 !important;
                padding: 12px 8px;
                font-size: 13px;
              }
              .comparison-table .ant-table-tbody > tr > td {
                padding: 8px;
                border: 1px solid #e8e8e8 !important;
                vertical-align: middle;
              }
              .comparison-table .ant-table-tbody > tr:hover > td {
                background-color: #e6f7ff !important;
              }
              .comparison-table .ant-table-row {
                cursor: default;
              }
            `}
          </style>
          <Table
            columns={columns}
            dataSource={comparisonData}
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 'max-content' }}
            rowKey="key"
            className="comparison-table"
            rowClassName={(record) => (record.isHeader ? 'header-row' : '')}
          />
        </Card>

        {/* Summary Information */}
        <Card
          size="small"
          style={{
            marginTop: 16,
            background: stats.offspec > 0 ? '#fff2f0' : '#f6ffed',
            border: `1px solid ${stats.offspec > 0 ? '#ffccc7' : '#b7eb8f'}`,
          }}
        >
          <Row justify="center">
            <Col>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: stats.offspec > 0 ? '#ff4d4f' : '#52c41a',
                    marginBottom: 4,
                  }}
                >
                  {stats.offspec > 0
                    ? '⚠️ SAMPLE NOT ACCEPTABLE'
                    : '✅ SAMPLE ACCEPTABLE'}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  {stats.offspec > 0
                    ? `${stats.offspec} parameter(s) out of specification`
                    : 'All parameters within specification limits'}
                </div>
              </div>
            </Col>
          </Row>
        </Card>
        </div>
      </Spin>
    </Modal>
  );
};

export default ComparisonTestModal;
