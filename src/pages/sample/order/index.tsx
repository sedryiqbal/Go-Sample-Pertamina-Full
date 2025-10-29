import { FormOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import { Button, Form, Input, Modal, message } from 'antd';
import dayjs from 'dayjs';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  cancelSampleOrder,
  createSampleOrder,
  getAvailableSampleList,
  getCategoryTests,
  getLabs,
  getProductTypes,
  getSampleOrderDetail,
  getSampleOrdersPaged,
  getShips,
  getTanks,
  getUnits,
  uploadAttachment,
} from '@/services/sample-estimations/api';
import type { CreateSampleOrderPayload } from '@/services/sample-estimations/typings';

import CalendarModeAlert from './components/CalendarModeAlert';
import OrderSummaryCards from './components/OrderSummaryCards';
import SampleOrderDetailModal from './components/SampleOrderDetailModal';
import SampleOrderDrawer from './components/SampleOrderDrawer';
import SampleOrderTable, {
  type SampleOrderTableQuery,
} from './components/SampleOrderTable';
import {
  FALLBACK_CATEGORY_TEST_OPTIONS,
  FALLBACK_LAB_OPTIONS,
  FALLBACK_PRODUCT_OPTIONS,
  FALLBACK_SHIP_OPTIONS,
  FALLBACK_TANK_OPTIONS,
  FALLBACK_UNIT_OPTIONS,
} from './constants';
import { AVAILABLE_SAMPLES } from './mockData';
import type {
  AvailableSample,
  OrderType,
  SampleOrderRecord,
  SelectOption,
} from './types';
import {
  buildOrderNumber,
  computeSummary,
  getLabDeliveryTime,
  mapCategoryTestsToOptions,
  mapLabsToOptions,
  mapProductTypesToOptions,
  mapSampleToFormValues,
  mapShipsToOptions,
  mapTanksToOptions,
  mapUnitsToOptions,
  transformAvailableSample,
  transformSampleOrderRecord,
} from './utils';

