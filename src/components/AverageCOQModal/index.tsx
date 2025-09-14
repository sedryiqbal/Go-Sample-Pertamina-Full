import {
  CloseOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Row,
  Space,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

const { Text, Title } = Typography;

// Interface untuk data parameter COQ
interface COQParameterData {
  key: string;
  parameter: string;
  tanks: { [tankNumber: string]: number | string | null };
  average: number | string | null;
}

interface AverageCOQModalProps {
  visible: boolean;
  onClose: () => void;
  sampleData: any;
  onSubmit: (data: COQParameterData[]) => void;
}

const AverageCOQModal: React.FC<AverageCOQModalProps> = ({
  visible,
  onClose,
  sampleData,
  onSubmit,
}) => {
  const [_form] = Form.useForm();
  const [tankNumbers, setTankNumbers] = useState<string[]>(['1201', '1203']);
  const [tableData, setTableData] = useState<COQParameterData[]>([]);

  // Initialize table data with parameters
  useEffect(() => {
    const initData: COQParameterData[] = [
      {
        key: 'colour_saybolt',
        parameter: 'Colour Saybolt',
        tanks: {},
        average: null,
      },
      {
        key: 'distillation',
        parameter: 'Distillation',
        tanks: {},
        average: null,
      },
      { key: 'ibp', parameter: '- IBP', tanks: {}, average: null },
      { key: 'ten_percent', parameter: '- 10%', tanks: {}, average: null },
      { key: 'fifty_percent', parameter: '- 50%', tanks: {}, average: null },
      { key: 'ninety_percent', parameter: '- 90%', tanks: {}, average: null },
      { key: 'end_point', parameter: '- End point', tanks: {}, average: null },
      { key: 'residue', parameter: '- Residue', tanks: {}, average: null },
      { key: 'loss', parameter: '- Loss', tanks: {}, average: null },
      {
        key: 'flash_point',
        parameter: 'Flash Point',
        tanks: {},
        average: null,
      },
      { key: 'density_15', parameter: 'Density 15', tanks: {}, average: null },
      {
        key: 'freezing_point',
        parameter: 'Freezing Point',
        tanks: {},
        average: null,
      },
      { key: 'msep', parameter: 'Msep', tanks: {}, average: null },
      {
        key: 'corrosion_cs',
        parameter: 'Corrosion CS',
        tanks: {},
        average: null,
      },
      {
        key: 'existent_gum',
        parameter: 'Existent Gum',
        tanks: {},
        average: null,
      },
    ];

    // Initialize tanks for each parameter
    tankNumbers.forEach((tankNum) => {
      initData.forEach((param) => {
        param.tanks[tankNum] = null;
      });
    });

    setTableData(initData);
  }, [tankNumbers]);

  const handleAddTank = () => {
    const newTankNumber = `12${(tankNumbers.length + 1).toString().padStart(2, '0')}`;
    setTankNumbers([...tankNumbers, newTankNumber]);
  };

  const handleRemoveTank = (tankNumber: string) => {
    if (tankNumbers.length <= 1) {
      message.warning('Minimal harus ada satu tangki');
      return;
    }

    const newTankNumbers = tankNumbers.filter((num) => num !== tankNumber);
    setTankNumbers(newTankNumbers);

    // Update table data by removing the tank column
    const updatedData = tableData.map((row) => {
      const { [tankNumber]: _removed, ...restTanks } = row.tanks;
      return { ...row, tanks: restTanks };
    });
    setTableData(updatedData);
  };

  const handleTankNumberChange = (oldNumber: string, newNumber: string) => {
    const newTankNumbers = tankNumbers.map((num) =>
      num === oldNumber ? newNumber : num,
    );
    setTankNumbers(newTankNumbers);

    // Update table data with new tank number
    const updatedData = tableData.map((row) => {
      const tanks = { ...row.tanks };
      if (tanks[oldNumber] !== undefined) {
        tanks[newNumber] = tanks[oldNumber];
        delete tanks[oldNumber];
      }
      return { ...row, tanks };
    });
    setTableData(updatedData);
  };

  const handleValueChange = (
    paramKey: string,
    tankNumber: string,
    value: number | null,
  ) => {
    const updatedData = tableData.map((row) => {
      if (row.key === paramKey) {
        const newTanks = { ...row.tanks, [tankNumber]: value };

        // Calculate average
        const values = Object.values(newTanks).filter(
          (v) => v !== null && v !== '',
        ) as number[];
        const average =
          values.length > 0
            ? values.reduce((sum, val) => sum + val, 0) / values.length
            : null;

        return { ...row, tanks: newTanks, average };
      }
      return row;
    });
    setTableData(updatedData);
  };

  const handleSubmit = () => {
    const hasData = tableData.some((row) =>
      Object.values(row.tanks).some((value) => value !== null && value !== ''),
    );

    if (!hasData) {
      message.error('Minimal harus ada satu nilai yang diisi');
      return;
    }

    onSubmit(tableData);
    message.success('Average COQ berhasil disimpan');
    onClose();
  };

  // Generate table columns
  const generateColumns = (): ColumnsType<COQParameterData> => {
    const columns: ColumnsType<COQParameterData> = [
      {
        title: '',
        dataIndex: 'parameter',
        key: 'parameter',
        width: 200,
        fixed: 'left',
        render: (text) => (
          <div
            style={{
              fontWeight: 500,
              fontSize: '13px',
              padding: '8px 0',
            }}
          >
            {text}
          </div>
        ),
      },
    ];

    // Add tank columns
    tankNumbers.forEach((tankNumber) => {
      columns.push({
        title: (
          <div style={{ textAlign: 'center' }}>
            <Input
              value={tankNumber}
              onChange={(e) =>
                handleTankNumberChange(tankNumber, e.target.value)
              }
              style={{
                textAlign: 'center',
                fontWeight: 600,
                backgroundColor: '#95d475',
                border: '1px solid #73c653',
                color: '#000',
              }}
              size="small"
            />
            {tankNumbers.length > 1 && (
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveTank(tankNumber)}
                style={{ marginTop: 4, fontSize: '10px' }}
              />
            )}
          </div>
        ),
        dataIndex: ['tanks', tankNumber],
        key: tankNumber,
        width: 120,
        align: 'center',
        render: (value, record) => (
          <InputNumber
            value={value}
            onChange={(val) => handleValueChange(record.key, tankNumber, val)}
            style={{ width: '100%' }}
            size="small"
            precision={record.key === 'corrosion_cs' ? 0 : 1}
            controls={false}
            placeholder="-"
          />
        ),
      });
    });

    // Add average column
    columns.push({
      title: (
        <div
          style={{
            textAlign: 'center',
            fontWeight: 600,
            backgroundColor: '#95d475',
            color: '#000',
            padding: '4px 8px',
            borderRadius: 4,
          }}
        >
          AVERAGE COQ
        </div>
      ),
      dataIndex: 'average',
      key: 'average',
      width: 120,
      align: 'center',
      render: (value) => (
        <div
          style={{
            fontWeight: 600,
            color: '#262626',
            fontSize: '13px',
          }}
        >
          {value !== null
            ? typeof value === 'string'
              ? value
              : value.toFixed(1)
            : '-'}
        </div>
      ),
    });

    return columns;
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ExperimentOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
          <div>
            <Title level={4} style={{ margin: 0, color: '#262626' }}>
              Average COQ Input
            </Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {sampleData
                ? `${sampleData.sample_id} • ${sampleData.sample_type}`
                : 'Input nilai rata-rata COQ per tangki'}
            </Text>
          </div>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      width={1200}
      style={{ top: 20 }}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button
            icon={<PlusOutlined />}
            onClick={handleAddTank}
            style={{ borderColor: '#52c41a', color: '#52c41a' }}
          >
            Tambah Tangki
          </Button>
          <Space>
            <Button icon={<CloseOutlined />} onClick={handleClose}>
              Batal
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Simpan Average COQ
            </Button>
          </Space>
        </div>
      }
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '0 4px' }}>
        {/* Sample Information Header */}
        {sampleData && (
          <Card
            size="small"
            style={{
              marginBottom: 16,
              background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
              border: '1px solid #b7eb8f',
            }}
          >
            <Row gutter={16}>
              <Col span={6}>
                <Text strong style={{ color: '#389e0d' }}>
                  Sample ID:
                </Text>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>
                  {sampleData.sample_id}
                </div>
              </Col>
              <Col span={6}>
                <Text strong style={{ color: '#389e0d' }}>
                  Order Number:
                </Text>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>
                  {sampleData.order_number}
                </div>
              </Col>
              <Col span={6}>
                <Text strong style={{ color: '#389e0d' }}>
                  Sample Type:
                </Text>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>
                  {sampleData.sample_type}
                </div>
              </Col>
              <Col span={6}>
                <Text strong style={{ color: '#389e0d' }}>
                  Vessel:
                </Text>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>
                  {sampleData.vessel_name}
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {/* COQ Table */}
        <Card
          size="small"
          style={{
            borderRadius: 8,
            border: '1px solid #d9d9d9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <style>
            {`
              .coq-table .ant-table-thead > tr > th {
                background-color: #95d475 !important;
                font-weight: 600;
                text-align: center;
                border: 1px solid #73c653 !important;
                color: #000 !important;
                padding: 12px 8px;
              }
              .coq-table .ant-table-tbody > tr > td {
                padding: 8px;
                text-align: center;
                border: 1px solid #e8e8e8 !important;
              }
              .coq-table .ant-table-tbody > tr:nth-child(odd) > td {
                background-color: #fafafa;
              }
              .coq-table .ant-table-tbody > tr:hover > td {
                background-color: #e6f7ff !important;
              }
              .coq-table .ant-input-number {
                border: none;
                background: transparent;
              }
              .coq-table .ant-input-number-input {
                text-align: center;
                font-weight: 500;
              }
            `}
          </style>
          <Table
            columns={generateColumns()}
            dataSource={tableData}
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 'max-content' }}
            rowKey="key"
            className="coq-table"
          />
        </Card>

        {/* Summary Information */}
        <Card
          size="small"
          style={{
            marginTop: 16,
            background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
            border: '1px solid #b7eb8f',
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#52c41a',
                  }}
                >
                  {tankNumbers.length}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  Total Tangki
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#1890ff',
                  }}
                >
                  {tableData.reduce(
                    (sum, row) =>
                      sum +
                      Object.values(row.tanks).filter(
                        (val) => val !== null && val !== '',
                      ).length,
                    0,
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  Total Parameter Terisi
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#fa8c16',
                  }}
                >
                  {tableData.filter((row) => row.average !== null).length}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  Parameter dengan Average
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </Modal>
  );
};

export default AverageCOQModal;
