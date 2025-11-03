import { EyeOutlined } from '@ant-design/icons';
import { Button, Col, Modal, Row, Space, Timeline, Typography } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

import type { ShippingHistory } from '../types';

const { Text } = Typography;

interface HistoryDetailModalProps {
  visible: boolean;
  order: ShippingHistory | null;
  onClose: () => void;
}

const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({
  visible,
  order,
  onClose,
}) => (
  <Modal
    title={
      <Space>
        <EyeOutlined style={{ color: '#595959' }} />
        <span style={{ color: '#262626', fontWeight: 600 }}>Order Details</span>
      </Space>
    }
    open={visible}
    onCancel={onClose}
    footer={[
      <Button
        key="close"
        type="default"
        onClick={onClose}
        style={{ borderRadius: 6 }}
      >
        Close
      </Button>,
    ]}
    width={800}
    style={{ top: 20 }}
  >
    {order && (
      <div>
        <div
          style={{
            background: '#fafafa',
            padding: 20,
            borderRadius: 8,
            border: '1px solid #e8e8e8',
            marginBottom: 24,
          }}
        >
          <Row align="middle" justify="space-between">
            <Col xs={18}>
              <div>
                <Text
                  strong
                  style={{
                    fontSize: 20,
                    color: '#262626',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  {order.order_number}
                </Text>
                <Text style={{ fontSize: 14, color: '#8c8c8c' }}>
                  {order.npc_number}
                </Text>
              </div>
            </Col>
            <Col xs={6}>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: 20,
                    background:
                      order.status === 'completed' ? '#f6ffed' : '#fff2f0',
                    border:
                      order.status === 'completed'
                        ? '1px solid #d9f7be'
                        : '1px solid #ffccc7',
                    marginBottom: 8,
                  }}
                >
                  <Text
                    strong
                    style={{
                      fontSize: 12,
                      color:
                        order.status === 'completed' ? '#52c41a' : '#ff4d4f',
                    }}
                  >
                    {order.status === 'completed' ? 'COMPLETED' : 'CANCELLED'}
                  </Text>
                </div>
                <br />
                <Text style={{ fontSize: 13, color: '#8c8c8c' }}>
                  Distance: {order.distance}
                </Text>
              </div>
            </Col>
          </Row>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Text
            strong
            style={{
              fontSize: 16,
              color: '#262626',
              display: 'block',
              marginBottom: 16,
            }}
          >
            Sample Information
          </Text>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e8e8e8',
              borderRadius: 8,
              padding: 16,
            }}
          >
            <Row gutter={[24, 16]}>
              <Col xs={12} sm={6}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#8c8c8c',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  Sample Type
                </Text>
                <Text strong style={{ fontSize: 14, color: '#262626' }}>
                  {order.sample_type}
                </Text>
              </Col>
              <Col xs={12} sm={6}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#8c8c8c',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  Vessel Name
                </Text>
                <Text style={{ fontSize: 14, color: '#262626' }}>
                  {order.vessel_name || '-'}
                </Text>
              </Col>
              <Col xs={12} sm={6}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#8c8c8c',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  Tank Number
                </Text>
                <Text style={{ fontSize: 14, color: '#262626' }}>
                  {order.tank_number || '-'}
                </Text>
              </Col>
              <Col xs={12} sm={6}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#8c8c8c',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  Quantity
                </Text>
                <Text style={{ fontSize: 14, color: '#262626' }}>
                  {order.quantity ? `${order.quantity} ${order.unit}` : '-'}
                </Text>
              </Col>
            </Row>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Text
            strong
            style={{
              fontSize: 16,
              color: '#262626',
              display: 'block',
              marginBottom: 16,
            }}
          >
            Route Information
          </Text>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e8e8e8',
              borderRadius: 8,
              padding: 16,
            }}
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#8c8c8c',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  Pickup Location
                </Text>
                <Text
                  style={{ fontSize: 14, color: '#262626', lineHeight: 1.4 }}
                >
                  {order.pickup_location}
                </Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#8c8c8c',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  Delivery Location
                </Text>
                <Text
                  style={{ fontSize: 14, color: '#262626', lineHeight: 1.4 }}
                >
                  {order.delivery_location}
                </Text>
              </Col>
            </Row>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Text
            strong
            style={{
              fontSize: 16,
              color: '#262626',
              display: 'block',
              marginBottom: 16,
            }}
          >
            Delivery Timeline
          </Text>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e8e8e8',
              borderRadius: 8,
              padding: 20,
            }}
          >
            {(() => {
              const pickupTime = dayjs(order.pickup_time);
              const deliveryTime = dayjs(order.delivery_time);
              const totalDuration = deliveryTime.diff(pickupTime, 'minute');
              const hours = Math.floor(totalDuration / 60);
              const minutes = totalDuration % 60;
              const durationText =
                hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

              return (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <Row
                      align="middle"
                      justify="space-between"
                      style={{ marginBottom: 8 }}
                    >
                      <Col>
                        <Text style={{ fontSize: 14, color: '#8c8c8c' }}>
                          Total Duration
                        </Text>
                      </Col>
                      <Col>
                        <Text strong style={{ fontSize: 16, color: '#262626' }}>
                          {order.status === 'completed'
                            ? durationText
                            : 'Cancelled'}
                        </Text>
                      </Col>
                    </Row>
                    <div
                      style={{
                        height: 1,
                        background: '#e8e8e8',
                        marginBottom: 20,
                      }}
                    />
                  </div>

                  <Timeline
                    items={[
                      {
                        color: '#52c41a',
                        dot: (
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: '#52c41a',
                              border: '3px solid #f6ffed',
                            }}
                          />
                        ),
                        children: (
                          <div style={{ paddingBottom: 16 }}>
                            <div style={{ marginBottom: 8 }}>
                              <Text
                                strong
                                style={{
                                  fontSize: 14,
                                  color: '#262626',
                                  display: 'block',
                                }}
                              >
                                Pickup Started
                              </Text>
                              <Text style={{ fontSize: 13, color: '#8c8c8c' }}>
                                {pickupTime.format('DD MMM YYYY, HH:mm')}
                              </Text>
                            </div>
                            <Text style={{ fontSize: 12, color: '#595959' }}>
                              Driver arrived at pickup location
                            </Text>
                          </div>
                        ),
                      },
                      ...(order.status === 'completed'
                        ? [
                            {
                              color: '#1890ff',
                              dot: (
                                <div
                                  style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    background: '#1890ff',
                                    border: '3px solid #e6f7ff',
                                  }}
                                />
                              ),
                              children: (
                                <div style={{ paddingBottom: 16 }}>
                                  <div style={{ marginBottom: 8 }}>
                                    <Text
                                      strong
                                      style={{
                                        fontSize: 14,
                                        color: '#262626',
                                        display: 'block',
                                      }}
                                    >
                                      In Transit
                                    </Text>
                                    <Text
                                      style={{ fontSize: 13, color: '#8c8c8c' }}
                                    >
                                      Sample collected, en route to destination
                                    </Text>
                                  </div>
                                  <Text
                                    style={{ fontSize: 12, color: '#595959' }}
                                  >
                                    Estimated duration based on route:{' '}
                                    {order.distance}
                                  </Text>
                                </div>
                              ),
                            },
                            {
                              color: '#52c41a',
                              dot: (
                                <div
                                  style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    background: '#52c41a',
                                    border: '3px solid #f6ffed',
                                  }}
                                />
                              ),
                              children: (
                                <div>
                                  <div style={{ marginBottom: 8 }}>
                                    <Text
                                      strong
                                      style={{
                                        fontSize: 14,
                                        color: '#262626',
                                        display: 'block',
                                      }}
                                    >
                                      Delivered
                                    </Text>
                                    <Text
                                      style={{ fontSize: 13, color: '#8c8c8c' }}
                                    >
                                      Sample handed over at destination
                                    </Text>
                                  </div>
                                  <Text
                                    style={{ fontSize: 12, color: '#595959' }}
                                  >
                                    {deliveryTime.format('DD MMM YYYY, HH:mm')}
                                  </Text>
                                </div>
                              ),
                            },
                          ]
                        : [
                            {
                              color: '#ff4d4f',
                              dot: (
                                <div
                                  style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    background: '#ff4d4f',
                                    border: '3px solid #fff2f0',
                                  }}
                                />
                              ),
                              children: (
                                <div>
                                  <Text
                                    strong
                                    style={{
                                      fontSize: 14,
                                      color: '#262626',
                                      display: 'block',
                                      marginBottom: 8,
                                    }}
                                  >
                                    Delivery Cancelled
                                  </Text>
                                  <Text
                                    style={{ fontSize: 12, color: '#595959' }}
                                  >
                                    Delivery cancelled before completion
                                  </Text>
                                </div>
                              ),
                            },
                          ]),
                    ]}
                  />
                </>
              );
            })()}
          </div>
        </div>

        {order.status_updates && order.status_updates.length > 0 && (
          <div>
            <Text
              strong
              style={{
                fontSize: 16,
                color: '#262626',
                display: 'block',
                marginBottom: 16,
              }}
            >
              Status Updates
            </Text>
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e8e8e8',
                borderRadius: 8,
                padding: 16,
              }}
            >
              <Timeline
                items={order.status_updates.map((update) => ({
                  color: '#1890ff',
                  children: (
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 13, color: '#262626' }}>
                        {update.message}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {dayjs(update.timestamp).format('DD MMM YYYY, HH:mm')} •{' '}
                        {update.created_by}
                      </Text>
                    </div>
                  ),
                }))}
              />
            </div>
          </div>
        )}
      </div>
    )}
  </Modal>
);

export default HistoryDetailModal;
