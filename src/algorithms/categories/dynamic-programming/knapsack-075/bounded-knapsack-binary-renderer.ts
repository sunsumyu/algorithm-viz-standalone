/**
 * 多重背包二进制拆分 (洛谷 P1776 宝物筛选) - 顶层抽象适配器
 * 薄领域适配器 (Thin Domain Adapter, LOC < 150)
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import {
  buildBoundedKnapsackBinarySteps,
  parseBinarySplitInputs,
  type BoundedKnapsackBinaryStep,
  type DerivedItem,
} from '../../../../core/renderers/adapters/bounded-knapsack-binary-step-compiler';

export {
  buildBoundedKnapsackBinarySteps,
  parseBinarySplitInputs,
  UniversalStageVisualizer,
  UniversalStageVisualizer as BoundedKnapsackBinaryVisualizer,
};
export type { BoundedKnapsackBinaryStep, DerivedItem };

registerAlgorithm({
  id: 'bounded-knapsack-binary',
  name: '多重背包二进制拆分 (洛谷 P1776 宝物筛选)',
  viewId: 'algo-bounded-knapsack-binary-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 075 Code02：洛谷 P1776 宝物筛选，利用二进制 1, 2, 4, 8... 拆分转化 01 背包将时间复杂度降至 O(W · Σlog c)',
  icon: '✂️',
  aliases: ['class075-code02', 'bounded-knapsack-binary-075', 'multiple-knapsack-binary', 'luogu-p1776-binary'],
  template: '<div id="algo-bounded-knapsack-binary-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 91,
  learningGoal: '彻底掌握多重背包向 01 背包的二进制拆分转化艺术，理解位权拆分的无遗漏与无冗余特性',
});
