/**
 * 最大 BST 子树 (Largest BST Subtree / LeetCode 333 / 左程云 Class 078 Code03)
 * 接入顶层抽象架构：YAML 模型 + TreeDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compileLargestBST } from '../../../../core/strategies/tree-largestbst';

export {
  compileLargestBST,
  UniversalStageVisualizer,
  UniversalStageVisualizer as LargestBstSubtreeVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'largest-bst-subtree',
  name: '最大 BST 子树 (LeetCode 333)',
  viewId: 'largest-bst-subtree',
  category: 'dynamic-programming',
  description: '左程云算法讲解078 Code03：LeetCode 333 最大 BST 子树，经典树型 DP 四元组汇报：[maxBSTSize, size, min, max]，判定 BST 性质并汇聚最大节点数。',
  icon: '🔍',
  aliases: ['class078-code03', 'largest-bst-subtree-333', 'leetcode-333'],
  template: '<div id="largest-bst-subtree" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 7803,
  learningGoal: '掌握树型 DP 经典四元组汇报模型：子树汇报 [maxBSTSize, size, min, max]，判定 BST 严格单调性充要条件并在后序回溯中聚合最优规模。',
});
