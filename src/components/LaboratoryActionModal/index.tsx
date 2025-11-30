import {
  CalculatorOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Spin,
  Steps,
  Switch,
  Tag,
  Typography,
} from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { request } from '@umijs/max';

const { TextArea } = Input;
const { Title, Text } = Typography;

type UnitOption = { label: string; value: string; id?: number };

interface PropertyTestParameter {
  name: string;
  key: string;
  unit: string;
  standard: string;
  min?: number;
  max?: number;
  method: string;
  propertyTestId?: number;
  satuanId?: number;
}

interface TestPayload {
  propertyTestId: number;
  satuanId: number;
  method: string;
  value: number;
}

interface SavedTestResult {
  propertyTestId: number;
  satuanId?: number;
  unit?: string;
  method?: string;
  value?: number;
  propertyTestTitle?: string;
}

const DEFAULT_TEST_PARAMETERS: PropertyTestParameter[] = [
  {
    name: 'Colour Saybolt',
    key: 'colour_saybolt',
    unit: '%vol',
    standard: 'ASTM D86-17',
    min: 0,
    max: 100,
    method: 'ASTM D86-17',
  },
  {
    name: 'Distillation IBP',
    key: 'ibp',
    unit: '°C',
    standard: 'ASTM D86-17',
    min: 100,
    max: 200,
    method: 'ASTM D86-17',
  },
  {
    name: 'Distillation 10%',
    key: 'ten_percent',
    unit: '°C',
    standard: '',
    min: 120,
    max: 180,
    method: 'ASTM D86-17',
  },
  {
    name: 'Distillation 50%',
    key: 'fifty_percent',
    unit: '°C',
    standard: '',
    min: 150,
    max: 220,
    method: 'ASTM D86-17',
  },
  {
    name: 'Distillation 90%',
    key: 'ninety_percent',
    unit: '°C',
    standard: '',
    min: 180,
    max: 250,
    method: 'ASTM D86-17',
  },
  {
    name: 'Distillation Endpoint',
    key: 'fbp',
    unit: '°C',
    standard: '',
    min: 200,
    max: 300,
    method: 'ASTM D86-17',
  },
  {
    name: 'Distillation Residue',
    key: 'residue',
    unit: '%vol',
    standard: '',
    min: 0,
    max: 5,
    method: 'ASTM D86-17',
  },
  {
    name: 'Distillation Loss',
    key: 'loss',
    unit: '%vol',
    standard: '',
    min: 0,
    max: 2,
    method: 'ASTM D86-17',
  },
  {
    name: 'Flash Point Abel',
    key: 'flash_point_abel',
    unit: '°C',
    standard: 'BS EN ISO 13736:2008',
    min: 38,
    max: 100,
    method: 'BS EN ISO 13736:2008',
  },
  {
    name: 'Density at 15°C',
    key: 'density_15c',
    unit: 'kg/m³',
    standard: 'ASTM D4052-22',
    min: 775,
    max: 840,
    method: 'ASTM D4052-22',
  },
  {
    name: 'Freezing Point',
    key: 'freezing_point',
    unit: '°C',
    standard: 'ASTM D2386-19',
    min: -50,
    max: -40,
    method: 'ASTM D2386-19',
  },
  {
    name: 'FSII-P.A with SDA',
    key: 'fsii_pa_sda',
    unit: 'mg/kg',
    standard: 'ASTM D5006-22',
    min: 0,
    max: 200,
    method: 'ASTM D5006-22',
  },
  {
    name: 'Copper Strip Corrosion (2h/100°C)',
    key: 'copper_strip_corrosion',
    unit: 'class',
    standard: 'ASTM D130-19',
    min: 1,
    max: 4,
    method: 'ASTM D130-19',
  },
  {
    name: 'Existent Gum (unwashed)',
    key: 'existent_gum',
    unit: 'mg/100ml',
    standard: 'ASTM D381-22',
    min: 0,
    max: 7,
    method: 'ASTM D381-22',
  },
];

export type ActionType =
  | 'confirm_sample'
  | 'waiting_test'
  | 'process_test'
  | 'input_result'
  | 'complete_test';

