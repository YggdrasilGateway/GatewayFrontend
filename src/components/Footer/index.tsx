import React from 'react';
import {FooterProps} from '@arco-design/web-react/es/Layout/interface';
import cs from 'classnames';
import styles from './style/index.module.less';
import {Layout} from "@arco-design/web-react";
import {BACKEND_VERSION, GIT_COMMIT} from "@/global";

function Footer(props: FooterProps = {}) {
  const {className, ...restProps} = props;
  return (
    <Layout.Footer className={cs(styles.footer, className)} {...restProps}>
      <div className={styles['footer-left']}>
        Yggdrasil Gateway
      </div>
      <div className={styles['footer-right']}>
        Version: {BACKEND_VERSION}^{GIT_COMMIT.substring(0, 8)}
      </div>
    </Layout.Footer>
  );
}

export default Footer;
