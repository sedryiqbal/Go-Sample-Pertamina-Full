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
  DatePicker,
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
import type { ShipTableRecord } from '@/pages/ships/types';
import { calculateDensityAt15C } from '@/services/product-qc/api';

export interface CoqDetail {
  coq_no: string;
  issuance_date: string;
}

export interface PortStarboardRecord {
  id: number;
  free_water: 'P' | 'N' | '';
  suspended_water: 'P' | 'N' | '';
  electrical_conductivity: number | null;
  temperature_observed: number | null;
  density_observed: number | null;
  density_15c: number | null;
  batch_density_15c: number | null;
  diff: number | null;
  volume_liters: number | null;
  dens_15c_x_volume: number | null;
  notes?: string | null;
}

export interface ProductQCData {
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

export interface CalculatedResults {
  total_volume_dens_15c: number;
  total_volume: number;
  expected_density: number;
  refinery_certificate_density: number;
  density_difference: number;
}

export interface ProductQCSampleData {
  arrival_date?: string;
  grade_of_product?: string;
  name_of_tanker?: string;
  refinery_terminal?: string;
  quantity_in_batch?: number;
  coq_details?: CoqDetail[];
  port_note?: string;
  starboard_note?: string;
  port_data?: Partial<PortStarboardRecord>[];
  starboard_data?: Partial<PortStarboardRecord>[];
  calculatedResults?: Partial<CalculatedResults>;
  vessel_name?: string;
  sample_type?: string;
}

export interface ProductQCModalProps {
  visible: boolean;
  onClose: () => void;
  sampleData?: ProductQCSampleData;
  onSubmit: (data: ProductQCData) => Promise<void> | void;
  viewOnly?: boolean;
  submitting?: boolean;
  shipId?: number | string | null;
  ship?: ShipTableRecord | null;
}

const DEFAULT_RECORD_LENGTH = 8;

const DEFAULT_CALCULATED_RESULTS: CalculatedResults = {
  total_volume_dens_15c: 0,
  total_volume: 0,
  expected_density: 0,
  refinery_certificate_density: 627,
  density_difference: 0,
};

const createEmptyRecord = (index: number): PortStarboardRecord => ({
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
  notes: null,
});

const normalizeRecords = (
  source?: Partial<PortStarboardRecord>[],
): PortStarboardRecord[] => {
  const prepared = (source ?? []).map((record, index) => ({
    ...createEmptyRecord(index),
    ...record,
    id:
      record?.id !== undefined && record?.id !== null
        ? Number(record.id)
        : index + 1,
  }));

  const length = Math.max(DEFAULT_RECORD_LENGTH, prepared.length);

  return Array.from({ length }, (_, index) => {
    const existing = prepared[index];
    if (existing) {
      return {
        ...createEmptyRecord(index),
        ...existing,
        id: existing.id ?? index + 1,
      };
    }
    return createEmptyRecord(index);
  });
};

const computeTotals = (
  portRecords: PortStarboardRecord[],
  starboardRecords: PortStarboardRecord[],
  refineryCertificateDensity: number,
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

  return {
    total_volume_dens_15c: Math.round(totalVolumeDens15C * 1000) / 1000,
    total_volume: Math.round(totalVolume * 1000) / 1000,
    expected_density: Math.round(expectedDensity * 10) / 10,
    density_difference:
      Math.round(Math.abs(expectedDensity - refineryCertificateDensity) * 10) /
      10,
  };
};

const ProductQCModal: React.FC<ProductQCModalProps> = ({
  visible,
  onClose,
  sampleData,
  onSubmit,
  viewOnly = false,
  submitting = false,
}) => {
  const [form] = Form.useForm();
  const [portData, setPortData] = useState<PortStarboardRecord[]>([]);
  const [starboardData, setStarboardData] = useState<PortStarboardRecord[]>([]);
  const [portNote, setPortNote] = useState('');
  const [starboardNote, setStarboardNote] = useState('');
  const [calculatedResults, setCalculatedResults] = useState<CalculatedResults>(
    () => ({ ...DEFAULT_CALCULATED_RESULTS }),
  );
  const isViewOnly = viewOnly ?? false;
  const [calculatingDensityKey, setCalculatingDensityKey] = useState<
    string | null
  >(null);

  // Initialize empty records for Port and Starboard
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setCalculatingDensityKey(null);

      const initialPortRecords = normalizeRecords(sampleData?.port_data);
      const initialStarboardRecords = normalizeRecords(
        sampleData?.starboard_data,
      );

      setPortData(initialPortRecords);
      setStarboardData(initialStarboardRecords);
      setPortNote(sampleData?.port_note || '');
      setStarboardNote(sampleData?.starboard_note || '');

      const arrivalSource = sampleData?.arrival_date;
      const arrivalDateValue =
        arrivalSource && dayjs(arrivalSource).isValid()
          ? dayjs(arrivalSource)
          : dayjs();

      const coqDetails = Array.from({ length: 4 }, (_, idx) => {
        const issuanceSource = sampleData?.coq_details?.[idx]?.issuance_date;
        const issuanceDate =
          issuanceSource && dayjs(issuanceSource).isValid()
            ? dayjs(issuanceSource)
            : undefined;

        return {
          coq_no: sampleData?.coq_details?.[idx]?.coq_no || '',
          issuance_date: issuanceDate || (idx === 0 ? dayjs() : undefined),
        };
      });

      const defaultValues = {
        arrival_date: arrivalDateValue,
        grade_of_product:
          sampleData?.grade_of_product ?? sampleData?.sample_type ?? undefined,
        name_of_tanker:
          sampleData?.name_of_tanker ??
          (sampleData?.vessel_name
            ? `${sampleData.vessel_name}`
            : undefined),
        refinery_terminal: sampleData?.refinery_terminal ?? undefined,
        quantity_in_batch:
          sampleData?.quantity_in_batch !== undefined
            ? sampleData.quantity_in_batch
            : undefined,
        coq_details: coqDetails,
      };

      form.setFieldsValue(defaultValues);

      const baseResults: CalculatedResults = {
        ...DEFAULT_CALCULATED_RESULTS,
        ...sampleData?.calculatedResults,
      };

      const totals = computeTotals(
        initialPortRecords,
        initialStarboardRecords,
        baseResults.refinery_certificate_density,
      );

      setCalculatedResults({
        ...baseResults,
        ...totals,
      });
    }
  }, [visible, sampleData, form]);

  // Handle API call for Density @ 15°C
  const handleCalculateDensity15C = async (
    type: 'port' | 'starboard',
    index: number,
  ) => {
    if (isViewOnly || submitting) {
      return;
    }

    const currentData = type === 'port' ? portData : starboardData;
    const record = currentData[index];

    if (!record.temperature_observed || !record.density_observed) {
      message.warning('Please input Temperature and Density Observed first!');
      return;
    }

    const operationKey = `${type}-${index}`;

    try {
      setCalculatingDensityKey(operationKey);
      const density15C = await calculateDensityAt15C({
        temperatureObserved: Number(record.temperature_observed),
        densityObserved: Number(record.density_observed),
      });

      // Update the record with calculated value
      updateRecord(type, index, 'density_15c', density15C);
      message.success('Density @ 15°C berhasil dihitung');
    } catch (_error) {
      const errorMessage =
        _error instanceof Error
          ? _error.message
          : 'Failed to calculate Density @ 15°C';
      message.error(errorMessage);
    } finally {
      setCalculatingDensityKey((current) =>
        current === operationKey ? null : current,
      );
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
    setCalculatedResults((prev) => {
      const totals = computeTotals(
        portRecords,
        starboardRecords,
        prev.refinery_certificate_density,
      );

      return {
        ...prev,
        ...totals,
      };
    });
  };

  // Table columns for Port/Starboard data
  const getTableColumns = (
    type: 'port' | 'starboard',
    readOnly: boolean,
  ): ColumnsType<PortStarboardRecord> => [
      {
        title: type === 'port' ? 'PORT' : 'STARBOARD',
        dataIndex: 'id',
        key: 'id',
        width: 80,
        align: 'center',
        render: (_id, _record, index) => <strong>{index + 1}</strong>,
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
                disabled={readOnly}
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
                disabled={readOnly}
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
            disabled={readOnly}
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
            disabled={readOnly}
            onChange={(value) =>
              updateRecord(type, index, 'temperature_observed', value)
            }
            placeholder="Enter temp"
            style={{ width: '100%' }}
            precision={0}
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
            disabled={readOnly}
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
              disabled={
                readOnly ||
                !record.temperature_observed ||
                !record.density_observed ||
                calculatingDensityKey === `${type}-${index}`
              }
              loading={calculatingDensityKey === `${type}-${index}`}
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
            disabled={readOnly}
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
    if (submitting) {
      return;
    }

    try {
      const formValues = await form.validateFields();

      const arrivalDateValue = formValues.arrival_date;
      const arrivalDateIso = arrivalDateValue
        ? dayjs.isDayjs(arrivalDateValue)
          ? arrivalDateValue.toISOString()
          : dayjs(arrivalDateValue).isValid()
            ? dayjs(arrivalDateValue).toISOString()
            : ''
        : '';

      const coqDetails: CoqDetail[] = Array.from({ length: 4 }, (_, idx) => {
        const issuanceValue = formValues?.coq_details?.[idx]?.issuance_date;
        const issuanceIso = issuanceValue
          ? dayjs.isDayjs(issuanceValue)
            ? issuanceValue.toISOString()
            : dayjs(issuanceValue).isValid()
              ? dayjs(issuanceValue).toISOString()
              : ''
          : '';

        return {
          coq_no: formValues?.coq_details?.[idx]?.coq_no || '',
          issuance_date: issuanceIso,
        };
      });

      const productQCData: ProductQCData & {
        calculatedResults?: typeof calculatedResults;
      } = {
        name_of_tanker: formValues.name_of_tanker || '',
        arrival_date: arrivalDateIso,
        quantity_in_batch: Number(formValues.quantity_in_batch ?? 0),
        refinery_terminal: formValues.refinery_terminal || '',
        grade_of_product: formValues.grade_of_product || '',
        coq_details: coqDetails,
        port_data: portData,
        starboard_data: starboardData,
        port_note: portNote,
        starboard_note: starboardNote,
        calculatedResults,
      };

      await onSubmit(productQCData);
      onClose();
    } catch (error: any) {
      if (error?.errorFields) {
        message.error('Please fill in all required fields');
        return;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menyimpan Product QC';
      message.error(errorMessage);
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
      footer={
        [
          <Button
            key="cancel"
            onClick={onClose}
            icon={<CloseOutlined />}
            disabled={submitting}
          >
            {isViewOnly ? 'Tutup' : 'Cancel'}
          </Button>,
          !isViewOnly ? (
            <Button
              key="submit"
              type="primary"
              onClick={handleSubmit}
              icon={<SaveOutlined />}
              loading={submitting}
              disabled={submitting}
            >
              Save Product QC
            </Button>
          ) : null,
        ].filter(Boolean) as React.ReactNode[]
      }
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
          <Form
            form={form}
            layout="vertical"
            disabled={isViewOnly || submitting}
          >
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
                    render: () => (
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD MMM YYYY"
                        placeholder="Pilih tanggal kedatangan"
                      />
                    ),
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
                            <Input
                              placeholder={
                                isViewOnly
                                  ? undefined
                                  : 'COQ-0221/KPI47210/2021-S2'
                              }
                            />
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
                            <DatePicker
                              style={{ width: '100%' }}
                              format="DD MMM YYYY"
                              placeholder="Pilih tanggal"
                              allowClear
                            />
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
            columns={getTableColumns('port', isViewOnly || submitting)}
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
              disabled={isViewOnly || submitting}
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
            columns={getTableColumns('starboard', isViewOnly || submitting)}
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
              disabled={isViewOnly || submitting}
            />
          </div>
        </Card>

        {/* Calculation Results */}
      </div>
    </Modal>
  );
};

export default ProductQCModal;

export type {
  ProductQCData,
  PortStarboardRecord,
  ProductQCSampleData,
  CalculatedResults,
};
