import { ExperimentOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { Calendar, Card, message, Spin, Tooltip } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';

import { getSampleEstimationCalendar } from '@/services/sample-estimations/api';
import type { SampleEstimationRecord } from '@/services/sample-estimations/typings';

type SampleAvailabilityStatus = 'success' | 'warning' | 'error';

const STATUS_STYLES: Record<
  SampleAvailabilityStatus,
  {
    background: string;
    border: string;
    icon: string;
    text: string;
    badge: string;
  }
> = {
  success: {
    background: 'linear-gradient(90deg, #f6ffed 0%, #d9f7be 100%)',
    border: '#b7eb8f',
    icon: '#52c41a',
    text: '#389e0d',
    badge: '#52c41a',
  },
  warning: {
    background: 'linear-gradient(90deg, #fffbe6 0%, #fff1b8 100%)',
    border: '#ffe58f',
    icon: '#faad14',
    text: '#d48806',
    badge: '#faad14',
  },
  error: {
    background: 'linear-gradient(90deg, #fff2f0 0%, #ffccc7 100%)',
    border: '#ffb3b3',
    icon: '#ff4d4f',
    text: '#cf1322',
    badge: '#ff4d4f',
  },
};

const MAX_CALENDAR_PAGE_SIZE = 100;

const SampleCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [activeMonth, setActiveMonth] = useState<Dayjs>(dayjs());
  const [calendarData, setCalendarData] = useState<
    Record<string, SampleEstimationRecord[]>
  >({});
  const [loading, setLoading] = useState(false);

  const fetchCalendarData = useCallback(
    async (targetDate: Dayjs) => {
      setLoading(true);
      try {
        const { data } = await getSampleEstimationCalendar({
          month: targetDate.month() + 1,
          year: targetDate.year(),
          page: 1,
          pageSize: MAX_CALENDAR_PAGE_SIZE,
        });

        const grouped = data.reduce<Record<string, SampleEstimationRecord[]>>(
          (acc, record) => {
            const keyCandidate = record.etaReceivedAt || record.createdAt;
            if (!keyCandidate) {
              return acc;
            }
            const parsed = dayjs(keyCandidate);
            if (!parsed.isValid()) {
              return acc;
            }
            const key = parsed.format('YYYY-MM-DD');
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(record);
            return acc;
          },
          {},
        );

        setCalendarData(grouped);
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Gagal memuat kalender sampel';
        message.error(errorMessage);
        setCalendarData({});
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchCalendarData(activeMonth);
  }, [activeMonth, fetchCalendarData]);

  const updateActiveMonth = useCallback((value: Dayjs) => {
    setSelectedDate(value);
    setActiveMonth((prev) => {
      if (prev.month() === value.month() && prev.year() === value.year()) {
        return prev;
      }
      return value;
    });
  }, []);

  const handleSelectDate = useCallback(
    (value: Dayjs) => {
      updateActiveMonth(value);
    },
    [updateActiveMonth],
  );

  const handlePanelChange = useCallback(
    (value: Dayjs) => {
      updateActiveMonth(value);
    },
    [updateActiveMonth],
  );

  const getSamplesByDate = useCallback(
    (value: Dayjs) => calendarData[value.format('YYYY-MM-DD')] || [],
    [calendarData],
  );

  const getAvailabilityStatus = useCallback(
    (record: SampleEstimationRecord): SampleAvailabilityStatus => {
      const available = Number(record.availableQty ?? 0);
      const planned = Number(record.qty ?? 0);

      if (available <= 0) {
        return 'error';
      }

      if (planned > 0 && available < planned) {
        return 'warning';
      }

      return 'success';
    },
    [],
  );

  const handleDateClick = useCallback(
    (date: Dayjs) => {
      const samples = getSamplesByDate(date);

      if (samples.length === 0) {
        message.info('Tidak ada sample yang dijadwalkan pada tanggal ini');
        return;
      }

      const availableSamples = samples.filter(
        (sample) => (sample.availableQty ?? 0) > 0,
      );

      if (availableSamples.length > 0) {
        const sampleIds = availableSamples.map((sample) => sample.id).join(',');
        history.push(
          `/sample/order?date=${date.format('YYYY-MM-DD')}&samples=${sampleIds}&action=create`,
        );
        message.success(
          `🧪 Redirect ke Create Sample Order dengan ${availableSamples.length} sample tersedia`,
        );
      } else {
        message.warning('Tidak ada sample yang tersedia pada tanggal ini');
      }
    },
    [getSamplesByDate],
  );

  const dateCellRender = useCallback(
    (value: Dayjs) => {
      const samples = getSamplesByDate(value);

      if (samples.length === 0) {
        return null;
      }

      const sortedSamples = [...samples].sort((a, b) => {
        const aTime = a.etaReceivedAt
          ? dayjs(a.etaReceivedAt).valueOf()
          : 0;
        const bTime = b.etaReceivedAt
          ? dayjs(b.etaReceivedAt).valueOf()
          : 0;
        return aTime - bTime;
      });

      return (
        <div
          style={{
            fontSize: '9px',
            lineHeight: '11px',
            overflow: 'hidden',
            height: '100%',
            padding: '1px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
          }}
          onClick={() => handleDateClick(value)}
          title="Klik untuk melihat detail sample"
        >
          {sortedSamples.map((item) => {
            const status = getAvailabilityStatus(item);
            const styles = STATUS_STYLES[status];
            const availableQty = item.availableQty ?? 0;
            const plannedQty = item.qty ?? 0;
            return (
              <Tooltip
                key={`${item.id}-${item.etaReceivedAt ?? 'na'}`}
                title={
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      📋 Detail Sample
                    </div>
                    <div>Produk: {item.typeLoadName ?? '-'}</div>
                    <div>Vessel: {item.shipName ?? '-'}</div>
                    <div>Tank: {item.tankiName ?? item.nomorTanki ?? '-'}</div>
                    <div>
                      Qty:{' '}
                      {availableQty > 0
                        ? `${availableQty} / ${plannedQty} ${item.satuanName ?? ''}`
                        : `${plannedQty} ${item.satuanName ?? ''}`}
                    </div>
                    <div>Lokasi: {item.unitName ?? item.lokasi ?? '-'}</div>
                    {item.note ? <div>Catatan: {item.note}</div> : null}
                    {item.detailSample ? (
                      <div style={{ whiteSpace: 'pre-line' }}>
                        Detail: {item.detailSample}
                      </div>
                    ) : null}
                    <div style={{ marginTop: 4, fontStyle: 'italic' }}>
                      💡 Klik untuk membuat order sample
                    </div>
                  </div>
                }
                placement="top"
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: `1px solid ${styles.border}`,
                    borderRadius: '4px',
                    padding: '2px 4px',
                    marginBottom: '1px',
                    background: styles.background,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  <ExperimentOutlined
                    style={{
                      fontSize: '8px',
                      marginRight: '2px',
                      color: styles.icon,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '8px',
                      fontWeight: 600,
                      color: styles.text,
                    }}
                  >
                    {item.typeLoadName ?? 'Sample'}
                  </span>
                  <span
                    style={{
                      fontSize: '7px',
                      marginLeft: '2px',
                      color: styles.badge,
                    }}
                  >
                    ({availableQty}/{plannedQty})
                  </span>
                </div>
              </Tooltip>
            );
          })}
        </div>
      );
    },
    [getSamplesByDate, handleDateClick, getAvailabilityStatus],
  );

  return (
    <Card title="Kalender Estimasi Sample" size="small">
      <Spin spinning={loading}>
        <Calendar
          fullscreen={false}
          cellRender={dateCellRender}
          value={selectedDate}
          onSelect={handleSelectDate}
          onPanelChange={handlePanelChange}
          style={{ cursor: 'pointer' }}
        />
        <div
          style={{
            marginTop: 12,
            fontSize: '11px',
            color: '#666',
            lineHeight: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '4px',
            }}
          >
            <ExperimentOutlined
              style={{ color: '#52c41a', marginRight: '4px', fontSize: '12px' }}
            />
            <strong>Sample Stock:</strong>
            <span style={{ marginLeft: '4px' }}>
              Klik untuk membuat order sample
            </span>
          </div>
          <div style={{ marginTop: '8px', fontStyle: 'italic' }}>
            💡 <strong>Tip:</strong> Klik pada tanggal untuk melihat detail
            sample yang tersedia
          </div>
        </div>
      </Spin>
    </Card>
  );
};

export default SampleCalendar;
