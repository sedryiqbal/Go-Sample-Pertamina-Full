import { Form, Input, Space, Typography } from 'antd';
import React from 'react';
import type { Role } from '@/services/roles/typings';
import PermissionSelector from './PermissionSelector';

const { Text } = Typography;

interface RoleFormProps {
  form: any;
  initialData?: Partial<Role>;
  disabled?: boolean;
}

const RoleForm: React.FC<RoleFormProps> = ({
  form,
  initialData,
  disabled = false,
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialData}
      disabled={disabled}
    >
      <Form.Item
        name="name"
        label="Nama Role"
        rules={[
          { required: true, message: 'Nama role wajib diisi' },
          { min: 2, message: 'Nama role minimal 2 karakter' },
          { max: 50, message: 'Nama role maksimal 50 karakter' },
        ]}
      >
        <Input
          placeholder="Masukkan nama role (contoh: Sample Officer, Lab Manager)"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="permissions"
        label={
          <Space direction="vertical" size={4}>
            <Text strong>Permissions</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Pilih modul yang dapat diakses oleh role ini
            </Text>
          </Space>
        }
        rules={[
          { required: true, message: 'Minimal pilih 1 permission' },
          {
            validator: (_, value) => {
              if (!value || value.length === 0) {
                return Promise.reject(new Error('Minimal pilih 1 permission'));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <PermissionSelector disabled={disabled} />
      </Form.Item>
    </Form>
  );
};

export default RoleForm;
