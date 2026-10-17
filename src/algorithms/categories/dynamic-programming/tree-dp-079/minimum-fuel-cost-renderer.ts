/**
 * 到达首都的最少油耗 (Minimum Fuel Cost to Report to the Capital / LeetCode 2477 / 左程云 Class 079 Code03)
 * 接入顶层抽象架构：YAML 模型 + TreeDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compileMinimumFuelCost } from '../../../../core/strategies/tree-minimumfuelcost';

export {
  compileMinimumFuelCost,
  UniversalStageVisualizer,
  UniversalStageVisualizer as MinimumFuelCostVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'minimum-fuel-cost',
  name: '到达首都的最少油耗 (LeetCode 2477)',
  viewId: 'minimum-fuel-cost',
  category: 'dynamic-programming',
  description: '左程云算法讲解079 Code03：LeetCode 2477 到达首都的最少油耗，树型 DP 经典人数汇聚：每个节点统计子树人数 people(u)，跨边行驶车数 ⌈people(u) / seats⌉ 累加即为最少总油耗。',
  icon: '⛽',
  aliases: ['class079-code03', 'minimum-fuel-cost-2477', 'leetcode-2477'],
  template: '<div id="minimum-fuel-cost" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 7903,
  learningGoal: '掌握经典树型 DP 自底向上汇聚模型：子树代表人数归约、跨边贪心拼车向上取整计算、以及后序遍历与自顶向下调度语义差异。',
});
