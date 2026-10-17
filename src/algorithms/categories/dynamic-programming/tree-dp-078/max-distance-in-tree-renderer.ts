/**
 * 树的最大距离 (Max Distance in Tree / 左程云 Class 078 Code01)
 * 接入顶层抽象架构：YAML 模型 + TreeDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compileMaxDistance } from '../../../../core/strategies/tree-maxdistance';

export {
  compileMaxDistance,
  UniversalStageVisualizer,
  UniversalStageVisualizer as MaxDistanceInTreeVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'max-distance-in-tree',
  name: '树的最大距离 (Class 078 Code01)',
  viewId: 'max-distance-in-tree',
  category: 'dynamic-programming',
  description: '左程云算法讲解078 Code01：树的最大距离，经典树型 DP 二元组汇报模板题。每个节点向父节点汇报 [maxDistance, height]，以当前节点为拐点结算最大路径。',
  icon: '📏',
  aliases: ['class078-code01', 'tree-max-distance'],
  template: '<div id="max-distance-in-tree" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 7801,
  learningGoal: '透彻掌握树型 DP 经典二元组汇报架构：每个节点自底向上返回 [子树内部最大距离, 子树高度]，理解拐点跨度 left.height + right.height 与子树内部极值的合并法则。',
});
