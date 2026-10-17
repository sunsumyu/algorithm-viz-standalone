/**
 * 从栈中取出K个硬币的最大面值和 (LeetCode 2218 / Class 074 Code02)
 * 接入顶层抽象架构：YAML 模型 + Strategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import {
  buildCoinsFromPilesSteps,
  parseCoinsFromPilesInputs,
  type CoinsFromPilesStep,
  type CoinPileTake,
} from '../../../../core/renderers/adapters/coins-from-piles-step-compiler';

export { buildCoinsFromPilesSteps, parseCoinsFromPilesInputs, UniversalStageVisualizer };
export type { CoinsFromPilesStep, CoinPileTake };

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'coins-from-piles',
  name: '从栈中取出K个硬币的最大面值和',
  viewId: 'coins-from-piles',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code02：LeetCode 2218 取硬币，自顶向下连续拿取的前缀和预处理转分组背包互斥选择',
  icon: '🪙',
  aliases: ['class074-code02', 'coins-from-piles-074', 'maximum-value-of-k-coins-from-piles', 'leetcode-2218'],
  template: '<div id="coins-from-piles" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 3,
  levelOrder: 85,
  learningGoal: '掌握硬币栈连续操作向互斥物品组的转化、前缀和预处理加速与步数容量分组背包',
});