const SampleOrder: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('ready');
  const [editingRecord, setEditingRecord] = useState<
    SampleOrderRecord | undefined
  >();
  const [selectedSample, setSelectedSample] = useState<AvailableSample | null>(
    null,
  );
  const [allAvailableSamples, setAllAvailableSamples] =
    useState<AvailableSample[]>(AVAILABLE_SAMPLES);
  const [availableSamples, setAvailableSamples] =
    useState<AvailableSample[]>(AVAILABLE_SAMPLES);
  const [fromCalendar, setFromCalendar] = useState(false);
  const [productOptions, setProductOptions] = useState<SelectOption[]>(
    FALLBACK_PRODUCT_OPTIONS,
  );
  const [categoryTestOptions, setCategoryTestOptions] = useState<
    SelectOption[]
  >(FALLBACK_CATEGORY_TEST_OPTIONS);
  const [shipOptions, setShipOptions] = useState<SelectOption[]>(
    FALLBACK_SHIP_OPTIONS,
  );
  const [tankOptions, setTankOptions] = useState<SelectOption[]>(
    FALLBACK_TANK_OPTIONS,
  );
  const [labOptions, setLabOptions] =
    useState<SelectOption[]>(FALLBACK_LAB_OPTIONS);
  const [unitOptions, setUnitOptions] = useState<SelectOption[]>(
    FALLBACK_UNIT_OPTIONS,
  );
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tableOrders, setTableOrders] = useState<SampleOrderRecord[]>([]);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<SampleOrderRecord | null>(
    null,
  );
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRecord, setDetailRecord] = useState<SampleOrderRecord | null>(
    null,
  );

  const actionRef = useRef<ActionType>(null);
  const calendarInitializedRef = useRef(false);
  const lastSearchRef = useRef<string>();
  const [form] = Form.useForm();
  const [cancelForm] = Form.useForm();
  const location = useLocation();

  const defaultUnitValue = useMemo(() => unitOptions[0]?.value, [unitOptions]);
  const defaultCategoryTestValue = useMemo(
    () => categoryTestOptions[0]?.value,
    [categoryTestOptions],
  );
  const defaultLabValue = useMemo(() => labOptions[0]?.value, [labOptions]);

  const handleDrawerClose = useCallback(() => {
    setDrawerVisible(false);
    form.resetFields();
    setSelectedSample(null);
    setEditingRecord(undefined);
  }, [form]);

  const handleAddReady = useCallback(() => {
    setOrderType('ready');
    setEditingRecord(undefined);
    form.resetFields();
    form.setFieldsValue({
      order_date: dayjs(),
      priority: 'normal',
      quantity: 1,
      unit: defaultUnitValue,
      category_test: defaultCategoryTestValue,
      lab_location: defaultLabValue,
    });
    setSelectedSample(null);
    setDrawerVisible(true);
  }, [defaultCategoryTestValue, defaultLabValue, defaultUnitValue, form]);

  const handleAddRequest = useCallback(() => {
    setOrderType('request');
    setEditingRecord(undefined);
    form.resetFields();
    form.setFieldsValue({
      order_date: dayjs(),
      priority: 'normal',
      category: 'import',
      quantity: 1,
      unit: defaultUnitValue,
      category_test: defaultCategoryTestValue,
      lab_location: defaultLabValue,
    });
    setSelectedSample(null);
    setDrawerVisible(true);
  }, [defaultCategoryTestValue, defaultLabValue, defaultUnitValue, form]);

  const loadDropdownData = useCallback(async () => {
    setLoadingDropdowns(true);
    try {
      const [
        sampleList,
        productTypes,
        shipList,
        tankList,
        unitList,
        categoryTests,
        labList,
      ] = await Promise.all([
        getAvailableSampleList(),
        getProductTypes(),
        getShips(),
        getTanks(),
        getUnits(),
        getCategoryTests(),
        getLabs(),
      ]);

      const mappedSamples = sampleList.map(transformAvailableSample);
      const productOptionsFromApi = mapProductTypesToOptions(productTypes);
      const categoryTestOptionsFromApi =
        mapCategoryTestsToOptions(categoryTests);
      const shipOptionsFromApi = mapShipsToOptions(shipList);
      const tankOptionsFromApi = mapTanksToOptions(tankList);
      const unitOptionsFromApi = mapUnitsToOptions(unitList);
      const labOptionsFromApi = mapLabsToOptions(labList);

      setAllAvailableSamples(
        mappedSamples.length > 0 ? mappedSamples : AVAILABLE_SAMPLES,
      );
      setProductOptions(
        productOptionsFromApi.length > 0
          ? productOptionsFromApi
          : FALLBACK_PRODUCT_OPTIONS,
      );
      setCategoryTestOptions(
        categoryTestOptionsFromApi.length > 0
          ? categoryTestOptionsFromApi
          : FALLBACK_CATEGORY_TEST_OPTIONS,
      );
      setShipOptions(
        shipOptionsFromApi.length > 0
          ? shipOptionsFromApi
          : FALLBACK_SHIP_OPTIONS,
      );
      setTankOptions(
        tankOptionsFromApi.length > 0
          ? tankOptionsFromApi
          : FALLBACK_TANK_OPTIONS,
      );
      setLabOptions(
        labOptionsFromApi.length > 0 ? labOptionsFromApi : FALLBACK_LAB_OPTIONS,
      );
      setUnitOptions(
        unitOptionsFromApi.length > 0
          ? unitOptionsFromApi
          : FALLBACK_UNIT_OPTIONS,
      );
      calendarInitializedRef.current = false;
    } catch (_error) {
      message.error(
        'Gagal memuat data dropdown, menggunakan data bawaan sementara.',
      );
      setAllAvailableSamples(AVAILABLE_SAMPLES);
      setProductOptions(FALLBACK_PRODUCT_OPTIONS);
      setCategoryTestOptions(FALLBACK_CATEGORY_TEST_OPTIONS);
      setShipOptions(FALLBACK_SHIP_OPTIONS);
      setTankOptions(FALLBACK_TANK_OPTIONS);
      setLabOptions(FALLBACK_LAB_OPTIONS);
      setUnitOptions(FALLBACK_UNIT_OPTIONS);
    } finally {
      setLoadingDropdowns(false);
    }
  }, []);

  useEffect(() => {
    loadDropdownData();
  }, [loadDropdownData]);

  useEffect(() => {
    if (lastSearchRef.current !== location.search) {
      calendarInitializedRef.current = false;
      lastSearchRef.current = location.search;
    }

    if (!allAvailableSamples.length) {
      setAvailableSamples([]);
      return;
    }

    const urlParams = new URLSearchParams(location.search);
    const actionParam = urlParams.get('action');
    const sampleParam = urlParams.get('samples');
    const dateParam = urlParams.get('date');

    if (actionParam === 'create' && sampleParam) {
      setFromCalendar(true);
      const sampleIds = sampleParam.split(',');
      const filtered = allAvailableSamples.filter((sample) =>
        sampleIds.includes(sample.id),
      );
      const hasFilteredSamples = filtered.length > 0;
      setAvailableSamples(hasFilteredSamples ? filtered : allAvailableSamples);

      if (hasFilteredSamples && !calendarInitializedRef.current) {
        const formattedDate =
          dateParam && dayjs(dateParam).isValid()
            ? dayjs(dateParam).format('DD/MM/YYYY')
            : 'tanggal pilihan';

        message.success(
          `${filtered.length} sample tersedia untuk dibuat order pada ${formattedDate}`,
        );
        calendarInitializedRef.current = true;
        setTimeout(() => {
          handleAddReady();
        }, 500);
      }
    } else {
      setFromCalendar(false);
      setAvailableSamples(allAvailableSamples);
    }
  }, [allAvailableSamples, handleAddReady, location.search]);

  useEffect(() => {
    if (
      orderType !== 'ready' ||
      !selectedSample ||
      availableSamples.some((sample) => sample.id === selectedSample.id)
    ) {
      return;
    }

    setSelectedSample(null);
    form.setFieldsValue({ selected_sample_id: undefined });
  }, [availableSamples, form, orderType, selectedSample]);

  useEffect(() => {
    if (!unitOptions.length || !defaultUnitValue) {
      return;
    }

    const currentUnit = form.getFieldValue('unit');
    const hasCurrentUnit =
      currentUnit !== undefined &&
      currentUnit !== null &&
      unitOptions.some(
        (option) => option.value.toString() === currentUnit.toString(),
      );

    if (!currentUnit || currentUnit === '') {
      form.setFieldsValue({ unit: defaultUnitValue });
      return;
    }

    if (!hasCurrentUnit) {
      form.setFieldsValue({ unit: defaultUnitValue });
    }
  }, [defaultUnitValue, form, unitOptions]);

  useEffect(() => {
    if (!categoryTestOptions.length) {
      return;
    }

    const currentCategory = form.getFieldValue('category_test');
    const hasCurrentCategory =
      currentCategory !== undefined &&
      currentCategory !== null &&
      categoryTestOptions.some(
        (option) => option.value.toString() === currentCategory.toString(),
      );

    if (
      (currentCategory === undefined ||
        currentCategory === null ||
        currentCategory === '') &&
      defaultCategoryTestValue
    ) {
      form.setFieldsValue({ category_test: defaultCategoryTestValue });
      return;
    }

    if (currentCategory && !hasCurrentCategory) {
      form.setFieldsValue({
        category_test: defaultCategoryTestValue ?? undefined,
      });
    }
  }, [categoryTestOptions, defaultCategoryTestValue, form]);

  useEffect(() => {
    if (!labOptions.length) {
      return;
    }

    const currentLab = form.getFieldValue('lab_location');
    const hasCurrentLab =
      currentLab !== undefined &&
      currentLab !== null &&
      labOptions.some(
        (option) => option.value.toString() === currentLab.toString(),
      );

    if (
      (currentLab === undefined || currentLab === null || currentLab === '') &&
      defaultLabValue
    ) {
      form.setFieldsValue({ lab_location: defaultLabValue });
      return;
    }

    if (currentLab && !hasCurrentLab) {
      form.setFieldsValue({
        lab_location: defaultLabValue ?? undefined,
      });
    }
  }, [defaultLabValue, form, labOptions]);

  const handleSampleSelection = (sampleId: string) => {
    const sample = availableSamples.find((item) => item.id === sampleId);
    if (sample) {
      setSelectedSample(sample);
      const currentQuantity = form.getFieldValue('quantity') || 1;
      form.setFieldsValue({
        ...mapSampleToFormValues(sample),
        quantity: Math.min(currentQuantity, sample.quantity),
      });
      message.success(
        `Sample ${sample.sample_type} dari ${sample.vessel_name} dipilih`,
      );
    }
  };

  const openCancelModal = (record: SampleOrderRecord) => {
    setCancelTarget(record);
    cancelForm.resetFields();
    setCancelModalVisible(true);
  };

  const handleFileUpload = useCallback(async (file: File) => {
    const result = await uploadAttachment(file);
    if (!result?.fileUrl) {
      throw new Error('URL file tidak tersedia.');
    }
    return result.fileUrl;
  }, []);

  const handleTableRequest = useCallback(
    async (
      params: SampleOrderTableQuery & { current?: number; pageSize?: number },
    ) => {
      const { current = 1, pageSize = 10, keyword } = params;

      try {
        const { data, pagination } = await getSampleOrdersPaged({
          page: current,
          pageSize,
          search: keyword,
        });

        const transformed = data.map(transformSampleOrderRecord);
        setTableOrders(transformed);

        return {
          data: transformed,
          success: true,
          total: pagination?.totalData ?? transformed.length,
        };
      } catch (error: any) {
        const errorMessage =
          error?.message ??
          'Gagal memuat data sample order. Mohon coba kembali.';
        message.error(errorMessage);
        setTableOrders([]);

        return {
          data: [],
          success: false,
          total: 0,
        };
      }
    },
    [],
  );

  const handleSubmit = async (values: any) => {
    const isReadyOrder = orderType === 'ready';
    const isEditing = Boolean(editingRecord);

    const parseOptionalNumber = (numericValue: unknown) => {
      if (numericValue === null || numericValue === undefined) {
        return undefined;
      }
      const parsed = Number(numericValue);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    };

    const findOptionByValue = (
      options: SelectOption[],
      value: unknown,
    ): SelectOption | undefined =>
      options.find((option) => option.value === value);

    const extractUploadPath = (uploadValue: unknown) => {
      if (!uploadValue) {
        return undefined;
      }

      const extractFromList = (fileList?: any[]) => {
        if (!Array.isArray(fileList) || fileList.length === 0) {
          return undefined;
        }

        const first = fileList[0];
        if (!first || typeof first !== 'object') {
          return undefined;
        }

        if (first.url) {
          return first.url as string;
        }

        const responseData =
          first.response?.data ?? first.response ?? undefined;
        if (responseData && typeof responseData === 'object') {
          const candidate = responseData as { fileUrl?: string };
          if (candidate.fileUrl) {
            return candidate.fileUrl;
          }
        }

        if (first.originFileObj instanceof File) {
          return first.originFileObj.name;
        }

        return undefined;
      };

      if (Array.isArray(uploadValue)) {
        return extractFromList(uploadValue);
      }

      const maybeFileList = (uploadValue as { fileList?: unknown[] }).fileList;
      if (maybeFileList) {
        return extractFromList(maybeFileList as any[]);
      }

      return undefined;
    };

    const tanggalOrder = values.order_date
      ? dayjs(values.order_date).toISOString()
      : dayjs().toISOString();
    const etaArrival = values.estimated_arrival
      ? dayjs(values.estimated_arrival).toISOString()
      : dayjs().toISOString();

    const priorityValue = values.priority ?? 'normal';

    if (isReadyOrder && !isEditing) {
      if (!selectedSample) {
        message.error('Silakan pilih sample estimasi terlebih dahulu.');
        return;
      }

      const estimasiSampleId = Number(
        selectedSample.raw?.id ?? selectedSample.id,
      );
      const labOption = findOptionByValue(labOptions, values.lab_location);
      const categoryOption = findOptionByValue(
        categoryTestOptions,
        values.category_test,
      );
      const productOption = findOptionByValue(
        productOptions,
        values.sample_type,
      );

      const labId = parseOptionalNumber(labOption?.meta?.id);
      const categoryTestId = parseOptionalNumber(categoryOption?.meta?.id);
      const shipId = parseOptionalNumber(
        selectedSample.shipId ?? selectedSample.raw?.shipId,
      );
      const tankNumber = parseOptionalNumber(
        selectedSample.tankId ?? selectedSample.raw?.nomorTanki,
      );
      const unitId = parseOptionalNumber(
        selectedSample.unitId ?? selectedSample.raw?.satuanId,
      );
      const typeLoadId =
        parseOptionalNumber(
          selectedSample.sampleTypeId ?? selectedSample.raw?.typeLoadId,
        ) ?? parseOptionalNumber(productOption?.meta?.id);

      if (
        !Number.isFinite(estimasiSampleId) ||
        !labId ||
        !categoryTestId ||
        !shipId ||
        !tankNumber ||
        !unitId ||
        !typeLoadId
      ) {
        message.error(
          'Data sample atau referensi tidak lengkap untuk membuat order.',
        );
        return;
      }

      const payload: CreateSampleOrderPayload = {
        estimasiSampleId,
        tanggalOrder,
        nomorNpc: values.npc_number,
        labId,
        categoryTestId,
        etaArival: etaArrival,
        pathPhotoSample: extractUploadPath(values.photo_sample) ?? null,
        pathMemo: extractUploadPath(values.memo_file) ?? null,
        notes: values.notes ?? null,
        jenisProduct: selectedSample.sample_type,
        typeLoadId,
        shipId,
        nomorTangki: tankNumber,
        quantity: Number(values.quantity),
        satuanId: unitId,
        priority: String(priorityValue),
      };

      setSubmitting(true);
      try {
        const response = await createSampleOrder(payload);
        message.success(response.message ?? 'Ready Order berhasil dibuat.');
        handleDrawerClose();
        actionRef.current?.reload();
      } catch (error: any) {
        const errorMessage =
          error?.message ?? 'Gagal membuat ready order. Mohon coba kembali.';
        message.error(errorMessage);
      } finally {
        setSubmitting(false);
      }

      return;
    }

    if (orderType === 'request' && !isEditing) {
      const productOption = findOptionByValue(
        productOptions,
        values.sample_type,
      );
      const labOption = findOptionByValue(labOptions, values.lab_location);
      const categoryOption = findOptionByValue(
        categoryTestOptions,
        values.category_test,
      );
      const shipOption = findOptionByValue(shipOptions, values.vessel_name);
      const tankOption = findOptionByValue(tankOptions, values.tank_number);
      const unitOption = findOptionByValue(unitOptions, values.unit);

      const typeLoadId = parseOptionalNumber(productOption?.meta?.id);
      const labId = parseOptionalNumber(labOption?.meta?.id);
      const categoryTestId = parseOptionalNumber(categoryOption?.meta?.id);
      const shipId = parseOptionalNumber(shipOption?.meta?.id);
      let tankNumber = parseOptionalNumber(tankOption?.meta?.id);
      if (!tankNumber && typeof values.tank_number === 'string') {
        const digits = values.tank_number.match(/\d+/);
        if (digits?.[0]) {
          tankNumber = parseOptionalNumber(digits[0]);
        }
      }
      const unitId = parseOptionalNumber(unitOption?.meta?.id);

      if (!typeLoadId) {
        message.error('Jenis product tidak valid.');
        return;
      }

      if (!labId || !categoryTestId) {
        message.error('Lab atau category test belum dipilih.');
        return;
      }

      if (!shipId || !tankNumber) {
        message.error('Data kapal atau tangki belum lengkap.');
        return;
      }

      if (!unitId) {
        message.error('Data satuan belum lengkap.');
        return;
      }

      const payload: CreateSampleOrderPayload = {
        tanggalOrder,
        nomorNpc: values.npc_number,
        labId,
        categoryTestId,
        etaArival: etaArrival,
        pathPhotoSample: extractUploadPath(values.photo_sample) ?? null,
        pathMemo: extractUploadPath(values.memo_file) ?? null,
        notes: values.notes ?? null,
        jenisProduct:
          typeof values.sample_type === 'string'
            ? values.sample_type
            : (productOption?.label ?? ''),
        typeLoadId,
        shipId,
        nomorTangki: tankNumber,
        quantity: Number(values.quantity),
        satuanId: unitId,
        priority: String(priorityValue),
      };

      setSubmitting(true);
      try {
        const response = await createSampleOrder(payload);
        message.success(response.message ?? 'Request Order berhasil dibuat.');
        handleDrawerClose();
        actionRef.current?.reload();
      } catch (error: any) {
        const errorMessage =
          error?.message ?? 'Gagal membuat request order. Mohon coba kembali.';
        message.error(errorMessage);
      } finally {
        setSubmitting(false);
      }

      return;
    }

    try {
      const orderNumber = buildOrderNumber(orderType);
      const orderPayload = {
        ...values,
        order_number: orderNumber,
        order_type: orderType,
        order_date: values.order_date?.format('YYYY-MM-DD'),
        estimated_arrival: values.estimated_arrival?.format('YYYY-MM-DD HH:mm'),
        estimated_delivery_time: getLabDeliveryTime(
          values.lab_location,
          labOptions,
        ),
        status: 'pending',
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      message.success(
        editingRecord
          ? `${orderType === 'ready' ? 'Ready Order' : 'Request Order'} berhasil diperbarui`
          : `${orderType === 'ready' ? 'Ready Order' : 'Request Order'} berhasil dibuat: ${orderNumber}`,
      );
      handleDrawerClose();
      actionRef.current?.reload();
      return orderPayload;
    } catch (_error) {
      message.error(
        `Gagal menyimpan ${orderType === 'ready' ? 'ready order' : 'request order'}`,
      );
      return undefined;
    }
  };

  const summaryData = useMemo(() => computeSummary(tableOrders), [tableOrders]);

  const handleCancelOrder = async () => {
    try {
      const { cancelReason } = await cancelForm.validateFields();
      if (!cancelTarget) {
        message.error('Data sample order tidak ditemukan.');
        return;
      }

      setCancelSubmitting(true);
      const response = await cancelSampleOrder(cancelTarget.id, cancelReason);
      message.success(response.message ?? 'Sample order berhasil dibatalkan.');
      setCancelModalVisible(false);
      setCancelTarget(null);
      cancelForm.resetFields();
      actionRef.current?.reload();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      const errorMessage =
        error?.message ?? 'Gagal membatalkan order. Mohon coba kembali.';
      message.error(errorMessage);
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleShowDetail = async (record: SampleOrderRecord) => {
    setDetailVisible(true);
    setDetailLoading(true);
    setDetailRecord(record);

    try {
      const detail = await getSampleOrderDetail(record.id);
      if (!detail) {
        throw new Error('Detail sample order tidak ditemukan.');
      }
      const transformed = transformSampleOrderRecord(detail);
      setDetailRecord(transformed);
    } catch (error: any) {
      const errorMessage =
        error?.message ?? 'Gagal memuat detail sample order.';
      message.error(errorMessage);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <PageContainer
      title={
        fromCalendar
          ? 'Create Sample Order dari Kalender'
          : 'Sample Order Management'
      }
      content={
        fromCalendar
          ? `Membuat order sample dari ${availableSamples.length} sample yang tersedia pada tanggal yang dipilih`
          : 'Unified management for Ready Orders and Request Orders'
      }
      extra={[
        ...(fromCalendar
          ? []
          : [
              <Button
                key="add-ready"
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddReady}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Create Ready Order
              </Button>,
              <Button
                key="add-request"
                type="primary"
                icon={<FormOutlined />}
                onClick={handleAddRequest}
              >
                Create Request Order
              </Button>,
            ]),
        ...(fromCalendar
          ? [
              <Button
                key="back-dashboard"
                onClick={() => history.push('/dashboard')}
              >
                ← Kembali ke Dashboard
              </Button>,
            ]
          : []),
      ]}
    >
      {fromCalendar && (
        <CalendarModeAlert availableSamplesCount={availableSamples.length} />
      )}

      <OrderSummaryCards summary={summaryData} />

      <SampleOrderTable
        actionRef={actionRef}
        onDetail={handleShowDetail}
        onCancel={openCancelModal}
        request={handleTableRequest}
      />

      <SampleOrderDrawer
        orderType={orderType}
        open={drawerVisible}
        form={form}
        availableSamples={availableSamples}
        selectedSample={selectedSample}
        editingRecord={editingRecord}
        onClose={handleDrawerClose}
        onSubmit={handleSubmit}
        onSelectSample={handleSampleSelection}
        productOptions={productOptions}
        categoryTestOptions={categoryTestOptions}
        shipOptions={shipOptions}
        tankOptions={tankOptions}
        labOptions={labOptions}
        unitOptions={unitOptions}
        optionsLoading={loadingDropdowns}
        submitting={submitting}
        onUploadFile={handleFileUpload}
      />

      <SampleOrderDetailModal
        open={detailVisible}
        loading={detailLoading}
        record={detailRecord}
        onClose={() => {
          setDetailVisible(false);
          setDetailRecord(null);
        }}
      />

      <Modal
        title="Batalkan Sample Order"
        open={cancelModalVisible}
        onCancel={() => {
          if (!cancelSubmitting) {
            setCancelModalVisible(false);
            setCancelTarget(null);
            cancelForm.resetFields();
          }
        }}
        onOk={handleCancelOrder}
        confirmLoading={cancelSubmitting}
        okText="Konfirmasi"
        cancelText="Batal"
      >
        <Form form={cancelForm} layout="vertical">
          <Form.Item
            name="cancelReason"
            label="Alasan Pembatalan"
            rules={[
              { required: true, message: 'Alasan pembatalan wajib diisi' },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Tuliskan alasan pembatalan order"
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default SampleOrder;
