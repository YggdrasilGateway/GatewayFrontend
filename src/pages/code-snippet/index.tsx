import React, {useEffect, useState} from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Message,
  Modal,
  Notification,
  Spin,
  Table,
  TableColumnProps,
  Typography
} from '@arco-design/web-react';
import axios from "axios";
import {useTranslation} from "react-i18next";
import {actionConfirm} from "@/utils/actionConfirm";

function EntryEditor({record}) {
  const {t} = useTranslation()
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm();
  const [processing, setProcessing] = useState(false)


  async function doLoad() {
    setVisible(true)
    setLoading(true)
    try {
      const serverReply = await axios.get('/api/code-snippets/' + record.key)
      if (serverReply.status != 200) {
        Notification.error(serverReply.data.message)
        return
      }

      form.setFieldsValue(serverReply.data.data)
    } finally {
      setLoading(false)
    }
  }

  async function doReset() {
    setProcessing(true);
    try {
      if (!await actionConfirm({title: t('code-snippet.reset-confirm')})) {
        return
      }
      await axios.patch('/api/code-snippets/' + record.key, {code: ''})
      Message.info(t('code-snippet.resetted'))
      setVisible(false)
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
      const serverReply = await axios.patch('/api/code-snippets/' + record.key, {code: data.currentCode})
      if (serverReply.status != 200) {
        Notification.error(serverReply.data.message)
        return
      }

      const passed = serverReply.data.data.status == 'passed'
      const content = <>
        <Typography.Text>Status: {serverReply.data.data.status}</Typography.Text>
        <Input.TextArea style={{height: passed ? 100 : 400}} defaultValue={serverReply.data.data.log}/>
        <Input.TextArea style={{height: passed ? 100 : 400}} defaultValue={serverReply.data.data.error}/>
      </>

      if (passed) {
        Notification.info({content, style: {width: 800}})
      } else {
        Modal.error({content, style: {width: 1200}})
      }
    } catch (e) {
      Message.warning(String(e))
    } finally {
      setProcessing(false)
    }
  }

  return <>
    <Button onClick={doLoad}>{t('message.edit')}</Button>
    <Modal
      visible={visible}
      onCancel={() => setVisible(false)}
      title={record.key}
      style={{width: 800}}
      footer={(a, b) => <>
        {a}
        <Button onClick={doReset}>{t('code-snippet.reset')}</Button>
        {b}
      </>}
      confirmLoading={processing}
      onConfirm={doSubmit}
      modalRender={node => <Spin loading={loading}>{node}</Spin>}
    >
      <Form form={form}>
        <Form.Item label={t('code-snippet.defaultCode')} field='defaultCode' disabled>
          <Input.TextArea style={{minHeight: 120}}/>
        </Form.Item>
        <Form.Item label={t('code-snippet.currentCode')} field='currentCode'>
          <Input.TextArea style={{minHeight: 120}} placeholder={record.def}/>
        </Form.Item>
      </Form>
    </Modal>
  </>
}

function CodeSnippet() {
  const {t} = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([{}]);


  const columns: TableColumnProps[] = [
    {
      title: t('code-snippet.key'),
      dataIndex: 'key',
      sorter: (a, b) => a.key.localeCompare(b.key),
    },
    {
      title: t('code-snippet.name'),
      dataIndex: 'name',
    },
    {
      title: '',
      dataIndex: '',
      render: (_, record) => <EntryEditor record={record}/>,
      width: 150
    },
  ];


  async function reloadData() {
    setLoading(true)
    try {
      const serverDefaults = await axios.get('/api/code-snippets')
      if (serverDefaults.status != 200) {
        Message.error(serverDefaults.data.message)
        return
      }


      setData(serverDefaults.data.data);
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

export default CodeSnippet;
