import type { ActionType, ProTableProps } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import React, { type MutableRefObject, useMemo } from 'react';

import { getOrderColumns } from '../columns';
import type { SampleOrderRecord } from '../types';

interface SampleOrderTableProps {
  actionRef: MutableRefObject<ActionType | null>;
  onDetail: (record: SampleOrderRecord) => void;
  onCancel: (record: SampleOrderRecord) => void;
  request: ProTableProps<SampleOrderRecord, SampleOrderTableQuery>['request'];
}

export interface SampleOrderTableQuery {
  keyword?: string;
}

const SampleOrderTable: React.FC<SampleOrderTableProps> = ({
  actionRef,
  onDetail,
  onCancel,
  request,
}) => {
  const columns = useMemo(
    () => [
      ...getOrderColumns({ onDetail, onCancel }),
      {
        title: 'Search',
        dataIndex: 'keyword',
        hideInTable: true,
        valueType: 'text',
        fieldProps: {
          placeholder: 'Cari nomor NPC, kapal, atau jenis product',
        },
      },
    ],
    [onDetail, onCancel],
  );

  return (
    <ProTable<SampleOrderRecord, SampleOrderTableQuery>
      actionRef={actionRef}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      form={{
        syncToUrl: false,
      }}
      columns={columns}
      request={request}
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
};

export default SampleOrderTable;
