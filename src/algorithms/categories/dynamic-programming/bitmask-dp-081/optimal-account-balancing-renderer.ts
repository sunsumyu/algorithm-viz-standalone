/**
 * 最优账单平衡 (Optimal Account Balancing / LeetCode 465 / 左程云 Class 081 Code02)
 * 接入顶层抽象架构：YAML 模型 + BitmaskDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compileOptimalAccount } from '../../../../core/strategies/bitmask-optimalaccount';

export {
  compileOptimalAccount,
  UniversalStageVisualizer,
  UniversalStageVisualizer as OptimalAccountBalancingVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'optimal-account-balancing',
  name: '最优账单平衡',
  viewId: 'optimal-account-balancing',
  category: 'dynamic-programming',
  description: '左程云算法讲解081 Code02：LeetCode 465 最优账单平衡，账单流抵消与最大和为0独立子集拆分状压 DP。',
  icon: '⚖️',
  aliases: ['class081-code02', 'optimal-account-balancing-465', 'leetcode-465'],
  template: '<div id="optimal-account-balancing" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 8102,
  learningGoal: '掌握债务流抵消规约与最大和为0子集状压 DP：证明最少转账笔数等于非零负债人数减去最大独立平衡子集数，通过二进制掩码预处理子集和并继承极大拆分数。',
});
