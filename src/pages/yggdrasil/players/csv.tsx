import React, {useState} from 'react';
import {Button, Form, Input, Modal, Notification, Switch} from "@arco-design/web-react";
import axios from "axios";
import {useTranslation} from "react-i18next";

function PlayersCSV() {
  return <></>
}

export default PlayersCSV;

function Import({refetch}) {
  const [modalShow, setModalShow] = useState(false)
  const [form] = Form.useForm()
  const [files, setFiles] = useState<FileList>()
  const [t] = useTranslation()

  async function doSubmit() {
    const result = await form.validate()
    try {
      const formData = new FormData()
      formData.append("files", files.item(0))

      const uploadResult = await axios.post('/api/yggdrasil-cgi/csv/import?override=' + result['override'], formData)
      if (uploadResult.status != 200) {
        Notification.warning({content: uploadResult.data.message})
      } else {
        refetch()
      }
    } catch (e) {
      console.warn(e)
      Notification.warning({content: String(e)})
    }
  }

  return <>
    <Button onClick={() => setModalShow(true)}>{t('yggdrasil.player.import')}</Button>

    <Modal
      visible={modalShow}
      onCancel={() => setModalShow(false)}
      title={t('yggdrasil.player.import')}
      onOk={doSubmit}
    >
      <Form form={form}>
        <Form.Item label={t('yggdrasil.player.import-override')} field='override' triggerPropName='checked'>
          <Switch defaultValue='false'/>
        </Form.Item>
        <Form.Item field='file' required label=' ' rules={[{required: true}]}>
          <Input type='file' accept='.csv' onChange={(_, e) => {
            setFiles(e.nativeEvent.target.files)
          }}/>
        </Form.Item>
      </Form>
    </Modal>
  </>
}

function Export() {
  const [t] = useTranslation()

  async function doDownload() {
    const result = await axios({
      url: '/api/yggdrasil-cgi/csv/export',
      method: 'GET',
      responseType: 'blob',
    });
    // create file link in browser's memory
    const href = URL.createObjectURL(result.data);

    // create "a" HTML element with href to file & click
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', 'players.csv'); //or any other extension
    document.body.appendChild(link);
    link.click();

    // clean up "a" element & remove ObjectURL
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  }

  return <Button onClick={doDownload}>{t('yggdrasil.player.export')}</Button>
}

PlayersCSV.Export = Export;
PlayersCSV.Import = Import;

