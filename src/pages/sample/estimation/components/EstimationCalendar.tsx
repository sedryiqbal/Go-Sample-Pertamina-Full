import { Badge, Calendar, Card } from 'antd';
import type { Dayjs } from 'dayjs';
import React from 'react';
import type { CalendarData } from '../utils';

interface Props {
  selectedDate: Dayjs;
  onSelect: (date: Dayjs) => void;
  calendarData: CalendarData;
}

const getListData = (calendarData: CalendarData, date: Dayjs) => {
  const dateKey = date.format('YYYY-MM-DD');
  return calendarData[dateKey] ?? [];
};

export const EstimationCalendar: React.FC<Props> = ({
  selectedDate,
  onSelect,
  calendarData,
}) => (
  <Card title="Kalender Estimasi Sample">
    <Calendar
      dateCellRender={(value) => {
        const listData = getListData(calendarData, value);
        return (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {listData.map((item, index) => (
              <li key={`${item.type}-${item.content}-${index}`}>
                <Badge
                  status={item.type}
                  text={
                    <span style={{ fontSize: '10px' }}>
                      {item.content.substring(0, 20)}...
                    </span>
                  }
                />
              </li>
            ))}
          </ul>
        );
      }}
      value={selectedDate}
      onSelect={onSelect}
    />
  </Card>
);

export default EstimationCalendar;
