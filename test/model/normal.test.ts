import { initTreeModelFromJSON, ITreeModelSnapshot } from '../../src';

describe('treeModel - 获取 json 对象', () => {
  let model: ITreeModelSnapshot;

  beforeEach(() => {
    model = initTreeModelFromJSON({
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
  });

  test('获取 tree json', () => {
    const json = model.treeJSON;
    expect(json).toEqual({
      id: 'A',
      name: 'rootNode',
      children: [
        {
          id: 'B',
          name: 'B-Node',
          children: [{ id: 'D', name: 'D-Node', children: [] }]
        },
        { id: 'C', name: 'C-Node', children: [] }
      ]
    });
  });

  test('获取所有节点', () => {
    const allNodes = model.allNodes;

    const nodeArr = allNodes.map((o: ITreeModelSnapshot) => {
      return { id: o.id, name: o.meta.name, isRoot: o.isRoot };
    });
    expect(nodeArr).toEqual([
      { id: 'A', name: 'rootNode', isRoot: true },
      { id: 'B', name: 'B-Node', isRoot: false },
      { id: 'C', name: 'C-Node', isRoot: false },
      { id: 'D', name: 'D-Node', isRoot: false }
    ]);
  });

  test('findNodeById - 根据 id 查找节点', () => {
    const nodeC = model.findNodeById('C');
    expect(nodeC.treeJSON).toEqual({ id: 'C', name: 'C-Node', children: [] });

    const nodeNotExist = model.findNodeById('not-exist');
    expect(nodeNotExist).toBeNull();
  });

  test('indexOfChild - 查找是第几个元素', () => {
    expect(model.indexOfChild('B')).toBe(0);
    expect(model.indexOfChild('C')).toBe(1);

    expect(model.indexOfChild('not-exist')).toBe(-1);
  });

  test('upsertMeta - 更新元素的属性', () => {
    expect(model.meta).toEqual({ name: 'rootNode' });
    model.upsertMeta('name', 'A-Node');
    expect(model.meta).toEqual({ name: 'A-Node' });
    model.upsertMeta('age', '123');
    expect(model.meta).toEqual({ name: 'A-Node', age: '123' });
  });

  test('addChildren - 扩增子元素', () => {
    const nodeE = initTreeModelFromJSON({ id: 'E', name: 'E-Node' });
    model.addChildren(nodeE);

    expect(model.treeJSON).toEqual({
      id: 'A',
      name: 'rootNode',
      children: [
        {
          id: 'B',
          name: 'B-Node',
          children: [{ id: 'D', name: 'D-Node', children: [] }]
        },
        { id: 'C', name: 'C-Node', children: [] },
        { id: 'E', name: 'E-Node', children: [] }
      ]
    });
  });

  test('addChildByIndex - 在指定位置插入子元素', () => {
    const nodeE = initTreeModelFromJSON({ id: 'E', name: 'E-Node' });
    model.addChildByIndex(nodeE, 1);

    expect(model.treeJSON).toEqual({
      id: 'A',
      name: 'rootNode',
      children: [
        {
          id: 'B',
          name: 'B-Node',
          children: [{ id: 'D', name: 'D-Node', children: [] }]
        },
        { id: 'E', name: 'E-Node', children: [] },
        { id: 'C', name: 'C-Node', children: [] }
      ]
    });
  });

  test('removeChildren - 移除指定子元素', () => {
    model.removeChildren(['B', 'C']);
    expect(model.treeJSON).toEqual({
      id: 'A',
      name: 'rootNode',
      children: []
    });
  });
});
