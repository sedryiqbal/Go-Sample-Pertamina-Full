import type { ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import React, { type MutableRefObject } from 'react';

import { getOrderColumns } from '../columns';
import type { SampleOrderRecord } from '../types';

interface SampleOrderTableProps {
  actionRef: MutableRefObject<ActionType | null>;
  dataSource: SampleOrderRecord[];
  onEdit: (record: SampleOrderRecord) => void;
}

const SampleOrderTable: React.FC<SampleOrderTableProps> = ({
  actionRef,
  dataSource,
  onEdit,
}) => (
  <ProTable<SampleOrderRecord>
    actionRef={actionRef}
    rowKey="id"
    search={{ labelWidth: 'auto' }}
    columns={getOrderColumns({ onEdit })}
    dataSource={dataSource}
    pagination={{
      pageSize: 10,
      showSizeChanger: true,
      showQuickJumper: true,
    }}
    dateFormatter="string"
    headerTitle="Sample Orders List"
    toolBarRender={() => [
      <Button key="export" type="default">
        Export Excel
      </Button>,
    ]}
  />
);

export default SampleOrderTable;
