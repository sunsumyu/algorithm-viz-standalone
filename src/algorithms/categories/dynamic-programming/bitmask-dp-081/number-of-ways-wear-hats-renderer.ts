/**
 * 每个人戴不同帽子的方案数 (Number of Ways to Wear Different Hats / LeetCode 1434 / 左程云 Class 081 Code01)
 * 接入顶层抽象架构：YAML 模型 + BitmaskDpStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import { compileWearHats } from '../../../../core/strategies/bitmask-wearhats';

export {
  compileWearHats,
  UniversalStageVisualizer,
  UniversalStageVisualizer as NumberOfWaysWearHatsVisualizer,
};

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'number-of-ways-wear-hats',
  name: '每个人戴不同帽子的方案数',
  viewId: 'number-of-ways-wear-hats',
  category: 'dynamic-programming',
  description: '左程云算法讲解081 Code01：LeetCode 1434 每个人戴不同帽子的方案数，维度反转状压 DP（人少帽子多，对人状压逐顶帽子决策）。',
  icon: '🎩',
  aliases: ['class081-code01', 'number-of-ways-wear-hats-1434', 'leetcode-1434'],
  template: '<div id="number-of-ways-wear-hats" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 8101,
  learningGoal: '掌握维度反转（Dimension Inversion）状压动态规划设计：当决策对象数量极多（帽子 40 顶）而受体数量极少（人 <= 10）时，将状态压缩维度建立在稀疏受体上，外层按物品逐项推进 0-1 背包转移。',
});
