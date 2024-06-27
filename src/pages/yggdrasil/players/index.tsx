import React, {useEffect, useState} from 'react';
import {
  Button,
  Card,
  Form,
  Grid,
  Input,
  Message,
  Modal,
  Space,
  Switch,
  Table,
  TableColumnProps
} from '@arco-design/web-react';
import {IconCheck, IconClose} from "@arco-design/web-react/icon";
import {useTranslation} from "react-i18next";
import axios from "axios";
import ManualSync from "@/pages/yggdrasil/players/manualsync";

function PlayerEditor({data, reloadServices}) {
  const {t, i18n} = useTranslation();
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
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
          const reply = await axios.delete('/api/yggdrasil-cgi/players/' + data.entryId);
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
      const reply = await axios.patch('/api/yggdrasil-cgi/players', res);
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
        {t('message.edit')}
      </Button>
      <Modal
        title={`${data.upstreamName} <-> ${data.downstreamName}`}
        visible={visible}
        onOk={onOk}
        confirmLoading={confirmLoading}
        onCancel={() => setVisible(false)}
        style={{width: '800px'}}
        footer={(cancel, ok) => {
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
          <Form.Item field='entryId' required hidden><Input/></Form.Item>

          <Form.Item
            label={t('yggdrasil.player.upstream-name')}
            field='upstreamName'
            disabled
          ><Input type="text"/></Form.Item>
          <Form.Item
            label={t('yggdrasil.player.declared-yggdrasil')}
            field='declared'
            disabled
          ><Input type="text"/></Form.Item>
          <Form.Item
            label={t('yggdrasil.player.upstream-uuid')}
            field='upstreamUuid'
            disabled
          ><Input type="text"/></Form.Item>

          <Form.Item
            label={t('yggdrasil.player.downstream-name')}
            field='downstreamName'
          ><Input type="text"/></Form.Item>
          <Form.Item
            label={t('yggdrasil.player.downstream-uuid')}
            field='downstreamUuid'
          ><Input type="text"/></Form.Item>

          <Form.Item
            label={t('yggdrasil.player.always-permit')}
            field="alwaysPermit"
            tooltip={t('yggdrasil.settings.prohibit-mode.tooltip')}
            triggerPropName={'checked'}
          ><Switch/></Form.Item>
        </Form>
      </Modal>
    </>
  )
}


function Players() {
  const {t} = useTranslation()
  const [data, setData] = useState([{}]);
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    sizeCanChange: true,
    showTotal: true,
    total: 0,
    pageSize: 10,
    current: 1,
    pageSizeChangeResetCurrent: true,
  });
  const [searchTerm, setSearchTerm] = useState('');

  async function onChangeTable(paramP) {
    if (paramP == null) paramP = pagination;

    const {current, pageSize} = paramP;
    setLoading(true);
    try {
      const response = await axios.get('/api/yggdrasil-cgi/players?index=' + ((current - 1) * pageSize) + '&pageSize=' + pageSize)
      if (response.status != 200) {
        Message.error(response.data.message)
        return
      }
      setData(response.data.data.values)
      setPagination({...paramP, total: response.data.data.total});
    } catch (e) {
      Message.error(String(e))
    } finally {
      setLoading(false);
    }
  }
  async function doSearch() {
    if (!searchTerm) {
      onChangeTable(null)
      return
    }

    setLoading(true);
    try {
      const response = await axios.get('/api/yggdrasil-cgi/players?search=' + encodeURIComponent(searchTerm))
      if (response.status != 200) {
        Message.error(response.data.message)
        return
      }
      setData(response.data.data.values)
      setPagination({...pagination, total: response.data.data.total, current: 1});
    } catch (e) {
      Message.error(String(e))
    } finally {
      setLoading(false);
    }
  }

  const columns: TableColumnProps[] = [
    {
      title: t('yggdrasil.player.upstream-name'),
      dataIndex: 'upstreamName',
    },
    {
      title: t('yggdrasil.player.declared-yggdrasil'),
      dataIndex: 'declared',
      width: 150,
    },
    {
      title: t('yggdrasil.player.upstream-uuid'),
      dataIndex: 'upstreamUuid',
      width: 300,
    },
    {
      title: t('yggdrasil.player.downstream-name'),
      dataIndex: 'downstreamName',
    },
    {
      title: t('yggdrasil.player.downstream-uuid'),
      dataIndex: 'downstreamUuid',
      width: 300,
    },
    {
      title: t('yggdrasil.player.always-permit'),
      dataIndex: 'alwaysPermit',
      render(a) {
        return a ? <IconCheck/> : <IconClose/>
      },
    },
    {
      title: '',
      dataIndex: '',
      render: (_, record) => (
        <PlayerEditor reloadServices={() => onChangeTable(pagination)} data={record}/>
      ),
    },
  ];

  useEffect(() => {
    onChangeTable(pagination);
  }, []);

  return (
    <Card style={{height: '100%'}}>
      <Space direction='vertical' style={{width: '100%'}}>

        <Grid.Row>
          <ManualSync topReloader={onChangeTable}/>
          <Grid.Col flex='auto'></Grid.Col>
          <Grid.Col flex='500px'>
            <Input addAfter={
              <Button onClick={doSearch}>{t('message.search')}</Button>
            } afterStyle={{padding: 0}} value={searchTerm} onChange={setSearchTerm} onPressEnter={doSearch}/>
          </Grid.Col>
        </Grid.Row>

        <Table
          columns={columns}
          data={data}
          loading={loading}
          pagination={pagination}
          onChange={onChangeTable}
          border={{
            wrapper: true,
            headerCell: true,
          }}
        />
      </Space>
    </Card>
  );
}

export default Players;
