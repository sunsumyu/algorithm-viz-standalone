/**
 * 分组背包模版 (洛谷 P1757 通天之分组背包 / 左程云 Class 074 Code01)
 * 接入顶层抽象架构：YAML 模型 + Strategy + UniversalStageVisualizer
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import {
  buildPartitionedKnapsackSteps,
  parsePartitionedInputs,
  type PartitionedKnapsackStep,
  type PartitionedItem,
} from '../../../../core/renderers/adapters/partitioned-knapsack-step-compiler';

export {
  buildPartitionedKnapsackSteps,
  parsePartitionedInputs,
  UniversalStageVisualizer,
  UniversalStageVisualizer as PartitionedKnapsackVisualizer,
};
export type { PartitionedKnapsackStep, PartitionedItem };

// 注册至全局算法注册表，接入统一顶层抽象容器
registerAlgorithm({
  id: 'partitioned-knapsack-standard',
  name: '分组背包模版 (通天之分组背包)',
  viewId: 'partitioned-knapsack-standard',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code01：洛谷 P1757 通天之分组背包，组内物品至多选 1 件，容量倒序外层枚举防止组内多选',
  icon: '🗂️',
  aliases: ['class074-code01', 'partitioned-knapsack-074', 'partitioned-knapsack', 'luogu-p1757'],
  template: '<div id="partitioned-knapsack-standard" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 84,
  learningGoal: '掌握分组背包组内互斥决策建模、外层容量倒序内层枚举组内物品的核心循环顺序',
});
