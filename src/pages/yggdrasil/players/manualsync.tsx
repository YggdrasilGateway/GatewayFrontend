import React, {useEffect, useRef, useState} from 'react';
import {Button, Input, List, Message, Modal, Select, Spin} from "@arco-design/web-react";
import {useTranslation} from "react-i18next";
import axios from "axios";
import {RefInputType} from "@arco-design/web-react/es/Input";

export default function ManualSync({topReloader = undefined}) {
  const {t} = useTranslation()
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState([] as string[])
  const [currentService, setCurrentService] = useState('')
  const optionName = useRef<RefInputType>()

  const [requestToFetch, setRequestToFetch] = useState([] as string[])

  useEffect(() => {
    axios.get('/api/yggdrasil-cgi/services').then(result => {
      if (result.status == 200) {
        const fetchedResults = result.data.data
        setServices(fetchedResults.map(e => e.id))
        setCurrentService(fetchedResults ? fetchedResults[0].id : '');

        setLoading(false)
      } else {
        throw Error(result.data.message)
      }
    })
  }, []);

  function onEnterPress() {
    const newVal = [
      ...requestToFetch,
      currentService + ':' + optionName.current.dom.value
    ]
    setTimeout(() => {
      optionName.current.dom.value = '';
    })

    setRequestToFetch(newVal)
  }

  async function doRequest() {
    const toRequest = {} as { [a: string]: string[] };
    for (const entry of requestToFetch) {
      const split = entry.indexOf(':');
      const namespace = entry.substring(0, split);
      const player = entry.substring(split + 1);

      if (!(namespace in toRequest)) {
        toRequest[namespace] = [];
      }
      toRequest[namespace].push(player);
    }

    const resp = await axios.post('/api/yggdrasil-cgi/players/sync', {data: toRequest});
    if (resp.status != 200) {
      Message.error(resp.data.message)
      return
    }
    setVisible(false)
    setRequestToFetch([]);
    if (topReloader != null) {
      topReloader()
    }
  }

  return <>
    <Button type='outline' onClick={() => setVisible(true)}>{t('yggdrasil.player.sync')}</Button>
    <Modal
      title={t('yggdrasil.player.sync')}
      visible={visible}
      onCancel={() => {
        setVisible(false);
        setRequestToFetch([]);
      }}
      onConfirm={doRequest}
    >
      <Spin loading={loading} style={{width: '100%'}}>
        <Input ref={optionName} addBefore={
          <Select
            style={{width: 120}}
            defaultValue={services ? services[0] : ''}
            options={services}
            onChange={setCurrentService}
          ></Select>
        } placeholder={'Press to add'} onPressEnter={onEnterPress} autoFocus/>

        <List
          dataSource={requestToFetch}
          render={(item, index) => <List.Item key={index}>{item}</List.Item>}
        />
      </Spin>
    </Modal>
  </>
}