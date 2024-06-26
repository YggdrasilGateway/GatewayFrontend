import React from 'react';
import ResetPassword from './resetpassword';
import { Card, Typography } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';

function Settings() {
  const { t } = useTranslation();

  return (
    <Card>
      <Typography.Title heading={6}>
        {t('personal.settings.security')}
      </Typography.Title>

      <ResetPassword />
    </Card>
  );
}

export default Settings;
