import React from 'react';

const styleContent = `
  @media (max-width: 768px) {
    .ant-col {
      margin-bottom: 16px;
    }
    .shipping-card .ant-card-body {
      padding: 12px !important;
    }
    .shipping-summary .ant-statistic-title {
      font-size: 12px !important;
    }
    .shipping-summary .ant-statistic-content-value {
      font-size: 18px !important;
    }
    .pending-order-card {
      margin-bottom: 12px !important;
    }
    .pending-order-card .ant-card-body {
      padding: 12px !important;
    }
  }

  @media (max-width: 576px) {
    .ant-page-header-heading-title {
      font-size: 20px !important;
    }
    .shipping-metrics {
      padding: 6px !important;
    }
    .reward-text {
      font-size: 12px !important;
    }
  }

  .pending-order-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.12) !important;
    transition: all 0.3s ease;
  }

  .urgent-pulse {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(255, 77, 79, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 77, 79, 0);
    }
  }

  /* Table Styling */
  .ant-table-thead > tr > th {
    background: linear-gradient(135deg, #f0f2f5 0%, #fafbfc 100%);
    border-bottom: 2px solid #e8f4fd;
    font-weight: 600;
    font-size: 12px;
    color: #434343;
    padding: 12px 8px;
  }

  .ant-table-tbody > tr > td {
    padding: 12px 8px;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: top;
  }

  .ant-table-tbody > tr:hover > td {
    background: #f8fbff !important;
  }

  .completed-row {
    background: linear-gradient(135deg, #f6ffed 0%, #ffffff 100%);
  }

  .completed-row:hover {
    background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%) !important;
  }

  .cancelled-row {
    background: linear-gradient(135deg, #fff2f0 0%, #ffffff 100%);
  }

  .cancelled-row:hover {
    background: linear-gradient(135deg, #fff7f0 0%, #ffffff 100%) !important;
  }

  .ant-table {
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  .ant-table-pagination {
    margin: 16px 0 0 0 !important;
    padding: 16px;
    background: #fafafa;
    border-radius: 0 0 8px 8px;
    border-top: 1px solid #f0f0f0;
  }

  .ant-pagination-item-active {
    background: #1890ff;
    border-color: #1890ff;
  }

  .ant-pagination-item-active a {
    color: #ffffff;
  }

  .ant-table-small .ant-table-thead > tr > th {
    padding: 8px 6px;
    font-size: 11px;
  }

  .ant-table-small .ant-table-tbody > tr > td {
    padding: 8px 6px;
  }

  /* Mobile Table Responsiveness */
  @media (max-width: 768px) {
    .ant-table-scroll {
      overflow-x: auto;
    }

    .ant-table-pagination {
      padding: 12px;
    }

    .ant-pagination-options {
      display: none;
    }
  }

  /* Tab Styling */
  .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab {
    border-radius: 8px 8px 0 0;
    font-weight: 500;
    background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
    border-color: #d9d9d9;
    transition: all 0.3s ease;
  }

  .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active {
    background: linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%);
    border-color: #1890ff;
    color: #1890ff;
  }

  .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab:hover {
    background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
    border-color: #40a9ff;
  }

  .ant-tabs-content-holder {
    background: #ffffff;
    border-radius: 0 0 8px 8px;
  }

  /* Progress Card Styling */
  .progress-order-card {
    transition: all 0.3s ease;
  }

  .progress-order-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(250, 140, 22, 0.15) !important;
  }

  /* Timeline Customization */
  .ant-timeline .ant-timeline-item-tail {
    border-left: 2px solid #f0f0f0;
  }

  .ant-timeline .ant-timeline-item-head {
    border-width: 2px;
  }

  /* Progress Bar Customization */
  .ant-progress-bg {
    border-radius: 4px;
  }

  .ant-progress-outer {
    border-radius: 4px;
  }
`;

const ShippingStyles: React.FC = () => <style>{styleContent}</style>;

export default ShippingStyles;
