/**
 * 好子集的数目 (The Number of Good Subsets / LeetCode 1994 / 左程云 Class 081 Code03)
 * 接入顶层抽象架构：YAML 模型 + BitmaskDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compileGoodSubsets } from '../../../../core/strategies/bitmask-goodsubsets';

export {
  compileGoodSubsets,
  UniversalStageVisualizer,
  UniversalStageVisualizer as GoodSubsetsVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'good-subsets',
  name: '好子集的数目',
  viewId: 'good-subsets',
  category: 'dynamic-programming',
  description: '左程云算法讲解081 Code03：LeetCode 1994 好子集的数目，数论质因数分解、平方因子过滤与 0-1 背包状压计数 DP。',
  icon: '✨',
  aliases: ['class081-code03', 'good-subsets-1994', 'leetcode-1994'],
  template: '<div id="good-subsets" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 8103,
  learningGoal: '掌握数论与状态压缩动态规划结合技巧：利用 30 以内仅 10 个质数的特性构建 10 位掩码，排除带平方因子的非法数字，通过 0-1 背包逆序累加无交集方案，最后对数字 1 进行 2^cnt[1] 倍乘。',
});
