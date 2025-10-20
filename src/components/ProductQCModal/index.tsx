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
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Select,
  Space,
  Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

interface CoqDetail {
  coq_no: string;
  issuance_date: string;
}

interface ProductQCData {
  // Header Information
  name_of_tanker: string;
  arrival_date: string;
  quantity_in_batch: number;
  refinery_terminal: string;
  grade_of_product: string;
  coq_details: CoqDetail[];
  port_note: string;
  starboard_note: string;

  // Port & Starboard Data (8 records each)
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
  batch_density_15c: number | null;
  diff: number | null; // Calculated
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
  const [portNote, setPortNote] = useState('');
  const [starboardNote, setStarboardNote] = useState('');
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
      form.resetFields();
      const initializeRecords = (): PortStarboardRecord[] =>
        Array.from({ length: 8 }, (_, index) => ({
          id: index + 1,
          free_water: '',
          suspended_water: '',
          electrical_conductivity: null,
          temperature_observed: null,
          density_observed: null,
          density_15c: null,
          batch_density_15c: null,
          diff: null,
          volume_liters: null,
          dens_15c_x_volume: null,
        }));

      setPortData(initializeRecords());
      setStarboardData(initializeRecords());
      setPortNote(sampleData?.port_note || '');
      setStarboardNote(sampleData?.starboard_note || '');

      const coqDetails: CoqDetail[] = Array.from({ length: 4 }, (_, idx) => ({
        coq_no: sampleData?.coq_details?.[idx]?.coq_no || '',
        issuance_date:
          sampleData?.coq_details?.[idx]?.issuance_date ||
          (idx === 0 ? dayjs().format('DD MMM YYYY') : ''),
      }));

      const defaultValues: Partial<ProductQCData> = {
        arrival_date: sampleData?.arrival_date || dayjs().format('DD MMM YYYY'),
        grade_of_product: sampleData?.sample_type ?? undefined,
        name_of_tanker: sampleData?.vessel_name
          ? `MT. ${sampleData.vessel_name}`
          : undefined,
        refinery_terminal: sampleData?.refinery_terminal ?? undefined,
        quantity_in_batch: sampleData?.quantity_in_batch ?? undefined,
        coq_details: coqDetails,
      };

