import { FormOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import { Button, Form, message } from 'antd';
import dayjs from 'dayjs';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  getAvailableSampleList,
  getCategoryTests,
  getLabs,
  getProductTypes,
  getShips,
  getTanks,
  getUnits,
} from '@/services/sample-estimations/api';

import CalendarModeAlert from './components/CalendarModeAlert';
import OrderSummaryCards from './components/OrderSummaryCards';
import SampleOrderDrawer from './components/SampleOrderDrawer';
import SampleOrderTable from './components/SampleOrderTable';
import {
  FALLBACK_CATEGORY_TEST_OPTIONS,
  FALLBACK_LAB_OPTIONS,
  FALLBACK_PRODUCT_OPTIONS,
  FALLBACK_SHIP_OPTIONS,
  FALLBACK_TANK_OPTIONS,
  FALLBACK_UNIT_OPTIONS,
} from './constants';
import { AVAILABLE_SAMPLES, SAMPLE_ORDERS } from './mockData';
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
} from './utils';

const mergeOptions = (
  primary: SelectOption[],
  secondary: SelectOption[],
): SelectOption[] => {
  const map = new Map<string, SelectOption>();

  [...primary, ...secondary].forEach((option) => {
    const key = option.value.toString().toLowerCase();
    const existing = map.get(key);

    if (existing) {
      map.set(key, {
        ...existing,
        label: existing.label ?? option.label,
        value: existing.value ?? option.value,
        disabled: existing.disabled ?? option.disabled,
        meta: {
          ...(option.meta ?? {}),
          ...(existing.meta ?? {}),
        },
      });
      return;
    }

    map.set(key, option);
  });

  return Array.from(map.values());
};

const buildOptionsFromSamples = (
  samples: AvailableSample[],
  selector: (sample: AvailableSample) => string | number | undefined | null,
): SelectOption[] => {
  const seen = new Set<string>();
  const options: SelectOption[] = [];

  samples.forEach((sample) => {
    const value = selector(sample);
    if (value === null || value === undefined || value === '') {
      return;
    }

    const key = value.toString().toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);

    options.push({
      label: value.toString(),
      value,
    });
  });

  return options;
};

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

  const actionRef = useRef<ActionType>(null);
  const calendarInitializedRef = useRef(false);
  const lastSearchRef = useRef<string>();
  const [form] = Form.useForm();
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

      const productOptionsFromSamples = buildOptionsFromSamples(
        mappedSamples,
        (sample) => sample.sample_type,
      );
      const shipOptionsFromSamples = buildOptionsFromSamples(
        mappedSamples,
        (sample) => sample.vessel_name,
      );
      const tankOptionsFromSamples = buildOptionsFromSamples(
        mappedSamples,
        (sample) => sample.tank_number,
      );
      const labOptionsFromSamples = buildOptionsFromSamples(
        mappedSamples,
        (sample) => sample.location,
      );
      const unitOptionsFromSamples = buildOptionsFromSamples(
        mappedSamples,
        (sample) => sample.unit,
      );

      setAllAvailableSamples(
        mappedSamples.length > 0 ? mappedSamples : AVAILABLE_SAMPLES,
      );
      setProductOptions(productOptionsFromApi);
      setCategoryTestOptions(categoryTestOptionsFromApi);
      setShipOptions(shipOptionsFromApi);
      setTankOptions(tankOptionsFromApi);
      setLabOptions(labOptionsFromApi);
      setUnitOptions(unitOptionsFromApi);
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

  const handleEdit = (record: SampleOrderRecord) => {
    setEditingRecord(record);
    setOrderType(record.order_type);
    form.setFieldsValue({
      ...record,
      order_date: record.order_date ? dayjs(record.order_date) : null,
      estimated_arrival: record.estimated_arrival
        ? dayjs(record.estimated_arrival)
        : null,
    });
    setSelectedSample(null);
    setDrawerVisible(true);
  };

  const handleSubmit = async (values: any) => {
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

  const summaryData = computeSummary(SAMPLE_ORDERS);

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
        dataSource={SAMPLE_ORDERS}
        onEdit={handleEdit}
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
      />
    </PageContainer>
  );
};

export default SampleOrder;
