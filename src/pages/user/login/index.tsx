import { LockOutlined, UserOutlined } from '@ant-design/icons';

import { Helmet, SelectLang, useIntl, useModel } from '@umijs/max';
import { Alert, App, Button, Checkbox, Form, Input } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { login } from '@/services/ant-design-pro/api';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(({ token }) => {
  return {
    container: {
      height: '100vh',
      background: '#f5f5f5',
      display: 'flex',
      overflow: 'hidden',
    },
    leftPanel: {
      flex: 1,
      background: 'linear-gradient(135deg, #fd0017 0%, #b8000f 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '40px',
    },
    rightPanel: {
      flex: 1,
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
    },
    logo: {
      position: 'absolute',
      top: '30px',
      left: '30px',
      zIndex: 10,
    },
    logoImg: {
      height: '40px',
      width: 'auto',
    },
    illustration: {
      width: '300px',
      height: '300px',
      borderRadius: '50%',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '30px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
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
      maxWidth: '400px',
    },
    loginTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '40px',
      textAlign: 'center',
    },
    formInput: {
      height: '50px',
      fontSize: '16px',
      marginBottom: '20px',
    },
    loginButton: {
      width: '100%',
      height: '50px',
      fontSize: '16px',
      fontWeight: 'bold',
      marginTop: '10px',
    },
    formBottom: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '20px',
    },
    lang: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: token.borderRadius,
      padding: '8px',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.2)',
      },
    },
    '@media (max-width: 768px)': {
      container: {
        flexDirection: 'column',
      },
      leftPanel: {
        minHeight: '40vh',
        padding: '20px',
      },
      rightPanel: {
        padding: '20px',
      },
      illustration: {
        width: '200px',
        height: '200px',
      },
      illustrationText: {
        fontSize: '18px',
      },
      loginTitle: {
        fontSize: '24px',
      },
    },
  };
});

const IllustrationComponent = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.illustration}>
      <div className={styles.illustrationContent}>
        <div
          style={{
            fontSize: '60px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          🧪 🚢
        </div>
        <h2 className={styles.illustrationText}>Go Sample</h2>
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
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
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
    try {
      const msg = await login({ ...values, type: 'account' });
      if (msg.status === 'ok') {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        window.location.href = urlParams.get('redirect') || '/';
        return;
      }
      console.log(msg);
      setUserLoginState(msg);
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      console.log(error);
      message.error(defaultLoginFailureMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const { status } = userLoginState;

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
          <img
            alt="Pertamina Logo"
            src="/logo.svg"
            className={styles.logoImg}
          />
        </div>
        <IllustrationComponent />
      </div>

      {/* Right Panel */}
      <div className={styles.rightPanel}>
        <div className={styles.loginForm}>
          <h1 className={styles.loginTitle}>Login</h1>

          {status === 'error' && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: '账户或密码错误(admin/ant.design)',
              })}
            />
          )}

          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            initialValues={{
              autoLogin: true,
            }}
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: 'pages.login.username.required',
                    defaultMessage: '请输入用户名!',
                  }),
                },
              ]}
            >
              <Input
                size="large"
                prefix={<UserOutlined />}
                className={styles.formInput}
                placeholder={intl.formatMessage({
                  id: 'pages.login.username.placeholder',
                  defaultMessage: '用户名: admin or user',
                })}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: 'pages.login.password.required',
                    defaultMessage: '请输入密码！',
                  }),
                },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                className={styles.formInput}
                placeholder={intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '密码: ant.design',
                })}
              />
            </Form.Item>

            <Form.Item>
              <div className={styles.formBottom}>
                <Form.Item name="autoLogin" valuePropName="checked" noStyle>
                  <Checkbox>
                    {intl.formatMessage({
                      id: 'pages.login.rememberMe',
                      defaultMessage: 'Ingat saya',
                    })}
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
                Login
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
