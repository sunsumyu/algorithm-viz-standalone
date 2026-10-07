/**
 * 多重背包二进制拆分 (洛谷 P1776 宝物筛选) - 声明式 4-Card 沙盘渲染器
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { KNAPSACK_075_PROBLEMS } from './knapsack-075-problem-content';
import {
  buildBoundedKnapsackBinarySteps,
  parseBinarySplitInputs,
  type BoundedKnapsackBinaryStep,
  type DerivedItem,
} from '../../../../core/renderers/adapters/bounded-knapsack-binary-step-compiler';
import {
  renderBinarySplitSandbox,
  renderBinarySplitVectorMatrix,
  createBoundedBinaryStages,
} from '../../../../core/renderers/adapters/bounded-knapsack-binary-canvas-adapter';

export { buildBoundedKnapsackBinarySteps, parseBinarySplitInputs };
export type { BoundedKnapsackBinaryStep, DerivedItem };

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'bounded-knapsack-binary',
  name: '多重背包二进制拆分 (洛谷 P1776 宝物筛选)',
  category: 'dynamic-programming',
  badge: {
    mode: '多重背包 · 二进制拆分',
    complexity: 'O(W · Σlog c) · O(W)',
  },
  card1Title: '✂️ 二进制拆分衍生包货架与实时背包载荷舱',
  card2Title: '📈 01 背包空间压缩向量 dp[j] 监视器',
  card2Desc: '展示利用 1, 2, 4... 二进制位权无遗漏拆分转化并由 01 背包逆序空间压缩求解过程',
  legend: [
    { label: '未选衍生包', color: '#475569' },
    { label: '已选衍生包', color: '#10b981' },
    { label: '当前考察衍生包', color: '#38bdf8' },
  ],
  inputs: [
    { id: 'input-t', label: 't:', type: 'number', defaultValue: 10, width: '42px' },
    { id: 'input-v', label: 'v:', type: 'text', defaultValue: '3, 4, 7', width: '70px' },
    { id: 'input-w', label: 'w:', type: 'text', defaultValue: '2, 3, 5', width: '70px' },
    { id: 'input-c', label: 'c:', type: 'text', defaultValue: '2, 3, 2', width: '70px' },
  ],
  presets: [
    {
      label: '洛谷经典案例 (t=10, 3种宝物, Ans=14)',
      values: { 'input-t': 10, 'input-v': '3, 4, 7', 'input-w': '2, 3, 5', 'input-c': '2, 3, 2' },
    },
    {
      label: '大件数位权拆分案例 (t=12, v=[2,5], w=[1,3], c=[5,4], Ans=21)',
      values: { 'input-t': 12, 'input-v': '2, 5', 'input-w': '1, 3', 'input-c': '5, 4' },
    },
  ],
  metrics: [
    { id: 'metric-orig-n', label: '原宝物品类数', color: '#818cf8' },
    { id: 'metric-derived-m', label: '衍生 01 包总数', color: '#f59e0b' },
    { id: 'metric-cur-derived', label: '当前考察衍生包', color: '#38bdf8' },
    { id: 'metric-max-val', label: '最大总价值', color: '#10b981' },
  ],
  codeLanguages: KNAPSACK_075_PROBLEMS['bounded-knapsack-binary'].codeLanguages,
  problemHtml: KNAPSACK_075_PROBLEMS['bounded-knapsack-binary'].problemHtml,
  analysisHtml: KNAPSACK_075_PROBLEMS['bounded-knapsack-binary'].analysisHtml,
  defaultStage: 'stage-4',
  stages: createBoundedBinaryStages(),
  buildSteps: (inputs: Record<string, any>) => buildBoundedKnapsackBinarySteps(inputs),
  renderCanvas: (container, step) => renderBinarySplitSandbox(container, step),
  renderCustomMetrics: (container, step) => renderBinarySplitVectorMatrix(container, step),
});

export const BoundedKnapsackBinaryVisualizer = Visualizer;

registerAlgorithm({
  id: 'bounded-knapsack-binary',
  name: '多重背包二进制拆分 (洛谷 P1776 宝物筛选)',
  viewId: 'algo-bounded-knapsack-binary-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 075 Code02：洛谷 P1776 宝物筛选，利用二进制 1, 2, 4, 8... 拆分转化 01 背包将时间复杂度降至 O(W · Σlog c)',
  icon: '✂️',
  aliases: ['class075-code02', 'bounded-knapsack-binary-075', 'multiple-knapsack-binary', 'luogu-p1776-binary'],
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 91,
  learningGoal: '彻底掌握多重背包向 01 背包的二进制拆分转化艺术，理解位权拆分的无遗漏与无冗余特性',
});
