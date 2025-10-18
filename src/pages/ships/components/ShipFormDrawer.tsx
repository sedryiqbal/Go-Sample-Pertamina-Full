import type { FormInstance } from 'antd';
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
import type { FC } from 'react';
import {
  SHIP_CARGO_TYPE_OPTIONS,
  SHIP_PORT_OPTIONS,
  SHIP_STATUS_OPTIONS,
  SHIP_TYPE_OPTIONS,
} from '../constants';
import type { ShipFormValues } from '../types';

interface ShipFormDrawerProps {
  form: FormInstance<ShipFormValues>;
  open: boolean;
  submitting?: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (values: ShipFormValues) => Promise<void> | void;
}

const formItemLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
};

const ShipFormDrawer: FC<ShipFormDrawerProps> = ({
  form,
  open,
  submitting = false,
  title,
  onClose,
  onSubmit,
}) => {
  const handleFinish = async (values: ShipFormValues) => {
    await onSubmit(values);
  };

  return (
    <Drawer
      title={title}
      width={720}
      open={open}
      onClose={onClose}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>Batal</Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={submitting}
            style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
          >
            Simpan
          </Button>
        </Space>
      }
    >
      <Form<ShipFormValues>
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        {...formItemLayout}
      >
        <Row gutter={16}>
          <Col span={14}>
            <Form.Item
              name="name"
              label="Nama Kapal"
              rules={[{ required: true, message: 'Nama kapal wajib diisi' }]}
            >
              <Input placeholder="MT Commodore One" />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              name="code"
              label="Kode Kapal"
              rules={[{ required: true, message: 'Kode kapal wajib diisi' }]}
            >
              <Input placeholder="CM0001" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Tipe Kapal"
              rules={[{ required: true, message: 'Tipe kapal wajib dipilih' }]}
            >
              <Select
                placeholder="Pilih tipe kapal"
                options={SHIP_TYPE_OPTIONS}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="flag"
              label="Bendera"
              rules={[{ required: true, message: 'Bendera wajib diisi' }]}
            >
              <Input placeholder="Singapore" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="company"
              label="Perusahaan"
              rules={[{ required: true, message: 'Perusahaan wajib diisi' }]}
            >
              <Input placeholder="Maritime Oil Corp" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="captainName"
              label="Nama Kapten"
              rules={[{ required: true, message: 'Nama kapten wajib diisi' }]}
            >
              <Input placeholder="Captain Johnson" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="capacity"
              label="Kapasitas (KL)"
              rules={[
                { message: 'Kapasitas wajib diisi', type: 'number' },
                {
                  type: 'number',
                  min: 1,
                  message: 'Kapasitas minimal 1 KL',
                },
              ]}
            >
              <InputNumber
                placeholder="50000"
                style={{ width: '100%' }}
                controls={false}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="cargoType"
              label="Jenis Muatan"
              rules={[
                { required: true, message: 'Jenis muatan wajib dipilih' },
              ]}
            >
              <Select
                placeholder="Pilih jenis muatan"
                options={SHIP_CARGO_TYPE_OPTIONS}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="arrivalDate"
              label="Tanggal Kedatangan"
              rules={[
                {
                  required: true,
                  message: 'Tanggal dan waktu kedatangan wajib diisi',
                },
              ]}
            >
              <DatePicker
                showTime
                style={{ width: '100%' }}
                placeholder="Pilih tanggal kedatangan"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="operationCompletionTime" label="Selesai Operasi">
              <DatePicker
                showTime
                style={{ width: '100%' }}
                placeholder="Pilih waktu selesai operasi"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="portLocation"
              label="Lokasi Pelabuhan"
              rules={[
                { required: true, message: 'Lokasi pelabuhan wajib dipilih' },
              ]}
            >
              <Select
                placeholder="Pilih lokasi pelabuhan"
                options={SHIP_PORT_OPTIONS}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Status wajib dipilih' }]}
            >
              <Select
                placeholder="Pilih status"
                options={SHIP_STATUS_OPTIONS}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contactPerson"
              label="Contact Person"
              rules={[
                { required: true, message: 'Contact person wajib diisi' },
              ]}
            >
              <Input placeholder="John Smith" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Nomor Telepon"
              rules={[{ required: true, message: 'Nomor telepon wajib diisi' }]}
            >
              <Input placeholder="+65-98765432" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Email wajib diisi' },
                { type: 'email', message: 'Format email tidak valid' },
              ]}
            >
              <Input placeholder="contact@company.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="originPort"
              label="Pelabuhan Asal"
              rules={[
                { required: true, message: 'Pelabuhan asal wajib diisi' },
              ]}
            >
              <Input placeholder="Singapore" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="destinationPort"
              label="Pelabuhan Tujuan"
              rules={[
                { required: true, message: 'Pelabuhan tujuan wajib diisi' },
              ]}
            >
              <Input placeholder="Batam" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="notes" label="Catatan">
              <Input.TextArea
                placeholder="Informasi tambahan"
                autoSize={{ minRows: 2, maxRows: 4 }}
                showCount
                maxLength={200}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};

export default ShipFormDrawer;
