import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright="Powered by Pertamina SHAFTHI 2025"
      links={[]}
    />
  );
};

export default Footer;
