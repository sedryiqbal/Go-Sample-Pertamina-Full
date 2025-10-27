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
} from 'antd';
import dayjs from 'dayjs';
import React from 'react';

import {
  CATEGORY_TEST_OPTIONS,
  LAB_LOCATION_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
  SHIP_OPTIONS,
  TANK_NUMBER_OPTIONS,
} from '../constants';
import type { AvailableSample, OrderType, SampleOrderRecord } from '../types';
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
}) => {
  const handleQuantityChange = (value: number | null) => {
    if (
      orderType === 'ready' &&
      selectedSample &&
      isValidQuantity(value) &&
      value! > selectedSample.quantity
    ) {
      message.warning(
        `Quantity tidak boleh melebihi stock tersedia: ${selectedSample.quantity} ${selectedSample.unit}`,
      );
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
      onClose={onClose}
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={() => form.submit()}>
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
                        {dayjs(sample.received_date).format('DD/MM/YYYY')}
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
              >
                {PRODUCT_TYPE_OPTIONS.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
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
              >
                {SHIP_OPTIONS.map((ship) => (
                  <Select.Option key={ship.value} value={ship.value}>
                    {ship.label}
                  </Select.Option>
                ))}
              </Select>
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
              >
                {TANK_NUMBER_OPTIONS.map((tank) => (
                  <Select.Option key={tank.value} value={tank.value}>
                    {tank.label}
                  </Select.Option>
                ))}
              </Select>
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
              <Select placeholder="Pilih category test">
                {CATEGORY_TEST_OPTIONS.map((test) => (
                  <Select.Option key={test.value} value={test.value}>
                    {test.label}
                  </Select.Option>
                ))}
              </Select>
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
              <Select placeholder="Pilih unit">
                <Select.Option value="botol">Botol</Select.Option>
                <Select.Option value="liter">Liter</Select.Option>
                <Select.Option value="ml">ml</Select.Option>
              </Select>
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
          <Select placeholder="Pilih lab location">
            {LAB_LOCATION_OPTIONS.map((lab) => (
              <Select.Option key={lab.value} value={lab.value}>
                <div style={{ padding: '4px 0' }}>
                  <div style={{ fontWeight: 500 }}>
                    {lab.label.split(' (')[0]}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Estimasi delivery: {lab.time} jam
                  </div>
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
                beforeUpload={() => false}
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
                beforeUpload={() => false}
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
