import React, { useState } from 'react';
import { Button, Form, Input, Message, Modal } from '@arco-design/web-react';
import axios from 'axios';
import { sha512 } from '@/utils/digests';
import { useTranslation } from 'react-i18next';

function ResetPassword() {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();

  async function onOk() {
    const res = await form.validate();

    setConfirmLoading(true);

    try {
      const serverReply = await axios.post('/api/user/reset-password', {
        old: await sha512(res.prev),
        new: await sha512(res.password),
      });

      if (serverReply.status == 417) {
        Message.error(t(serverReply.data.message || 'message.error.apiError'));
        return;
      }
      Message.info('Password reset. Please re-login.');
      setVisible(false);
      form.clearFields();

      // setTimeout(() => {
      //     setToken(null)
      // }, 5000)
    } catch (e) {
      Message.error(String(e));
      console.error(e);
    } finally {
      setConfirmLoading(false);
    }
  }

  const formItemLayout = {
    labelCol: {
      span: 4,
    },
    wrapperCol: {
      span: 20,
    },
  };
  return (
    <div>
      <Button onClick={() => setVisible(true)} type="primary" status="danger">
        {t('reset-password')}
      </Button>
      <Modal
        title={t('reset-password')}
        visible={visible}
        onOk={onOk}
        confirmLoading={confirmLoading}
        onCancel={() => setVisible(false)}
        style={{ width: '800px' }}
      >
        <Form
          {...formItemLayout}
          form={form}
          labelCol={{
            style: { flexBasis: 150 },
          }}
          wrapperCol={{
            style: { flexBasis: 'calc(100% - 150px)' },
          }}
        >
          <Form.Item
            label={t('reset-password.old')}
            field="prev"
            rules={[{ required: true }]}
          >
            <Input placeholder="Type your old password" type="password" />
          </Form.Item>
          <Form.Item
            label={t('reset-password.new')}
            required
            field="password"
            rules={[{ required: true }]}
          >
            <Input placeholder="Type your new password" type="password" />
          </Form.Item>
          <Form.Item
            label={t('reset-password.confirm')}
            required
            field="confirm"
            dependencies={['password']}
            rules={[
              {
                validator: (v, cb) => {
                  if (!v) {
                    return cb('confirm_password is required');
                  } else if (form.getFieldValue('password') !== v) {
                    return cb('confirm_password must be equal with password');
                  }
                  cb(null);
                },
              },
            ]}
          >
            <Input placeholder="Type your new password again" type="password" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ResetPassword;
