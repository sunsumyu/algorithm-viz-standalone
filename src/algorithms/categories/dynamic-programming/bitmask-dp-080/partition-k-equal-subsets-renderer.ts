/**
 * 划分为k个相等的子集 (Partition to K Equal Sum Subsets / LeetCode 698 / 左程云 Class 080 Code03)
 * 接入顶层抽象架构：YAML 模型 + BitmaskDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compilePartitionK } from '../../../../core/strategies/bitmask-partitionk';

export {
  compilePartitionK,
  UniversalStageVisualizer,
  UniversalStageVisualizer as PartitionKEqualSubsetsVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'partition-k-equal-subsets',
  name: '划分为k个相等子集 (LeetCode 698)',
  viewId: 'partition-k-equal-subsets',
  category: 'dynamic-programming',
  description: '左程云算法讲解080 Code03：LeetCode 698 划分为k个相等的子集，经典状压DP与子集和划分回溯，将数组元素装箱至 k 个等和桶中。',
  icon: '📦',
  aliases: ['class080-code03', 'partition-k-equal-subsets-698', 'leetcode-698'],
  template: '<div id="partition-k-equal-subsets" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 8003,
  learningGoal: '掌握状态压缩在多子集均分装箱问题中的应用：位掩码标记已选元素，配合降序贪心、整除特判与记忆化表剪枝提升搜索效率。',
});
