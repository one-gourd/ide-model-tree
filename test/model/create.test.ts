import { initTreeModelFromJSON, ITreeModelSnapshot } from '../../src';

describe('initTreeModelFromJSON - 根据 json 创建 schema ', () => {
  describe('单层 tree 模型建模', () => {
    test('普通方式创建', () => {
      const model = initTreeModelFromJSON({
        id: 'A',
        name: 'rootNode'
      });
      expect(model.id).toBe('A');
      const meta = model.meta;
      expect(meta.name).toBe('rootNode');
      expect(model.parent).toBeUndefined();
      expect(model.children).toEqual([]);
    });

    test('不提供 id 则采用随机值作为 id', () => {
      const model = initTreeModelFromJSON({
        name: 'rootNode2'
      });
      expect(typeof parseInt(model.id)).toBe('number');
      const meta = model.meta;
      expect(meta.name).toBe('rootNode2');
      expect(model.parent).toBeUndefined();
      expect(model.children).toEqual([]);
    });

    test('可自定义 id 生成规则', () => {
      const model = initTreeModelFromJSON(
        {
          name: 'rootNode'
        },
        function(node: ITreeModelSnapshot) {
          return node.name + '-2';
        }
      );
      expect(model.id).toBe('rootNode-2');
      const meta = model.meta;
      expect(meta.name).toBe('rootNode');
      expect(model.parent).toBeUndefined();
      expect(model.children).toEqual([]);
    });

    test('支持空对象创建', () => {
      const model = initTreeModelFromJSON({});
      expect(typeof parseInt(model.id)).toBe('number');
      expect(model.parent).toBeUndefined();
      expect(model.children).toEqual([]);
    });
  });

  describe('多层 tree 模型建模', () => {
    test('普通创建', () => {
      const model = initTreeModelFromJSON({
        id: 'A',
        name: 'rootNode',
        children: [
          {
            id: 'B',
            name: 'B-Node',
            children: [
              {
                id: 'D',
                name: 'D-Node'
              }
            ]
          },
          { id: 'C', name: 'C-Node' }
        ]
      });

      //   根节点 A
      expect(model.id).toBe('A');
      const meta = model.meta;
      expect(meta.name).toBe('rootNode');
      expect(model.parent).toBeUndefined();
      expect(model.children.length).toBe(2);

      //   节点 B
      const nodeB = model.children[0];
      expect(nodeB.meta.name).toBe('B-Node');
      console.log(nodeB.parent);
      expect(nodeB.parent.id).toBe('A');
      expect(nodeB.children.length).toBe(1);

      //   节点 C
      const nodeC = model.children[1];
      expect(nodeC.meta.name).toBe('C-Node');
      expect(nodeC.parent.id).toBe('A');
      expect(nodeC.children.length).toBe(0);

      //   节点 D
      const nodeD = nodeB.children[0];
      expect(nodeD.meta.name).toBe('D-Node');
      expect(nodeD.parent.id).toBe('B');
      expect(nodeD.children.length).toBe(0);
    });
  });
});
