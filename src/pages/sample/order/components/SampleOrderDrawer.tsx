import { FileTextOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Drawer,
  Form,
  type FormInstance,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Tag,
  Upload,
  type UploadProps,
} from 'antd';
import dayjs from 'dayjs';
import React from 'react';

import type {
  AvailableSample,
  OrderType,
  SampleOrderRecord,
  SelectOption,
} from '../types';
import {
  getSampleStatusColor,
  getSampleStatusLabel,
  isValidQuantity,
} from '../utils';

interface SampleOrderDrawerProps {
  orderType: OrderType;
  open: boolean;
  form: FormInstance;
  availableSamples: AvailableSample[];
  selectedSample: AvailableSample | null;
  editingRecord?: SampleOrderRecord;
  onClose: () => void;
  onSubmit: (values: any) => void;
  onSelectSample: (sampleId: string) => void;
  productOptions: SelectOption[];
  categoryTestOptions: SelectOption[];
  shipOptions: SelectOption[];
  tankOptions: SelectOption[];
  labOptions: SelectOption[];
  unitOptions: SelectOption[];
  optionsLoading?: boolean;
  submitting?: boolean;
  onUploadFile: (file: File) => Promise<string>;
}

const SampleOrderDrawer: React.FC<SampleOrderDrawerProps> = ({
  orderType,
  open,
  form,
  availableSamples,
  selectedSample,
  editingRecord,
  onClose,
  onSubmit,
  onSelectSample,
  productOptions,
  categoryTestOptions,
  shipOptions,
  tankOptions,
  labOptions,
  unitOptions,
  optionsLoading = false,
  submitting = false,
  onUploadFile,
}) => {
  const handleQuantityChange = (value: number | null) => {
    if (
      orderType === 'ready' &&
      selectedSample &&
      isValidQuantity(value) &&
      value > selectedSample.quantity
    ) {
      message.warning(
        `Quantity tidak boleh melebihi stock tersedia: ${selectedSample.quantity} ${selectedSample.unit}`,
      );
    }
  };

  const handleUploadRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    const uploadFile = file as File & { url?: string };
    const hide = message.loading('Mengunggah file...', 0);

    try {
      const fileUrl = await onUploadFile(uploadFile);
      hide();
      uploadFile.url = fileUrl;
      message.success('File berhasil diunggah.');
      onSuccess?.({ fileUrl }, uploadFile);
    } catch (error) {
      hide();
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Upload file gagal. Mohon coba kembali.';
      message.error(errorMessage);
      onError?.(error as Error);
    }
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {editingRecord ? (
            <span>
              Edit {orderType === 'ready' ? 'Ready' : 'Request'} Order
            </span>
          ) : (
            <span>
              Create {orderType === 'ready' ? 'Ready' : 'Request'} Order
            </span>
          )}
        </div>
      }
      width={800}
      open={open}
      onClose={() => {
        if (!submitting) {
          onClose();
        }
      }}
      maskClosable={!submitting}
      extra={
        <Space>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={submitting}
            disabled={submitting}
          >
            Save Order
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        {orderType === 'ready' && availableSamples.length > 0 && (
          <>
            <Alert
              message="Pilih Sample dari Estimasi"
              description="Pilih sample yang tersedia dari data estimasi untuk membuat order:"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form.Item
              name="selected_sample_id"
              label="Pilih Sample Tersedia"
              rules={[{ required: true, message: 'Sample wajib dipilih' }]}
            >
              <Select
                placeholder="Pilih sample dari estimasi..."
                onChange={onSelectSample}
                optionLabelProp="label"
                size="large"
                loading={optionsLoading}
              >
                {availableSamples.map((sample) => (
                  <Select.Option
                    key={sample.id}
                    value={sample.id}
                    label={`${sample.sample_type} - ${sample.vessel_name}`}
                  >
                    <div style={{ padding: '8px 0' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <Space>
                            <span style={{ fontWeight: 600 }}>
                              {sample.sample_type}
                            </span>
                            <span style={{ color: '#666' }}>
                              • {sample.vessel_name}
                            </span>
                          </Space>
                        </div>
                        <Tag color={getSampleStatusColor(sample.status)}>
                          {getSampleStatusLabel(sample.status)}
                        </Tag>
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#666',
                          marginLeft: 0,
                        }}
                      >
                        {sample.tank_number} • {sample.quantity} {sample.unit} •{' '}
                        {sample.location}
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#666',
                          marginLeft: 0,
                        }}
                      >
                        Received:{' '}
                        {sample.received_date
                          ? dayjs(sample.received_date).format('DD/MM/YYYY')
                          : '-'}
                      </div>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {selectedSample && (
              <Card
                size="small"
                title="Detail Sample Terpilih"
                style={{
                  marginBottom: 16,
                  background: '#f6ffed',
                  border: '1px solid #b7eb8f',
                }}
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <div>
                      <strong>Product:</strong> {selectedSample.sample_type}
                    </div>
                    <div>
                      <strong>Vessel:</strong> {selectedSample.vessel_name}
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      <strong>Tank:</strong> {selectedSample.tank_number}
                    </div>
                    <div>
                      <strong>Location:</strong> {selectedSample.location}
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      <strong>Available:</strong> {selectedSample.quantity}{' '}
                      {selectedSample.unit}
                    </div>
                    <div>
                      <strong>Status:</strong>
                      <Tag
                        color={getSampleStatusColor(selectedSample.status)}
                        style={{ marginLeft: 4 }}
                      >
                        {getSampleStatusLabel(selectedSample.status)}
                      </Tag>
                    </div>
                  </Col>
                </Row>
              </Card>
            )}

            <Divider orientation="left">Detail Order</Divider>
          </>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="order_date"
              label="Tanggal Order"
              rules={[{ required: true, message: 'Tanggal order wajib diisi' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Pilih tanggal order"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="npc_number"
              label="Nomor NPC"
              rules={[{ required: true, message: 'Nomor NPC wajib diisi' }]}
              tooltip="Nomor NPC (Notification of Product Control)"
            >
              <Input placeholder="227/NPC/SKH/2025" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="sample_type"
              label="Jenis Product"
              rules={[
                { required: true, message: 'Jenis product wajib dipilih' },
              ]}
            >
              <Select
                placeholder="Pilih jenis product"
                disabled={orderType === 'ready' && !!selectedSample}
                showSearch
                options={productOptions}
                loading={optionsLoading}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="vessel_name"
              label="Kapal"
              rules={[{ required: true, message: 'Kapal wajib dipilih' }]}
            >
              <Select
                placeholder="Pilih kapal"
                disabled={orderType === 'ready' && !!selectedSample}
                showSearch
                options={shipOptions}
                loading={optionsLoading}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="tank_number"
              label="Nomor Tangki"
              rules={[
                { required: true, message: 'Nomor tangki wajib dipilih' },
              ]}
            >
              <Select
                placeholder="Pilih nomor tangki"
                disabled={orderType === 'ready' && !!selectedSample}
                showSearch
                options={tankOptions}
                loading={optionsLoading}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category_test"
              label="Category Test"
              rules={[
                { required: true, message: 'Category test wajib dipilih' },
              ]}
            >
              <Select
                placeholder="Pilih category test"
                showSearch
                options={categoryTestOptions}
                loading={optionsLoading}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[
                { required: true, message: 'Quantity wajib diisi' },
                ...(orderType === 'ready' && selectedSample
                  ? [
                      {
                        validator: (_: any, value: number) => {
                          if (
                            isValidQuantity(value) &&
                            value > selectedSample.quantity
                          ) {
                            return Promise.reject(
                              new Error(
                                `Quantity tidak boleh melebihi stock tersedia (${selectedSample.quantity} ${selectedSample.unit})`,
                              ),
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]
                  : []),
              ]}
              extra={
                orderType === 'ready' && selectedSample ? (
                  <span style={{ color: '#52c41a' }}>
                    Max: {selectedSample.quantity} {selectedSample.unit} (dari
                    stock tersedia)
                  </span>
                ) : undefined
              }
            >
              <InputNumber
                min={1}
                max={
                  orderType === 'ready' && selectedSample
                    ? selectedSample.quantity
                    : undefined
                }
                placeholder="Masukkan jumlah"
                style={{ width: '100%' }}
                onChange={handleQuantityChange}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="unit"
              label="Unit"
              rules={[{ required: true, message: 'Unit wajib dipilih' }]}
            >
              <Select
                placeholder="Pilih unit"
                showSearch
                options={unitOptions}
                loading={optionsLoading}
                filterOption={(input, option) =>
                  (option?.label ?? '')
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="priority"
              label="Priority"
              rules={[{ required: true, message: 'Priority wajib dipilih' }]}
            >
              <Select placeholder="Pilih priority">
                <Select.Option value="normal">
                  <Tag color="blue">Normal</Tag>
                </Select.Option>
                <Select.Option value="urgent">
                  <Tag color="red">Urgent</Tag>
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="lab_location"
          label="Lab Location"
          rules={[{ required: true, message: 'Lab location wajib dipilih' }]}
          tooltip="Pilih laboratorium tujuan untuk pengujian sample"
        >
          <Select
            placeholder="Pilih lab location"
            showSearch
            optionLabelProp="label"
            loading={optionsLoading}
            filterOption={(input, option) =>
              (option?.label ?? '')
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {labOptions.map((lab) => (
              <Select.Option
                key={lab.value}
                value={lab.value}
                label={lab.label}
              >
                <div style={{ padding: '4px 0' }}>
                  <div style={{ fontWeight: 500 }}>{lab.label}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Estimasi delivery:{' '}
                    {lab.meta?.time ? `${lab.meta.time} jam` : '-'}
                  </div>
                  {lab.meta?.description && (
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {lab.meta.description}
                    </div>
                  )}
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="estimated_arrival"
          label="Estimated Arrival"
          rules={[{ required: true, message: 'Estimated arrival wajib diisi' }]}
          tooltip={
            orderType === 'ready'
              ? 'Perkiraan waktu kedatangan sample ke laboratorium'
              : 'Perkiraan waktu kedatangan sample yang di-request'
          }
        >
          <DatePicker
            showTime
            style={{ width: '100%' }}
            placeholder="Pilih waktu perkiraan kedatangan"
            format="DD/MM/YYYY HH:mm"
          />
        </Form.Item>

        {orderType === 'request' && (
          <>
            <Divider orientation="left">Detail Request</Divider>

            <Alert
              message="Request Order Information"
              description="Request order digunakan untuk meminta sample baru yang belum tersedia di estimasi"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </>
        )}

        <Divider orientation="left">Upload Documents</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="photo_sample"
              label="Photo Sample"
              tooltip="Upload foto sample untuk dokumentasi"
            >
              <Upload
                listType="picture-card"
                maxCount={3}
                accept="image/*"
                customRequest={handleUploadRequest}
                disabled={submitting || optionsLoading}
              >
                <div style={{ textAlign: 'center' }}>
                  <UploadOutlined style={{ fontSize: 20, color: '#666' }} />
                  <div style={{ marginTop: 8, fontSize: '12px' }}>
                    Upload Photo
                  </div>
                </div>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="memo_file"
              label="Memo File"
              tooltip="Upload memo atau dokumen pendukung"
            >
              <Upload
                maxCount={2}
                accept=".pdf,.doc,.docx"
                customRequest={handleUploadRequest}
                disabled={submitting || optionsLoading}
              >
                <Button
                  icon={<FileTextOutlined />}
                  style={{
                    width: '100%',
                    height: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div>Upload Memo</div>
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    PDF, DOC, DOCX
                  </div>
                </Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="notes"
          label="Notes"
          tooltip="Catatan tambahan untuk order ini"
        >
          <Input.TextArea
            rows={4}
            placeholder="Catatan tambahan untuk order ini..."
            style={{ resize: 'none' }}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default SampleOrderDrawer;
