import { Calendar, Card } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useState } from 'react';

const SampleCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const dateCellRender = (value: Dayjs) => {
    // Sample calendar data could be fetched from API
    const hasEvent = Math.random() > 0.7; // Mock data

    if (hasEvent) {
      return (
        <div
          style={{
            backgroundColor: '#f0f9ff',
            borderRadius: '4px',
            padding: '2px',
            fontSize: '10px',
          }}
        >
          Sampel tersedia
        </div>
      );
    }
    return null;
  };

  return (
    <Card title="Kalender" size="small">
      <Calendar
        fullscreen={false}
        cellRender={dateCellRender}
        value={selectedDate}
        onChange={setSelectedDate}
      />
    </Card>
  );
};

export default SampleCalendar;
