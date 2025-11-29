import { PageContainer } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useState } from 'react';

const { Title, Paragraph, Text } = Typography;

type CategoryTest = {
  id: number;
  name: string;
  isActive?: boolean;
};

type PropertyTestOption = {
  id: number;
  title: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
};

type PropertyPrice = {
  id: string;
  categoryId: number;
  categoryName: string;
  propertyTestId: number;
  propertyName: string;
  propertyDescription?: string;
  price: number;
  notes?: string;
};

type PropertyPriceFormValues = {
  categoryId?: number;
  propertyTestId?: number;
  price?: number;
  notes?: string;
};

const defaultProperties: PropertyPrice[] = [
  {
    id: 'prop-4',
    categoryId: 3,
    categoryName: 'Short Test',
    propertyTestId: 4,
    propertyName: 'Colour Sayyybolt',
    propertyDescription: 'Colour Saybolt',
    price: 180000,
    notes: 'Standar warna baseline',
  },
  {
    id: 'prop-5',
    categoryId: 3,
    categoryName: 'Short Test',
    propertyTestId: 5,
    propertyName: 'Distillation IBP',
    propertyDescription: 'Distillation IBP',
    price: 220000,
    notes: 'Wajib untuk short test',
  },
  {
    id: 'prop-6',
    categoryId: 3,
    categoryName: 'Short Test',
    propertyTestId: 6,
    propertyName: 'Distillation 10%',
    propertyDescription: 'Distillation 10%',
    price: 220000,
  },
  {
    id: 'prop-7',
    categoryId: 3,
    categoryName: 'Short Test',
    propertyTestId: 7,
    propertyName: 'Distillation 50%',
    propertyDescription: 'Distillation 50%',
    price: 220000,
  },
  {
    id: 'prop-8',
    categoryId: 3,
    categoryName: 'Short Test',
    propertyTestId: 8,
    propertyName: 'Distillation 90%',
    propertyDescription: 'Distillation 90%',
    price: 220000,
  },
  {
    id: 'prop-9',
    categoryId: 3,
    categoryName: 'Short Test',
    propertyTestId: 9,
    propertyName: 'Distillation Endpooint',
    propertyDescription: 'Distillation Endpoint',
    price: 250000,
  },
  {
    id: 'prop-10',
    categoryId: 3,
    categoryName: 'Short Test',
    propertyTestId: 10,
    propertyName: 'Distillation Residue',
    propertyDescription: 'Distillation Residue',
    price: 210000,
  },
  {
    id: 'prop-11',
    categoryId: 3,
    categoryName: 'Short Test',
    propertyTestId: 11,
    propertyName: 'Distillation Loss',
    propertyDescription: 'Distillation Loss',
    price: 210000,
  },
  {
    id: 'prop-12',
    categoryId: 3,
    categoryName: 'Short Test',
    propertyTestId: 12,
    propertyName: 'Flash Point Abel',
    propertyDescription: 'Flash Point Abel',
    price: 200000,
    notes: 'Monitoring titik nyala',
  },
  {
    id: 'prop-13',
    categoryId: 3,
    categoryName: 'Short Test',
    propertyTestId: 13,
    propertyName: 'Density at 15°C',
    propertyDescription: 'Density at 15°C',
    price: 240000,
  },
  {
    id: 'prop-14',
    categoryId: 3,
    categoryName: 'Short Test',
    propertyTestId: 14,
    propertyName: 'Freezing Point',
    propertyDescription: 'Freezing Point',
    price: 260000,
    notes: 'Khusus avtur darurat',
  },
  {
    id: 'prop-15',
    categoryId: 3,
    categoryName: 'Short Test',
    propertyTestId: 15,
    propertyName: 'FSII-P.A with SDA',
    propertyDescription: 'FSII-P.A with SDA',
    price: 230000,
  },
  {
    id: 'prop-16',
    categoryId: 3,
    categoryName: 'Short Test',
    propertyTestId: 16,
    propertyName: 'Copper Strip Corrosion (2h/100°C)',
    propertyDescription: 'Copper Strip Corrosion (2h/100°C)',
    price: 190000,
  },
  {
    id: 'prop-17',
    categoryId: 3,
    categoryName: 'Short Test',
    propertyTestId: 17,
    propertyName: 'Existent Gum (unwashed)',
    propertyDescription: 'Existent Gum (unwashed)',
    price: 200000,
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const LaboratoryHarga: React.FC = () => {
  const [properties, setProperties] = useState<PropertyPrice[]>(defaultProperties);
  const [categories, setCategories] = useState<CategoryTest[]>([]);
  const [propertyOptions, setPropertyOptions] = useState<PropertyTestOption[]>([]);
  const [propertyOptionsLoading, setPropertyOptionsLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyPrice | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | number>('all');
  const [searchValue, setSearchValue] = useState('');
  const [selectedFormCategory, setSelectedFormCategory] = useState<number | null>(null);
  const [form] = Form.useForm<PropertyPriceFormValues>();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await request('/api/CategoryTests', { method: 'GET' });
        setCategories(response?.data || []);
      } catch (error) {
        console.error('Failed to fetch Category Tests', error);
        message.error('Gagal memuat kategori test');
      }
    };

    fetchCategories();
  }, []);

  const fetchPropertyTests = async (categoryId: number) => {
    if (!categoryId) return;
    setPropertyOptions([]);
    setPropertyOptionsLoading(true);
    try {
      const response = await request(`/api/PropertyTests/by-category/${categoryId}`, {
        method: 'GET',
      });
      const options: PropertyTestOption[] =
        (response?.data || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
        })) || [];
      setPropertyOptions(options);
      return options;
    } catch (error) {
      console.error('Failed to fetch Property Tests', error);
      message.error('Gagal memuat daftar property test');
      setPropertyOptions([]);
      return [];
    } finally {
      setPropertyOptionsLoading(false);
    }
  };

  const categoryOptionsForFilter = useMemo(() => {
    if (categories.length) return categories;
    const uniqueFromData = Array.from(
      new Map(properties.map((item) => [item.categoryId, item.categoryName])).entries(),
    ).map(([id, name]) => ({ id: Number(id), name }));
    return uniqueFromData;
  }, [categories, properties]);

  const formCategoryOptions = categories.length ? categories : categoryOptionsForFilter;

  const filteredProperties = useMemo(() => {
    const keyword = searchValue.toLowerCase();
    return properties.filter((prop) => {
      const matchesCategory = selectedCategoryFilter === 'all' || prop.categoryId === selectedCategoryFilter;
      const matchesSearch =
        prop.propertyName.toLowerCase().includes(keyword) ||
        (prop.propertyDescription || '').toLowerCase().includes(keyword) ||
        (prop.notes || '').toLowerCase().includes(keyword) ||
        prop.categoryName.toLowerCase().includes(keyword);
      return matchesCategory && matchesSearch;
    });
  }, [properties, selectedCategoryFilter, searchValue]);

  const averagePrice =
    properties.reduce((acc, prop) => acc + prop.price, 0) / (properties.length || 1);
  const uniqueCategoryCount = new Set(properties.map((prop) => prop.categoryId)).size;

  const handleDelete = (record: PropertyPrice) => {
    Modal.confirm({
      title: 'Hapus Property Test',
      content: `Anda yakin ingin menghapus ${record.propertyName}?`,
      okButtonProps: { danger: true },
      okText: 'Hapus',
      cancelText: 'Batal',
      onOk: () => {
        setProperties((prev) => prev.filter((item) => item.id !== record.id));
        message.success('Harga property berhasil dihapus');
      },
    });
  };

  const resetDrawerState = () => {
    setDrawerVisible(false);
    setEditingProperty(null);
    setSelectedFormCategory(null);
    setPropertyOptions([]);
    form.resetFields();
  };

  const openDrawerForCreate = () => {
    setEditingProperty(null);
    setSelectedFormCategory(null);
    setPropertyOptions([]);
    form.resetFields();
    setDrawerVisible(true);
  };

  const openDrawerForEdit = (record: PropertyPrice) => {
    setEditingProperty(record);
    setDrawerVisible(true);
    setSelectedFormCategory(record.categoryId);
    form.setFieldsValue({
      categoryId: record.categoryId,
      propertyTestId: record.propertyTestId,
      price: record.price,
      notes: record.notes,
    });
    fetchPropertyTests(record.categoryId);
  };

  const handleCategoryChange = (value: number) => {
    setSelectedFormCategory(value);
    form.setFieldsValue({ propertyTestId: undefined });
    fetchPropertyTests(value);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const categoryInfo = categories.find((cat) => cat.id === values.categoryId);
      let propertyInfo =
        propertyOptions.find((option) => option.id === values.propertyTestId) || null;

      if (!propertyInfo && editingProperty && editingProperty.propertyTestId === values.propertyTestId) {
        propertyInfo = {
          id: editingProperty.propertyTestId,
          title: editingProperty.propertyName,
          description: editingProperty.propertyDescription,
          categoryId: editingProperty.categoryId,
          categoryName: editingProperty.categoryName,
        };
      }

      if (!propertyInfo) {
        message.error('Property test tidak valid, mohon pilih ulang');
        return;
      }

      const payload: PropertyPrice = {
        id: editingProperty ? editingProperty.id : `prop-${Date.now()}`,
        categoryId: values.categoryId!,
        categoryName: categoryInfo?.name || propertyInfo.categoryName || '-',
        propertyTestId: values.propertyTestId!,
        propertyName: propertyInfo.title,
        propertyDescription: propertyInfo.description,
        price: values.price || 0,
        notes: values.notes,
      };

      if (editingProperty) {
        setProperties((prev) => prev.map((item) => (item.id === editingProperty.id ? payload : item)));
        message.success('Harga property berhasil diperbarui');
      } else {
        setProperties((prev) => [payload, ...prev]);
        message.success('Harga property berhasil ditambahkan');
      }

      resetDrawerState();
    } catch (error) {
      // Validation handled by AntD
    }
  };

  const columns: ColumnsType<PropertyPrice> = [
    {
      title: 'Property Test',
      dataIndex: 'propertyName',
      key: 'propertyName',
      render: (_value, record) => (
        <div>
          <Text strong>{record.propertyName}</Text>
          {record.propertyDescription && (
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.propertyDescription}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 180,
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: 'Harga',
      dataIndex: 'price',
      key: 'price',
      width: 180,
      render: (value: number) => <Text strong>{formatCurrency(value)}</Text>,
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (value?: string) =>
        value ? <span style={{ color: '#595959' }}>{value}</span> : <Text type="secondary">-</Text>,
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 180,
      render: (_value, record) => (
        <Space>
          <Button size="small" type="link" onClick={() => openDrawerForEdit(record)}>
            Edit
          </Button>
          <Button size="small" danger type="link" onClick={() => handleDelete(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: 'Harga Pengujian',
        breadcrumb: {
          items: [
            { path: '/', breadcrumbName: 'Home' },
            { path: '/laboratory', breadcrumbName: 'Laboratory' },
            { path: '/laboratory/harga', breadcrumbName: 'Harga' },
          ],
        },
      }}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #f6fbff 0%, #ffffff 100%)',
              border: '1px solid #e6f4ff',
            }}
          >
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Title level={4} style={{ marginBottom: 8 }}>
                Master Harga Property Test
              </Title>
              <Paragraph style={{ marginBottom: 0 }}>
                Kelola tarif setiap parameter pengujian berdasarkan kategori yang disediakan tim QA.
                Seluruh harga akan menjadi referensi utama saat membuat quotation maupun perkiraan biaya.
              </Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card
        style={{ marginTop: 24 }}
        title="Daftar Property Test"
        extra={
          <Space wrap>
            <Input.Search
              placeholder="Cari property atau kategori..."
              allowClear
              value={searchValue}
              onSearch={(value) => setSearchValue(value)}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ width: 240 }}
            />
            <Select
              value={selectedCategoryFilter}
              style={{ width: 200 }}
              onChange={(value) => setSelectedCategoryFilter(value as 'all' | number)}
              options={[
                { value: 'all', label: 'Semua Kategori' },
                ...categoryOptionsForFilter.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
            />
            <Button type="primary" onClick={openDrawerForCreate}>
              + Tambah Property
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredProperties}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          size="middle"
        />
      </Card>

      <Drawer
        title={editingProperty ? 'Edit Harga Property' : 'Tambah Harga Property'}
        width={480}
        open={drawerVisible}
        onClose={resetDrawerState}
        destroyOnClose
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={resetDrawerState}>
              Batal
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              Simpan
            </Button>
          </div>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="categoryId"
            label="Kategori Test"
            rules={[{ required: true, message: 'Kategori wajib dipilih' }]}
          >
            <Select
              placeholder="Pilih kategori"
              options={formCategoryOptions.map((cat) => ({ value: cat.id, label: cat.name }))}
              onChange={handleCategoryChange}
            />
          </Form.Item>
          <Form.Item
            name="propertyTestId"
            label="Property Test"
            rules={[{ required: true, message: 'Property test wajib dipilih' }]}
          >
            <Select
              placeholder={
                selectedFormCategory ? 'Pilih property test' : 'Pilih kategori terlebih dahulu'
              }
              disabled={!selectedFormCategory}
              loading={propertyOptionsLoading}
              options={propertyOptions.map((option) => ({
                value: option.id,
                label: option.title,
              }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item
            name="price"
            label="Harga (IDR)"
            rules={[{ required: true, message: 'Harga wajib diisi' }]}
          >
            <InputNumber
              min={0}
              step={50000}
              style={{ width: '100%' }}
              formatter={(value) => (value ? formatCurrency(Number(value)) : '')}
              parser={(value) => {
                const numeric = Number(value?.replace(/[^0-9]/g, ''));
                return Number.isNaN(numeric) ? 0 : numeric;
              }}
            />
          </Form.Item>
          <Form.Item name="notes" label="Catatan">
            <Input.TextArea rows={3} placeholder="Isi catatan tambahan seperti kondisi khusus atau pengecualian harga" />
          </Form.Item>
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default LaboratoryHarga;
