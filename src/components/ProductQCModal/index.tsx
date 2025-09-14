import {
  CalculatorOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  ThunderboltOutlined,
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
  Select,
  Space,
  Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

interface ProductQCData {
  // Header Information
  name_of_tanker: string;
  arrival_date: string;
  quantity_in_batch: number;
  voyage_no: string;
  rcoq_no: string;
  rcoq_date: string;
  refinery_terminal: string;
  grade_of_product: string;

  // Port & Starboard Data (6 records each)
  port_data: PortStarboardRecord[];
  starboard_data: PortStarboardRecord[];
}

interface PortStarboardRecord {
  id: number;
  free_water: 'P' | 'N' | '';
  suspended_water: 'P' | 'N' | '';
  electrical_conductivity: number | null;
  temperature_observed: number | null;
  density_observed: number | null;
  density_15c: number | null; // Calculated
  volume_liters: number | null;
  dens_15c_x_volume: number | null; // Calculated
}

interface ProductQCModalProps {
  visible: boolean;
  onClose: () => void;
  sampleData?: any;
  onSubmit: (data: ProductQCData) => void;
}

const ProductQCModal: React.FC<ProductQCModalProps> = ({
  visible,
  onClose,
  sampleData,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [portData, setPortData] = useState<PortStarboardRecord[]>([]);
  const [starboardData, setStarboardData] = useState<PortStarboardRecord[]>([]);
  const [calculatedResults, setCalculatedResults] = useState({
    total_volume_dens_15c: 0,
    total_volume: 0,
    expected_density: 0,
    refinery_certificate_density: 627, // Default value
    density_difference: 0,
  });

  // Initialize empty records for Port and Starboard
  useEffect(() => {
    if (visible) {
      const initializeRecords = (): PortStarboardRecord[] =>
        Array.from({ length: 6 }, (_, index) => ({
          id: index + 1,
          free_water: '',
          suspended_water: '',
          electrical_conductivity: null,
          temperature_observed: null,
          density_observed: null,
          density_15c: null,
          volume_liters: null,
          dens_15c_x_volume: null,
        }));

      setPortData(initializeRecords());
      setStarboardData(initializeRecords());

      // Set default form values if sample data exists
      if (sampleData) {
        form.setFieldsValue({
          name_of_tanker: `MT. ${sampleData.vessel_name}`,
          grade_of_product: sampleData.sample_type,
          arrival_date: dayjs().format('DD MMM YYYY'),
          rcoq_date: dayjs().format('DD MMM YYYY'),
        });
      }
    }
  }, [visible, sampleData, form]);

  // API function to calculate Density @ 15°C
  const calculateDensity15C = async (
    tempObserved: number,
    densityObserved: number,
  ): Promise<number> => {
    // In real implementation, this would call an actual API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Formula: Density@15°C = Density@T / (1 + α * (T - 15))
        // Where α is the coefficient of thermal expansion
        const alpha = 0.0008; // Typical value for petroleum products
        const density15C = densityObserved / (1 + alpha * (tempObserved - 15));
        resolve(Math.round(density15C * 10000) / 10000); // Round to 4 decimal places
      }, 1000); // Simulate API delay
    });
  };

  // Handle API call for Density @ 15°C
  const handleCalculateDensity15C = async (
    type: 'port' | 'starboard',
    index: number,
  ) => {
    const currentData = type === 'port' ? portData : starboardData;
    const record = currentData[index];

    if (!record.temperature_observed || !record.density_observed) {
      message.warning('Please input Temperature and Density Observed first!');
      return;
    }

    try {
      message.loading({
        content: 'Calculating Density @ 15°C via API...',
        key: 'density-calc',
      });

      const density15C = await calculateDensity15C(
        record.temperature_observed,
        record.density_observed,
      );

      message.success({
        content: 'Density @ 15°C calculated successfully!',
        key: 'density-calc',
      });

      // Update the record with calculated value
      updateRecord(type, index, 'density_15c', density15C);
    } catch (_error) {
      message.error({
        content: 'Failed to calculate Density @ 15°C',
        key: 'density-calc',
      });
    }
  };

  // Update record data and trigger calculations
  const updateRecord = (
    type: 'port' | 'starboard',
    index: number,
    field: keyof PortStarboardRecord,
    value: any,
  ) => {
    const updateData = type === 'port' ? [...portData] : [...starboardData];
    const record = { ...updateData[index] };

    (record as any)[field] = value;

    // Note: Density @ 15°C will be calculated via API button click

    // Auto-calculate Dens @15°C x Volume when both values are available
    if (
      (field === 'density_15c' || field === 'volume_liters') &&
      record.density_15c &&
      record.volume_liters
    ) {
      record.dens_15c_x_volume =
        Math.round(record.density_15c * record.volume_liters * 1000) / 1000;
    }

    updateData[index] = record;

    if (type === 'port') {
      setPortData(updateData);
    } else {
      setStarboardData(updateData);
    }

    // Trigger overall calculations
    calculateOverallResults(
      type === 'port' ? updateData : portData,
      type === 'starboard' ? updateData : starboardData,
    );
  };

  // Calculate overall results
  const calculateOverallResults = (
    portRecords: PortStarboardRecord[],
    starboardRecords: PortStarboardRecord[],
  ) => {
    const allRecords = [...portRecords, ...starboardRecords];

    const totalVolumeDens15C = allRecords.reduce(
      (sum, record) => sum + (record.dens_15c_x_volume || 0),
      0,
    );

    const totalVolume = allRecords.reduce(
      (sum, record) => sum + (record.volume_liters || 0),
      0,
    );

    const expectedDensity =
      totalVolume > 0 ? (totalVolumeDens15C / totalVolume) * 1000 : 0;

    // Formula fix: Different = Expected Density - Refinery Certificate Density
    const densityDifference = Math.abs(
      expectedDensity - calculatedResults.refinery_certificate_density,
    );

    setCalculatedResults((prev) => ({
      ...prev,
      total_volume_dens_15c: Math.round(totalVolumeDens15C * 1000) / 1000,
      total_volume: Math.round(totalVolume * 1000) / 1000,
      expected_density: Math.round(expectedDensity * 10) / 10,
      density_difference: Math.round(densityDifference * 10) / 10,
    }));
  };

  // Table columns for Port/Starboard data
  const getTableColumns = (
    type: 'port' | 'starboard',
  ): ColumnsType<PortStarboardRecord> => [
    {
      title: type === 'port' ? 'PORT' : 'STARBOARD',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
      render: (id) => <strong>{id}</strong>,
    },
    {
      title: 'WATER CHECK',
      children: [
        {
          title: 'Free Water',
          key: 'free_water',
          width: 100,
          render: (_, record, index) => (
            <Select
              size="small"
              value={record.free_water || undefined}
              placeholder="Select"
              onChange={(value) =>
                updateRecord(type, index, 'free_water', value)
              }
              options={[
                { label: 'P (Positive)', value: 'P' },
                { label: 'N (Negative)', value: 'N' },
              ]}
              style={{ width: '100%' }}
            />
          ),
        },
        {
          title: 'Suspended Water',
          key: 'suspended_water',
          width: 120,
          render: (_, record, index) => (
            <Select
              size="small"
              value={record.suspended_water || undefined}
              placeholder="Select"
              onChange={(value) =>
                updateRecord(type, index, 'suspended_water', value)
              }
              options={[
                { label: 'P (Positive)', value: 'P' },
                { label: 'N (Negative)', value: 'N' },
              ]}
              style={{ width: '100%' }}
            />
          ),
        },
      ],
    },
    {
      title: 'Electrical Conductivity (p.S/m)',
      key: 'electrical_conductivity',
      width: 140,
      render: (_, record, index) => (
        <InputNumber
          size="small"
          value={record.electrical_conductivity}
          onChange={(value) =>
            updateRecord(type, index, 'electrical_conductivity', value)
          }
          placeholder="Enter value"
          style={{ width: '100%' }}
          precision={0}
        />
      ),
    },
    {
      title: 'Temperature Observed (°C)',
      key: 'temperature_observed',
      width: 140,
      render: (_, record, index) => (
        <InputNumber
          size="small"
          value={record.temperature_observed}
          onChange={(value) =>
            updateRecord(type, index, 'temperature_observed', value)
          }
          placeholder="Enter temp"
          style={{ width: '100%' }}
          precision={2}
        />
      ),
    },
    {
      title: 'Density Observed (Kg/l)',
      key: 'density_observed',
      width: 140,
      render: (_, record, index) => (
        <InputNumber
          size="small"
          value={record.density_observed}
          onChange={(value) =>
            updateRecord(type, index, 'density_observed', value)
          }
          placeholder="Enter density"
          style={{ width: '100%' }}
          precision={4}
        />
      ),
    },
    {
      title: 'Density @15°C',
      key: 'density_15c',
      width: 140,
      render: (_, record, index) => (
        <div style={{ textAlign: 'center' }}>
          {record.density_15c ? (
            <div
              style={{
                fontWeight: 600,
                color: '#1890ff',
                fontSize: '13px',
                marginBottom: 4,
              }}
            >
              {record.density_15c.toFixed(4)}
            </div>
          ) : null}

          <Button
            type={record.density_15c ? 'default' : 'primary'}
            size="small"
            icon={<ThunderboltOutlined />}
            onClick={() => handleCalculateDensity15C(type, index)}
            disabled={!record.temperature_observed || !record.density_observed}
            style={{
              fontSize: '10px',
              height: 24,
              width: '100%',
              backgroundColor: record.density_15c ? '#f0f0f0' : undefined,
              borderColor: record.density_15c ? '#d9d9d9' : undefined,
              color: record.density_15c ? '#8c8c8c' : undefined,
            }}
          >
            {record.density_15c ? 'Recalc' : 'Calc API'}
          </Button>
        </div>
      ),
    },
    {
      title: 'Volume (Liters)',
      key: 'volume_liters',
      width: 120,
      render: (_, record, index) => (
        <InputNumber
          size="small"
          value={record.volume_liters}
          onChange={(value) =>
            updateRecord(type, index, 'volume_liters', value)
          }
          placeholder="Enter volume"
          style={{ width: '100%' }}
          precision={3}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }
        />
      ),
    },
    {
      title: 'Dens @15°C x Volume (Liters)',
      key: 'dens_15c_x_volume',
      width: 160,
      render: (_, record) => (
        <div
          style={{
            textAlign: 'center',
            fontWeight: 500,
            color: record.dens_15c_x_volume ? '#52c41a' : '#d9d9d9',
          }}
        >
          {record.dens_15c_x_volume
            ? record.dens_15c_x_volume.toLocaleString(undefined, {
                maximumFractionDigits: 3,
              })
            : '-'}
        </div>
      ),
    },
  ];

  const handleSubmit = async () => {
    try {
      const formValues = await form.validateFields();

      const productQCData: ProductQCData = {
        ...formValues,
        port_data: portData,
        starboard_data: starboardData,
      };

      onSubmit(productQCData);
      message.success('Product QC data saved successfully!');
      onClose();
    } catch (_error) {
      message.error('Please fill in all required fields');
    }
  };

  return (
    <Modal
      title={
        <Space>
          <CalculatorOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontSize: '18px', fontWeight: 600 }}>
            PRODUCT QUALITY CHECK COMPARTEMENT TANKER BEFORE DISCHARGE
          </span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width="95%"
      style={{ top: 20 }}
      footer={[
        <Button key="cancel" onClick={onClose} icon={<CloseOutlined />}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          icon={<SaveOutlined />}
        >
          Save Product QC
        </Button>,
      ]}
      destroyOnClose
    >
      <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        {/* Header Information Form */}
        <Card
          title="Tanker Information"
          size="small"
          style={{ marginBottom: 16 }}
          bodyStyle={{ padding: '16px' }}
        >
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  name="name_of_tanker"
                  label="Name of Tanker"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="MT. PACIFIC ERA" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="arrival_date"
                  label="Arrival Date"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="03 May 2025" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="quantity_in_batch"
                  label="Quantity in Batch"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    placeholder="1987425"
                    style={{ width: '100%' }}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="voyage_no"
                  label="Voyage No."
                  rules={[{ required: true }]}
                >
                  <Input placeholder="25600" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  name="rcoq_no"
                  label="RCoQ No."
                  rules={[{ required: true }]}
                >
                  <Input placeholder="JET A-1/112/2024" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="rcoq_date"
                  label="RCoQ Date"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="29 April 2025" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="refinery_terminal"
                  label="Refinery/Terminal"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Tanjung Bin, Malaysia" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="grade_of_product"
                  label="Grade of Product"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Jet A-1" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Port Data Table */}
        <Card
          title="Port Compartment Data"
          size="small"
          style={{ marginBottom: 16 }}
          bodyStyle={{ padding: '8px' }}
        >
          <Table
            columns={getTableColumns('port')}
            dataSource={portData}
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 1200 }}
            rowKey="id"
          />
        </Card>

        {/* Starboard Data Table */}
        <Card
          title="Starboard Compartment Data"
          size="small"
          style={{ marginBottom: 16 }}
          bodyStyle={{ padding: '8px' }}
        >
          <Table
            columns={getTableColumns('starboard')}
            dataSource={starboardData}
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 1200 }}
            rowKey="id"
          />
        </Card>

        {/* Calculation Results */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <InfoCircleOutlined
                style={{ color: '#722ed1', fontSize: '16px' }}
              />
              <span style={{ fontWeight: 600, color: '#262626' }}>
                Calculation Results
              </span>
            </div>
          }
          size="small"
          style={{
            marginTop: 16,
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #e8e8e8',
            overflow: 'hidden',
          }}
          headStyle={{
            background: 'linear-gradient(135deg, #f6f8ff 0%, #f0f2ff 100%)',
            borderBottom: '1px solid #e8e8e8',
            padding: '12px 20px',
          }}
          bodyStyle={{ padding: '20px' }}
        >
          {/* Volume Calculations */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                background: '#fafbfc',
                padding: '16px',
                borderRadius: 8,
                border: '1px solid #e8e8e8',
              }}
            >
              <div
                style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4 }}
              >
                Total Volume × Density @15°C
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#1890ff',
                  fontFamily: 'Monaco, monospace',
                }}
              >
                {calculatedResults.total_volume_dens_15c.toFixed(3)}
              </div>
            </div>

            <div
              style={{
                background: '#fafbfc',
                padding: '16px',
                borderRadius: 8,
                border: '1px solid #e8e8e8',
              }}
            >
              <div
                style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4 }}
              >
                Total Volume (Liters)
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#52c41a',
                  fontFamily: 'Monaco, monospace',
                }}
              >
                {calculatedResults.total_volume.toFixed(3)}
              </div>
            </div>
          </div>

          {/* Density Comparison */}
          <div
            style={{
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: 8,
              border: '1px solid #dee2e6',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 20,
                alignItems: 'end',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6c757d',
                    marginBottom: 8,
                  }}
                >
                  Expected Density (kg/m³)
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#495057',
                    fontFamily: 'Monaco, monospace',
                  }}
                >
                  {calculatedResults.expected_density.toFixed(1)}
                </div>
                <div
                  style={{ fontSize: '10px', color: '#adb5bd', marginTop: 2 }}
                >
                  (Volume×Dens÷Volume×1000)
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6c757d',
                    marginBottom: 8,
                  }}
                >
                  Refinery Certificate
                </div>
                <InputNumber
                  value={calculatedResults.refinery_certificate_density}
                  onChange={(value) => {
                    const newValue = value || 627;
                    setCalculatedResults((prev) => {
                      const newDifference = Math.abs(
                        prev.expected_density - newValue,
                      );
                      return {
                        ...prev,
                        refinery_certificate_density: newValue,
                        density_difference: Math.round(newDifference * 10) / 10,
                      };
                    });
                  }}
                  style={{
                    width: '100%',
                    fontSize: '16px',
                    fontWeight: 600,
                  }}
                  size="large"
                  precision={0}
                  min={0}
                />
              </div>

              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6c757d',
                    marginBottom: 8,
                  }}
                >
                  Difference (Max 3 kg/m³)
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color:
                        calculatedResults.density_difference <= 3
                          ? '#28a745'
                          : '#dc3545',
                      fontFamily: 'Monaco, monospace',
                    }}
                  >
                    {calculatedResults.density_difference.toFixed(1)}
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      color:
                        calculatedResults.density_difference <= 3
                          ? '#28a745'
                          : '#dc3545',
                    }}
                  >
                    {calculatedResults.density_difference <= 3 ? '✓' : '⚠️'}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color:
                      calculatedResults.density_difference <= 3
                        ? '#28a745'
                        : '#dc3545',
                    marginTop: 2,
                    fontWeight: 500,
                  }}
                >
                  {calculatedResults.density_difference <= 3
                    ? 'ACCEPTABLE'
                    : 'EXCEEDS LIMIT'}
                </div>
              </div>
            </div>
          </div>

          {/* Formula Info */}
          <div
            style={{
              marginTop: 16,
              padding: '12px 16px',
              background: '#f0f6ff',
              borderRadius: 6,
              border: '1px solid #bae7ff',
            }}
          >
            <div
              style={{ fontSize: '11px', color: '#0958d9', lineHeight: 1.5 }}
            >
              <strong>Formula:</strong> Difference = |Expected Density -
              Refinery Certificate| ≤ 3 kg/m³ for acceptance
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default ProductQCModal;
