import React from 'react';
import {Card, Typography} from '@arco-design/web-react';

function Example() {
  return (
    <Card style={{height: '100%'}}>
      <Typography.Title heading={6}>
        This is a very basic and simple page
      </Typography.Title>
      <Typography.Text>You can add content here :)</Typography.Text>
    </Card>
  );
}

export default Example;
