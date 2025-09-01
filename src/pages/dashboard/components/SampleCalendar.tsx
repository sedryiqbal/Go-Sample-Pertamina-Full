import { history } from '@umijs/max';
import { Badge, Calendar, Card, message } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useState } from 'react';

const SampleCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  // Sample stock data for calendar
  const getStockData = (value: Dayjs) => {
    const stockData: {
      [key: string]: Array<{
        type: 'success' | 'warning' | 'error';
        content: string;
        available: boolean;
      }>;
    } = {
      '2025-09-01': [
        { type: 'success', content: 'JET A-1 Available', available: true },
        { type: 'warning', content: 'Avgas Limited', available: true },
      ],
      '2025-09-02': [
        { type: 'error', content: 'JET A-1 Empty', available: false },
        { type: 'success', content: 'Diesel Available', available: true },
      ],
      '2025-09-03': [
        { type: 'success', content: 'JET A-1 Available', available: true },
        { type: 'success', content: 'Avgas Available', available: true },
      ],
      '2025-09-04': [
        { type: 'warning', content: 'JET A-1 Limited', available: true },
      ],
      '2025-09-05': [
        { type: 'success', content: 'All Stock Available', available: true },
      ],
    };

    return stockData[value.format('YYYY-MM-DD')] || [];
  };

  const handleDateClick = (date: Dayjs) => {
    const stockData = getStockData(date);
    console.log('Clicked date:', date.format('YYYY-MM-DD'), stockData);
    if (stockData.length > 0) {
      // Navigate to estimate scheduling sample page with date parameter
      history.push(`/laboratory/testing?date=${date.format('YYYY-MM-DD')}`);
      message.info(
        `Navigating to estimate scheduling for ${date.format('DD/MM/YYYY')}`,
      );
    } else {
      message.info('No stock data available for this date');
    }
  };

  const dateCellRender = (value: Dayjs) => {
    const stockData = getStockData(value);

    if (stockData.length === 0) return null;

    return (
      <div
        style={{
          fontSize: '10px',
          lineHeight: '12px',
          overflow: 'hidden',
          height: '100%',
          padding: '2px',
          cursor: 'pointer',
        }}
        onClick={() => handleDateClick(value)}
        title="Click to view stock order"
      >
        {stockData.map((item, index) => (
          <Badge
            key={`${item.type}-${item.content}-${index}`}
            status={item.type}
            text={item.content.split(' ')[0]}
            style={{
              fontSize: '9px',
              display: 'block',
              marginBottom: '1px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <Card title="Kalender Stock Sample" size="small">
      <Calendar
        fullscreen={false}
        cellRender={dateCellRender}
        value={selectedDate}
        onChange={setSelectedDate}
        style={{ cursor: 'pointer' }}
      />
      <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
        💡 <strong>Tip:</strong> Click pada tanggal yang memiliki data stock
        untuk membuat estimate scheduling sample
      </div>
    </Card>
  );
};

export default SampleCalendar;
