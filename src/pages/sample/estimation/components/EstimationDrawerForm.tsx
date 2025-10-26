import type { FormInstance, SelectProps } from 'antd';
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
} from 'antd';
import type { Dayjs } from 'dayjs';
import React from 'react';

interface FormValues {
  typeLoadId: number;
  shipId: number;
  nomorTanki: number;
  qty: number;
  satuanId: number;
  etaReceivedAt: Dayjs;
  status: string;
  note?: string;
}

interface Props {
  form: FormInstance<FormValues>;
  open: boolean;
  isEditing: boolean;
  submitting: boolean;
  dropdownLoading: boolean;
  productOptions: SelectProps['options'];
  shipOptions: SelectProps['options'];
  tankOptions: SelectProps['options'];
  unitOptions: SelectProps['options'];
  statusOptions: SelectProps['options'];
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}

export const EstimationDrawerForm: React.FC<Props> = ({
  form,
  open,
  isEditing,
  submitting,
  dropdownLoading,
  productOptions,
  shipOptions,
  tankOptions,
  unitOptions,
  statusOptions,
  onClose,
  onSubmit,
}) => (
  <Drawer
    title={isEditing ? 'Edit Estimasi Sample' : 'Tambah Estimasi Sample Baru'}
    width={600}
    open={open}
    onClose={onClose}
    extra={
      <Space>
        <Button onClick={onClose}>Batal</Button>
        <Button
          type="primary"
          onClick={() => form.submit()}
          loading={submitting}
          style={{
            backgroundColor: '#fd0017',
            borderColor: '#fd0017',
          }}
        >
          Simpan
        </Button>
      </Space>
    }
  >
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <Form.Item
        name="typeLoadId"
        label="Jenis Product"
        rules={[
          {
            required: true,
            message: 'Jenis product wajib dipilih',
          },
        ]}
      >
        <Select
          placeholder="Pilih jenis product"
          options={productOptions}
          loading={dropdownLoading}
          allowClear
          showSearch
          optionFilterProp="label"
        />
      </Form.Item>

      <Form.Item
        name="shipId"
        label="Kapal"
        rules={[{ required: true, message: 'Kapal wajib dipilih' }]}
      >
        <Select
          placeholder="Pilih kapal"
          options={shipOptions}
          loading={dropdownLoading}
          allowClear
          showSearch
          optionFilterProp="label"
        />
      </Form.Item>

      <Form.Item
        name="nomorTanki"
        label="Nomor Tangki"
        rules={[
          {
            required: true,
            message: 'Nomor tangki wajib dipilih',
          },
        ]}
      >
        <Select
          placeholder="Pilih nomor tangki"
          options={tankOptions}
          loading={dropdownLoading}
          allowClear
          showSearch
          optionFilterProp="label"
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="qty"
            label="Kuantitas"
            rules={[
              {
                required: true,
                message: 'Kuantitas wajib diisi',
              },
            ]}
          >
            <InputNumber min={0} placeholder="25" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="satuanId"
            label="Satuan"
            rules={[{ required: true, message: 'Satuan wajib diisi' }]}
          >
            <Select
              placeholder="Pilih satuan"
              options={unitOptions}
              allowClear
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="etaReceivedAt"
        label="Tanggal Diterima"
        rules={[
          {
            required: true,
            message: 'Tanggal diterima wajib diisi',
          },
        ]}
      >
        <DatePicker
          style={{ width: '100%' }}
          showTime
          format="DD/MM/YYYY HH:mm"
        />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: 'Status wajib dipilih' }]}
      >
        <Select
          placeholder="Pilih status"
          options={statusOptions}
          allowClear
          showSearch
          optionFilterProp="label"
        />
      </Form.Item>

      <Form.Item name="note" label="Catatan">
        <Input.TextArea
          rows={3}
          placeholder="Catatan tambahan mengenai estimasi sample..."
        />
      </Form.Item>
    </Form>
  </Drawer>
);

export default EstimationDrawerForm;
export type { FormValues as EstimationFormValues };
