import {
  Card,
  Checkbox,
  Col,
  Empty,
  Row,
  Space,
  Spin,
  Tooltip,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import type { AvailableModule } from '@/services/roles/typings';
import { mockAvailableModules } from '../../../../../mock/roles.mock';

const { Text, Title } = Typography;

interface PermissionSelectorProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
}

const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  value = [],
  onChange,
  disabled = false,
}) => {
  const [modules, setModules] = useState<AvailableModule[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      try {
        // Use mock data for now - replace with API call when backend is ready
        // const response = await getAvailableModules();
        setModules(mockAvailableModules);
      } catch (error) {
        console.error('Failed to fetch modules:', error);
        setModules(mockAvailableModules);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const handleModuleChange = (moduleKey: string, checked: boolean) => {
    if (!onChange) return;

    const newValue = checked
      ? [...value, moduleKey]
      : value.filter((key) => key !== moduleKey);

    onChange(newValue);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onChange) return;

    if (checked) {
      onChange(modules.map((module) => module.key));
    } else {
      onChange([]);
    }
  };

  const isAllSelected = modules.length > 0 && value.length === modules.length;
  const isIndeterminate = value.length > 0 && value.length < modules.length;

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Memuat modul yang tersedia...</Text>
          </div>
        </div>
      </Card>
    );
  }

  if (modules.length === 0) {
    return (
      <Card>
        <Empty
          description="Tidak ada modul yang tersedia"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card
      size="small"
      title={
        <Space align="center">
          <Title level={5} style={{ margin: 0 }}>
            Pilih Permissions
          </Title>
          <Checkbox
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            onChange={(e) => handleSelectAll(e.target.checked)}
            disabled={disabled}
          >
            Pilih Semua
          </Checkbox>
        </Space>
      }
      styles={{
        body: { padding: '16px' },
      }}
    >
      <Row gutter={[16, 16]}>
        {modules.map((module) => (
          <Col xs={24} sm={12} md={8} lg={6} key={module.key}>
            <Card
              size="small"
              hoverable={!disabled}
              style={{
                border: value.includes(module.key)
                  ? '2px solid #fd0017'
                  : '1px solid #d9d9d9',
                backgroundColor: value.includes(module.key)
                  ? '#fff2f0'
                  : 'white',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
              }}
              onClick={() =>
                !disabled &&
                handleModuleChange(module.key, !value.includes(module.key))
              }
            >
              <Space
                direction="vertical"
                size="small"
                style={{ width: '100%' }}
              >
                <Space align="center">
                  <Checkbox
                    checked={value.includes(module.key)}
                    onChange={(e) =>
                      handleModuleChange(module.key, e.target.checked)
                    }
                    disabled={disabled}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span style={{ fontSize: '18px' }}>{module.icon}</span>
                  <Text strong style={{ fontSize: '14px' }}>
                    {module.name}
                  </Text>
                </Space>
                <Tooltip title={module.description} placement="bottom">
                  <Text
                    type="secondary"
                    style={{
                      fontSize: '12px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.4',
                    }}
                  >
                    {module.description}
                  </Text>
                </Tooltip>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {value.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: '12px',
            backgroundColor: '#f0f0f0',
            borderRadius: '6px',
          }}
        >
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Dipilih: {value.length} dari {modules.length} modul
          </Text>
        </div>
      )}
    </Card>
  );
};

export default PermissionSelector;
