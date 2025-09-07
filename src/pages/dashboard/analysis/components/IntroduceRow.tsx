import { InfoCircleOutlined } from '@ant-design/icons';
import { Area } from '@ant-design/plots';
import { Col, Progress, Row, Tooltip } from 'antd';
import numeral from 'numeral';
import type { DataItem } from '../data.d';
import useStyles from '../style.style';
import { ChartCard, Field } from './Charts';
import Trend from './Trend';

const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 8,
  xl: 8,
  style: {
    marginBottom: 24,
  },
};
const IntroduceRow = ({
  loading,
  visitData,
}: {
  loading: boolean;
  visitData: DataItem[];
}) => {
  const { styles } = useStyles();
  return (
    <Row gutter={24}>
      <Col {...topColResponsiveProps}>
        <ChartCard
          variant="borderless"
          title="Total Sampel Aktif"
          action={
            <Tooltip title="Total sampel yang sedang dalam proses pengujian">
              <InfoCircleOutlined />
            </Tooltip>
          }
          loading={loading}
          total={() => (
            <span style={{ fontSize: '30px', fontWeight: 'bold' }}>156</span>
          )}
          footer={
            <Field
              label="Sampel Hari Ini"
              value={`${numeral(12).format('0,0')} sampel`}
            />
          }
          contentHeight={46}
        >
          <Trend
            flag="up"
            style={{
              marginRight: 16,
            }}
          >
            Minggu Ini
            <span className={styles.trendText}>8%</span>
          </Trend>
          <Trend flag="up">
            Bulan Ini
            <span className={styles.trendText}>15%</span>
          </Trend>
        </ChartCard>
      </Col>

      <Col {...topColResponsiveProps}>
        <ChartCard
          variant="borderless"
          loading={loading}
          title="Pengujian Selesai"
          action={
            <Tooltip title="Total pengujian yang telah selesai bulan ini">
              <InfoCircleOutlined />
            </Tooltip>
          }
          total={numeral(284).format('0,0')}
          footer={
            <Field label="Target Bulanan" value={numeral(300).format('0,0')} />
          }
          contentHeight={46}
        >
          <Area
            xField="x"
            yField="y"
            shapeField="smooth"
            height={46}
            axis={false}
            style={{
              fill: 'linear-gradient(-90deg, white 0%, #52C41A 100%)',
              fillOpacity: 0.6,
              width: '100%',
            }}
            padding={-20}
            data={visitData}
          />
        </ChartCard>
      </Col>
      <Col {...topColResponsiveProps}>
        <ChartCard
          variant="borderless"
          loading={loading}
          title="Efisiensi Laboratorium"
          action={
            <Tooltip title="Tingkat efisiensi pengujian laboratorium">
              <InfoCircleOutlined />
            </Tooltip>
          }
          total="92%"
          footer={
            <div
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <Trend
                flag="up"
                style={{
                  marginRight: 16,
                }}
              >
                Target
                <span className={styles.trendText}>85%</span>
              </Trend>
              <Trend flag="up">
                Bulan Lalu
                <span className={styles.trendText}>89%</span>
              </Trend>
            </div>
          }
          contentHeight={46}
        >
          <Progress
            percent={92}
            strokeColor={{ from: '#1890ff', to: '#52C41A' }}
            status="active"
          />
        </ChartCard>
      </Col>
    </Row>
  );
};
export default IntroduceRow;
