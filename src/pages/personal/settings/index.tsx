import React from 'react';
import useLocale from '@/utils/useLocale';
import locale from '@/pages/dashboard/workplace/locale';
import Security from '@/pages/personal/settings/security';

function Settings() {
  const t = useLocale(locale);

  return (
    <div>
      <Security />
    </div>
  );
}

export default Settings;
