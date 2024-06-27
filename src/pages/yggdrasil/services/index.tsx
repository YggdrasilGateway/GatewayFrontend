import React, {useEffect, useRef, useState} from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Message,
  Modal,
  Space,
  Switch,
  Table,
  TableColumnProps,
  TableInstance,
  Typography
} from '@arco-design/web-react';
import {useTranslation} from "react-i18next";
import {IconCheck, IconClose} from "@arco-design/web-react/icon";
import axios from "axios";

function ServiceEditor({data, reloadServices}) {
  const {t, i18n} = useTranslation();
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const isCreateNew = data.id == null
  form.setFieldsValue(data)

  function onDeleteClicked() {
    Modal.confirm({
      title: t('message.delete.confirm-to-delete'),
      content: t('message.delete.unable-to-recover'),
      okButtonProps: {
        status: 'danger',
      },
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          const reply = await axios.delete('/api/yggdrasil-cgi/services/' + data.id);
          if (reply.status == 200) {
            reloadServices()
            setVisible(false)
          } else {
            Message.error(reply.data.message)
          }
        } finally {
          setConfirmLoading(false);
        }
      }
    })
  }

  async function onOk() {
    const res = await form.validate();

    setConfirmLoading(true);

    try {
      const reply = await axios.patch('/api/yggdrasil-cgi/services', res);
      if (reply.status == 200) {
        reloadServices()
        setVisible(false)
      } else {
        Message.error(reply.data.message)
      }
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
    <>
      <Button onClick={() => setVisible(true)} type="primary" status="default">
        {t(isCreateNew ? 'message.create-new' : 'message.edit')}
      </Button>
      <Modal
        title={data.id}
        visible={visible}
        onOk={onOk}
        confirmLoading={confirmLoading}
        onCancel={() => setVisible(false)}
        style={{width: '800px'}}
        footer={(cancel, ok) => {
          if (isCreateNew) return <>{cancel}{ok}</>
          return <>
            {cancel}
            <Button status='danger' onClick={onDeleteClicked}>{t('message.delete')}</Button>
            {ok}
          </>
        }}
      >
        <Form
          {...formItemLayout}
          form={form}
          labelCol={{
            style: {flexBasis: 150},
          }}
          wrapperCol={{
            style: {flexBasis: 'calc(100% - 150px)'},
          }}
        >
          <Form.Item label='ID' field='id' required hidden={!isCreateNew}>
            <Input/>
          </Form.Item>

          <Form.Item
            label='URL'
            field='urlPath'
            rules={[{required: true}]}
          >
            <Input placeholder="Type your old password" type="text"/>
          </Form.Item>
          <Form.Item
            label={t('yggdrasil.service.is-enabled')}
            required
            field="active"
            rules={[{required: true}]}
            triggerPropName={'checked'}
          >
            <Switch/>
          </Form.Item>
          <Form.Item
            label={t('yggdrasil.service.comment')}
            field='comment'
          >
            <Input.TextArea/>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}


function Services() {
  const {t} = useTranslation();

  const [loading, setLoading] = useState(false);
  const table = useRef<TableInstance>();

  const columns: TableColumnProps[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: 'URL',
      dataIndex: 'urlPath',
    },
    {
      title: t('yggdrasil.service.is-enabled'),
      dataIndex: 'active',
      render(a) {
        return a ? <IconCheck/> : <IconClose/>
      },
    },
    {
      title: t('yggdrasil.service.comment'),
      dataIndex: 'comment',
    },
    {
      title: '',
      dataIndex: '',
      render: (_, record) => (
        <ServiceEditor data={record} reloadServices={fetchServices}></ServiceEditor>
      ),
    },
  ];

  const [services, setServices] = useState([]);

  async function fetchServices() {
    setLoading(true)
    try {
      const serverReply = await axios.get('/api/yggdrasil-cgi/services');
      setServices(serverReply.data.data)
    } catch (e) {
      Message.warning(String(e))
      console.warn(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <Card style={{height: '100%'}}>
      <Typography.Title heading={6}>
        {t('menu.yggdrasil.services')}
      </Typography.Title>
      <Space direction='vertical' style={{width: '100%'}}>
        <ServiceEditor data={{active: true}} reloadServices={fetchServices}/>
        <Table ref={table} columns={columns} data={services} loading={loading}/>
      </Space>
    </Card>
  );
}

export default Services;
