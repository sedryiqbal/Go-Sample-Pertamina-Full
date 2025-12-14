import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Form, Modal, message, Tabs } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import { StadisManagement } from '@/components';
import type { StadisData } from '@/components/StadisManagement';
import {
  createSampleEstimation,
  updateSampleEstimation,
} from '@/services/sample-estimations/api';
import type { SampleEstimationRecord } from '@/services/sample-estimations/typings';
import { EstimationCalendar } from './components/EstimationCalendar';
import { EstimationDetailModal } from './components/EstimationDetailModal';
import {
  EstimationDrawerForm,
  type EstimationFormValues,
} from './components/EstimationDrawerForm';
import { EstimationTable } from './components/EstimationTable';
import { StadisStockCard } from './components/StadisStockCard';
import { SummaryCards } from './components/SummaryCards';
import { STATUS_OPTIONS } from './constants';
import { useReferenceData } from './hooks/useReferenceData';
import { useSampleEstimationList } from './hooks/useSampleEstimationList';
import { getErrorMessage } from './utils';

const MOCK_STADIS_DATA: StadisData[] = [
  {
    id: '1',
    location: 'Laboratory SHAFTI',
    current_stock: 45,
    min_threshold: 20,
    max_capacity: 100,
    last_updated: '2025-01-12T09:30:00Z',
    status: 'normal',
  },
];

const SampleEstimation: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [form] = Form.useForm<EstimationFormValues>();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<SampleEstimationRecord | null>(null);

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailRecord, setDetailRecord] =
    useState<SampleEstimationRecord | null>(null);

  const [calendarView, setCalendarView] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const [stadisDrawerVisible, setStadisDrawerVisible] = useState(false);
  const [selectedStadis, setSelectedStadis] = useState<
    StadisData | undefined
  >();

  const {
    loading: dropdownLoading,
    productOptions,
    shipOptions,
    tankOptions,
    unitOptions,
  } = useReferenceData();
  const { summary, calendarData, request, remove } = useSampleEstimationList();

  const isEditing = Boolean(editingRecord);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setDrawerVisible(true);
  };

  const handleEdit = (record: SampleEstimationRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      typeLoadId: record.typeLoadId ?? undefined,
      shipId: record.shipId ?? undefined,
      nomorTanki: record.nomorTanki ?? undefined,
      qty: record.qty ?? undefined,
      satuanId: record.satuanId ?? undefined,
      etaReceivedAt: record.etaReceivedAt ? dayjs(record.etaReceivedAt) : null,
      status: record.status ?? undefined,
      note: record.note ?? undefined,
    });
    setDrawerVisible(true);
  };

  const handleDetail = (record: SampleEstimationRecord) => {
    setDetailRecord(record);
    setDetailVisible(true);
  };

  const handleDelete = (record: SampleEstimationRecord) => {
    Modal.confirm({
      title: 'Konfirmasi Hapus',
      content: `Apakah Anda yakin ingin menghapus estimasi sample ${record.typeLoadName ?? '-'} dari ${record.shipName ?? '-'}?`,
      okText: 'Hapus',
      okType: 'danger',
      cancelText: 'Batal',
      onOk: () =>
        remove({
          id: record.id,
          description: record.typeLoadName ?? '-',
          onSuccess: () => actionRef.current?.reload(),
        }),
    });
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    form.resetFields();
    setEditingRecord(null);
  };

  const handleDetailClose = () => {
    setDetailVisible(false);
    setDetailRecord(null);
  };

  const handleSubmit = async (values: EstimationFormValues) => {
    try {
      setFormSubmitting(true);

      const payload = {
        typeLoadId: values.typeLoadId,
        shipId: values.shipId,
        nomorTanki: values.nomorTanki,
        qty: values.qty,
        satuanId: values.satuanId,
        status: values.status,
        etaReceivedAt: values.etaReceivedAt?.toISOString(),
        note: values.note,
      };

      if (editingRecord) {
        await updateSampleEstimation(editingRecord.id, payload);
        message.success('Estimasi sample berhasil diperbarui');
      } else {
        await createSampleEstimation(payload);
        message.success('Estimasi sample berhasil ditambahkan');
      }

      handleDrawerClose();
      actionRef.current?.reload();
    } catch (error) {
      message.error(
        `Gagal menyimpan data estimasi sample: ${getErrorMessage(error)}`,
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleView = () => {
    setCalendarView((prev) => !prev);
  };

  const handleStadisEdit = (stadis: StadisData) => {
    setSelectedStadis(stadis);
    setStadisDrawerVisible(true);
  };

  const handleStadisUpdate = (updatedStadis: StadisData) => {
    console.log('Updated stadis:', updatedStadis);
    message.success('Stock stadis berhasil diperbarui');
  };

  return (
    <PageContainer
      title="Estimasi Sample"
      content="Kelola estimasi ketersediaan sample dengan informasi lokasi dan status"
      extra={[
        <Button
          key="view"
          icon={<CalendarOutlined />}
          onClick={handleToggleView}
        >
          {calendarView ? 'View Tabel' : 'View Kalender'}
        </Button>,
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{ backgroundColor: '#fd0017', borderColor: '#fd0017' }}
        >
          Tambah Estimasi Sample
        </Button>,
      ]}
    >
      <Tabs
        defaultActiveKey="estimation"
        items={[
          {
            key: 'estimation',
            label: 'Estimasi Sample',
            children: (
              <div>
                <SummaryCards summary={summary} />
                {calendarView ? (
                  <EstimationCalendar
                    selectedDate={selectedDate}
                    onSelect={setSelectedDate}
                    calendarData={calendarData}
                  />
                ) : (
                  <EstimationTable
                    actionRef={actionRef}
                    request={request}
                    onDetail={handleDetail}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    productOptions={productOptions}
                    shipOptions={shipOptions}
                    dropdownLoading={dropdownLoading}
                  />
                )}
                <EstimationDrawerForm
                  form={form}
                  open={drawerVisible}
                  isEditing={isEditing}
                  submitting={formSubmitting}
                  dropdownLoading={dropdownLoading}
                  productOptions={productOptions}
                  shipOptions={shipOptions}
                  tankOptions={tankOptions}
                  unitOptions={unitOptions}
                  statusOptions={STATUS_OPTIONS}
                  onClose={handleDrawerClose}
                  onSubmit={handleSubmit}
                />
                <EstimationDetailModal
                  open={detailVisible}
                  record={detailRecord}
                  onClose={handleDetailClose}
                />
              </div>
            ),
          },
        ]}
      />

      <StadisManagement
        visible={stadisDrawerVisible}
        onClose={() => {
          setStadisDrawerVisible(false);
          setSelectedStadis(undefined);
        }}
        stadisData={selectedStadis}
        onUpdate={handleStadisUpdate}
      />
    </PageContainer>
  );
};

export default SampleEstimation;
