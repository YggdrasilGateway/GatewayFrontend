import React, {useEffect, useState} from 'react';
import {Button, Card, Form, Input, Message, Modal, Table, TableColumnProps, Typography} from '@arco-design/web-react';
import axios from "axios";
import {useTranslation} from "react-i18next";
import {actionConfirm} from "@/utils/actionConfirm";

function EntryEditor({record, refetch}) {
  const {t} = useTranslation()
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm();
  const [processing, setProcessing] = useState(false)

  form.setFieldsValue(record)

  async function doReset() {
    setProcessing(true);
    try {
      if (!await actionConfirm({title: t('message-edit.reset-confirm')})) {
        return
      }
      await axios.post('/api/messages/update', {key: record.key})
      Message.info(t('message-edit.resetted'))
      setVisible(false)
      refetch()
    } catch (e) {
      Message.warning(String(e))
    } finally {
      setProcessing(false)
    }
  }

  async function doSubmit() {
    const data = await form.validate()
    setProcessing(true);
    try {
      await axios.post('/api/messages/update', {key: record.key, value: data.val})
      Message.info(t('message-edit.submitted'))
      setVisible(false)
      refetch()
    } catch (e) {
      Message.warning(String(e))
    } finally {
      setProcessing(false)
    }
  }

  return <>
    <Button onClick={() => setVisible(true)}>{t('message.edit')}</Button>
    <Modal
      visible={visible}
      onCancel={() => setVisible(false)}
      title={record.key}
      style={{width: 800}}
      footer={(a, b) => <>
        {a}
        <Button onClick={doReset}>{t('message-edit.reset')}</Button>
        {b}
      </>}
      confirmLoading={processing}
      onConfirm={doSubmit}
    >
      <Form form={form}>
        <Form.Item label={t('message-edit.def')} field='def' disabled>
          <Input.TextArea style={{minHeight: 120}}/>
        </Form.Item>
        <Form.Item label={t('message-edit.val')} field='val'>
          <Input.TextArea style={{minHeight: 120}} placeholder={record.def}/>
        </Form.Item>
      </Form>
    </Modal>
  </>
}

function MessagesEdit() {
  const {t} = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([{}]);


  const columns: TableColumnProps[] = [
    {
      title: t('message-edit.key'),
      dataIndex: 'key',
      sorter: (a, b) => a.key.localeCompare(b.key),
    },
    {
      title: t('message-edit.val'),
      dataIndex: 'val',
      render: (_, record) => {
        return record.val || record.def
      }
    },
    {
      title: '',
      dataIndex: '',
      render: (_, record) => <EntryEditor record={record} refetch={reloadData}/>,
      width: 150
    },
  ];


  async function reloadData() {
    setLoading(true)
    try {
      const serverDefaults = await axios.get('/api/messages/default')
      if (serverDefaults.status != 200) {
        Message.error(serverDefaults.data.message)
        return
      }
      const serverDefined = await axios.get('/api/messages/defined')
      if (serverDefined.status != 200) {
        Message.error(serverDefined.data.message)
        return
      }
      const data0 = {};
      for (const key in serverDefaults.data.data) {
        data0[key] = {
          key,
          def: serverDefaults.data.data[key],
          val: serverDefined.data.data[key],
        };
      }

      setData(Object.keys(data0).map(it => data0[it]));

    } catch (e) {
      Message.warning(String(e))
      console.warn(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reloadData()
  }, []);

  return (
    <Card style={{height: '100%'}}>
      <Typography.Title heading={6}>
      </Typography.Title>
      <Table loading={loading} data={data} columns={columns} virtualized pagination/>
    </Card>
  );
}

export default MessagesEdit;