export interface TestingRecord {
  id: string;
  sample_id: string;
  order_number: string;
  nomorNpc: string;
  sample_type: string;
  shipName: string;
  vessel_name: string;
  tank_number: string;
  testing_status: string;
  lab_technician: string;
  progress_percentage: number;
  priority: string;
  estimated_completion: string;
  categoryTestId?: number | string;
  sample?: {
    qty?: number;
    satuanName?: string;
  };
}

interface LaboratoryActionModalProps {
  visible: boolean;
  onClose: () => void;
  actionType: ActionType;
  record?: TestingRecord;
  onSubmit: (actionType: ActionType, data: any) => void;
  onSave?: (actionType: ActionType, data: any) => void;
  unitOptions?: UnitOption[];
}

const useStyles = createStyles(({ token }) => {
  return {
    actionDrawer: {
      '.ant-drawer-header': {
        borderBottom: `1px solid ${token.colorBorder}`,
      },
    },
    recordInfo: {
      backgroundColor: token.colorBgContainer,
      padding: '16px',
      borderRadius: token.borderRadius,
      marginBottom: '16px',
      border: `1px solid ${token.colorBorder}`,
    },
    actionForm: {
      '.ant-form-item-label > label': {
        fontWeight: 500,
      },
    },
    statusStep: {
      marginBottom: '24px',
    },
  };
});

