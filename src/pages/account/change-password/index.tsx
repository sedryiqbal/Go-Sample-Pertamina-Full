import { PageContainer } from '@ant-design/pro-components';
import { App, Button, Card, Form, Input, Typography } from 'antd';
import React, { useState } from 'react';
import { changePassword } from '@/services/auth/api';

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordPage: React.FC = () => {
  const [form] = Form.useForm<ChangePasswordFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const { message } = App.useApp();

  const handleFinish = async (values: ChangePasswordFormValues) => {
    setSubmitting(true);
    try {
      const response = await changePassword(values, {
        skipErrorHandler: true,
      });

      const successMessage =
        response?.message || 'Password berhasil diperbarui.';
      message.success(successMessage);
      form.resetFields();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ??
        error?.response?.data?.data?.message ??
        error?.message ??
        'Gagal mengganti password. Silakan coba lagi.';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Card
        title="Ubah Password"
        bordered={false}
        style={{ maxWidth: 480, margin: '0 auto' }}
      >
        <Typography.Paragraph type="secondary">
          Pastikan password baru berbeda dengan password saat ini dan simpan
          perubahan Anda dengan aman.
        </Typography.Paragraph>
        <Form
          layout="vertical"
          form={form}
          onFinish={handleFinish}
          requiredMark={false}
        >
          <Form.Item
            name="currentPassword"
            label="Password Saat Ini"
            rules={[
              {
                required: true,
                message: 'Silakan masukkan password saat ini!',
              },
            ]}
          >
            <Input.Password placeholder="Masukkan password saat ini" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Password Baru"
            rules={[
              {
                required: true,
                message: 'Silakan masukkan password baru!',
              },
              {
                min: 6,
                message: 'Password minimal terdiri dari 6 karakter.',
              },
            ]}
          >
            <Input.Password placeholder="Masukkan password baru" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Konfirmasi Password Baru"
            dependencies={['newPassword']}
            rules={[
              {
                required: true,
                message: 'Silakan konfirmasi password baru!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error('Konfirmasi password tidak cocok.'),
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Konfirmasi password baru" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              Simpan Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </PageContainer>
  );
};

export default ChangePasswordPage;
