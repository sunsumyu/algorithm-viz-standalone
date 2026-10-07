/**
 * 观赏樱花 (洛谷 P1833 混合背包) - 声明式 4-Card 沙盘渲染器
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { KNAPSACK_075_PROBLEMS } from './knapsack-075-problem-content';
import {
  createCherryBlossomStages,
  renderCherryGardenCanvas,
} from '../../../../core/renderers/adapters/cherry-blossom-viewing-canvas-adapter';
import {
  buildCherryBlossomViewingSteps,
  parseCherryDerivedItems,
  type CherryBlossomViewingStep,
  type CherryItem,
  type CherryDerivedItem,
} from '../../../../core/renderers/adapters/cherry-blossom-viewing-step-compiler';
import { renderKnapsackDpMatrix } from '../../../../core/renderers/knapsack-sandbox-stage';

export { buildCherryBlossomViewingSteps, parseCherryDerivedItems };
export type { CherryBlossomViewingStep, CherryItem, CherryDerivedItem };

const { template, Visualizer } = createDeclarativeVisualizer<CherryBlossomViewingStep | any>({
  id: 'cherry-blossom-viewing',
  name: '观赏樱花 (洛谷 P1833 混合背包)',
  category: 'dynamic-programming',
  badge: {
    mode: '混合背包 · 统一拆分',
    complexity: 'O(T · Σlog c) · O(T)',
  },
  card1Title: '🌸 樱花树林图谱与实时赏花行程仓',
  card2Title: '📈 赏花美学价值向量 dp[0..T]',
  card2Desc: '展示 01 背包、完全背包与多重背包在统一二进制拆分后的时间分配与收益演进',
  legend: [
    { label: '未观赏樱花树', color: '#475569' },
    { label: '已排入行程樱花树', color: '#ec4899' },
    { label: '当前考察樱花树', color: '#38bdf8' },
  ],
  inputs: [
    { id: 'input-t', label: 't:', type: 'number', defaultValue: 10, width: '42px' },
    { id: 'input-costs', label: 'costs:', type: 'text', defaultValue: '2, 3, 5', width: '70px' },
    { id: 'input-vals', label: 'vals:', type: 'text', defaultValue: '3, 4, 10', width: '70px' },
    { id: 'input-cnts', label: 'cnts:', type: 'text', defaultValue: '0, 2, 1', width: '70px' },
  ],
  presets: [
    {
      label: '洛谷混合案例 (t=10, 包含完全/多重/01, Ans=16)',
      values: { 'input-t': 10, 'input-costs': '2, 3, 5', 'input-vals': '3, 4, 10', 'input-cnts': '0, 2, 1' },
    },
    {
      label: '全无限观赏 (t=12, costs=[3,4], vals=[5,7], cnts=[0,0], Ans=21)',
      values: { 'input-t': 12, 'input-costs': '3, 4', 'input-vals': '5, 7', 'input-cnts': '0, 0' },
    },
  ],
  metrics: [
    { id: 'metric-total-time', label: '总可用时间', color: '#38bdf8' },
    { id: 'metric-cur-tree', label: '当前樱花树', color: '#f59e0b' },
    { id: 'metric-tree-type', label: '背包模式分类', color: '#ec4899' },
    { id: 'metric-max-val', label: '最大美学总价值', color: '#10b981' },
  ],
  defaultStage: 'stage-4',
  stages: createCherryBlossomStages(),
  codeLanguages: KNAPSACK_075_PROBLEMS['cherry-blossom-viewing'].codeLanguages,
  problemHtml: KNAPSACK_075_PROBLEMS['cherry-blossom-viewing'].problemHtml,
  analysisHtml: KNAPSACK_075_PROBLEMS['cherry-blossom-viewing'].analysisHtml,
  buildSteps: buildCherryBlossomViewingSteps,
  renderCanvas: (container, step) => renderCherryGardenCanvas(container, step),
  renderCustomMetrics: (container, step) => {
    renderKnapsackDpMatrix(container, {
      ...step,
      items: [],
      currentGroupItems: [],
      selectedItems: [],
      groupIndex: -1,
      itemIndex: step.treeIndex,
      totalCapacity: step.totalTime,
    }, `DP 时间收益矩阵 dp[0..${step.totalTime}]`);
  },
});

export const CherryBlossomViewingVisualizer = Visualizer;

registerAlgorithm({
  id: 'cherry-blossom-viewing',
  name: '观赏樱花 (洛谷 P1833 混合背包)',
  viewId: 'algo-cherry-blossom-viewing-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 075 Code03：洛谷 P1833 观赏樱花，统一融合 01 背包、完全背包与多重背包的经典混合背包模版',
  icon: '🌸',
  aliases: ['class075-code04', 'class075-code03', 'cherry-blossom-viewing-075', 'mixed-knapsack', 'luogu-p1833'],
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 92,
  learningGoal: '掌握混合背包的判定边界、完全背包向上界多重背包的数学转化与统一二进制拆分',
});
