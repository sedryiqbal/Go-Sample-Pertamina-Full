import { CloseOutlined, DownloadOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Modal,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { request } from '@umijs/max';
import { TEST_PARAMETERS } from '../constants/testParameters';
import type { TestingRecord } from '../types';
import { getPriorityColor } from '../utils/helpers';

const { Title, Text } = Typography;

interface TestingReportModalProps {
  visible: boolean;
  record: TestingRecord | null;
  onClose: () => void;
}

interface PropertyTestParameter {
  name: string;
  key: string;
  unit: string;
  method: string;
  standard?: string;
  min?: number;
  max?: number;
  propertyTestId?: number;
  satuanId?: number;
}

interface SavedTestResult {
  propertyTestId: number;
  satuanId?: number;
  unit?: string;
  method?: string;
  value?: number;
  propertyTestTitle?: string;
}

const DEFAULT_PROPERTY_TESTS: PropertyTestParameter[] = TEST_PARAMETERS.map(
  (param, index) => ({
    name: param.name,
    key: param.key || `property-${index}`,
    unit: param.unit,
    method: param.method,
    standard: param.standard,
    min: param.min,
    max: param.max,
    propertyTestId: Number.isFinite(Number(param.key))
      ? Number(param.key)
      : undefined,
  }),
);

const normalizePropertyTests = (data: any[]): PropertyTestParameter[] =>
  data
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((item: any, index: number) => {
      const key =
        item.id ??
        item.key ??
        item.code ??
        item.propertyId ??
        `property-${index}`;
      const propertyTestId =
        typeof item.propertyTestId === 'number'
          ? item.propertyTestId
          : typeof item.id === 'number'
            ? item.id
            : typeof item.propertyId === 'number'
              ? item.propertyId
              : undefined;
      const satuanId =
        typeof item.satuanId === 'number'
          ? item.satuanId
          : typeof item.unitId === 'number'
            ? item.unitId
            : undefined;
      return {
        name:
          item.title ||
          item.name ||
          item.propertyName ||
          item.testName ||
          `Property ${index + 1}`,
        key: String(key),
        unit: item.unit || item.unitName || item.unitLabel || '',
        standard: item.standard || item.standardName || '',
        min:
          typeof item.min === 'number'
            ? item.min
            : typeof item.minValue === 'number'
              ? item.minValue
              : undefined,
        max:
          typeof item.max === 'number'
            ? item.max
            : typeof item.maxValue === 'number'
              ? item.maxValue
              : undefined,
        method: item.method || '',
        propertyTestId,
        satuanId,
      };
    });

const resolvePropertyTestId = (
  param: PropertyTestParameter | undefined,
  fallbackKey?: string,
): number | undefined => {
  if (typeof param?.propertyTestId === 'number') {
    return param.propertyTestId;
  }
  const numericKey = Number(fallbackKey || param?.key);
  return Number.isFinite(numericKey) ? numericKey : undefined;
};

const extractResultValue = (result: any) => {
  if (result === null || result === undefined) return undefined;
  if (typeof result === 'number' || typeof result === 'string') {
    return result;
  }
  if (typeof result === 'object') {
    if (result.value !== undefined) return result.value;
    if (result.result !== undefined) return result.result;
    if (result.reading !== undefined) return result.reading;
  }
  return undefined;
};

interface PriceTestEntry {
  propertyTestId: number;
  price?: number;
}

const priceFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const TestingReportModal: React.FC<TestingReportModalProps> = ({
  visible,
  record,
  onClose,
}) => {
  if (!record) return null;

  const [propertyTests, setPropertyTests] = useState<PropertyTestParameter[]>(
    DEFAULT_PROPERTY_TESTS,
  );
  const [existingTestResults, setExistingTestResults] = useState<
    Record<number, SavedTestResult>
  >({});
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceMap, setPriceMap] = useState<Record<number, number>>({});
  const [downloadLoading, setDownloadLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    if (!record?.categoryTestId) {
      setPropertyTests(DEFAULT_PROPERTY_TESTS);
      return;
    }

    let isCancelled = false;
    const fetchPropertyTests = async () => {
      setPropertyLoading(true);
      try {
        const response = await request(
          `/api/PropertyTests/by-category/${record.categoryTestId}`,
        );
        if (isCancelled) return;
        const list = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        const normalized = normalizePropertyTests(list);
        setPropertyTests(
          normalized.length ? normalized : DEFAULT_PROPERTY_TESTS,
        );
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to fetch property tests', error);
          message.error('Gagal mengambil daftar parameter uji');
          setPropertyTests(DEFAULT_PROPERTY_TESTS);
        }
      } finally {
        if (!isCancelled) {
          setPropertyLoading(false);
        }
      }
    };

    fetchPropertyTests();
    return () => {
      isCancelled = true;
    };
  }, [visible, record?.categoryTestId]);

  useEffect(() => {
    if (!visible) {
      setExistingTestResults({});
      setPriceMap({});
      return;
    }
    if (!record?.id) {
      setExistingTestResults({});
      return;
    }

    let isCancelled = false;
    const fetchExistingResults = async () => {
      setResultsLoading(true);
      try {
        const response = await request(
          `/api/LabTesting/sample-orders/${record.id}/tests`,
        );
        if (isCancelled) return;
        const list = Array.isArray(response?.data) ? response.data : [];
        const normalized: Record<number, SavedTestResult> = {};
        list.forEach((item: any) => {
          if (typeof item?.propertyTestId !== 'number') return;
          const numericValue =
            typeof item.value === 'number'
              ? item.value
              : item.value !== undefined
                ? Number(item.value)
                : undefined;
          normalized[item.propertyTestId] = {
            propertyTestId: item.propertyTestId,
            satuanId:
              typeof item.satuanId === 'number' ? item.satuanId : undefined,
            unit: item.satuanName || '',
            method: item.method || '',
            value:
              numericValue !== undefined && !Number.isNaN(numericValue)
                ? numericValue
                : undefined,
            propertyTestTitle: item.propertyTestTitle,
          };
        });
        setExistingTestResults(normalized);
        if (list.length) {
          setPropertyTests((prev) => {
            const next = [...prev];
            list.forEach((item: any) => {
              if (typeof item?.propertyTestId !== 'number') return;
              const key = String(item.propertyTestId);
              const exists = next.some(
                (test) =>
                  test.propertyTestId === item.propertyTestId ||
                  test.key === key,
              );
              if (!exists) {
                next.push({
                  name: item.propertyTestTitle || `Property ${next.length + 1}`,
                  key,
                  unit: item.satuanName || '',
                  standard: '',
                  method: item.method || '',
                  propertyTestId: item.propertyTestId,
                  satuanId:
                    typeof item.satuanId === 'number' ? item.satuanId : undefined,
                });
              }
            });
            return next;
          });
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to fetch lab test results', error);
          message.error('Gagal mengambil hasil pengujian');
        }
      } finally {
        if (!isCancelled) {
          setResultsLoading(false);
        }
      }
    };

    fetchExistingResults();
    return () => {
      isCancelled = true;
    };
  }, [visible, record?.id]);

  useEffect(() => {
    if (!visible) {
      setPriceMap({});
      return;
    }

    let isCancelled = false;
    const fetchPrices = async () => {
      setPriceLoading(true);
      try {
        const aggregated: Record<number, number> = {};
        let page = 1;
        const pageSize = 100;
        let totalPage = 1;

        do {
          const response = await request('/api/PriceTests/', {
            method: 'GET',
            params: { page, pageSize },
          });

          const list: PriceTestEntry[] = Array.isArray(response?.data)
            ? response.data
            : [];

          list.forEach((item) => {
            if (typeof item.propertyTestId === 'number') {
              const normalizedPrice =
                typeof item.price === 'number'
                  ? item.price
                  : item.price !== undefined
                    ? Number(item.price)
                    : undefined;
              if (normalizedPrice !== undefined && !Number.isNaN(normalizedPrice)) {
                aggregated[item.propertyTestId] = normalizedPrice;
              }
            }
          });

          const metaTotalPage =
            response?.meta?.pagination?.totalPage ??
            response?.meta?.pagination?.totalPages ??
            1;
          totalPage = Number.isFinite(metaTotalPage) ? metaTotalPage : 1;
          page += 1;
        } while (page <= totalPage && !isCancelled);

        if (!isCancelled) {
          setPriceMap(aggregated);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to fetch price tests', error);
        }
      } finally {
        if (!isCancelled) {
          setPriceLoading(false);
        }
      }
    };

    fetchPrices();
    return () => {
      isCancelled = true;
    };
  }, [visible]);

  const detailedResults = useMemo(() => {
    return propertyTests.map((test, index) => {
      const propertyId = resolvePropertyTestId(test, test.key);
      const existingResult = propertyId
        ? existingTestResults[propertyId]
        : undefined;
      const fallbackKey = test.key || test.name;
      const fallbackResult =
        (fallbackKey && record.test_results?.[fallbackKey]) ||
        (test.name && record.test_results?.[test.name]);
      const mergedResult = existingResult || fallbackResult;
      const displayName =
        existingResult?.propertyTestTitle ||
        test.name ||
        fallbackKey ||
        `Property ${index + 1}`;
      const displayUnit =
        existingResult?.unit ||
        (typeof fallbackResult === 'object' ? fallbackResult.unit : undefined) ||
        test.unit ||
        '-';
      const rawMethod =
        existingResult?.method ||
        (typeof fallbackResult === 'object'
          ? fallbackResult.method
          : undefined) ||
        test.method ||
        '';
      const displayMethod =
        rawMethod && String(rawMethod).trim().length ? rawMethod : '-';
      const value =
        existingResult?.value !== undefined
          ? existingResult.value
          : extractResultValue(fallbackResult);
      const price =
        propertyId && typeof priceMap[propertyId] === 'number'
          ? priceMap[propertyId]
          : undefined;
      return {
        key: test.key || `test-${index}`,
        name: displayName,
        unit: displayUnit || '-',
        method: displayMethod || '-',
        value: value ?? '-',
        price,
      };
    });
  }, [propertyTests, existingTestResults, record.test_results, priceMap]);

  const totalPrice = useMemo(() => {
    return detailedResults.reduce((sum, item) => {
      if (typeof item.price === 'number') {
        return sum + item.price;
      }
      return sum;
    }, 0);
  }, [detailedResults]);

  const isLoading = propertyLoading || resultsLoading || priceLoading;

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    try {
      setDownloadLoading(true);
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      const filename = `testing-report-${record.order_number || record.id}.pdf`;
      pdf.save(filename);
      message.success('Laporan berhasil diunduh');
    } catch (error) {
      console.error('Failed to generate PDF', error);
      message.error('Gagal mengunduh laporan');
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: 20 }}
      bodyStyle={{ padding: 0 }}
      closeIcon={<CloseOutlined style={{ color: 'white', fontSize: '16px' }} />}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '12px 24px',
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: '#fafafa',
        }}
        data-html2canvas-ignore="true"
      >
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownloadPdf}
          loading={downloadLoading}
        >
          Download PDF
        </Button>
      </div>
      <div ref={reportRef}>
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '24px',
            color: 'white',
          }}
        >
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            📊 Laporan Hasil Pengujian
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
            Laporan lengkap hasil analisis laboratorium
          </Text>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Sample Information */}
          <Card
            title="📋 Informasi Sampel"
            style={{ marginBottom: 24 }}
            headStyle={{
              background: 'linear-gradient(90deg, #f0f2f5 0%, #ffffff 100%)',
              borderBottom: '2px solid #1890ff',
            }}
          >
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Nomor NPC">
                {record.nomorNpc || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Order Number">
                {record.order_number || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Jenis Sampel">
                {record.sample_type || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Kategori Tes">
                {record.categoryTestName ? (
                  <Tag color="blue">{record.categoryTestName}</Tag>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Kapal/Tangki">
                {record.sample?.shipName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Diterima">
                {record.received_date && dayjs(record.received_date).isValid()
                  ? dayjs(record.received_date).format('DD/MM/YYYY')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Prioritas">
                {record.priority ? (
                  <Tag color={getPriorityColor(record.priority)}>
                    {record.priority.toUpperCase()}
                  </Tag>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Dibuat Pada">
                {record.createdAt
                  ? dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Catatan">
                {record.notes || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Divider orientation="left" orientationMargin="0">
            <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
              Detail Hasil Pengujian
            </Text>
          </Divider>

          <Card
            size="small"
            bodyStyle={{ padding: 16 }}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 120px 180px 1fr 140px',
                gap: '8px',
                backgroundColor: '#fafafa',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid #d9d9d9',
                marginBottom: 8,
              }}
            >
              <div>No.</div>
              <div>Property</div>
              <div>Units</div>
              <div>Method</div>
              <div>Results</div>
              <div>Price</div>
            </div>
            <Spin spinning={isLoading}>
              {detailedResults.map((item, index) => (
                <div
                  key={item.key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 120px 180px 1fr 140px',
                    gap: '8px',
                    padding: '10px',
                    borderBottom: '1px solid #f0f0f0',
                    alignItems: 'center',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ color: '#888' }}>{index + 1}</div>
                  <div style={{ fontWeight: 500 }}>{item.name}</div>
                  <div style={{ color: '#666' }}>{item.unit}</div>
                  <div style={{ color: '#666' }}>{item.method}</div>
                  <div style={{ fontWeight: 600 }}>{item.value}</div>
                  <div style={{ fontWeight: 600, color: '#1890ff' }}>
                    {typeof item.price === 'number'
                      ? priceFormatter.format(item.price)
                      : '-'}
                  </div>
                </div>
              ))}
              {!isLoading && !detailedResults.length && (
                <div style={{ padding: '16px', textAlign: 'center' }}>
                  <Text type="secondary">
                    Belum ada hasil pengujian yang tersedia.
                  </Text>
                </div>
              )}
            </Spin>
            <div
              style={{
                marginTop: 16,
                padding: '12px 16px',
                background:
                  'linear-gradient(90deg, rgba(24,144,255,0.08), rgba(24,144,255,0.02))',
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text strong style={{ color: '#1890ff' }}>
                Total Price
              </Text>
              <Text style={{ fontSize: 18, fontWeight: 700, color: '#1890ff' }}>
                {totalPrice > 0 ? priceFormatter.format(totalPrice) : '-'}
              </Text>
            </div>
          </Card>

          {record.quality_notes && (
            <Card
              title="📝 Catatan Kualitas"
              style={{ marginTop: 24 }}
              headStyle={{
                background: 'linear-gradient(90deg, #f0f2f5 0%, #ffffff 100%)',
                borderBottom: '2px solid #faad14',
              }}
            >
              <Text>{record.quality_notes}</Text>
            </Card>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TestingReportModal;
