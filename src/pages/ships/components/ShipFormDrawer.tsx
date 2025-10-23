import type { FormInstance } from 'antd';
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
} from 'antd';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {
  fetchDockReferences,
  fetchShipCargoTypes,
  fetchShipTypesReference,
} from '@/services/ships/api';
import type {
  DockReference,
  ShipCargoTypeReference,
  ShipTypeReference,
} from '@/services/ships/typings';
import { SHIP_STATUS_OPTIONS } from '../constants';
import type { ShipFormValues } from '../types';

type SelectOption = { label: string; value: number };

const dedupeOptions = (options: SelectOption[]): SelectOption[] => {
  const seen = new Set<string>();

  return options.filter((option) => {
    const key = option.value?.toString().trim();
    if (!key) {
      return false;
    }

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const normalizeName = (name?: string | null) => {
  if (typeof name !== 'string') {
    return undefined;
  }

  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const mapShipTypeOptions = (records: ShipTypeReference[]): SelectOption[] =>
  dedupeOptions(
    records
      .map((record) => {
        const name = normalizeName(record.name);
        const fallback = record.id ? `Ship Type #${record.id}` : undefined;
        const label = name ?? fallback;
        if (!label || record.id === undefined || record.id === null) {
          return undefined;
        }

        return {
          label,
          value: record.id,
        };
      })
      .filter(Boolean) as SelectOption[],
  );

const mapCargoTypeOptions = (
  records: ShipCargoTypeReference[],
): SelectOption[] =>
  dedupeOptions(
    records
      .map((record) => {
        const name = normalizeName(record.name);
        const fallback = record.id ? `Cargo Type #${record.id}` : undefined;
        const label = name ?? fallback;
        if (!label || record.id === undefined || record.id === null) {
          return undefined;
        }

        return {
          label,
          value: record.id,
        };
      })
      .filter(Boolean) as SelectOption[],
  );

const mapDockOptions = (records: DockReference[]): SelectOption[] =>
  dedupeOptions(
    records
      .map((record) => {
        const name = normalizeName(record.name);
        const fallback = record.id ? `Dock #${record.id}` : undefined;
        const label = name ?? fallback;
        if (!label || record.id === undefined || record.id === null) {
          return undefined;
        }

        return {
          label,
          value: record.id,
        };
      })
      .filter(Boolean) as SelectOption[],
  );

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
  const [shipTypeOptions, setShipTypeOptions] = useState<SelectOption[]>([]);
  const [cargoTypeOptions, setCargoTypeOptions] = useState<SelectOption[]>([]);
  const [dockOptions, setDockOptions] = useState<SelectOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isActive = true;
    const loadReferences = async () => {
      setOptionsLoading(true);
      try {
        const [typesResult, cargoResult, docksResult] =
          await Promise.allSettled([
            fetchShipTypesReference(),
            fetchShipCargoTypes(),
            fetchDockReferences(),
          ]);

        const failedResources: string[] = [];

        if (typesResult.status === 'fulfilled' && isActive) {
          const options = mapShipTypeOptions(typesResult.value);
          if (options.length > 0) {
            setShipTypeOptions(options);
          }
        } else if (typesResult.status === 'rejected') {
          failedResources.push('tipe kapal');
        }

        if (cargoResult.status === 'fulfilled' && isActive) {
          const options = mapCargoTypeOptions(cargoResult.value);
          if (options.length > 0) {
            setCargoTypeOptions(options);
          }
        } else if (cargoResult.status === 'rejected') {
          failedResources.push('jenis muatan');
        }

        if (docksResult.status === 'fulfilled' && isActive) {
          const options = mapDockOptions(docksResult.value);
          if (options.length > 0) {
            setDockOptions(options);
          }
        } else if (docksResult.status === 'rejected') {
          failedResources.push('lokasi dermaga');
        }

        if (failedResources.length > 0 && isActive) {
          message.error(
            `Gagal memuat data ${failedResources.join(
              ', ',
            )}. Silakan coba muat ulang.`,
          );
        }
      } catch (_error) {
        if (isActive) {
          message.error(
            'Gagal memuat data referensi kapal. Silakan coba muat ulang.',
          );
        }
      } finally {
        if (isActive) {
          setOptionsLoading(false);
        }
      }
    };

    loadReferences();

    return () => {
      isActive = false;
    };
  }, [open]);

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
              name="typeShipId"
              label="Tipe Kapal"
              rules={[{ required: true, message: 'Tipe kapal wajib dipilih' }]}
            >
              <Select
                placeholder="Pilih tipe kapal"
                options={shipTypeOptions}
                loading={optionsLoading}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="typeLoadId"
              label="Jenis Muatan"
              rules={[
                { required: true, message: 'Jenis muatan wajib dipilih' },
              ]}
            >
              <Select
                placeholder="Pilih jenis muatan"
                options={cargoTypeOptions}
                showSearch
                optionFilterProp="label"
                loading={optionsLoading}
              />
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
              name="dockId"
              label="Lokasi Dermaga"
              rules={[
                { required: true, message: 'Lokasi dermaga wajib dipilih' },
              ]}
            >
              <Select
                placeholder="Pilih lokasi dermaga"
                options={dockOptions}
                showSearch
                optionFilterProp="label"
                loading={optionsLoading}
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
          <Col span={8}>
            <Form.Item
              name="maximalTanki"
              label="Maksimal Tanki"
              rules={[
                {
                  type: 'number',
                  min: 0,
                  message: 'Maksimal tanki tidak boleh negatif',
                },
              ]}
            >
              <InputNumber
                placeholder="12"
                style={{ width: '100%' }}
                controls={false}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="capacity"
              label="Kapasitas (MT)"
              rules={[
                { message: 'Kapasitas wajib diisi', type: 'number' },
                {
                  type: 'number',
                  min: 1,
                  message: 'Kapasitas minimal 1 MT',
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
          <Col span={8}>
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
          <Col span={8}>
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
          <Col span={8}>
            <Form.Item
              name="phone"
              label="Nomor Telepon"
              rules={[{ required: true, message: 'Nomor telepon wajib diisi' }]}
            >
              <Input placeholder="+65-98765432" />
            </Form.Item>
          </Col>
          <Col span={8}>
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
        </Row>

        <Row gutter={16}>
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
        </Row>

        <Row gutter={16}>
          <Col span={24}>
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
