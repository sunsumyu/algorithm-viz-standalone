/**
 * 多重背包朴素枚举 (洛谷 P1776 宝物筛选) - 顶层抽象适配器
 * 薄领域适配器 (Thin Domain Adapter, LOC < 150)
 */

import { registerAlgorithm } from '../../../../core/registry';
import { UniversalStageVisualizer } from '../unique-paths-renderer';
import {
  buildBoundedKnapsackNaiveSteps,
  parseNaiveInputs,
  type BoundedKnapsackNaiveStep,
  type BoundedNaiveTake,
} from '../../../../core/renderers/adapters/bounded-knapsack-naive-step-compiler';

export {
  buildBoundedKnapsackNaiveSteps,
  parseNaiveInputs,
  UniversalStageVisualizer,
  UniversalStageVisualizer as BoundedKnapsackNaiveVisualizer,
};
export type { BoundedKnapsackNaiveStep, BoundedNaiveTake };

registerAlgorithm({
  id: 'bounded-knapsack-naive',
  name: '多重背包朴素枚举 (洛谷 P1776 宝物筛选)',
  viewId: 'algo-bounded-knapsack-naive-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 075 Code01：洛谷 P1776 宝物筛选，多重背包基准朴素三重循环枚举每种物品件数 k',
  icon: '📦',
  aliases: ['class075-code01', 'bounded-knapsack-naive-075', 'multiple-knapsack-naive', 'luogu-p1776-naive'],
  template: '<div id="algo-bounded-knapsack-naive-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 90,
  learningGoal: '理解多重背包的严格定义、三重循环朴素枚举的运行轨迹与向空间压缩的一维转化',
});