const LaboratoryActionModal: React.FC<LaboratoryActionModalProps> = ({
  visible,
  onClose,
  actionType,
  record,
  onSubmit,
  onSave,
  unitOptions,
}) => {
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const [isUrgent, setIsUrgent] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const [propertyTests, setPropertyTests] = useState<PropertyTestParameter[]>(
    DEFAULT_TEST_PARAMETERS,
  );
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [missingPropertyTests, setMissingPropertyTests] = useState(false);
  const [existingTestResults, setExistingTestResults] = useState<
    Record<number, SavedTestResult>
  >({});
  const [resultsLoading, setResultsLoading] = useState(false);
  const [hasInitializedResults, setHasInitializedResults] = useState(false);

  // Equipment options with availability status
  const equipmentOptions = [
    { label: 'Viscometer Alat A', value: 'viscometer-a', available: true },
    { label: 'Viscometer Alat B', value: 'viscometer-b', available: false },
    { label: 'Flash Point Tester', value: 'flash-point', available: true },
    { label: 'Karl Fischer Titrator', value: 'karl-fischer', available: true },
    { label: 'Density Meter', value: 'density-meter', available: false },
    { label: 'Freeze Point Tester', value: 'freeze-point', available: true },
    { label: 'GC-MS System', value: 'gc-ms', available: true },
  ];

  const defaultUnitOptions: UnitOption[] = [
    { label: '%vol', value: '%vol' },
    { label: '°C', value: '°C' },
    { label: 'kg/m³', value: 'kg/m³' },
    { label: 'mg/kg', value: 'mg/kg' },
    { label: 'mg/100ml', value: 'mg/100ml' },
    { label: 'class', value: 'class' },
    { label: 'bar', value: 'bar' },
    { label: 'mm²/s', value: 'mm²/s' },
    { label: 'g/mol', value: 'g/mol' },
    { label: 'ppm', value: 'ppm' },
    { label: '%', value: '%' },
    { label: 'Pa·s', value: 'Pa·s' },
  ];
  const emptySelectOption: UnitOption = { label: 'Tidak diisi', value: '' };
  const unitSelectOptions: UnitOption[] = [
    emptySelectOption,
    ...((unitOptions && unitOptions.length
      ? unitOptions
      : defaultUnitOptions) ?? []),
  ];

  const normalizePropertyTests = (data: any[]) =>
    data
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((item, index) => {
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
          method:
            item.method ||
            item.methodName ||
            item.description ||
            'Custom Method',
          propertyTestId,
          satuanId,
        };
      });
  const getActionConfig = (type: ActionType) => {
    switch (type) {
      case 'confirm_sample':
        return {
          title: 'Konfirmasi Sample',
          icon: <CheckCircleOutlined />,
          color: '#52c41a',
          description:
            'Konfirmasi penerimaan dan registrasi sampel untuk memulai proses pengujian',
          fields: ['description', 'priority_notes'],
          helpText:
            'Pastikan kondisi sampel sesuai dengan standar penerimaan laboratorium',
        };
      case 'waiting_test':
        return {
          title: 'Menunggu Pengujian',
          icon: <ClockCircleOutlined />,
          color: '#faad14',
          description:
            'Jadwalkan pengujian dengan estimasi waktu dan equipment yang diperlukan',
          fields: [
            'description',
            'estimated_completion',
            'equipment_needed',
            'urgency',
          ],
          helpText:
            'Perkirakan waktu berdasarkan kompleksitas pengujian dan ketersediaan alat',
        };
      case 'process_test':
        return {
          title: 'Proses Pengujian',
          icon: <SyncOutlined />,
          color: '#1890ff',
          description:
            'Mulai proses pengujian dan monitor progress secara real-time',
          fields: ['description', 'equipment_used', 'technician_notes'],
          helpText:
            'Dokumentasikan setiap tahap pengujian untuk keperluan audit',
        };
      case 'input_result':
        return {
          title: 'Input Hasil Pengujian',
          icon: <FileTextOutlined />,
          color: '#722ed1',
          description:
            'Input hasil pengujian dengan detail parameter yang telah dianalisis',
          fields: [
            'test_results_detailed',
            'quality_assessment',
            'recommendations',
          ],
          helpText:
            'Pastikan semua parameter telah diuji sesuai dengan standar yang berlaku',
        };
      case 'complete_test':
        return {
          title: 'Selesai Pengujian',
          icon: <ExperimentOutlined />,
          color: '#fd0017',
          description:
            'Finalisasi dan validasi hasil pengujian untuk laporan akhir',
          fields: ['final_summary', 'certification_status', 'next_actions'],
          helpText:
            'Review semua data dan pastikan hasil dapat dipertanggungjawabkan',
        };
      default:
        return {
          title: 'Aksi',
          icon: <CheckCircleOutlined />,
          color: '#1890ff',
          description: '',
          fields: [],
          helpText: '',
        };
    }
  };

  const mapStatusToStep = (status: string) => {
    if (status === 'shipped') return 0;
    if (status === 'registered') return 1;
    if (status === 'testing') return 2;
    if (status === 'completed') return 3;
    return 1;
  };

  const resolvePropertyTestId = (
    param: PropertyTestParameter | undefined,
    key: string,
  ): number | undefined => {
    if (typeof param?.propertyTestId === 'number') {
      return param.propertyTestId;
    }
    const numericKey = Number(key);
    return Number.isFinite(numericKey) ? numericKey : undefined;
  };

  const resolveSatuanId = (
    unitValue?: string,
    param?: PropertyTestParameter,
  ): number | undefined => {
    const candidates = [unitValue, param?.unit].filter(
      (val): val is string => !!val,
    );
    for (const candidate of candidates) {
      const option = unitSelectOptions.find(
        (item) => item.value === candidate,
      );
      if (typeof option?.id === 'number') {
        return option.id;
      }
    }
    if (typeof param?.satuanId === 'number') {
      return param.satuanId;
    }
    return undefined;
  };

  const buildTestsPayload = (
    details: Record<string, { unit?: string; method?: string; value?: number }>,
  ): TestPayload[] => {
    if (!details) return [];
    return Object.entries(details)
      .map(([key, detail]) => {
        const matchedProperty = propertyTests.find(
          (test) => test.key === key,
        );
        const propertyTestId = resolvePropertyTestId(matchedProperty, key);
        if (!propertyTestId) {
          return null;
        }

        const numericValue =
          typeof detail?.value === 'number'
            ? detail.value
            : detail?.value !== undefined
              ? Number(detail.value)
              : undefined;
        if (numericValue === undefined || Number.isNaN(numericValue)) {
          return null;
        }

        const satuanId =
          resolveSatuanId(detail?.unit, matchedProperty) ?? 0;

        return {
          propertyTestId,
          satuanId,
          method: detail?.method || '',
          value: numericValue,
        };
      })
      .filter((payload): payload is TestPayload => Boolean(payload));
  };

  const handleSave = async () => {
    if (actionType === 'input_result' && missingPropertyTests) {
      message.warning(
        'Tidak dapat menyimpan karena kategori tes ini belum memiliki property test.',
      );
      return;
    }
    try {
      setIsSaving(true);
      // Get form values without validation (allow empty fields for save)
      const values = form.getFieldsValue();

      // Format data for saving
      const formattedData = {
        ...values,
        sample_id: record?.sample_id,
        timestamp: dayjs().toISOString(),
        actionType,
        is_temporary: true, // Flag untuk data sementara
      };

      // Special formatting for test results
      if (record?.id) {
        formattedData.sampleOrderId = record.id;
      }

      let testsPayload: TestPayload[] = [];

      if (actionType === 'input_result' && values.test_results_detailed) {
        formattedData.test_results = values.test_results_detailed;
        testsPayload = buildTestsPayload(values.test_results_detailed);
        if (testsPayload.length) {
          formattedData.tests = testsPayload;
        }
      }

      if (onSave) {
        await onSave(actionType, formattedData);
      } else {
        message.success('Data berhasil disimpan sementara');
      }
    } catch (error: any) {
      message.error('Gagal menyimpan data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (actionType === 'input_result' && missingPropertyTests) {
        message.error(
          'Kategori tes ini belum memiliki property test sehingga hasil tidak dapat dikonfirmasi.',
        );
        return;
      }
      // Format data based on action type
      const formattedData = {
        ...values,
        sample_id: record?.sample_id,
        timestamp: dayjs().toISOString(),
        actionType,
        is_temporary: false, // Flag untuk data final
      };
      if (record?.id) {
        formattedData.sampleOrderId = record.id;
      }

      // Special formatting for different action types
      if (actionType === 'input_result') {
        const detailed = values.test_results_detailed || {};
        const hasIncomplete = propertyTests.some((param) => {
          const result =
            detailed?.[param.key] ||
            (param.name ? detailed?.[param.name] : undefined);
          return (
            !result ||
            result.value === undefined ||
            result.value === null ||
            result.value === ''
          );
        });
        if (hasIncomplete) {
          message.warning(
            'Harap isi nilai untuk semua parameter pengujian sebelum konfirmasi.',
          );
          return;
        }
        formattedData.test_results = detailed;
        const testsPayload = buildTestsPayload(detailed);
        if (testsPayload.length) {
          formattedData.tests = testsPayload;
        }
      }

      if (actionType === 'waiting_test' && values.estimated_completion) {
        formattedData.estimated_completion =
          values.estimated_completion.toISOString();
      }

      await onSubmit(actionType, formattedData);

      message.success(`${config.title} berhasil dilakukan`);
      form.resetFields();
      setIsUrgent(false);
      setSelectedEquipment(undefined);
      onClose();
    } catch (_error) {
      message.error(`Gagal melakukan ${config.title.toLowerCase()}`);
    }
  };

  // Helper function for placeholder text
  const getPlaceholderText = (type: ActionType) => {
    switch (type) {
      case 'confirm_sample':
        return 'Sampel telah diterima dalam kondisi baik, siap untuk pengujian selanjutnya';
      case 'waiting_test':
        return 'Jadwalkan pengujian sesuai dengan prioritas dan ketersediaan equipment';
      case 'process_test':
        return 'Memulai proses pengujian sesuai dengan prosedur standar laboratorium';
      case 'input_result':
        return 'Dokumentasikan semua hasil pengujian dengan detail dan akurat';
      case 'complete_test':
        return 'Finalisasi pengujian dengan review menyeluruh terhadap semua data';
      default:
        return 'Masukkan deskripsi kegiatan yang dilakukan';
    }
  };

  // Helper function for action alerts
  const getActionAlert = (
    type: ActionType,
    urgent: boolean,
    equipment?: string,
  ) => {
    const alertConfigs = {
      confirm_sample: {
        type: 'success' as const,
        message: 'Konfirmasi Penerimaan Sampel',
        description:
          'Setelah konfirmasi, sampel akan masuk ke tahap registrasi dan siap untuk dijadwalkan pengujian.',
      },
      waiting_test: {
        type: urgent ? ('warning' as const) : ('info' as const),
        message: urgent
          ? 'Pengujian Prioritas Tinggi'
          : 'Penjadwalan Pengujian',
        description: urgent
          ? 'Pengujian akan diprioritaskan. Pastikan equipment tersedia dan teknisi siap.'
          : 'Status akan berubah menjadi "Menunggu Pengujian" dengan estimasi waktu yang telah ditentukan.',
      },
      process_test: {
        type: 'info' as const,
        message: 'Proses Pengujian Dimulai',
        description: equipment
          ? `Pengujian dimulai menggunakan ${equipment}. Progress akan diupdate secara berkala.`
          : 'Pengujian dimulai. Progress akan diupdate secara berkala.',
      },
      input_result: {
        type: 'warning' as const,
        message: 'Input Hasil Pengujian',
        description:
          'Gunakan tombol "Save" untuk menyimpan data sementara (meskipun belum lengkap), atau "Konfirmasi & Lanjutkan" untuk menyelesaikan dan melanjutkan ke tahap selanjutnya. Pastikan semua parameter telah diuji sesuai dengan standar yang berlaku sebelum konfirmasi.',
      },
      complete_test: {
        type: 'success' as const,
        message: 'Finalisasi Pengujian',
        description:
          'Pengujian akan diselesaikan dan hasil akan tersedia untuk laporan. Pastikan semua data telah direview.',
      },
    };

    const config = alertConfigs[type];
    if (!config) return null;

    return (
      <Alert
        type={config.type}
        message={config.message}
        description={config.description}
        showIcon
        style={{ marginTop: 16 }}
      />
    );
  };

  const config = getActionConfig(actionType);
  const isInputResultDisabled =
    actionType === 'input_result' && missingPropertyTests;

  useEffect(() => {
    if (!visible || actionType !== 'input_result') {
      setPropertyTests(DEFAULT_TEST_PARAMETERS);
      setPropertyLoading(false);
      setExistingTestResults({});
      setHasInitializedResults(false);
      setMissingPropertyTests(false);
      return;
    }

    const categoryId = record?.categoryTestId;
    if (!categoryId) {
      setPropertyTests(DEFAULT_TEST_PARAMETERS);
      setMissingPropertyTests(false);
      return;
    }

    const fetchPropertyTests = async () => {
      setPropertyLoading(true);
      setMissingPropertyTests(false);
      try {
        const response = await request(
          `/api/PropertyTests/by-category/${categoryId}`,
        );
        const list = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        const normalized = normalizePropertyTests(list);
        if (normalized.length) {
          setPropertyTests(normalized);
          setMissingPropertyTests(false);
        } else {
          setPropertyTests([]);
          setMissingPropertyTests(true);
        }
      } catch (error) {
        console.error('Failed to fetch property tests', error);
        setPropertyTests(DEFAULT_TEST_PARAMETERS);
        setMissingPropertyTests(false);
      } finally {
        setPropertyLoading(false);
      }
    };

    fetchPropertyTests();
  }, [visible, actionType, record?.categoryTestId]);

  useEffect(() => {
    if (!visible || actionType !== 'input_result') return;
    setHasInitializedResults(false);
  }, [record?.id]);

  useEffect(() => {
    if (!visible || actionType !== 'input_result') {
      setExistingTestResults({});
      setResultsLoading(false);
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
          if (typeof item?.propertyTestId !== 'number') {
            return;
          }
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
        if (list.length && !missingPropertyTests) {
          setPropertyTests((prev) => {
            const next = [...prev];
            list.forEach((item: any) => {
              if (typeof item?.propertyTestId !== 'number') {
                return;
              }
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
                  min: undefined,
                  max: undefined,
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
  }, [visible, actionType, record?.id, missingPropertyTests]);

  useEffect(() => {
    if (!visible || actionType !== 'input_result') return;
    if (hasInitializedResults) return;
    if (!Object.keys(existingTestResults).length) return;

    const fieldValues: Record<string, { unit?: string; method?: string; value?: number }> =
      {};
    propertyTests.forEach((test) => {
      const propertyId = resolvePropertyTestId(test, test.key);
      if (!propertyId) return;
      const saved = existingTestResults[propertyId];
      if (!saved) return;
      fieldValues[test.key] = {
        unit: saved.unit || test.unit || '',
        method: saved.method || test.method || '',
        value: saved.value,
      };
    });

    if (!Object.keys(fieldValues).length) return;

    const currentDetailed = form.getFieldValue('test_results_detailed') || {};
    form.setFieldsValue({
      test_results_detailed: {
        ...currentDetailed,
        ...fieldValues,
      },
    });
    setHasInitializedResults(true);
  }, [
    visible,
    actionType,
    propertyTests,
    existingTestResults,
    hasInitializedResults,
    form,
  ]);

  return (
    <Drawer
      title={
        <Space>
          <span style={{ color: config.color }}>{config.icon}</span>
          {config.title}
        </Space>
      }
      width={'55%'}
      open={visible}
      onClose={onClose}
      className={styles.actionDrawer}
      extra={
        <Space>
          <Button onClick={onClose}>Batal</Button>
          {actionType === 'input_result' && onSave && (
            <Button
              onClick={handleSave}
              loading={isSaving}
              disabled={isInputResultDisabled}
              style={{
                backgroundColor: '#52c41a',
                borderColor: '#52c41a',
                color: 'white',
              }}
            >
              Save
            </Button>
          )}
          <Button
            type="primary"
            onClick={() => form.submit()}
            disabled={isInputResultDisabled}
            style={{ backgroundColor: config.color, borderColor: config.color }}
          >
            {actionType === 'input_result'
              ? 'Konfirmasi & Lanjutkan'
              : 'Konfirmasi'}
          </Button>
        </Space>
      }
    >
      {/* Record Information */}
      {record && (
        <div className={styles.recordInfo}>
          <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
            Informasi Sampel
          </Title>
          <Space direction="vertical" size={4}>
            <Text>
              <strong>Nomor NPC:</strong> {record.nomorNpc}
            </Text>
            <Text>
              <strong>Order Number:</strong> {record.order_number}
            </Text>
            <Text>
              <strong>Jenis Sampel:</strong> {record.sample_type}
            </Text>
            <Text>
              <strong>Jumlah Sampel:</strong>{' '}
              {record.sample?.qty
                ? `${record.sample.qty} ${record.sample.satuanName || ''}`
                : '-'}
            </Text>
            <Text>
              <strong>Kapal:</strong> {record.shipName}
            </Text>
            <div style={{ marginTop: 8 }}>
              <Tag color={record.priority === 'urgent' ? 'orange' : 'default'}>
                {record.priority.toUpperCase()}
              </Tag>
            </div>
          </Space>
        </div>
      )}

      {/* Progress Steps */}
      <div className={styles.statusStep}>
        <Title level={5}>Status Pengujian</Title>
        <Steps
          size="small"
          current={mapStatusToStep(record?.testing_status || '')}
          status={
            record?.testing_status === 'waiting_equipment' ? 'error' : 'process'
          }
          items={[
            {
              title: 'Diterima',
              description: 'Sampel diterima lab',
            },
            {
              title: 'Registrasi',
              description: 'Sampel didaftarkan',
            },
            {
              title: 'Pengujian',
              description: 'Proses pengujian',
            },
            {
              title: 'Selesai',
              description: 'Pengujian selesai',
            },
          ]}
        />
      </div>

      {/* Action Description */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <InfoCircleOutlined style={{ color: config.color, marginRight: 8 }} />
          <Title level={5} style={{ margin: 0 }}>
            Deskripsi Aksi
          </Title>
        </div>
        <Text type="secondary">{config.description}</Text>
        {config.helpText && (
          <Alert
            message={config.helpText}
            type="info"
            showIcon
            style={{ marginTop: 12 }}
            banner
          />
        )}
      </Card>

      {/* Action Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className={styles.actionForm}
        initialValues={{
          urgency: false,
          certification_status: 'passed',
        }}
      >
        {/* Common Description Field */}
        {config.fields.includes('description') && (
          <Form.Item
            name="description"
            label="Deskripsi Kegiatan"
            // rules={[
            //   {
            //     required: true,
            //     message: 'Deskripsi wajib diisi',
            //   },
            //   {
            //     min: 10,
            //     message: 'Deskripsi minimal 10 karakter',
            //   },
            // ]}
            tooltip="Jelaskan secara detail kegiatan yang dilakukan"
          >
            <TextArea
              rows={3}
              placeholder={`Contoh: ${getPlaceholderText(actionType)}`}
              showCount
              maxLength={500}
            />
          </Form.Item>
        )}

        {/* Estimated Completion for Waiting Test */}
        {config.fields.includes('estimated_completion') && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="estimated_completion"
                label="Estimasi Selesai"
                rules={[
                  {
                    required: true,
                    message: 'Estimasi waktu selesai wajib diisi',
                  },
                ]}
                tooltip="Perkirakan waktu berdasarkan kompleksitas pengujian"
              >
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                  placeholder="Pilih estimasi waktu selesai"
                  disabledDate={(current) =>
                    current && current < dayjs().startOf('day')
                  }
                  showNow={false}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        {/* Technician Notes */}
        {config.fields.includes('technician_notes') && (
          <Form.Item
            name="technician_notes"
            label="Catatan Teknisi"
            tooltip="Dokumentasikan observasi dan catatan khusus selama pengujian"
          >
            <TextArea
              rows={3}
              placeholder="Contoh: Pengujian berjalan normal, suhu ruangan 25°C, kelembaban 60%, tidak ada masalah pada equipment"
              showCount
              maxLength={300}
            />
          </Form.Item>
        )}

        {/* Detailed Test Results */}
        {config.fields.includes('test_results_detailed') && (
          <Card
            title="Input Hasil Pengujian Detail"
            size="small"
            style={{ marginBottom: 16 }}
          >
            {missingPropertyTests ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span>
                      Property test belum tersedia untuk kategori ini.
                    </span>
                  }
                />
                <Text type="secondary">
                  Hubungi administrator laboratorium untuk menambahkan daftar
                  property sebelum input hasil pengujian.
                </Text>
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '30px 1fr 140px 220px 1fr',
                    gap: '8px',
                    backgroundColor: '#fafafa',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: '1px solid #d9d9d9',
                  }}
                >
                  <div>No.</div>
                  <div>Property</div>
                  <div>Units</div>
                  <div>Method</div>
                  <div>Results</div>
                </div>
                <Spin spinning={propertyLoading || resultsLoading}>
                  {propertyTests.map((param, index) => (
                    <div
                      key={param.key}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '30px 1fr 140px 220px 1fr',
                        gap: '8px',
                        padding: '8px',
                        borderBottom: '1px solid #f0f0f0',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {index + 1}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 500 }}>
                        {param.name}
                      </div>
                      <Form.Item
                        name={['test_results_detailed', param.key, 'unit']}
                        style={{ margin: 0 }}
                        initialValue=""
                      >
                        <Select
                          placeholder="Unit"
                          size="small"
                          style={{ width: '100%', fontSize: '11px' }}
                          options={unitSelectOptions}
                          dropdownMatchSelectWidth
                        />
                      </Form.Item>
                      <Form.Item
                        name={['test_results_detailed', param.key, 'method']}
                        style={{ margin: 0 }}
                        initialValue=""
                      >
                        <Input
                          placeholder="Method"
                          size="small"
                          style={{ width: '100%', fontSize: '11px' }}
                        />
                      </Form.Item>
                      <Form.Item
                        name={['test_results_detailed', param.key, 'value']}
                        style={{ margin: 0 }}
                        rules={[]}
                      >
                        <InputNumber
                          min={param.min}
                          max={param.max}
                          step={
                            param.key.includes('percent') ||
                              param.key === 'density_15c'
                              ? 0.1
                              : 1
                          }
                          style={{ width: '100%' }}
                          placeholder="Input value"
                          size="small"
                        />
                      </Form.Item>
                    </div>
                  ))}
                </Spin>
              </div>
            )}
          </Card>
        )}

        {/* Quality Assessment */}
        {/* {config.fields.includes('quality_assessment') && (
          <Form.Item
            name="quality_assessment"
            label="Penilaian Kualitas"
            rules={[
              {
                required: true,
                message: 'Penilaian kualitas wajib diisi',
              },
            ]}
            tooltip="Berikan penilaian menyeluruh terhadap kualitas sampel"
          >
            <Select placeholder="Pilih penilaian kualitas">
              <Select.Option value="excellent">
                Excellent - Semua parameter di atas standar
              </Select.Option>
              <Select.Option value="good">
                Good - Semua parameter memenuhi standar
              </Select.Option>
              <Select.Option value="acceptable">
                Acceptable - Parameter dalam batas toleransi
              </Select.Option>
              <Select.Option value="poor">
                Poor - Beberapa parameter tidak memenuhi standar
              </Select.Option>
              <Select.Option value="failed">
                Failed - Tidak memenuhi standar minimum
              </Select.Option>
            </Select>
          </Form.Item>
        )} */}

        {/* Recommendations */}
        {config.fields.includes('recommendations') && (
          <Form.Item
            name="recommendations"
            label="Rekomendasi"
            tooltip="Berikan rekomendasi untuk tindak lanjut berdasarkan hasil pengujian"
          >
            <TextArea
              rows={3}
              placeholder="Contoh: Sampel memenuhi standar untuk digunakan, disarankan untuk monitoring berkala"
              showCount
              maxLength={400}
            />
          </Form.Item>
        )}

        {/* Final Summary */}
        {config.fields.includes('final_summary') && (
          <Form.Item
            name="final_summary"
            label="Ringkasan Akhir"
            rules={[
              {
                required: true,
                message: 'Ringkasan akhir wajib diisi',
              },
              {
                min: 20,
                message: 'Ringkasan minimal 20 karakter',
              },
            ]}
            tooltip="Ringkas semua hasil pengujian dan kesimpulan"
          >
            <TextArea
              rows={4}
              placeholder="Contoh: Pengujian sampel JET A-1 telah selesai dilakukan dengan hasil semua parameter memenuhi standar ASTM. Sampel dinyatakan layak untuk digunakan."
              showCount
              maxLength={600}
            />
          </Form.Item>
        )}

        {/* Certification Status */}
        {config.fields.includes('certification_status') && (
          <Form.Item
            name="certification_status"
            label="Status Sertifikasi"
            rules={[
              {
                required: true,
                message: 'Status sertifikasi wajib dipilih',
              },
            ]}
          >
            <Select placeholder="Pilih status sertifikasi">
              <Select.Option value="passed">
                PASSED - Lulus semua pengujian
              </Select.Option>
              <Select.Option value="passed_conditional">
                PASSED (CONDITIONAL) - Lulus dengan syarat
              </Select.Option>
              <Select.Option value="failed">
                FAILED - Tidak lulus pengujian
              </Select.Option>
              <Select.Option value="retest_required">
                RETEST REQUIRED - Perlu pengujian ulang
              </Select.Option>
            </Select>
          </Form.Item>
        )}

        {/* Next Actions */}
        {config.fields.includes('next_actions') && (
          <Form.Item
            name="next_actions"
            label="Tindak Lanjut"
            tooltip="Tentukan langkah selanjutnya yang perlu dilakukan"
          >
            <Select
              mode="multiple"
              placeholder="Pilih tindak lanjut yang diperlukan"
              options={[
                { label: 'Generate Laporan', value: 'generate_report' },
                { label: 'Kirim ke Customer', value: 'send_to_customer' },
                { label: 'Arsip Sampel', value: 'archive_sample' },
                { label: 'Monitoring Berkala', value: 'regular_monitoring' },
                { label: 'Pengujian Tambahan', value: 'additional_testing' },
                { label: 'Review Manajemen', value: 'management_review' },
              ]}
            />
          </Form.Item>
        )}

        <Divider />

        {/* Action-specific alerts */}
        {getActionAlert(actionType, isUrgent, selectedEquipment)}
      </Form>
    </Drawer>
  );
};

export default LaboratoryActionModal;
