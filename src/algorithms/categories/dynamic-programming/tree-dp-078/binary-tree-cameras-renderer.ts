/**
 * 监控二叉树 (Binary Tree Cameras / LeetCode 968 / 左程云 Class 078 Code05)
 * 接入顶层抽象架构：YAML 模型 + TreeDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compileBinaryTreeCameras } from '../../../../core/strategies/tree-binarytreecameras';

export {
  compileBinaryTreeCameras,
  UniversalStageVisualizer,
  UniversalStageVisualizer as BinaryTreeCamerasVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'binary-tree-cameras',
  name: '监控二叉树 (LeetCode 968)',
  viewId: 'binary-tree-cameras',
  category: 'dynamic-programming',
  description: '左程云算法讲解078 Code05：LeetCode 968 监控二叉树，树型 DP 状态机经典三状态汇报：[0:待覆盖, 1:已覆盖, 2:装相机]，自底向上贪心决策叶子父节点装相机，根节点单独收敛特判。',
  icon: '📷',
  aliases: ['class078-code05', 'binary-tree-cameras-968', 'leetcode-968'],
  template: '<div id="binary-tree-cameras" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 7805,
  learningGoal: '掌握树型 DP 状态机三状态建模范式：0=待覆盖、1=已覆盖、2=装相机，深刻理解自底向上局部贪心最优推导全局最少相机数的数学本质。',
});