      form.setFieldsValue(defaultValues);
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
    } else if (field === 'density_15c' || field === 'volume_liters') {
      record.dens_15c_x_volume = null;
    }

    if (
      (field === 'batch_density_15c' || field === 'density_15c') &&
      record.batch_density_15c !== null &&
      record.density_15c !== null
    ) {
      record.diff =
        Math.round((record.batch_density_15c - record.density_15c) * 1000) /
        1000;
    } else if (field === 'batch_density_15c' || field === 'density_15c') {
      record.diff = null;
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
      title: 'Batch Density @15 °C',
      key: 'batch_density_15c',
      width: 140,
      render: (_, record, index) => (
        <InputNumber
          size="small"
          value={record.batch_density_15c}
          onChange={(value) =>
            updateRecord(type, index, 'batch_density_15c', value)
          }
          placeholder="Enter batch density"
          style={{ width: '100%' }}
          precision={4}
        />
      ),
    },
    {
      title: 'Diff (Max 0,003 kg/cm3)',
      key: 'diff',
      width: 160,
      render: (_, record) => (
        <div
          style={{
            textAlign: 'center',
            fontWeight: 500,
            color:
              record.diff !== null && record.diff !== undefined
                ? '#52c41a'
                : '#d9d9d9',
          }}
        >
          {record.diff !== null && record.diff !== undefined
            ? record.diff.toLocaleString(undefined, {
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

      const coqDetails: CoqDetail[] = Array.from({ length: 4 }, (_, idx) => ({
        coq_no: formValues?.coq_details?.[idx]?.coq_no || '',
        issuance_date: formValues?.coq_details?.[idx]?.issuance_date || '',
      }));

      const productQCData: ProductQCData & {
        calculatedResults?: typeof calculatedResults;
      } = {
        ...formValues,
        coq_details: coqDetails,
        port_data: portData,
        starboard_data: starboardData,
        port_note: portNote,
        starboard_note: starboardNote,
        calculatedResults,
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
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
                border: '1px solid #0f7c0f',
              }}
            >
              <tbody>
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #0f7c0f',
                      fontWeight: 700,
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      color: '#0f5132',
                      background: '#f1f8f0',
                      letterSpacing: '0.04em',
                    }}
                  >
                    PRODUCT QUALITY CHECK COMPARTEMENT TANKER BEFORE DISCHARGE
                  </td>
                </tr>
                {[
                  {
                    key: 'name_of_tanker',
                    label: 'Name of Tanker',
                    render: () => <Input placeholder="MT. PACIFIC ERA" />,
                    name: 'name_of_tanker' as const,
                    rules: [{ required: true }],
                  },
                  {
                    key: 'arrival_date',
                    label: 'Arrival Date',
                    render: () => <Input placeholder="14 Oktober 2025" />,
                    name: 'arrival_date' as const,
                    rules: [{ required: true }],
                  },
                  {
                    key: 'quantity_in_batch',
                    label: 'Quantity in Batch',
                    render: () => (
                      <InputNumber
                        placeholder="11,390,489"
                        style={{ width: '100%' }}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        }
                        min={0}
                      />
                    ),
                    name: 'quantity_in_batch' as const,
                    rules: [{ required: true }],
                    after: (
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#0f5132',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Ltr Observed
                      </span>
                    ),
                  },
                  {
                    key: 'refinery_terminal',
                    label: 'Refinery / Terminal',
                    render: () => <Input placeholder="Cilacap" />,
                    name: 'refinery_terminal' as const,
                    rules: [{ required: true }],
                  },
                  {
                    key: 'grade_of_product',
                    label: 'Grade of Product',
                    render: () => <Input placeholder="Jet A-1" />,
                    name: 'grade_of_product' as const,
                    rules: [{ required: true }],
                  },
                ].map((row, index) => (
                  <tr key={row.key}>
                    <td
                      style={{
                        border: '1px solid #0f7c0f',
                        padding: '8px 12px',
                        fontWeight: 600,
                        background: '#ffffff',
                        minWidth: '170px',
                      }}
                    >
                      {row.label}
                    </td>
                    <td
                      style={{
                        border: '1px solid #0f7c0f',
                        padding: '8px 6px',
                        textAlign: 'center',
                        fontWeight: 600,
                      }}
                    >
                      :
                    </td>
                    <td
                      style={{
                        border: '1px solid #0f7c0f',
                        padding: '6px 12px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: row.after ? 8 : 0,
                        }}
                      >
                        <Form.Item
                          name={row.name}
                          rules={row.rules}
                          style={{ marginBottom: 0, flex: 1 }}
                        >
                          {row.render()}
                        </Form.Item>
                        {row.after}
                      </div>
                    </td>
                    {index < 4 ? (
                      <>
                        <td
                          style={{
                            border: '1px solid #0f7c0f',
                            padding: '8px 12px',
                            fontWeight: 600,
                            minWidth: '140px',
                          }}
                        >
                          {`CoQ (${index + 1}) No.`}
                        </td>
                        <td
                          style={{
                            border: '1px solid #0f7c0f',
                            padding: '8px 6px',
                            textAlign: 'center',
                            fontWeight: 600,
                          }}
                        >
                          :
                        </td>
                        <td
                          style={{
                            border: '1px solid #0f7c0f',
                            padding: '6px 12px',
                            minWidth: '200px',
                          }}
                        >
                          <Form.Item
                            name={['coq_details', index, 'coq_no']}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder="COQ-0221/KPI47210/2021-S2" />
                          </Form.Item>
                        </td>
                        <td
                          style={{
                            border: '1px solid #0f7c0f',
                            padding: '8px 12px',
                            fontWeight: 600,
                            minWidth: '140px',
                          }}
                        >
                          Issuance Date
                        </td>
                        <td
                          style={{
                            border: '1px solid #0f7c0f',
                            padding: '8px 6px',
                            textAlign: 'center',
                            fontWeight: 600,
                          }}
                        >
                          :
                        </td>
                        <td
                          style={{
                            border: '1px solid #0f7c0f',
                            padding: '6px 12px',
                            minWidth: '180px',
                          }}
                        >
                          <Form.Item
                            name={['coq_details', index, 'issuance_date']}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder="12 Oktober 2021" />
                          </Form.Item>
                        </td>
                      </>
                    ) : (
                      <td
                        style={{
                          border: '1px solid #0f7c0f',
                          padding: '8px 12px',
                        }}
                        colSpan={6}
                      />
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
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
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Catatan Port</div>
            <Input.TextArea
              value={portNote}
              onChange={(event) => setPortNote(event.target.value)}
              rows={3}
              placeholder="Tambahkan catatan untuk port compartment"
            />
          </div>
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
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Catatan Starboard
            </div>
            <Input.TextArea
              value={starboardNote}
              onChange={(event) => setStarboardNote(event.target.value)}
              rows={3}
              placeholder="Tambahkan catatan untuk starboard compartment"
            />
          </div>
        </Card>

        {/* Calculation Results */}
      </div>
    </Modal>
  );
};

export default ProductQCModal;
