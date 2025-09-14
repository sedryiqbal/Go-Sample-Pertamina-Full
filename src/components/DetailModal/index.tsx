import {
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  EyeOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  message,
  Radio,
  Row,
  Space,
  Statistic,
  Steps,
  Tag,
  Timeline,
} from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useState } from 'react';

dayjs.extend(relativeTime);

interface DetailModalProps {
  visible: boolean;
  onClose: () => void;
  sampleData: any;
  onRelease?: (releaseData: {
    status: 'Success' | 'Repeat';
    notes: string;
  }) => void;
}

const DetailModal: React.FC<DetailModalProps> = ({
  visible,
  onClose,
  sampleData,
  onRelease,
}) => {
  const [form] = Form.useForm();
  const [releaseStatus, setReleaseStatus] = useState<'Success' | 'Repeat'>(
    'Success',
  );
  const [loading, setLoading] = useState(false);

  if (!sampleData) return null;

  // Get task status information
  const getTaskProgress = () => {
    const tasks = [
      {
        title: 'Product QC',
        status: sampleData.product_qc_status,
        icon: <FileTextOutlined />,
        color:
          sampleData.product_qc_status === 'completed' ? '#52c41a' : '#d9d9d9',
      },
      {
        title: 'Average COQ',
        status: sampleData.tank_value_status,
        icon: <ExperimentOutlined />,
        color:
          sampleData.tank_value_status === 'completed' ? '#52c41a' : '#d9d9d9',
      },
      {
        title: 'Lab Tester',
        status: sampleData.lab_tester_status,
        icon: <CheckCircleOutlined />,
        color:
          sampleData.lab_tester_status === 'completed' ? '#52c41a' : '#d9d9d9',
      },
      {
        title: 'Comparison Test',
        status: sampleData.comparison_test_status,
        icon: <ThunderboltOutlined />,
        color:
          sampleData.comparison_test_status === 'completed'
            ? '#52c41a'
            : '#d9d9d9',
      },
    ];

    const completedTasks = tasks.filter(
      (task) => task.status === 'completed',
    ).length;
    const totalTasks = tasks.length;
    const progress = (completedTasks / totalTasks) * 100;

    return { tasks, completedTasks, totalTasks, progress };
  };

  const { tasks, completedTasks, totalTasks, progress } = getTaskProgress();

  const getComparisonStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'ready':
        return 'processing';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getComparisonStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'ready':
        return 'Ready';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const handleRelease = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Simulate API call
      setTimeout(() => {
        message.success(
          `Sample ${releaseStatus === 'Success' ? 'successfully released' : 'marked for repeat'}!`,
        );
        onRelease?.({
          status: releaseStatus,
          notes: values.notes || '',
        });
        setLoading(false);
        onClose();
        form.resetFields();
      }, 1500);
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const isComparisonCompleted =
    sampleData.comparison_test_status === 'completed';

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <EyeOutlined style={{ color: '#1890ff' }} />
          <span>Detail Komparasi Sample</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      footer={
        <Space>
          <Button onClick={onClose}>Tutup</Button>
          {isComparisonCompleted && !sampleData.release_status && (
            <Button
              type="primary"
              loading={loading}
              onClick={handleRelease}
              icon={
                releaseStatus === 'Success' ? (
                  <CheckOutlined />
                ) : (
                  <ReloadOutlined />
                )
              }
              style={{
                backgroundColor:
                  releaseStatus === 'Success' ? '#52c41a' : '#fa8c16',
                borderColor:
                  releaseStatus === 'Success' ? '#52c41a' : '#fa8c16',
              }}
            >
              {releaseStatus === 'Success'
                ? 'Release Success'
                : 'Mark for Repeat'}
            </Button>
          )}
        </Space>
      }
      destroyOnClose
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Sample Information Card */}
        <Card title="Informasi Sample" style={{ marginBottom: 16 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Sample ID">
              <Tag color="blue" style={{ fontFamily: 'monospace' }}>
                {sampleData.sample_id}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Order Number">
              <Tag color="cyan" style={{ fontFamily: 'monospace' }}>
                {sampleData.order_number}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Sample Type">
              <Tag color="green">{sampleData.sample_type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Priority">
              <Tag color={sampleData.priority === 'urgent' ? 'red' : 'default'}>
                {sampleData.priority?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Vessel Name">
              {sampleData.vessel_name}
            </Descriptions.Item>
            <Descriptions.Item label="Tank Number">
              {sampleData.tank_number}
            </Descriptions.Item>
            <Descriptions.Item label="Lab Completion">
              {sampleData.lab_completion_date ? (
                <div>
                  <div>
                    {dayjs(sampleData.lab_completion_date).format(
                      'DD MMM YYYY, HH:mm',
                    )}
                  </div>
                  <small style={{ color: '#8c8c8c' }}>
                    {dayjs(sampleData.lab_completion_date).fromNow()}
                  </small>
                </div>
              ) : (
                <span style={{ color: '#8c8c8c' }}>Belum selesai</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Comparison Status">
              <Tag
                color={getComparisonStatusColor(sampleData.comparison_status)}
              >
                {getComparisonStatusText(sampleData.comparison_status)}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Progress Overview */}
        <Card title="Progress Overview" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Statistic
                title="Completed Tasks"
                value={completedTasks}
                suffix={`/ ${totalTasks}`}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Progress"
                value={progress}
                suffix="%"
                prefix={<ThunderboltOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Created"
                value={dayjs(sampleData.created_at).format('DD MMM')}
                prefix={<ClockCircleOutlined style={{ color: '#8c8c8c' }} />}
                valueStyle={{ fontSize: '16px', color: '#8c8c8c' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Task Timeline */}
        <Card title="Task Progress" style={{ marginBottom: 16 }}>
          <Steps
            current={completedTasks - 1}
            status={completedTasks === totalTasks ? 'finish' : 'process'}
            items={tasks.map((task, index) => ({
              title: task.title,
              status: task.status === 'completed' ? 'finish' : 'wait',
              icon: React.cloneElement(task.icon, {
                style: {
                  color: task.status === 'completed' ? '#52c41a' : '#d9d9d9',
                  fontSize: '16px',
                },
              }),
              description: (
                <Tag
                  color={task.status === 'completed' ? 'success' : 'default'}
                  style={{ fontSize: '10px', marginTop: 4 }}
                >
                  {task.status === 'completed' ? 'Completed' : 'Pending'}
                </Tag>
              ),
            }))}
            size="small"
          />
        </Card>

        {/* Additional Information */}
        {(sampleData.comparison_technician || sampleData.notes) && (
          <Card title="Additional Information" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              {sampleData.comparison_technician && (
                <Descriptions.Item label="Comparison Technician">
                  {sampleData.comparison_technician}
                </Descriptions.Item>
              )}
              {sampleData.notes && (
                <Descriptions.Item label="Notes">
                  <div
                    style={{
                      backgroundColor: '#f6f6f6',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '13px',
                    }}
                  >
                    {sampleData.notes}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        {/* Release Information - Show if already released */}
        {sampleData.release_status && (
          <Card title="Release Information" style={{ marginBottom: 16 }}>
            <Alert
              message={`Sample ${sampleData.release_status === 'Success' ? 'Successfully Released' : 'Marked for Repeat'}`}
              description={
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Status:</strong> {sampleData.release_status}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Date:</strong>{' '}
                    {dayjs(sampleData.release_date).format(
                      'DD MMM YYYY, HH:mm',
                    )}
                  </div>
                  {sampleData.release_notes && (
                    <div>
                      <strong>Notes:</strong> {sampleData.release_notes}
                    </div>
                  )}
                </div>
              }
              type={
                sampleData.release_status === 'Success' ? 'success' : 'warning'
              }
              icon={
                sampleData.release_status === 'Success' ? (
                  <CheckOutlined />
                ) : (
                  <WarningOutlined />
                )
              }
              showIcon
            />
          </Card>
        )}

        {/* Release Section - Only show if comparison is completed and not yet released */}
        {isComparisonCompleted && !sampleData.release_status && (
          <>
            <Divider orientation="left">Release Decision</Divider>
            <Card style={{ backgroundColor: '#f9f9f9' }}>
              <Alert
                message="Comparison Completed"
                description="Silakan pilih status release untuk sample ini berdasarkan hasil komparasi."
                type="info"
                icon={<InfoCircleOutlined />}
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Form form={form} layout="vertical">
                <Form.Item
                  label="Release Status"
                  name="release_status"
                  initialValue="Success"
                >
                  <Radio.Group
                    value={releaseStatus}
                    onChange={(e) => setReleaseStatus(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Radio value="Success">
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <CheckOutlined style={{ color: '#52c41a' }} />
                          <div>
                            <div style={{ fontWeight: 500 }}>Success</div>
                            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                              Hasil komparasi sesuai standar, sample dapat
                              dirilis
                            </div>
                          </div>
                        </div>
                      </Radio>
                      <Radio value="Repeat">
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <ReloadOutlined style={{ color: '#fa8c16' }} />
                          <div>
                            <div style={{ fontWeight: 500 }}>Repeat</div>
                            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                              Hasil komparasi tidak sesuai, perlu pengujian
                              ulang
                            </div>
                          </div>
                        </div>
                      </Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>

                <Form.Item label="Notes (Optional)" name="notes">
                  <Input.TextArea
                    rows={3}
                    placeholder="Tambahkan catatan untuk keputusan release ini..."
                  />
                </Form.Item>
              </Form>
            </Card>
          </>
        )}

        {/* Timestamps */}
        <Card title="Timestamps" size="small" style={{ marginTop: 16 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Created At">
              {dayjs(sampleData.created_at).format('DD MMM YYYY, HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {dayjs(sampleData.updated_at).format('DD MMM YYYY, HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Modal>
  );
};

export default DetailModal;
