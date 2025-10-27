import { FormOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import { Button, Form, message } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import CalendarModeAlert from './components/CalendarModeAlert';
import OrderSummaryCards from './components/OrderSummaryCards';
import SampleOrderDrawer from './components/SampleOrderDrawer';
import SampleOrderTable from './components/SampleOrderTable';
import { AVAILABLE_SAMPLES, SAMPLE_ORDERS } from './mockData';
import type { AvailableSample, OrderType, SampleOrderRecord } from './types';
import {
  buildOrderNumber,
  computeSummary,
  getLabDeliveryTime,
  mapSampleToFormValues,
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
  const [availableSamples, setAvailableSamples] =
    useState<AvailableSample[]>(AVAILABLE_SAMPLES);
  const [fromCalendar, setFromCalendar] = useState(false);

  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();
  const location = useLocation();

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
      unit: 'botol',
    });
    setSelectedSample(null);
    setDrawerVisible(true);
  }, [form]);

  const handleAddRequest = useCallback(() => {
    setOrderType('request');
    setEditingRecord(undefined);
    form.resetFields();
    form.setFieldsValue({
      order_date: dayjs(),
      priority: 'normal',
      category: 'import',
      quantity: 1,
      unit: 'botol',
    });
    setSelectedSample(null);
    setDrawerVisible(true);
  }, [form]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const actionParam = urlParams.get('action');
    const sampleParam = urlParams.get('samples');
    const dateParam = urlParams.get('date');

    if (actionParam === 'create' && sampleParam) {
      setFromCalendar(true);
      const sampleIds = sampleParam.split(',');
      const filtered = AVAILABLE_SAMPLES.filter((sample) =>
        sampleIds.includes(sample.id),
      );
      setAvailableSamples(filtered);

      if (filtered.length > 0) {
        message.success(
          `${filtered.length} sample tersedia untuk dibuat order pada ${dayjs(dateParam).format('DD/MM/YYYY')}`,
        );
        setTimeout(() => {
          handleAddReady();
        }, 500);
      }
    } else {
      setFromCalendar(false);
      setAvailableSamples(AVAILABLE_SAMPLES);
    }
  }, [handleAddReady, location.search]);

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
        estimated_delivery_time: getLabDeliveryTime(values.lab_location),
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
      />
    </PageContainer>
  );
};

export default SampleOrder;
