import { Form, Input, Select, Space, Tag, Typography } from 'antd';
import React from 'react';
import type { RoleMenuOption } from '@/services/roles/typings';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

interface RoleFormProps {
  form: any;
  disabled?: boolean;
  menuOptions?: RoleMenuOption[];
  menuOptionsLoading?: boolean;
  showMenuSelector?: boolean;
  totalMenus?: number;
  selectedCount?: number;
}

const RoleForm: React.FC<RoleFormProps> = ({
  form,
  disabled = false,
  menuOptions = [],
  menuOptionsLoading = false,
  showMenuSelector = false,
  totalMenus,
  selectedCount,
}) => {
  const selectedMenuIds = Form.useWatch<number[]>('menuIds', form) || [];
  const totalMenusCount = totalMenus ?? menuOptions.length;
  const derivedSelectedCount =
    selectedMenuIds.length === 0 && typeof selectedCount === 'number'
      ? selectedCount
      : selectedMenuIds.length;

  return (
    <>
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
          disabled={disabled}
        />
      </Form.Item>

      <Form.Item
        name="description"
        label="Deskripsi"
        rules={[{ max: 200, message: 'Deskripsi maksimal 200 karakter' }]}
      >
        <TextArea
          rows={3}
          placeholder="Tambahkan deskripsi singkat role"
          showCount
          maxLength={200}
          disabled={disabled}
        />
      </Form.Item>

      {(showMenuSelector || menuOptionsLoading) && (
        <Form.Item
          name="menuIds"
          label={
            <Space direction="vertical" size={0}>
              <Text strong>Menu Permissions</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {derivedSelectedCount} dari {totalMenusCount} menu dipilih
              </Text>
            </Space>
          }
          rules={
            menuOptions.length > 0
              ? [
                  {
                    required: true,
                    message: 'Pilih minimal 1 menu',
                  },
                ]
              : undefined
          }
        >
          <Select
            mode="multiple"
            placeholder={
              menuOptionsLoading
                ? 'Memuat menu...'
                : 'Pilih menu untuk role ini'
            }
            loading={menuOptionsLoading}
            disabled={
              disabled || menuOptionsLoading || menuOptions.length === 0
            }
            optionFilterProp="children"
            allowClear
            showSearch
            optionLabelProp="label"
            notFoundContent={
              menuOptionsLoading ? 'Memuat menu...' : 'Tidak ada menu tersedia'
            }
          >
            {menuOptions.map((menu) => (
              <Option
                key={menu.menuId}
                value={menu.menuId}
                label={menu.menuNama}
                style={{
                  opacity: menu.isActive === false ? 0.6 : 1,
                  padding: 8,
                }}
              >
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: '18px' }}>
                    {menu.menuIcon || '📁'}
                  </span>
                  <div>
                    <Space size={8} wrap>
                      <span style={{ fontWeight: 600 }}>{menu.menuNama}</span>
                      {menu.isSelected && (
                        <Tag color="blue" style={{ margin: 0 }}>
                          Terpilih
                        </Tag>
                      )}
                      {menu.isActive === false && (
                        <Tag color="red" style={{ margin: 0 }}>
                          Nonaktif
                        </Tag>
                      )}
                    </Space>
                    {menu.menuDeskripsi && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {menu.menuDeskripsi}
                      </Text>
                    )}
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      Urutan: #
                      {typeof menu.menuOrder === 'number'
                        ? menu.menuOrder
                        : '-'}{' '}
                      · URL: {menu.menuUrl || '-'}
                    </Text>
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
      )}
    </>
  );
};

export default RoleForm;
