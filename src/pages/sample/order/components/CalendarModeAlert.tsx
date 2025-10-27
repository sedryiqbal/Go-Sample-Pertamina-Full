import { Alert } from 'antd';
import React from 'react';

interface CalendarModeAlertProps {
  availableSamplesCount: number;
}

const CalendarModeAlert: React.FC<CalendarModeAlertProps> = ({
  availableSamplesCount,
}) => (
  <Alert
    message="Mode: Create Order dari Kalender Dashboard"
    description={
      <div>
        <div>{availableSamplesCount} sample tersedia untuk dibuat order</div>
        <div>Sample dipilih berdasarkan tanggal aktif pada kalender</div>
        <div>
          Form create order sudah dibuka otomatis dengan sample yang tersedia
        </div>
      </div>
    }
    type="success"
    showIcon
    style={{ marginBottom: 24 }}
    closable
  />
);

export default CalendarModeAlert;
