// @ts-ignore
import { startMock } from '@@/requestRecordMock';
import { TestBrowser } from '@@/testBrowser';
import { fireEvent, render } from '@testing-library/react';
import React, { act } from 'react';

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

let server: {
  close: () => void;
};

describe('Login Page', () => {
  beforeAll(async () => {
    server = await startMock({
      port: 8000,
      scene: 'login',
    });
  });

  afterAll(() => {
    server?.close();
  });

  it('should show login form', async () => {
    const historyRef = React.createRef<any>();
    const rootContainer = render(
      <TestBrowser
        historyRef={historyRef}
        location={{
          pathname: '/login',
        }}
      />,
    );

    await rootContainer.findAllByText('Masuk');

    act(() => {
      historyRef.current?.push('/login');
    });

    expect(rootContainer.baseElement?.querySelector('h1')?.textContent).toBe(
      'Masuk',
    );

    rootContainer.unmount();
  });

  it('should login success', async () => {
    const historyRef = React.createRef<any>();
    const rootContainer = render(
      <TestBrowser
        historyRef={historyRef}
        location={{
          pathname: '/login',
        }}
      />,
    );

    await rootContainer.findAllByText('Masuk');

    const userNameInput =
      await rootContainer.findByPlaceholderText('Masukkan username');

    act(() => {
      fireEvent.change(userNameInput, { target: { value: 'admin' } });
    });

    const passwordInput =
      await rootContainer.findByPlaceholderText('Masukkan password');

    act(() => {
      fireEvent.change(passwordInput, { target: { value: 'ant.design' } });
    });

    await (await rootContainer.findByText('Masuk')).click();

    // 等待接口返回结果
    await waitTime(5000);

    await rootContainer.findAllByText('登录成功！');

    await waitTime(2000);

    rootContainer.unmount();
  });
});
