import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { history } from '@umijs/max';
import { Calendar, Card, message, Tooltip } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useState } from 'react';

const SampleCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  // Sample stock data for calendar - enhanced with estimation data
  const getStockData = (value: Dayjs) => {
    const stockData: {
      [key: string]: Array<{
        id: string;
        type: 'success' | 'warning' | 'error';
        content: string;
        available: boolean;
        sample_type: string;
        vessel_name: string;
        tank_number: string;
        quantity: number;
        unit: string;
        location: string;
      }>;
    } = {
      '2025-09-01': [
        {
          id: '1',
          type: 'success',
          content: 'JET A-1 Available',
          available: true,
          sample_type: 'JET-A1',
          vessel_name: 'MT. Commodore One',
          tank_number: 'Tangki 107',
          quantity: 25,
          unit: 'botol',
          location: 'SHAFTI',
        },
        {
          id: '2',
          type: 'warning',
          content: 'Avgas Limited',
          available: true,
          sample_type: 'Avgas',
          vessel_name: 'MT. Pioneer',
          tank_number: 'Tangki 203',
          quantity: 5,
          unit: 'botol',
          location: 'SHAFTI',
        },
      ],
      '2025-09-02': [
        {
          id: '3',
          type: 'error',
          content: 'JET A-1 Empty',
          available: false,
          sample_type: 'JET-A1',
          vessel_name: 'MT. Serenity',
          tank_number: 'Tangki 105',
          quantity: 0,
          unit: 'botol',
          location: 'SHAFTI',
        },
        {
          id: '4',
          type: 'success',
          content: 'Diesel Available',
          available: true,
          sample_type: 'Soft blended',
          vessel_name: 'MT. Ocean Star',
          tank_number: 'Tangki 301',
          quantity: 15,
          unit: 'botol',
          location: 'Balongan',
        },
      ],
      '2025-09-03': [
        {
          id: '5',
          type: 'success',
          content: 'JET A-1 Available',
          available: true,
          sample_type: 'JET-A1',
          vessel_name: 'MT. Excellence',
          tank_number: 'Tangki 108',
          quantity: 30,
          unit: 'botol',
          location: 'SHAFTI',
        },
        {
          id: '6',
          type: 'success',
          content: 'Avgas Available',
          available: true,
          sample_type: 'Avgas',
          vessel_name: 'MV. Explorer',
          tank_number: 'Tangki 204',
          quantity: 20,
          unit: 'botol',
          location: 'SHAFTI',
        },
      ],
      '2025-09-04': [
        {
          id: '7',
          type: 'warning',
          content: 'JET A-1 Limited',
          available: true,
          sample_type: 'JET-A1',
          vessel_name: 'MT. Horizon',
          tank_number: 'Tangki 106',
          quantity: 8,
          unit: 'botol',
          location: 'SHAFTI',
        },
      ],
      '2025-09-05': [
        {
          id: '8',
          type: 'success',
          content: 'All Stock Available',
          available: true,
          sample_type: 'JET-A1',
          vessel_name: 'MT. Prosperity',
          tank_number: 'Multi tank composite',
          quantity: 50,
          unit: 'botol',
          location: 'SHAFTI',
        },
      ],
    };

    return stockData[value.format('YYYY-MM-DD')] || [];
  };

  // Ship completion data for calendar
  const getShipCompletionData = (value: Dayjs) => {
    const shipData: {
      [key: string]: Array<{
        vessel_name: string;
        cargo_type: string;
        completed_time: string;
        vessel_code: string;
        operation_type: 'unloading' | 'loading';
      }>;
    } = {
      '2025-09-07': [
        {
          vessel_name: 'MT. Commodore One',
          cargo_type: 'JET A-1',
          completed_time: '14:30',
          vessel_code: 'CMO001',
          operation_type: 'unloading',
        },
      ],
      '2025-09-08': [
        {
          vessel_name: 'MT. Pioneer',
          cargo_type: 'Avgas',
          completed_time: '10:15',
          vessel_code: 'PIO002',
          operation_type: 'unloading',
        },
        {
          vessel_name: 'MV. Navigator',
          cargo_type: 'Diesel',
          completed_time: '16:45',
          vessel_code: 'NAV004',
          operation_type: 'loading',
        },
      ],
      '2025-09-09': [
        {
          vessel_name: 'MT. Excellence',
          cargo_type: 'JET A-1',
          completed_time: '09:20',
          vessel_code: 'EXC005',
          operation_type: 'unloading',
        },
      ],
      '2025-09-10': [
        {
          vessel_name: 'MV. Atlantic',
          cargo_type: 'Gasoline',
          completed_time: '13:10',
          vessel_code: 'ATL006',
          operation_type: 'loading',
        },
      ],
    };

    return shipData[value.format('YYYY-MM-DD')] || [];
  };

  const handleDateClick = (date: Dayjs) => {
    const stockData = getStockData(date);
    const shipData = getShipCompletionData(date);

    console.log('Clicked date:', date.format('YYYY-MM-DD'), {
      stockData,
      shipData,
    });

    if (stockData.length > 0) {
      // Filter only available samples
      const availableSamples = stockData.filter(
        (sample) => sample.available && sample.quantity > 0,
      );

      if (availableSamples.length > 0) {
        // Navigate to sample order with available samples data
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
    } else if (shipData.length > 0) {
      // Navigate to ship management page with date parameter
      history.push(`/management/ships?date=${date.format('YYYY-MM-DD')}`);
      message.info(`Viewing ship operations for ${date.format('DD/MM/YYYY')}`);
    } else {
      message.info('No activities available for this date');
    }
  };

  const dateCellRender = (value: Dayjs) => {
    const stockData = getStockData(value);
    const shipData = getShipCompletionData(value);

    if (stockData.length === 0 && shipData.length === 0) return null;

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
        title="Click to view details"
      >
        {/* Stock Sample Data */}
        {stockData.map((item) => (
          <Tooltip
            key={item.id}
            title={
              <div>
                <div style={{ fontWeight: 'bold' }}>
                  📋 Sample Stock Details
                </div>
                <div>Product: {item.sample_type}</div>
                <div>Vessel: {item.vessel_name}</div>
                <div>Tank: {item.tank_number}</div>
                <div>
                  Quantity: {item.quantity} {item.unit}
                </div>
                <div>Location: {item.location}</div>
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
                backgroundColor:
                  item.type === 'success'
                    ? '#f6ffed'
                    : item.type === 'warning'
                      ? '#fffbe6'
                      : '#fff2f0',
                border: `1px solid ${
                  item.type === 'success'
                    ? '#b7eb8f'
                    : item.type === 'warning'
                      ? '#ffe58f'
                      : '#ffb3b3'
                }`,
                borderRadius: '4px',
                padding: '2px 4px',
                marginBottom: '1px',
                background:
                  item.type === 'success'
                    ? 'linear-gradient(90deg, #f6ffed 0%, #d9f7be 100%)'
                    : item.type === 'warning'
                      ? 'linear-gradient(90deg, #fffbe6 0%, #fff1b8 100%)'
                      : 'linear-gradient(90deg, #fff2f0 0%, #ffccc7 100%)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              <ExperimentOutlined
                style={{
                  fontSize: '8px',
                  marginRight: '2px',
                  color:
                    item.type === 'success'
                      ? '#52c41a'
                      : item.type === 'warning'
                        ? '#faad14'
                        : '#ff4d4f',
                }}
              />
              <span
                style={{
                  fontSize: '8px',
                  fontWeight: 600,
                  color:
                    item.type === 'success'
                      ? '#389e0d'
                      : item.type === 'warning'
                        ? '#d48806'
                        : '#cf1322',
                }}
              >
                {item.sample_type}
              </span>
              <span
                style={{
                  fontSize: '7px',
                  marginLeft: '2px',
                  color:
                    item.type === 'success'
                      ? '#52c41a'
                      : item.type === 'warning'
                        ? '#faad14'
                        : '#ff4d4f',
                }}
              >
                ({item.quantity})
              </span>
            </div>
          </Tooltip>
        ))}

        {/* Ship Completion Data */}
        {shipData.map((ship) => (
          <Tooltip
            key={ship.vessel_code}
            title={
              <div>
                <div style={{ fontWeight: 'bold' }}>
                  {ship.vessel_name} ({ship.vessel_code})
                </div>
                <div>Cargo: {ship.cargo_type}</div>
                <div>
                  Operation:{' '}
                  {ship.operation_type === 'unloading'
                    ? 'Unloading'
                    : 'Loading'}{' '}
                  Completed
                </div>
                <div>Time: {ship.completed_time}</div>
              </div>
            }
            placement="top"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor:
                  ship.operation_type === 'unloading' ? '#e6f7ff' : '#f9f0ff',
                border: `1px solid ${ship.operation_type === 'unloading' ? '#91d5ff' : '#d3adf7'}`,
                borderRadius: '3px',
                padding: '1px 3px',
                marginBottom: '1px',
                background:
                  ship.operation_type === 'unloading'
                    ? 'linear-gradient(90deg, #e6f7ff 0%, #bae7ff 100%)'
                    : 'linear-gradient(90deg, #f9f0ff 0%, #efdbff 100%)',
              }}
            >
              {ship.operation_type === 'unloading' ? (
                <CheckCircleOutlined
                  style={{
                    fontSize: '8px',
                    marginRight: '2px',
                    color: '#1890ff',
                  }}
                />
              ) : (
                <CarOutlined
                  style={{
                    fontSize: '8px',
                    marginRight: '2px',
                    color: '#722ed1',
                  }}
                />
              )}
              <span
                style={{
                  fontSize: '8px',
                  fontWeight: 600,
                  color:
                    ship.operation_type === 'unloading' ? '#096dd9' : '#531dab',
                }}
              >
                {ship.vessel_code}
              </span>
              <ClockCircleOutlined
                style={{
                  fontSize: '7px',
                  marginLeft: '2px',
                  color:
                    ship.operation_type === 'unloading' ? '#40a9ff' : '#9254de',
                }}
              />
              <span
                style={{
                  fontSize: '7px',
                  marginLeft: '1px',
                  color:
                    ship.operation_type === 'unloading' ? '#40a9ff' : '#9254de',
                }}
              >
                {ship.completed_time}
              </span>
            </div>
          </Tooltip>
        ))}
      </div>
    );
  };

  return (
    <Card title="Kalender Aktivitas Operasional" size="small">
      <Calendar
        fullscreen={false}
        cellRender={dateCellRender}
        value={selectedDate}
        onChange={setSelectedDate}
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
          style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}
        >
          <ExperimentOutlined
            style={{ color: '#52c41a', marginRight: '4px', fontSize: '12px' }}
          />
          <strong>Sample Stock:</strong>
          <span style={{ marginLeft: '4px' }}>
            Klik untuk membuat order sample
          </span>
        </div>
        <div
          style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}
        >
          <CheckCircleOutlined
            style={{ color: '#1890ff', marginRight: '4px', fontSize: '12px' }}
          />
          <strong>Unloading Complete:</strong>
          <span style={{ marginLeft: '4px' }}>
            Kapal selesai bongkar muatan
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CarOutlined
            style={{ color: '#722ed1', marginRight: '4px', fontSize: '12px' }}
          />
          <strong>Loading Complete:</strong>
          <span style={{ marginLeft: '4px' }}>Kapal selesai muat muatan</span>
        </div>
        <div style={{ marginTop: '8px', fontStyle: 'italic' }}>
          💡 <strong>Tip:</strong> Klik pada tanggal untuk melihat detail
          aktivitas
        </div>
      </div>
    </Card>
  );
};

export default SampleCalendar;
