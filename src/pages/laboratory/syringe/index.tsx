import { DatabaseOutlined, SaveOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Spin,
  Statistic,
  message,
} from 'antd';
import { createStyles } from 'antd-style';
import type { Dayjs } from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { TablePaginationConfig } from 'antd/es/table';
import {
  getSyringeStock,
  getSyringeAuditLogs,
  updateSyringeStockQuantity,
  type SyringeAuditLogQuery,
  type SyringeAuditLogResult,
  type SyringeStockItem,
} from '@/services/syringe/api';

const { RangePicker } = DatePicker;

type SyringeStatus = 'normal' | 'low' | 'urgent' | 'full';

const useStyles = createStyles(({ token }) => ({
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
  },
  stockInput: {
    width: '100%',
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  cardHover: {
    '&:hover': {
      boxShadow: token.boxShadowTertiary,
      borderColor: token.colorPrimary,
    },
  },
}));

const normalizeStatus = (status?: string): SyringeStatus => {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'low') return 'low';
  if (normalized === 'urgent' || normalized === 'critical') return 'urgent';
  if (normalized === 'full' || normalized === 'high') return 'full';
  return 'normal';
};

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const LaboratorySyringe: React.FC = () => {
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const [currentStock, setCurrentStock] = useState(0);
  const [auditFilters, setAuditFilters] = useState<SyringeAuditLogQuery>({
    page: 1,
    pageSize: 10,
  });
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  const {
    data: syringeData,
    loading: syringeLoading,
    refresh: refreshSyringe,
    refreshAsync: refreshSyringeAsync,
  } = useRequest<SyringeStockItem>(getSyringeStock, {
    formatResult: (result) => result,
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Gagal memuat data stock syringe';
      message.error(errorMessage);
    },
  });

  const {
    data: auditLogData,
    loading: auditLoading,
    run: runAuditLogs,
    runAsync: runAuditLogsAsync,
  } = useRequest<SyringeAuditLogResult, [SyringeAuditLogQuery]>(
    (filters) => getSyringeAuditLogs(filters),
    {
      manual: true,
      formatResult: (result) => result,
    },
  );

  const {
    runAsync: runUpdateStockAsync,
    run: runUpdateStock,
    loading: updatingStock,
  } = useRequest(
    async (params: {
      syringeId: number | string;
      newStockAmount: number;
      notes?: string;
    }) => {
      const { syringeId, newStockAmount, notes } = params;
      await updateSyringeStockQuantity(syringeId, { newStockAmount, notes });
    },
    { manual: true },
  );

  const refreshSyringeData = useCallback(async () => {
    const refresher =
      typeof refreshSyringeAsync === 'function'
        ? refreshSyringeAsync
        : refreshSyringe;
    if (typeof refresher === 'function') {
      await refresher();
    }
  }, [refreshSyringe, refreshSyringeAsync]);

  const fetchAuditLogs = useCallback(
    (filters: SyringeAuditLogQuery) => {
      const runner =
        typeof runAuditLogsAsync === 'function' ? runAuditLogsAsync : runAuditLogs;
      if (!runner) return Promise.resolve(undefined);
      return runner(filters);
    },
    [runAuditLogs, runAuditLogsAsync],
  );

  useEffect(() => {
    if (syringeData) {
      setCurrentStock(syringeData.currentStock);
      form.setFieldsValue({
        currentStock: syringeData.currentStock,
      });
      setAuditFilters((prev) => ({
        ...prev,
        syringeId: syringeData.id ?? syringeData.unitId,
      }));
    }
  }, [syringeData, form]);

  useEffect(() => {
    fetchAuditLogs(auditFilters);
  }, [auditFilters, fetchAuditLogs]);

  const getStatusColor = (status?: string) => {
    switch (normalizeStatus(status)) {
      case 'normal':
        return '#52c41a';
      case 'low':
        return '#faad14';
      case 'urgent':
        return '#ff4d4f';
      case 'full':
        return '#1890ff';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusText = (status?: string) => {
    switch (normalizeStatus(status)) {
      case 'normal':
        return 'Normal';
      case 'low':
        return 'Stock Rendah';
      case 'urgent':
        return 'Mendesak';
      case 'full':
        return 'Penuh';
      default:
        return 'Tidak Diketahui';
    }
  };

  const getStockStatus = (stock: number): SyringeStatus => {
    if (!syringeData) return 'normal';
    const capacity = syringeData.maxCapacity;
    const threshold = syringeData.minThreshold;
    if (!capacity) return 'normal';
    if (stock >= capacity * 0.9) return 'full';
    if (stock <= threshold) return 'urgent';
    if (stock <= threshold * 1.5) return 'low';
    return 'normal';
  };

  const getStockPercentage = () => {
    if (!syringeData?.maxCapacity) return 0;
    return Math.round((currentStock / syringeData.maxCapacity) * 100);
  };

  const auditLogs = useMemo(() => auditLogData?.data ?? [], [auditLogData]);
  const auditPagination = auditLogData?.pagination;

  const handleAuditTableChange = (tablePagination: TablePaginationConfig) => {
    setAuditFilters((prev) => ({
      ...prev,
      page: tablePagination.current || 1,
      pageSize: tablePagination.pageSize || prev.pageSize,
      syringeId: prev.syringeId,
    }));
  };

  const handleDateRangeChange = (
    values: [Dayjs | null, Dayjs | null] | null,
  ) => {
    setDateRange(values || [null, null]);
    const start = values?.[0]?.startOf('day');
    const end = values?.[1]?.endOf('day');
    setAuditFilters((prev) => ({
      ...prev,
      page: 1,
      startDate: start ? start.format('YYYY-MM-DD') : '',
      endDate: end ? end.format('YYYY-MM-DD') : '',
    }));
  };

  const handleSave = async (values: { currentStock: number; notes?: string }) => {
    try {
      if (!syringeData) throw new Error('Data syringe belum tersedia');

      const runUpdateFunction =
        typeof runUpdateStockAsync === 'function'
          ? runUpdateStockAsync
          : runUpdateStock;
      if (typeof runUpdateFunction !== 'function') {
        throw new Error('Fungsi update stock tidak tersedia');
      }

      await runUpdateFunction({
        syringeId: syringeData.id ?? syringeData.unitId,
        newStockAmount: values.currentStock,
        notes: values.notes,
      });

      await refreshSyringeData();
      await fetchAuditLogs(auditFilters);

      message.success('Stock syringe berhasil diperbarui');
      setCurrentStock(values.currentStock);
      form.setFieldsValue({
        currentStock: values.currentStock,
        notes: undefined,
      });
    } catch (error) {
      message.error(
        (error as Error)?.message || 'Gagal memperbarui stock syringe',
      );
    }
  };

  const stockUnitLabel = syringeData?.stockUnit || 'unit';

  return (
    <PageContainer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DatabaseOutlined style={{ color: '#fd0017' }} />
          <span>Manajemen Stock Syringe</span>
        </div>
      }
      content="Kelola dan update stock syringe dengan audit log"
      extra={[
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => form.submit()}
          disabled={!syringeData}
          loading={syringeLoading || updatingStock}
          style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
        >
          Simpan Perubahan
        </Button>,
      ]}
    >
      <Spin spinning={syringeLoading}>
        <>
          {syringeData ? (
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
              <Col xs={24} lg={12}>
                <Card
                  title="Stock Syringe Saat Ini"
                  style={{ height: '100%', textAlign: 'center' }}
                  headStyle={{ backgroundColor: '#fafafa' }}
                  className={styles.cardHover}
                >
                  <Statistic
                    title=""
                    value={currentStock}
                    suffix={`/ ${syringeData.maxCapacity} ${stockUnitLabel}`}
                    valueStyle={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: getStatusColor(getStockStatus(currentStock)),
                    }}
                  />
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#666',
                    }}
                  >
                    {getStockPercentage()}% dari kapasitas maksimal
                  </div>

                  <div
                    style={{
                      marginTop: 16,
                      padding: '16px',
                      backgroundColor: '#fafafa',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#999',
                          marginBottom: '4px',
                        }}
                      >
                        Status
                      </div>
                      <span
                        className={styles.statusBadge}
                        style={{
                          backgroundColor: getStatusColor(syringeData.status),
                          color: '#fff',
                        }}
                      >
                        {getStatusText(syringeData.status)}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#999',
                          marginBottom: '4px',
                        }}
                      >
                        Batas Min
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#333',
                        }}
                      >
                        {syringeData.minThreshold} {stockUnitLabel}
                      </div>
                    </div>
                  </div>

                  <Row
                    gutter={[16, 16]}
                    style={{ marginTop: 16, textAlign: 'left' }}
                  >
                    <Col xs={24} md={8}>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#999',
                          marginBottom: '4px',
                        }}
                      >
                        Unit Name
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#333',
                        }}
                      >
                        {syringeData.unitName || '-'}
                      </div>
                    </Col>
                    <Col xs={24} md={8}>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#999',
                          marginBottom: '4px',
                        }}
                      >
                        Last Update At
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#333',
                        }}
                      >
                        {formatDateTime(syringeData.updatedAt)}
                      </div>
                    </Col>
                    <Col xs={24} md={8}>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#999',
                          marginBottom: '4px',
                        }}
                      >
                        Last Update Name
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#333',
                        }}
                      >
                        {syringeData.updatedBy || '-'}
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card
                  title="Update Stock Syringe"
                  style={{ height: '100%' }}
                  headStyle={{ backgroundColor: '#fafafa' }}
                  className={styles.cardHover}
                >
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    initialValues={{
                      currentStock: syringeData.currentStock,
                    }}
                  >
                    <Form.Item
                      name="currentStock"
                      label="Jumlah Stock Baru"
                      rules={[
                        { required: true, message: 'Stock wajib diisi' },
                        {
                          type: 'number',
                          min: 0,
                          max: syringeData.maxCapacity,
                          message: `Stock harus antara 0 - ${syringeData.maxCapacity} ${stockUnitLabel}`,
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={syringeData.maxCapacity}
                        className={styles.stockInput}
                        onChange={(value) => setCurrentStock(value || 0)}
                        style={{
                          width: '100%',
                          fontSize: '18px',
                          padding: '8px 12px',
                          textAlign: 'center',
                        }}
                        placeholder={`Masukkan jumlah stock (0 - ${syringeData.maxCapacity} ${stockUnitLabel})`}
                      />
                    </Form.Item>

                    <Form.Item
                      name="notes"
                      label="Catatan Perubahan"
                      rules={[
                        { required: true, message: 'Catatan perubahan wajib diisi' },
                      ]}
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Masukkan catatan untuk perubahan stock ini (alasan, sumber, dll.)"
                        style={{
                          fontSize: '14px',
                        }}
                      />
                    </Form.Item>

                    {currentStock <= syringeData.minThreshold && (
                      <div
                        style={{
                          padding: '12px 16px',
                          backgroundColor: '#fff7e6',
                          border: '1px solid #ffd591',
                          borderRadius: '8px',
                          color: '#d46b08',
                          fontSize: '13px',
                          marginTop: 16,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>⚠️</span>
                        <div>
                          <div style={{ fontWeight: '500' }}>
                            Peringatan Stock Rendah!
                          </div>
                          <div style={{ marginTop: '2px', fontSize: '12px' }}>
                            Stock berada di bawah batas minimum (
                            {syringeData.minThreshold} {stockUnitLabel})
                          </div>
                        </div>
                      </div>
                    )}

                    {syringeData.maxCapacity &&
                      currentStock >= syringeData.maxCapacity * 0.9 && (
                        <div
                          style={{
                            padding: '12px 16px',
                            backgroundColor: '#e6f7ff',
                            border: '1px solid #91d5ff',
                            borderRadius: '8px',
                            color: '#0958d9',
                            fontSize: '13px',
                            marginTop: 16,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <span style={{ fontSize: '16px' }}>ℹ️</span>
                          <div>
                            <div style={{ fontWeight: '500' }}>
                              Informasi Kapasitas
                            </div>
                            <div style={{ marginTop: '2px', fontSize: '12px' }}>
                              Stock mendekati kapasitas maksimal (
                              {syringeData.maxCapacity} {stockUnitLabel})
                            </div>
                          </div>
                        </div>
                      )}
                  </Form>
                </Card>
              </Col>
            </Row>
          ) : !syringeLoading ? (
            <Card style={{ marginBottom: 24 }}>
              Data stock syringe belum tersedia.
            </Card>
          ) : null}

          <Card
            title="Audit Log Syringe Stock"
            size="default"
            style={{ marginTop: 24 }}
            extra={
              <Space size={8}>
                <RangePicker
                  value={dateRange}
                  allowClear
                  format="YYYY-MM-DD"
                  onChange={handleDateRangeChange}
                />
                <Button type="default" size="small">
                  Export Log
                </Button>
              </Space>
            }
          >
            <ProTable
              rowKey="id"
              search={false}
              loading={auditLoading}
              pagination={{
                current: auditPagination?.page ?? auditFilters.page,
                pageSize: auditPagination?.perPage ?? auditFilters.pageSize,
                total: auditPagination?.totalData ?? 0,
                showSizeChanger: true,
                showQuickJumper: true,
                size: 'small',
              }}
              onChange={handleAuditTableChange}
              toolBarRender={false}
              columns={[
                {
                  title: 'Waktu',
                  dataIndex: 'formattedCreatedAt',
                  key: 'formattedCreatedAt',
                  width: 160,
                  render: (_, record) =>
                    record.formattedCreatedAt ||
                    formatDateTime(record.createdAt || undefined),
                },
                {
                  title: 'Stock Sebelum',
                  dataIndex: 'stockBefore',
                  key: 'stockBefore',
                  width: 120,
                  render: (_, record) => `${record.stockBefore ?? 0} ${stockUnitLabel}`,
                  align: 'center',
                },
                {
                  title: 'Stock Sesudah',
                  dataIndex: 'stockAfter',
                  key: 'stockAfter',
                  width: 120,
                  render: (_, record) => `${record.stockAfter ?? 0} ${stockUnitLabel}`,
                  align: 'center',
                },
                {
                  title: 'Selisih',
                  key: 'difference',
                  width: 100,
                  render: (_, record: any) => {
                    const diff = record.difference ?? 0;
                    return (
                      <span
                        style={{
                          color:
                            diff > 0 ? '#52c41a' : diff < 0 ? '#ff4d4f' : '#666',
                          fontWeight: 500,
                        }}
                      >
                        {diff > 0 ? '+' : ''}
                        {diff}
                      </span>
                    );
                  },
                  align: 'center',
                },
                {
                  title: 'User',
                  dataIndex: 'userName',
                  key: 'userName',
                  width: 140,
                  render: (_, record) => (
                    <Space>
                      <span style={{ fontSize: '12px', color: '#666' }}>👤</span>
                      {record.userName}
                    </Space>
                  ),
                },
                {
                  title: 'Catatan',
                  dataIndex: 'notes',
                  key: 'notes',
                  ellipsis: true,
                },
              ]}
              dataSource={auditLogs}
              size="small"
            />
          </Card>
        </>
      </Spin>
    </PageContainer>
  );
};

export default LaboratorySyringe;
