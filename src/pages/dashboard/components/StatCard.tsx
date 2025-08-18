import { Card, Statistic } from 'antd';
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  suffix,
}) => (
  <Card hoverable>
    <Statistic
      title={title}
      value={value}
      suffix={suffix}
      prefix={<span style={{ color }}>{icon}</span>}
      valueStyle={{ color, fontSize: '24px', fontWeight: 'bold' }}
    />
  </Card>
);

export default StatCard;
