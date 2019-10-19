import * as React from 'react';
import { render } from 'react-dom';
import { ModelTree, ModelTreeFactory, IModelTreeProps } from '../src/';
import { Collapse } from 'antd';
const Panel = Collapse.Panel;

const { ComponentWithStore: ModelTreeWithStore, client } = ModelTreeFactory();

function onClick(value) {
  console.log('当前点击：', value);
}
function onClickWithStore(value) {
  client.put(`/model`, {
    name: 'text',
    value: `gggg${Math.random()}`.slice(0, 8)
  });

}

const props: IModelTreeProps = {
  visible: true
};

render(
  <Collapse defaultActiveKey={['1']}>
    <Panel header="普通组件" key="0">
      <ModelTree {...props} onClick={onClick} />
    </Panel>
    <Panel header="包含 store 功能" key="1">
      <ModelTreeWithStore onClick={onClickWithStore} />
    </Panel>
  </Collapse>,
  document.getElementById('example') as HTMLElement
);

client.post('/model', {
  model: {
    visible: true,
    text: `text${Math.random()}`.slice(0, 8)
  }
});
