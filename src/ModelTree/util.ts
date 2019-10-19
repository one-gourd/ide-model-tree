import { TreeModel, ITreeModelSnapshot, ITreeModel } from './index';
import { map } from 'ss-tree';

interface IObject {
  [key: string]: any;
}

const DEFAULT_ID_GEN = function(node: ITreeModelSnapshot) {
  return ('' + Math.random()).slice(2);
};

const DEFAULT_META_HANDLER = function(meta: IObject) {
  return meta;
};

export interface IInitOptions {
  idGenFn?: (node: ITreeModelSnapshot) => string;
  metaHandler?: (meta: IObject) => IObject;
}

// 通过 json 初始化出 tree model
export function initTreeModelFromJSON(
  json: IObject,
  options: IInitOptions = {}
) {
  // 传递给 map 函数的对象，必须具备 `children` 属性，否则没法迭代
  if (!json.children) {
    json.children = [];
  }

  const {
    idGenFn = DEFAULT_ID_GEN,
    metaHandler = DEFAULT_META_HANDLER
  } = options;

  return map(
    json,
    (node: ITreeModelSnapshot) => {
      const { id = idGenFn(node), children, ...otherMeta } = node;
      // 设置属性
      const subModel = TreeModel.create({
        id
      });
      subModel.setMeta(metaHandler(otherMeta)); // 对 meta 属性进行设置
      return subModel;
    },
    true,
    (parent: any, children: any[]) => {
      parent.addChildren(children); // 调用 tree.addChildren 方法，在该方法中内涵了对 parent 的设置
    }
  ) as ITreeModel;
}
