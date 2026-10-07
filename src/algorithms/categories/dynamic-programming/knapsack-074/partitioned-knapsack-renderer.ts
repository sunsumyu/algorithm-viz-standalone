/**
 * 分组背包模版 (洛谷 P1757 通天之分组背包) - 声明式 4-Card 沙盘渲染器
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  PARTITIONED_KNAPSACK_PROBLEM_HTML,
  PARTITIONED_KNAPSACK_ANALYSIS_HTML,
  PARTITIONED_KNAPSACK_CODE_LANGUAGES,
} from './knapsack-074-problem-content';
import {
  createPartitionedKnapsackStages,
  renderPartitionedKnapsackCanvas,
  renderPartitionedKnapsackMetrics,
} from '../../../../core/renderers/adapters/partitioned-knapsack-canvas-adapter';
import {
  buildPartitionedKnapsackSteps,
  parsePartitionedInputs,
  type PartitionedKnapsackStep,
  type PartitionedItem,
} from '../../../../core/renderers/adapters/partitioned-knapsack-step-compiler';

export { buildPartitionedKnapsackSteps, parsePartitionedInputs };
export type { PartitionedKnapsackStep, PartitionedItem };

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'partitioned-knapsack-standard',
  name: '分组背包模版 (通天之分组背包)',
  category: 'dynamic-programming',
  badge: {
    mode: '分组背包 · 组内互斥压缩',
    complexity: 'O(N · M) · O(M)',
  },
  defaultStage: 'stage-4',
  stages: createPartitionedKnapsackStages(),
  card1Title: '🗂️ 物品分组陈列与组内互斥选择沙盘',
  card2Title: '📊 滚动收益向量 dp[j] 监视器',
  card2Desc: '展示倒序容量枚举下，组内多选被严格禁止的互斥填表过程',
  legend: [
    { label: '未处理组', color: '#475569' },
    { label: '当前考察互斥组', color: '#f59e0b' },
    { label: '带来更优更新项', color: '#10b981' },
  ],
  inputs: [
    { id: 'input-capacity', label: '背包总容量 m', type: 'number', defaultValue: 45, width: '60px' },
    { id: 'input-items-json', label: '物品数组 JSON [cost, val, group]', type: 'text', defaultValue: '[[10,10,1],[10,20,1],[20,20,2]]', width: '240px' },
  ],
  presets: [
    {
      label: '洛谷经典案例 (m=45, 3物品2组, Ans=40)',
      values: { 'input-capacity': 45, 'input-items-json': '[[10,10,1],[10,20,1],[20,20,2]]' },
    },
    {
      label: '多组充分用例 (m=50, 5物品3组, Ans=65)',
      values: { 'input-capacity': 50, 'input-items-json': '[[15,25,1],[10,15,1],[20,30,2],[15,20,2],[10,20,3]]' },
    },
  ],
  metrics: [
    { id: 'metric-cur-group', label: '当前考察分组', color: '#f59e0b' },
    { id: 'metric-cur-capacity', label: '当前枚举容量 j', color: '#38bdf8' },
    { id: 'metric-group-items-cnt', label: '组内候选商品数', color: '#8b5cf6' },
    { id: 'metric-max-val', label: '当前最大收益', color: '#10b981' },
  ],
  codeLanguages: PARTITIONED_KNAPSACK_CODE_LANGUAGES,
  problemHtml: PARTITIONED_KNAPSACK_PROBLEM_HTML,
  analysisHtml: PARTITIONED_KNAPSACK_ANALYSIS_HTML,
  buildSteps: (inputs: Record<string, any>) => {
    const { m, items } = parsePartitionedInputs(inputs);
    return buildPartitionedKnapsackSteps(m, items);
  },
  renderCanvas: renderPartitionedKnapsackCanvas,
  renderCustomMetrics: renderPartitionedKnapsackMetrics,
});

export const PartitionedKnapsackVisualizer = Visualizer;

registerAlgorithm({
  id: 'partitioned-knapsack-standard',
  name: '分组背包模版 (通天之分组背包)',
  viewId: 'algo-partitioned-knapsack-standard-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code01：洛谷 P1757 通天之分组背包，组内物品至多选 1 件，容量倒序外层枚举防止组内多选',
  icon: '🗂️',
  aliases: ['class074-code01', 'partitioned-knapsack-074', 'partitioned-knapsack', 'luogu-p1757'],
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 84,
  learningGoal: '掌握分组背包组内互斥决策建模、外层容量倒序内层枚举组内物品的核心循环顺序',
});
