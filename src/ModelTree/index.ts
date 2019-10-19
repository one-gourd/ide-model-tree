import {
  getSnapshot,
  types,
  Instance,
  IAnyModelType,
  SnapshotOrInstance,
  detach,
  clone
} from 'mobx-state-tree';

import {
  quickInitModel,
  JSONModel,
  EMPTY_JSON_SNAPSHOT
} from 'ide-model-utils';

import { pick, isExist } from 'ide-lib-utils';

import { map, traverse, TRAVERSE_TYPE } from 'ss-tree';

import { debugModel } from '../lib/debug';
import { sortNumberDesc } from '../lib/utils';

/**
 * tree model
 */
export const TreeModel: IAnyModelType = quickInitModel('TreeModel', {
  // 规定每个节点 id
  id: types.identifier,

  // 节点 meta 信息：比如： {name, icon}
  meta: types.optional(JSONModel, EMPTY_JSON_SNAPSHOT),

  parent: types.maybe(types.reference(types.late(() => TreeModel))), // 保存父空间

  // 当前节点的边
  children: types.array(types.late((): IAnyModelType => TreeModel))
})
  .views(self => {
    return {
      /**
       * 获取直系子类的 id 列表
       * 依赖属性：children
       */
      get childrenIds() {
        return (self.children || []).map(
          (child: ITreeModelSnapshot) => child.id
        );
      },

      /**
       * 获取 tree json 格式数据
       */
      get treeJSON() {
        return map(
          self,
          (node: ITreeModelSnapshot) => {
            return Object.assign({ id: node.id }, node.meta);
          },
          true
        );
      },

      /**
       * 返回包含所有节点的列表集合
       */
      get allNodes() {
        return traverse(
          self,
          (node: ITreeModelSnapshot, lastResult: ITreeModelSnapshot[] = []) => {
            lastResult.push(node);
            return lastResult;
          }
        );
      },

      /**
       * 是否是根节点
       * 依赖属性：parentId
       */
      get isRoot() {
        return !self.parent;
      }
    };
  })
  .views(self => {
    return {
      /**
       * 根据 id 返回后代节点（不一定是直系子节点），如果有过滤条件，则返回符合过滤条件的节点
       */
      findNodeById(id: string, filterArray?: string | string[]) {
        debugModel(
          `[findNode] 开始查找节点 ${id}, filterArray: ${filterArray}`
        );
        if (!id) return null;

        let modelNode = null;
        const filters = [].concat(filterArray || []); // 使用逗号隔开

        traverse(
          self,
          (node: ITreeModelSnapshot) => {
            if (node.id === id) {
              modelNode = filters.length ? pick(node, filters) : node;
              return true;
            }
            return false;
          },
          TRAVERSE_TYPE.BFS,
          true
        );
        return modelNode;
      },
      /**
       * 根据 id 定位到直系子节点的索引值；
       * 即，返回子节点中指定 id 对应的节点位置
       */
      indexOfChild(id: string): number {
        if (!id) {
          return -1;
        }
        let ids = (self.children || []).map(
          (child: ITreeModelSnapshot) => child.id
        );
        return ids.indexOf(id);
      }
    };
  })
  .actions(self => {
    return {
      /**
       * 更新当前节点的 meta
       * meta 对应的属性
       */
      upsertMeta: (attrName: string, value: string | object) => {
        const originMeta = self.meta || {};
        originMeta[attrName] = value;
        self.setMeta(originMeta);
      },

      /**
       * 新增直系节点，简单的 append
       * 影响属性：children
       */
      addChildren: (
        nodeOrNodeArray: ITreeModelSnapshot | ITreeModelSnapshot[]
      ) => {
        const nodes = [].concat(nodeOrNodeArray);
        nodes.forEach(node => {
          node.setParent(self.id);
          self.children.push(node);
        });
      }
    };
  })
  .actions(self => {
    return {
      /**
       * 在指定节点新增直系子节点
       * 新增单个直系节点到指定位置，操作稍微复杂
       * 影响属性：children
       * @param {number} targetIndex - 指定插入的位置，该 `targetIndex` 插入的行为和 Array.splice 方法类似
       */
      addChildByIndex: (
        insertedNode: ITreeModelSnapshot,
        targetIndex?: number
      ) => {
        const currentLen = self.children.length;

        // 无子节点的情况
        if (!currentLen) {
          self.addChildren(insertedNode);
          return;
        }

        // 注意：要将 targetIndex 转换成数字
        let resultIndex = isExist(targetIndex) ? +targetIndex : currentLen;
        // const originChildren = self.children.toJSON();
        insertedNode.setParent(self.id);
        self.children.splice(resultIndex, 0, insertedNode);
      }
    };
  })
  .actions(self => {
    return {
      /**
       * 根据 id 删除直系节点，如果想要整个重置 children，请使用 `setChildren` 方法
       * 影响属性：children
       */
      removeChildren: (idOrIdArray: string | string[]) => {
        const ids = [].concat(idOrIdArray);
        debugModel(
          `[comp] 删除前 children 长度: ${
            self.children.length
          }, 待删除的 ids: ${ids.join('、')}`
        );

        const originIds = [].concat(self.childrenIds);

        const targetIndexes = ids.map(id => {
          return originIds.indexOf(id);
        });

        // 降序排列
        targetIndexes.sort(sortNumberDesc);

        // 逆序删除子元素
        targetIndexes.forEach(index => {
          if (index !== -1) {
            let nodeToBeRemoved = self.children[index];
            // 移除指定的元素
            detach(nodeToBeRemoved);
          }
        });

        debugModel(
          `[comp] 删除后 children 长度: ${
            self.children.length
          }，ids: ${self.children
            .map((o: ITreeModelSnapshot) => o.id)
            .join('、')}`
        );
      }
    };
  });

export interface ITreeModel extends Instance<typeof TreeModel> {}
export interface ITreeModelSnapshot
  extends SnapshotOrInstance<typeof TreeModel> {}
