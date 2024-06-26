import React from 'react';
import useLocale from '@/utils/useLocale';
import Security from '@/pages/personal/settings/security';

function Settings() {
  const t = useLocale();

  return (
    <div>
      <Security/>
    </div>
  );
}

export default Settings;
