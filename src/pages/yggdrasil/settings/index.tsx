import React, {useEffect, useState} from 'react';
import {Button, Card, Form, Input, Message, Modal, Radio, Spin, Switch, Tooltip} from '@arco-design/web-react';
import {useTranslation} from "react-i18next";
import axios from "axios";
import {isObject, isString} from "@/utils/is";

function YggdrasilSettings() {
  const {t} = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [modalDeliverPublicKeyVisible, setModalDeliverPublicKeyVisible] = useState(false)
  const [modalDeliverPublicKeySource, setModalDeliverPublicKeySource] = useState('');

  async function reloadOptions() {
    setLoading(true);
    try {
      const data = await axios.get('/api/yggdrasil-cgi/system/flags');
      if (data.status == 200) {
        form.setFieldsValue(data.data.data);
        console.log(data.data.data)
      } else {
        Message.error(data.data.message)
      }
    } catch (e) {
      console.warn(e)
      Message.error(String(e))
    } finally {
      setLoading(false)
    }
  }

  async function startSyncPublicKey() {
    const reply = await axios.post('/api/yggdrasil-cgi/system/fetch-content', {data: modalDeliverPublicKeySource});
    const parsedValues = reply.data;
    if (!isObject(parsedValues)) {
      Message.error(t('yggdrasil.settings.delivered-public-key.sync.incorrect-content-type'));
      return
    }
    if (reply.status != 200) {
      Message.error(t(parsedValues.message))
      return
    }
    const value = parsedValues.signaturePublickey
    if (!isString(value)) {
      Message.error(t('yggdrasil.settings.delivered-public-key.sync.incorrect-signaturePublickey'));
      return
    }
    Modal.confirm({
      title: t('yggdrasil.settings.delivered-public-key.sync.confirm-title'),
      content: <Input.TextArea value={value} style={{minHeight: 240}}/>,
      onConfirm: () => {
        form.setFieldValue('deliveredPublicKey', value);
        setModalDeliverPublicKeyVisible(false)
      },
    });
  }

  async function submitChanges() {
    setLoading(true);
    try {
      const result = await form.validate();
      const reply = await axios.patch('/api/yggdrasil-cgi/system/flags', result);
      if (reply.status == 200) {
        Message.success(t('message.submit.success'))
        await reloadOptions()
      } else {
        Message.error(reply.data.message)
      }

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reloadOptions()
  }, []);

  return (<Card style={{height: '100%'}}>
    <Spin loading={loading} style={{width: '100%'}}>
      <Form form={form}>
        <Form.Item
          field='autoResolveName'
          triggerPropName='checked'
          label={t('yggdrasil.settings.auto-resolve-name')}
          tooltip={t('yggdrasil.settings.auto-resolve-name.tooltip')}
        >
          <Switch/>
        </Form.Item>

        <Form.Item
          field='autoResolveUuidConflict'
          triggerPropName='checked'
          label={t('yggdrasil.settings.auto-resolve-uuid')}
          tooltip={t('yggdrasil.settings.auto-resolve-uuid.tooltip')}
        >
          <Switch/>
        </Form.Item>

        <Form.Item
          field='enchantedErrorRejection'
          triggerPropName='checked'
          label={t('yggdrasil.settings.enchanted-error-rejection')}
          tooltip={t('yggdrasil.settings.enchanted-error-rejection.tooltip')}
        ><Switch/></Form.Item>

        <Form.Item
          field='prohibitMode'
          triggerPropName='checked'
          label={t('yggdrasil.settings.prohibit-mode')}
          tooltip={t('yggdrasil.settings.prohibit-mode.tooltip')}
        >
          <Switch/>
        </Form.Item>


        <Form.Item
          field='processMode'
          label={t('yggdrasil.settings.process-mode')}
          tooltip={t('yggdrasil.settings.process-mode.tooltip')}
        >
          <Radio.Group type='button'>
            {[
              'FIRST_SUCCESS', 'ERROR_SKIP', 'COMPLETE_TEST',
            ].map(value =>
              <Radio value={value} key={value}>
                <Tooltip content={t('yggdrasil.settings.process-mode.' + value + '.tooltip')}>
                  {t('yggdrasil.settings.process-mode.' + value)}
                </Tooltip>
              </Radio>
            )}
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={t('yggdrasil.settings.delivered-public-key')}
          tooltip={t('yggdrasil.settings.delivered-public-key.tooltip')}
        >
          <Form.Item field='deliveredPublicKey'>
            <Input.TextArea style={{minHeight: 240}}/>
          </Form.Item>
          <Button onClick={() => setModalDeliverPublicKeyVisible(true)}>
            {t('yggdrasil.settings.delivered-public-key.sync')}
          </Button>
        </Form.Item>

        <Form.Item label=' '>
          <Button type='primary' onClick={submitChanges}>{t('message.submit')}</Button>
        </Form.Item>
      </Form>

      <Modal
        visible={modalDeliverPublicKeyVisible}
        onCancel={() => setModalDeliverPublicKeyVisible(false)}
        onOk={startSyncPublicKey}
      >
        <Input
          placeholder={t('yggdrasil.settings.delivered-public-key.sync.input')}
          value={modalDeliverPublicKeySource}
          onChange={setModalDeliverPublicKeySource}
        />
      </Modal>
    </Spin>
  </Card>);
}

export default YggdrasilSettings;
