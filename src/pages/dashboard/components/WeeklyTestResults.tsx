import { Card, Typography } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

const { Text } = Typography;

const WeeklyTestResults: React.FC = () => {
  const weekData = Array.from({ length: 7 }, (_, i) => ({
    day: dayjs()
      .subtract(6 - i, 'day')
      .format('DD/MM'),
    success: Math.floor(Math.random() * 20) + 10,
    failed: Math.floor(Math.random() * 5) + 1,
  }));

  return (
    <Card title="Pengujian 7 Hari Terakhir" size="small">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end',
          height: '200px',
          padding: '20px 0',
        }}
      >
        {weekData.map((data) => (
          <div key={data.day} style={{ textAlign: 'center', flex: 1 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <div
                style={{
                  width: '20px',
                  backgroundColor: '#52c41a',
                  height: `${data.success * 3}px`,
                  marginBottom: '2px',
                  borderRadius: '2px 2px 0 0',
                }}
              />
              <div
                style={{
                  width: '20px',
                  backgroundColor: '#ff4d4f',
                  height: `${data.failed * 3}px`,
                  borderRadius: '0 0 2px 2px',
                }}
              />
            </div>
            <Text style={{ fontSize: '10px' }}>{data.day}</Text>
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#52c41a',
              marginRight: '4px',
            }}
          />
          <Text style={{ fontSize: '12px' }}>Berhasil</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#ff4d4f',
              marginRight: '4px',
            }}
          />
          <Text style={{ fontSize: '12px' }}>Gagal</Text>
        </div>
      </div>
    </Card>
  );
};

export default WeeklyTestResults;
