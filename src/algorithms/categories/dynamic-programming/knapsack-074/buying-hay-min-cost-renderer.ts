/**
 * 购买足量干草的最小花费 (洛谷 P2918 [USACO08NOV] Buying Hay S / 左程云 Class 074 Code06)
 * 接入顶层抽象架构：YAML 模型 + KnapsackBuyingHayStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import {
  buildBuyingHayMinCostSteps,
  parseBuyingHayInputs,
  type BuyingHayStep,
  type HayPurchaseItem,
} from '../../../../core/renderers/adapters/buying-hay-step-compiler';

export {
  buildBuyingHayMinCostSteps,
  parseBuyingHayInputs,
  UniversalStageVisualizer,
  UniversalStageVisualizer as BuyingHayMinCostVisualizer,
};
export type { BuyingHayStep, HayPurchaseItem };

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'buying-hay-min-cost',
  name: '购买足量干草的最小花费 (洛谷 P2918)',
  viewId: 'buying-hay-min-cost',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code06：洛谷 P2918 购买干草，至少 H 磅允许超额，容量上界扩充至 H + maxVal 的完全背包求极小值',
  icon: '🌾',
  aliases: ['class074-code06', 'buying-hay-min-cost-074', 'buying-hay', 'luogu-p2918'],
  template: '<div id="buying-hay-min-cost" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 89,
  learningGoal: '掌握允许超额时的容量上界安全扩充证明（H + maxVal）与求最小花费完全背包的状态转移',
});
