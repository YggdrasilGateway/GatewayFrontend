import {
  Button,
  Form,
  Input,
  Link,
  Notification,
  Space,
} from '@arco-design/web-react';
import { FormInstance } from '@arco-design/web-react/es/Form';
import { IconLock, IconUser } from '@arco-design/web-react/icon';
import React, { useRef, useState } from 'react';
import axios from 'axios';
import useLocale from '@/utils/useLocale';
import locale from './locale';
import styles from './style/index.module.less';
import { sha512 } from '@/utils/digests';
import { setToken, setTokenExpireTime } from '@/utils/auth';

export default function LoginForm() {
  const formRef = useRef<FormInstance>();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const t = useLocale(locale);

  function afterLoginSuccess(params) {
    // 记录登录状态
    localStorage.setItem('userStatus', 'login');
    // 跳转首页
    window.location.href = '/';
  }

  async function login(params) {
    try {
      const hashedPwd = await sha512(params.password);
      console.log(hashedPwd);
      params.password = hashedPwd;
    } catch (e) {
      setErrorMessage(e);
      console.error(e);
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const loginResponse = await axios.post('/api/user/login', params);
      if (loginResponse.status == 417) {
        setErrorMessage(
          loginResponse.data.message || t['login.form.login.errMsg']
        );
        return;
      }
      console.log('RESP', loginResponse);
      const token = loginResponse.data.data.token;
      console.log('Token ', token);
      setToken(token);
      setTokenExpireTime(Date.now() + 60000);
      afterLoginSuccess({});
    } catch (error) {
      console.error(error);
      Notification.error({ content: String(error) });
    } finally {
      setLoading(false);
    }
  }

  function onSubmitClick() {
    formRef.current.validate().then((values) => {
      // noinspection JSIgnoredPromiseFromCall
      login(values);
    });
  }

  return (
    <div className={styles['login-form-wrapper']}>
      <div className={styles['login-form-title']}>{t['login.form.title']}</div>
      <div className={styles['login-form-sub-title']}>
        {t['login.form.title']}
      </div>
      <div className={styles['login-form-error-msg']}>{errorMessage}</div>
      <Form className={styles['login-form']} layout="vertical" ref={formRef}>
        <Form.Item
          field="username"
          rules={[{ required: true, message: t['login.form.userName.errMsg'] }]}
        >
          <Input
            prefix={<IconUser />}
            placeholder={t['login.form.userName.placeholder']}
            onPressEnter={onSubmitClick}
          />
        </Form.Item>
        <Form.Item
          field="password"
          rules={[{ required: true, message: t['login.form.password.errMsg'] }]}
        >
          <Input.Password
            prefix={<IconLock />}
            placeholder={t['login.form.password.placeholder']}
            onPressEnter={onSubmitClick}
          />
        </Form.Item>
        <Space size={16} direction="vertical">
          <div className={styles['login-form-password-actions']}>
            <Link>{t['login.form.forgetPassword']}</Link>
          </div>
          <Button type="primary" long onClick={onSubmitClick} loading={loading}>
            {t['login.form.login']}
          </Button>
          <Button
            type="text"
            long
            className={styles['login-form-register-btn']}
          >
            {t['login.form.register']}
          </Button>
        </Space>
      </Form>
    </div>
  );
}
