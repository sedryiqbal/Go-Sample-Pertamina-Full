import { Card, List, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

interface Activity {
  id: string;
  description: string;
  timestamp: string;
}

interface RecentActivitiesProps {
  activities?: Activity[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => {
  const defaultActivities: Activity[] = [
    {
      id: '1',
      description: 'Pengujian sampel JET A-1 selesai',
      timestamp: '1h ago',
    },
    {
      id: '2',
      description: 'Sampel baru diterima dari MT. Commodore',
      timestamp: '2h ago',
    },
    {
      id: '3',
      description: 'Hasil analisis Avgas tersedia',
      timestamp: '3h ago',
    },
    {
      id: '4',
      description: 'Komparasi dokumen completed',
      timestamp: '4h ago',
    },
    {
      id: '5',
      description: 'Pengantaran sampel ke lab external',
      timestamp: '5h ago',
    },
  ];

  const activityList = activities || defaultActivities;

  return (
    <Card title="Aktivitas Terbaru" size="small">
      <List
        size="small"
        dataSource={activityList}
        renderItem={(item) => (
          <List.Item>
            <div
              style={{ display: 'flex', alignItems: 'center', width: '100%' }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#52c41a',
                  marginRight: '12px',
                }}
              />
              <Text style={{ flex: 1 }}>{item.description}</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {item.timestamp}
              </Text>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default RecentActivities;
