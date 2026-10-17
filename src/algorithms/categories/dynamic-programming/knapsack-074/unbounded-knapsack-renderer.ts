/**
 * 完全背包模版 (洛谷 P1616 疯狂的采药 / 左程云 Class 074 Code03)
 * 接入顶层抽象架构：YAML 模型 + KnapsackFamilyStrategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import {
  buildUnboundedKnapsackSteps,
  parseUnboundedKnapsackInputs,
  type UnboundedKnapsackStep,
} from '../../../../core/renderers/adapters/unbounded-knapsack-step-compiler';

export {
  buildUnboundedKnapsackSteps,
  parseUnboundedKnapsackInputs,
  UniversalStageVisualizer,
  UniversalStageVisualizer as UnboundedKnapsackVisualizer,
};
export type { UnboundedKnapsackStep };

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'unbounded-knapsack-standard',
  name: '完全背包模版 (疯狂的采药)',
  viewId: 'unbounded-knapsack-standard',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code03：洛谷 P1616 疯狂的采药，每件物品可选任意次，空间压缩后正序枚举容量 j',
  icon: '🌿',
  aliases: ['class074-code03', 'unbounded-knapsack-074', 'unbounded-knapsack', 'luogu-p1616', 'complete-knapsack'],
  template: '<div id="unbounded-knapsack-standard" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 1,
  levelOrder: 86,
  learningGoal: '深刻理解完全背包与 01 背包空间压缩的本质区别：正序从小到大枚举容量使得物品可同轮无限次自叠加',
});
