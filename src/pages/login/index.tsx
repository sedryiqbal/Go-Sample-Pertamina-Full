import { LockOutlined, UserOutlined } from '@ant-design/icons';

import { Helmet, SelectLang, useIntl, useModel } from '@umijs/max';
import { Alert, App, Button, Carousel, Checkbox, Form, Input } from 'antd';
import { createStyles } from 'antd-style';
import React, { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { login as loginRequest } from '@/services/ant-design-pro/api';
import { setAuthToken } from '@/utils/auth';
import Settings from '../../../config/defaultSettings';

const useStyles = createStyles(({ token }) => ({
  container: {
    height: '100vh',
    background: '#f5f5f5',
    display: 'flex',
    overflow: 'hidden',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
    },
  },
  leftPanel: {
    flex: 2.5,
    background: `
      linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.7) 100%),
      url('/images/bg2.jpg') center/cover
    `,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: '40px',
    overflow: 'hidden',
    '@media (max-width: 768px)': {
      flex: 1,
      padding: '30px 20px 20px',
    },
  },
  rightPanel: {
    flex: 1,
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 30px',
    minWidth: '400px',
    '@media (max-width: 768px)': {
      minWidth: 'auto',
      padding: '20px',
      flex: 1,
    },
  },
  logo: {
    position: 'absolute',
    top: '30px',
    left: '30px',
    zIndex: 10,
  },
  logoImg: {
    height: '87px',
    width: 'auto',
    filter: 'brightness(0) invert(1)',
  },
  sliderContainer: {
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center',
    zIndex: 2,
  },
  sliderContent: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#fff',
  },
  sliderTitle: {
    fontSize: '42px',
    fontWeight: 'bold',
    marginBottom: '16px',
    lineHeight: '1.2',
    color: '#fff',
    textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
    '@media (max-width: 768px)': {
      fontSize: '28px',
      marginBottom: '12px',
    },
  },
  sliderSubtitle: {
    fontSize: '18px',
    marginBottom: '30px',
    opacity: 0.95,
    lineHeight: '1.5',
    textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
    '@media (max-width: 768px)': {
      fontSize: '15px',
      marginBottom: '20px',
    },
  },
  featureCard: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    margin: '0 auto',
    maxWidth: '350px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  featureIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    display: 'block',
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#fff',
  },
  featureDescription: {
    fontSize: '14px',
    opacity: 0.9,
    lineHeight: '1.4',
  },
  carouselDots: {
    '& .ant-carousel .ant-carousel-dots': {
      bottom: '20px',
    },
    '& .ant-carousel .ant-carousel-dots li button': {
      background: 'rgba(255, 255, 255, 0.4)',
      borderRadius: '4px',
      width: '24px',
      height: '4px',
    },
    '& .ant-carousel .ant-carousel-dots li.ant-carousel-dot-active button': {
      background: '#fff',
      width: '32px',
    },
  },
  illustration: {
    width: '200px',
    height: '200px',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '30px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  illustrationContent: {
    textAlign: 'center',
    color: '#fd0017',
  },
  illustrationIcon: {
    fontSize: '80px',
    marginBottom: '20px',
    display: 'block',
  },
  illustrationText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#fd0017',
    margin: 0,
  },
  loginForm: {
    width: '100%',
    maxWidth: '320px',
  },
  loginTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '30px',
    textAlign: 'center',
  },
  formInput: {
    height: '45px',
    fontSize: '14px',
    marginBottom: '16px',
    borderRadius: '8px',
  },
  loginButton: {
    width: '100%',
    height: '45px',
    fontSize: '15px',
    fontWeight: 'bold',
    marginTop: '8px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #fd0017 0%, #b8000f 100%)',
    border: 'none',
    '&:hover': {
      background: 'linear-gradient(135deg, #e8001a 0%, #a5000d 100%)',
    },
  },
  formBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
  },
  lang: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 100,
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: token.borderRadius,
    padding: '8px',
    backdropFilter: 'blur(10px)',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.25)',
    },
  },
  compactCheckbox: {
    fontSize: '13px',
    color: '#666',
  },
}));

