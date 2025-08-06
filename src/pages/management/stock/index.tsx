import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Tag, Space, Modal, Form, Input, InputNumber, Select, DatePicker, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';

interface StockItem {
  id: string;
  productType: string;
  category: string;
  shipName: string;
  compartment: string;
  quantity: number;
  unit: string;
  estimatedDate: string;
  status: 'available' | 'limited' | 'empty';
  createdAt: string;
}

const StockManagement: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);

  const columns: ProColumns<StockItem>[] = [
    {
      title: 'Jenis Produk',
      dataIndex: 'productType',
      key: 'productType',
      valueEnum: {
        'jet-a1': { text: 'JET A-1', status: 'Processing' },
        'avgas': { text: 'Avgas', status: 'Success' },
        'diesel': { text: 'Diesel', status: 'Warning' },
      },
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Nama Kapal',
      dataIndex: 'shipName',
      key: 'shipName',
      sorter: true,
    },
    {
      title: 'Kompartemen',
      dataIndex: 'compartment',
      key: 'compartment',
    },
    {
      title: 'Jumlah',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (_, record) => `${record.quantity} ${record.unit}`,
      sorter: true,
    },
    {
      title: 'Estimasi Tanggal',
      dataIndex: 'estimatedDate',
      key: 'estimatedDate',
      valueType: 'date',
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        const statusConfig = {
          available: { color: 'green', text: 'Tersedia' },
          limited: { color: 'orange', text: 'Terbatas' },
          empty: { color: 'red', text: 'Kosong' },
        };
        const config = statusConfig[record.status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Tanggal Dibuat',
      dataIndex: 'createdAt',
      key: 'createdAt',
      valueType: 'date',
      sorter: true,
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const handleEdit = (stock: StockItem) => {
    setEditingStock(stock);
    form.setFieldsValue({
      ...stock,
      estimatedDate: stock.estimatedDate,
    });
    setModalVisible(true);
  };

  const handleDelete = (stock: StockItem) => {
    Modal.confirm({
      title: 'Hapus Stock',
      content: `Apakah Anda yakin ingin menghapus stock ${stock.productType} dari ${stock.shipName}?`,
      onOk: async () => {
        message.success('Stock berhasil dihapus');
        actionRef.current?.reload();
      },
    });
  };

  const handleModalOk = async () => {
    try {
      await form.validateFields();
      if (editingStock) {
        message.success('Stock berhasil diperbarui');
      } else {
        message.success('Stock berhasil ditambahkan');
      }
      setModalVisible(false);
      setEditingStock(null);
      form.resetFields();
      actionRef.current?.reload();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingStock(null);
    form.resetFields();
  };

  // Mock data request
  const fetchStocks = async () => {
    const mockStocks: StockItem[] = [
      {
        id: '1',
        productType: 'jet-a1',
        category: 'Aviation Fuel',
        shipName: 'MT. Commodore One',
        compartment: 'T.107',
        quantity: 5000,
        unit: 'Liter',
        estimatedDate: '2025-08-08',
        status: 'available',
        createdAt: '2025-08-06',
      },
      {
        id: '2',
        productType: 'avgas',
        category: 'Aviation Gasoline',
        shipName: 'MT. Pioneer',
        compartment: 'T.205',
        quantity: 1500,
        unit: 'Liter',
        estimatedDate: '2025-08-07',
        status: 'limited',
        createdAt: '2025-08-05',
      },
      {
        id: '3',
        productType: 'jet-a1',
        category: 'Aviation Fuel',
        shipName: 'MT. Explorer',
        compartment: 'T.301',
        quantity: 0,
        unit: 'Liter',
        estimatedDate: '2025-08-09',
        status: 'empty',
        createdAt: '2025-08-04',
      },
    ];

    return {
      data: mockStocks,
      success: true,
      total: mockStocks.length,
    };
  };

  return (
    <PageContainer
      title="Manajemen Stock"
      content="Kelola inventaris dan estimasi ketersediaan stock sampel"
    >
      <ProTable<StockItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={fetchStocks}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle="Daftar Stock"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
            type="primary"
          >
            Tambah Stock
          </Button>,
        ]}
      />

      <Modal
        title={editingStock ? 'Edit Stock' : 'Tambah Stock'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'available',
            unit: 'Liter',
            productType: 'jet-a1',
          }}
        >
          <Form.Item
            name="productType"
            label="Jenis Produk"
            rules={[{ required: true, message: 'Jenis produk wajib dipilih' }]}
          >
            <Select placeholder="Pilih jenis produk">
              <Select.Option value="jet-a1">JET A-1</Select.Option>
              <Select.Option value="avgas">Avgas</Select.Option>
              <Select.Option value="diesel">Diesel</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label="Kategori"
            rules={[{ required: true, message: 'Kategori wajib diisi' }]}
          >
            <Input placeholder="Masukkan kategori produk" />
          </Form.Item>

          <Form.Item
            name="shipName"
            label="Nama Kapal"
            rules={[{ required: true, message: 'Nama kapal wajib diisi' }]}
          >
            <Input placeholder="Masukkan nama kapal" />
          </Form.Item>

          <Form.Item
            name="compartment"
            label="Kompartemen"
            rules={[{ required: true, message: 'Kompartemen wajib diisi' }]}
          >
            <Input placeholder="Masukkan nomor kompartemen" />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Jumlah"
            rules={[{ required: true, message: 'Jumlah wajib diisi' }]}
          >
            <InputNumber 
              style={{ width: '100%' }}
              placeholder="Masukkan jumlah"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="unit"
            label="Satuan"
            rules={[{ required: true, message: 'Satuan wajib dipilih' }]}
          >
            <Select placeholder="Pilih satuan">
              <Select.Option value="Liter">Liter</Select.Option>
              <Select.Option value="Gallon">Gallon</Select.Option>
              <Select.Option value="Barrel">Barrel</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="estimatedDate"
            label="Estimasi Tanggal"
            rules={[{ required: true, message: 'Estimasi tanggal wajib diisi' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              placeholder="Pilih estimasi tanggal"
              suffixIcon={<CalendarOutlined style={{ color: '#fd0017' }} />}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Status wajib dipilih' }]}
          >
            <Select placeholder="Pilih status">
              <Select.Option value="available">Tersedia</Select.Option>
              <Select.Option value="limited">Terbatas</Select.Option>
              <Select.Option value="empty">Kosong</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default StockManagement;
