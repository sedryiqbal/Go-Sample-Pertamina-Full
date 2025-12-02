import {
  CloseOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  PlusOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Tag,
  message,
  Row,
  Space,
  Spin,
  Table,
  Upload,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import {
  fetchComparisonAdditionalData,
  fetchExistingComparisons,
  fetchPropertyTestsBySampleOrder,
  fetchSampleOrderDetail,
  saveComparisons,
} from '../../services/comparison';
import type {
  PropertyTest,
  SampleOrderDetail,
  SaveComparisonsRequest,
} from '../../services/comparison';
import { uploadAttachment } from '@/services/sample-estimations/api';

const { Text, Title } = Typography;

// Interface untuk data parameter COQ
interface COQParameterData {
  key: string;
  propertyTestId: number;
  parameter: string;
  tanks: { [tankNumber: string]: number | null };
  average: number | null;
}

interface AverageCOQModalProps {
  visible: boolean;
  onClose: () => void;
  sampleData: any;
  onSubmit: (data: COQParameterData[]) => void;
}

const AverageCOQModal: React.FC<AverageCOQModalProps> = ({
  visible,
  onClose,
  sampleData,
  onSubmit,
}) => {
  const [_form] = Form.useForm();
  const [tankNumbers, setTankNumbers] = useState<string[]>(['1001', '1002']);
  const [tableData, setTableData] = useState<COQParameterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sampleOrderDetail, setSampleOrderDetail] = useState<SampleOrderDetail | null>(null);
  const [_propertyTests, setPropertyTests] = useState<PropertyTest[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | undefined>();
  const [documentFileList, setDocumentFileList] = useState<UploadFile[]>([]);

  const getFileNameFromUrl = (url?: string) => {
    if (!url) return 'Dokumen Komparasi';
    try {
      const cleanUrl = url.split('?')[0];
      const decoded = decodeURIComponent(cleanUrl);
      const parts = decoded.split('/');
      const fileName = parts[parts.length - 1];
      return fileName || 'Dokumen Komparasi';
    } catch (_error) {
      return 'Dokumen Komparasi';
    }
  };

  // Load data when modal opens
  useEffect(() => {
    const loadData = async () => {
      if (!visible || !sampleData?.id) return;

      setLoading(true);
      try {
        // Fetch property tests, sample order detail, and existing comparisons in parallel
        const sampleOrderId = parseInt(sampleData.id, 10);
        const [tests, detail, existingData, additionalData] = await Promise.all([
          fetchPropertyTestsBySampleOrder(sampleOrderId),
          fetchSampleOrderDetail(sampleOrderId),
          fetchExistingComparisons(sampleOrderId),
          fetchComparisonAdditionalData(sampleOrderId),
        ]);

        setPropertyTests(tests);
        setSampleOrderDetail(detail);

        // Check if we have existing data
        const hasExistingData = existingData && existingData.length > 0;
        setIsEditMode(hasExistingData);

        // Determine tank numbers - use existing data tanks or default
        let tankNumbersToUse = ['1001', '1002'];
        if (hasExistingData) {
          const tankNumbersSet = new Set<string>();
          existingData.forEach((item) => {
            item.tankData.forEach((tank) => {
              tankNumbersSet.add(String(tank.noTanki));
            });
          });
          const existingTankNumbers = Array.from(tankNumbersSet).sort();
          tankNumbersToUse = existingTankNumbers.length > 0 ? existingTankNumbers : ['1001', '1002'];
        }
        setTankNumbers(tankNumbersToUse);

        // Create a map of existing data by propertyTestId for quick lookup
        const existingDataMap = new Map<number, typeof existingData[0]>();
        if (hasExistingData) {
          existingData.forEach((item) => {
            existingDataMap.set(item.propertyTestId, item);
          });
        }

        // Always use property tests as the base and merge with existing data
        const initData: COQParameterData[] = tests.map((test) => {
          const existingItem = existingDataMap.get(test.id);
          
          // Initialize tanks object with all tank numbers
          const tanks: { [tankNumber: string]: number | null } = {};
          tankNumbersToUse.forEach((tankNum) => {
            tanks[tankNum] = null; // Default to null
          });

          // If we have existing data for this property test, fill in the values
          if (existingItem) {
            existingItem.tankData.forEach((tank) => {
              tanks[String(tank.noTanki)] = tank.coq;
            });
          }

          // Calculate average from tank data
          const values = Object.values(tanks).filter(
            (v) => v !== null && v !== undefined,
          ) as number[];
          const average =
            values.length > 0
              ? values.reduce((sum, val) => sum + val, 0) / values.length
              : null;

          return {
            key: `property_${test.id}`,
            propertyTestId: test.id,
            parameter: test.title,
            tanks,
            average,
          };
        });

        setTableData(initData);

        const docUrl =
          additionalData?.documentCompartion ||
          (detail as any)?.documentCompartion ||
          (detail as any)?.documentComparison ||
          ((existingData?.[0] as any)?.documentCompartion as string | undefined) ||
          undefined;
        if (typeof docUrl === 'string' && docUrl.length) {
          setDocumentUrl(docUrl);
          setDocumentFileList([
            {
              uid: 'existing-doc',
              name: getFileNameFromUrl(docUrl),
              status: 'done',
              url: docUrl,
            },
          ]);
        } else {
          setDocumentUrl(undefined);
          setDocumentFileList([]);
        }
      } catch (error) {
        console.error('Failed to load COQ data:', error);
        message.error('Gagal memuat data properti test');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [visible, sampleData?.id]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setTableData([]);
      setPropertyTests([]);
      setSampleOrderDetail(null);
      setTankNumbers(['1001', '1002']);
      setIsEditMode(false);
      setDocumentUrl(undefined);
      setDocumentFileList([]);
    }
  }, [visible]);

  const handleAddTank = () => {
    const newTankNumber = `${1000 + tankNumbers.length + 1}`;
    const newTankNumbers = [...tankNumbers, newTankNumber];
    setTankNumbers(newTankNumbers);

    // Update table data with new tank column
    const updatedData = tableData.map((row) => ({
      ...row,
      tanks: { ...row.tanks, [newTankNumber]: null },
    }));
    setTableData(updatedData);
  };

  const handleRemoveTank = (tankNumber: string) => {
    if (tankNumbers.length <= 1) {
      message.warning('Minimal harus ada satu tangki');
      return;
    }

    const newTankNumbers = tankNumbers.filter((num) => num !== tankNumber);
    setTankNumbers(newTankNumbers);

    // Update table data by removing the tank column and recalculate average
    const updatedData = tableData.map((row) => {
      const { [tankNumber]: _removed, ...restTanks } = row.tanks;
      
      // Recalculate average after removing tank
      const values = Object.values(restTanks).filter(
        (v) => v !== null && v !== undefined,
      ) as number[];
      const average =
        values.length > 0
          ? values.reduce((sum, val) => sum + val, 0) / values.length
          : null;

      return { ...row, tanks: restTanks, average };
    });
    setTableData(updatedData);
  };

  const handleTankNumberChange = (oldNumber: string, newNumber: string) => {
    const newTankNumbers = tankNumbers.map((num) =>
      num === oldNumber ? newNumber : num,
    );
    setTankNumbers(newTankNumbers);

    // Update table data with new tank number
    const updatedData = tableData.map((row) => {
      const tanks = { ...row.tanks };
      if (tanks[oldNumber] !== undefined) {
        tanks[newNumber] = tanks[oldNumber];
        delete tanks[oldNumber];
      }
      return { ...row, tanks };
    });
    setTableData(updatedData);
  };

  const handleValueChange = (
    paramKey: string,
    tankNumber: string,
    value: number | null,
  ) => {
    const updatedData = tableData.map((row) => {
      if (row.key === paramKey) {
        const newTanks = { ...row.tanks, [tankNumber]: value };

        // Calculate average
        const values = Object.values(newTanks).filter(
          (v) => v !== null && v !== undefined,
        ) as number[];
        const average =
          values.length > 0
            ? values.reduce((sum, val) => sum + val, 0) / values.length
            : null;

        return { ...row, tanks: newTanks, average };
      }
      return row;
    });
    setTableData(updatedData);
  };

  const openInNewTab = (url?: string) => {
    if (!url) {
      message.warning('Dokumen tidak tersedia.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDocumentUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onError, onSuccess } = options;
    const uploadFile = file as File;
    const hide = message.loading('Mengunggah dokumen...', 0);

    try {
      const uploaded = await uploadAttachment(uploadFile);
      hide();
      if (!uploaded?.fileUrl) {
        throw new Error('URL dokumen tidak tersedia');
      }
      const url = uploaded.fileUrl;
      const fileName = uploaded.fileName || uploadFile.name || getFileNameFromUrl(url);
      setDocumentUrl(url);
      setDocumentFileList([
        {
          uid: `${Date.now()}`,
          name: fileName,
          status: 'done',
          url,
        },
      ]);
      message.success('Dokumen berhasil diunggah');
      onSuccess?.({ url }, uploadFile as any);
    } catch (error: any) {
      hide();
      const errorMessage =
        error?.message || 'Gagal mengunggah dokumen. Silakan coba kembali.';
      message.error(errorMessage);
      onError?.(error as Error);
    }
  };

  const handleDocumentRemove = () => {
    setDocumentUrl(undefined);
    setDocumentFileList([]);
  };

  const handleDocumentPreview = async (file: UploadFile) => {
    const url =
      file.url ||
      (typeof file.thumbUrl === 'string' ? file.thumbUrl : undefined) ||
      (file.response as any)?.url ||
      (file.response as any)?.fileUrl;
    if (!url) {
      message.warning('Dokumen belum tersedia untuk pratinjau.');
      return;
    }
    openInNewTab(url);
  };

  const handleSubmit = async () => {
    const hasData = tableData.some((row) =>
      Object.values(row.tanks).some((value) => value !== null && value !== undefined),
    );

    if (!hasData) {
      message.error('Minimal harus ada satu nilai yang diisi');
      return;
    }

    setSaving(true);
    try {
      // Build the request payload
      const comparisons = tableData
        .filter((row) =>
          Object.values(row.tanks).some((value) => value !== null && value !== undefined),
        )
        .map((row) => ({
          propertyTestId: row.propertyTestId,
          tankData: Object.entries(row.tanks)
            .filter(([_, value]) => value !== null && value !== undefined)
            .map(([tankNum, value]) => ({
              noTanki: tankNum,
              coq: value as number,
            })),
        }));

      const requestData: SaveComparisonsRequest = {
        sampleOrderId: parseInt(sampleData.id, 10),
        comparisons,
        documentCompartion: documentUrl,
      };

      const response = await saveComparisons(requestData);

      if (response?.status) {
        message.success('Average COQ berhasil disimpan');
        onSubmit(tableData);
        onClose();
      } else {
        message.error(response?.message || 'Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Failed to save comparisons:', error);
      message.error('Gagal menyimpan Average COQ');
    } finally {
      setSaving(false);
    }
  };

  // Generate table columns
  const generateColumns = (): ColumnsType<COQParameterData> => {
    const columns: ColumnsType<COQParameterData> = [
      {
        title: '',
        dataIndex: 'parameter',
        key: 'parameter',
        width: 200,
        fixed: 'left',
        render: (text) => (
          <div
            style={{
              fontWeight: 500,
              fontSize: '13px',
              padding: '8px 0',
            }}
          >
            {text}
          </div>
        ),
      },
    ];

    // Add tank columns
    tankNumbers.forEach((tankNumber) => {
      columns.push({
        title: (
          <div style={{ textAlign: 'center' }}>
            <Input
              value={tankNumber}
              onChange={(e) =>
                handleTankNumberChange(tankNumber, e.target.value)
              }
              style={{
                textAlign: 'center',
                fontWeight: 600,
                backgroundColor: '#95d475',
                border: '1px solid #73c653',
                color: '#000',
              }}
              size="small"
            />
            {tankNumbers.length > 1 && (
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveTank(tankNumber)}
                style={{ marginTop: 4, fontSize: '10px' }}
              />
            )}
          </div>
        ),
        dataIndex: ['tanks', tankNumber],
        key: tankNumber,
        width: 120,
        align: 'center',
        render: (value, record) => (
          <InputNumber
            value={value}
            onChange={(val) => handleValueChange(record.key, tankNumber, val)}
            style={{ width: '100%' }}
            size="small"
            precision={record.key === 'corrosion_cs' ? 0 : 1}
            controls={false}
            placeholder="-"
          />
        ),
      });
    });

    // Add average column
    columns.push({
      title: (
        <div
          style={{
            textAlign: 'center',
            fontWeight: 600,
            backgroundColor: '#95d475',
            color: '#000',
            padding: '4px 8px',
            borderRadius: 4,
          }}
        >
          AVERAGE COQ
        </div>
      ),
      dataIndex: 'average',
      key: 'average',
      width: 120,
      align: 'center',
      render: (value) => (
        <div
          style={{
            fontWeight: 600,
            color: '#262626',
            fontSize: '13px',
          }}
        >
          {value !== null
            ? typeof value === 'string'
              ? value
              : value.toFixed(1)
            : '-'}
        </div>
      ),
    });

    return columns;
  };

  const handleClose = () => {
    onClose();
  };

  const headerInfo = {
    sampleId:
      sampleOrderDetail?.sampleId !== undefined && sampleOrderDetail?.sampleId !== null
        ? String(sampleOrderDetail.sampleId)
        : sampleData?.sample_id || '-',
    sampleType:
      sampleOrderDetail?.sampleType || sampleData?.sample_type || '-',
  };

  const coqInfo = {
    orderNo: sampleOrderDetail?.orderNo || sampleData?.order_number || '-',
    nomorNpc: sampleOrderDetail?.nomorNpc || sampleData?.sample_id || '-',
    orderDate:
      sampleOrderDetail?.tanggalOrder || sampleData?.order_date || null,
    productType:
      sampleOrderDetail?.typeLoadName ||
      sampleOrderDetail?.sampleType ||
      sampleData?.sample_type ||
      '-',
    shipName:
      sampleOrderDetail?.shipName ||
      sampleOrderDetail?.vessel ||
      sampleData?.vessel_name ||
      '-',
  };

  const infoItems = [
    { key: 'orderNo', label: 'Order No', value: coqInfo.orderNo },
    { key: 'nomorNpc', label: 'Nomor NPC', value: coqInfo.nomorNpc },
    {
      key: 'tanggalOrder',
      label: 'Tanggal Order',
      value: coqInfo.orderDate
        ? dayjs(coqInfo.orderDate).format('DD MMM YYYY HH:mm')
        : '-',
    },
    { key: 'typeLoadName', label: 'Jenis Muatan', value: coqInfo.productType },
    { key: 'shipName', label: 'Nama Kapal', value: coqInfo.shipName },
  ];

  const documentUploaded = Boolean(documentUrl);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ExperimentOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
          <div>
            <Title level={4} style={{ margin: 0, color: '#262626' }}>
              {isEditMode ? 'Edit Average COQ' : 'Average COQ Input'}
            </Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {sampleData
                ? `${headerInfo.sampleId} • ${headerInfo.sampleType}`
                : 'Input nilai rata-rata COQ per tangki'}
            </Text>
          </div>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      width={1200}
      style={{ top: 20 }}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button
            icon={<PlusOutlined />}
            onClick={handleAddTank}
            style={{ borderColor: '#52c41a', color: '#52c41a' }}
            disabled={loading || saving}
          >
            Tambah Tangki
          </Button>
          <Space>
            <Button icon={<CloseOutlined />} onClick={handleClose} disabled={saving}>
              Batal
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={saving}
              disabled={loading || tableData.length === 0}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              {isEditMode ? 'Update Average COQ' : 'Simpan Average COQ'}
            </Button>
          </Space>
        </div>
      }
    >
      <Spin spinning={loading || saving} tip={loading ? 'Memuat data...' : 'Menyimpan...'}>
        <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '0 4px' }}>
          {/* Sample Information Header */}
          <Card
            size="small"
            style={{
              marginBottom: 16,
              background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
              border: '1px solid #b7eb8f',
            }}
          >
            <Row gutter={[16, 12]}>
              {infoItems.map((item) => (
                <Col xs={24} sm={12} md={8} lg={8} xl={6} key={item.key}>
                  <Text strong style={{ color: '#389e0d' }}>
                    {item.label}
                  </Text>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>
                    {item.value}
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

        {/* COQ Table */}
        <Card
          size="small"
          style={{
            borderRadius: 8,
            border: '1px solid #d9d9d9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <style>
            {`
              .coq-table .ant-table-thead > tr > th {
                background-color: #95d475 !important;
                font-weight: 600;
                text-align: center;
                border: 1px solid #73c653 !important;
                color: #000 !important;
                padding: 12px 8px;
              }
              .coq-table .ant-table-tbody > tr > td {
                padding: 8px;
                text-align: center;
                border: 1px solid #e8e8e8 !important;
              }
              .coq-table .ant-table-tbody > tr:nth-child(odd) > td {
                background-color: #fafafa;
              }
              .coq-table .ant-table-tbody > tr:hover > td {
                background-color: #e6f7ff !important;
              }
              .coq-table .ant-input-number {
                border: none;
                background: transparent;
              }
              .coq-table .ant-input-number-input {
                text-align: center;
                font-weight: 500;
              }
            `}
          </style>
          {tableData.length > 0 ? (
            <Table
              columns={generateColumns()}
              dataSource={tableData}
              pagination={false}
              size="small"
              bordered
              scroll={{ x: 'max-content' }}
              rowKey="key"
              className="coq-table"
            />
          ) : (
            !loading && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
                Tidak ada data property test tersedia
              </div>
            )
          )}
        </Card>

        {/* Dokumentasi Komparasi */}
        <Card
          size="small"
          style={{
            marginTop: 16,
            border: '1px dashed #b7eb8f',
            backgroundColor: '#fcfffa',
          }}
        >
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Space size={8}>
                <Text strong style={{ color: '#237804' }}>
                  Dokumen Komparasi (COQ)
                </Text>
                <Tag color={documentUploaded ? 'green' : 'default'}>
                  {documentUploaded ? 'Sudah diupload' : 'Belum ada dokumen'}
                </Tag>
              </Space>
              {documentUrl && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => openInNewTab(documentUrl)}
                  style={{ padding: 0 }}
                >
                  Lihat Dokumen
                </Button>
              )}
            </div>
            <Upload
              fileList={documentFileList}
              customRequest={handleDocumentUpload}
              maxCount={1}
              onRemove={() => {
                handleDocumentRemove();
                return true;
              }}
              onPreview={handleDocumentPreview}
              accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
              disabled={saving}
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
              }}
            >
              <Button icon={<UploadOutlined />} disabled={saving}>
                {documentUrl ? 'Ganti Dokumen' : 'Upload Dokumen'}
              </Button>
            </Upload>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Format yang didukung: PDF, DOC, XLS, atau gambar. Dokumen ini akan
              dikirim bersama data Average COQ sebagai referensi lab dan dapat
              dipreview di halaman Comparison Result.
            </Text>
          </Space>
        </Card>

        {/* Summary Information */}
        <Card
          size="small"
          style={{
            marginTop: 16,
            background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
            border: '1px solid #b7eb8f',
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#52c41a',
                  }}
                >
                  {tankNumbers.length}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  Total Tangki
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#1890ff',
                  }}
                >
                  {tableData.reduce(
                    (sum, row) =>
                      sum +
                      Object.values(row.tanks).filter(
                        (val) => val !== null && val !== undefined,
                      ).length,
                    0,
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  Total Parameter Terisi
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#fa8c16',
                  }}
                >
                  {tableData.filter((row) => row.average !== null).length}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  Parameter dengan Average
                </div>
              </div>
            </Col>
          </Row>
        </Card>
        </div>
      </Spin>
    </Modal>
  );
};

export default AverageCOQModal;