const SliderComponent = () => {
  const { styles } = useStyles();
  const carouselRef = useRef(null);

  const slides = [
    {
      icon: '🧪',
      title: 'Analisis Laboratorium',
      description:
        'Sistem terintegrasi untuk manajemen sampel dan analisis laboratorium dengan teknologi terdepan.',
    },
    {
      icon: '🚢',
      title: 'Manajemen Kapal',
      description:
        'Tracking dan monitoring kapal serta pengiriman sampel secara real-time dan akurat.',
    },
    {
      icon: '📊',
      title: 'Laporan Digital',
      description:
        'Dashboard analitik dan laporan komprehensif untuk mendukung pengambilan keputusan.',
    },
    {
      icon: '⚡',
      title: 'Proses Cepat',
      description:
        'Otomatisasi proses untuk meningkatkan efisiensi dan mengurangi waktu operasional.',
    },
  ];

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.carouselDots}>
        <Carousel
          ref={carouselRef}
          autoplay
          autoplaySpeed={4000}
          dots={true}
          dotPosition="bottom"
          effect="fade"
        >
          {slides.map((slide, _slideIndex) => (
            <div key={slide.title}>
              <div className={styles.sliderContent}>
                <h1 className={styles.sliderTitle}>Go Sample</h1>
                <p className={styles.sliderSubtitle}>
                  Sistem Manajemen Sampel Laboratorium Pertamina
                </p>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>{slide.icon}</div>
                  <h3 className={styles.featureTitle}>{slide.title}</h3>
                  <p className={styles.featureDescription}>
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

const _IllustrationComponent = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.illustration}>
      <div className={styles.illustrationContent}>
        <img
          src="/images/Logo Go Sample.png"
          alt="Go Sample Logo"
          style={{
            width: '120px',
            height: '120px',
            objectFit: 'contain',
            display: 'block',
            borderRadius: '12px',
          }}
        />
      </div>
    </div>
  );
};

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [loginError, setLoginError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const { message } = App.useApp();
  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    setSubmitting(true);
    setLoginError('');
    try {
      const email = values?.email?.trim();
      const { password } = values;

      if (!email || !password) {
        message.error('Email dan password wajib diisi.');
        return;
      }

      const response = await loginRequest(
        {
          email,
          password,
        },
        {
          skipErrorHandler: true,
        },
      );

      if (!response?.status) {
        throw new Error(response?.message || 'Login gagal.');
      }

      const token = response?.data?.token;

      if (!token) {
        throw new Error('Token tidak ditemukan pada response login.');
      }

      setAuthToken(token);
      setLoginError('');

      const responseUser = response?.data?.user;

      if (responseUser) {
        const normalizedUser = {
          name: responseUser.nama || responseUser.name,
          email: responseUser.email,
          userid: responseUser.id ? String(responseUser.id) : undefined,
          access: responseUser.isSuperadmin ? 'admin' : responseUser.roleName,
          roleName: responseUser.roleName,
          superAdmin: responseUser.isSuperadmin,
          phone: responseUser.phone,
          status: responseUser.status,
        } as API.CurrentUser & {
          roleName?: string;
          superAdmin?: boolean;
          status?: string;
        };

        flushSync(() => {
          setInitialState((s) => ({
            ...s,
            currentUser: normalizedUser,
          }));
        });
      } else {
        await fetchUserInfo();
      }

      const loginMessage =
        response?.message ||
        intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
      message.success(loginMessage);
      const urlParams = new URL(window.location.href).searchParams;
      window.location.href = urlParams.get('redirect') || '/';
      return;
    } catch (error: any) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: 'Login gagal, silakan coba lagi.',
      });
      const apiMessage =
        error?.response?.data?.data?.message ??
        error?.response?.data?.message ??
        error?.message;
      if (apiMessage) {
        message.error(apiMessage);
        setLoginError(apiMessage);
      } else {
        message.error(defaultLoginFailureMessage);
        setLoginError(defaultLoginFailureMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <Lang />

      {/* Left Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.logo}>
          <img alt="Company Logo" src="/logo.svg" className={styles.logoImg} />
        </div>

        <SliderComponent />
      </div>

      {/* Right Panel */}
      <div className={styles.rightPanel}>
        <div className={styles.loginForm}>
          <h1 className={styles.loginTitle}>Masuk</h1>

          {loginError && <LoginMessage content={loginError} />}

          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            size="middle"
            initialValues={{
              autoLogin: true,
            }}
          >
            <Form.Item
              name="email"
              label={
                <span style={{ fontSize: '13px', fontWeight: '500' }}>
                  Email
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Silakan masukkan email!',
                },
                {
                  type: 'email',
                  message: 'Format email tidak valid!',
                },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#999' }} />}
                className={styles.formInput}
                placeholder="Masukkan email"
                type="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span style={{ fontSize: '13px', fontWeight: '500' }}>
                  Password
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Silakan masukkan password!',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#999' }} />}
                className={styles.formInput}
                placeholder="Masukkan password"
              />
            </Form.Item>

            <Form.Item>
              <div className={styles.formBottom}>
                <Form.Item name="autoLogin" valuePropName="checked" noStyle>
                  <Checkbox className={styles.compactCheckbox}>
                    Ingat saya
                  </Checkbox>
                </Form.Item>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.loginButton}
                loading={submitting}
              >
                Masuk
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
