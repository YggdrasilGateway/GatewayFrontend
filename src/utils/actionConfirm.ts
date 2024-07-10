import {Modal} from "@arco-design/web-react";
import {ConfirmProps} from "@arco-design/web-react/es/Modal/confirm";

export function actionConfirm(prop: ConfirmProps) {
  return new Promise<boolean>((resolve, reject) => {
    Modal.confirm({
      ...prop,
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    })
  })
}
