/**
 * 分组背包模版 (洛谷 P1757 通天之分组背包) - 声明式 4-Card 沙盘渲染器
 * 核心：组内物品互斥决策（至多选 1 件），容量倒序枚举保证组内单选
 * 架构重构：采用通用背包推演深模块 KnapsackExecutionEngine 与沙盘载荷舱组件 KnapsackSandboxStage
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  PARTITIONED_KNAPSACK_PROBLEM_HTML,
  PARTITIONED_KNAPSACK_ANALYSIS_HTML,
  PARTITIONED_KNAPSACK_CODE_LANGUAGES,
} from './knapsack-074-problem-content';
import {
  runKnapsackEngine,
  KnapsackExecutionStep,
  KnapsackItem,
} from '../../../../core/knapsack-execution-engine';
import {
  renderKnapsackSandbox,
  renderKnapsackDpMatrix,
} from '../../../../core/renderers/knapsack-sandbox-stage';

export type PartitionedItem = KnapsackItem & {
  group: number;
};

export type PartitionedKnapsackStep = KnapsackExecutionStep;

export function buildPartitionedKnapsackSteps(
  capacity: number,
  rawItems: PartitionedItem[]
): PartitionedKnapsackStep[] {
  return runKnapsackEngine({
    type: 'partitioned',
    capacity,
    items: rawItems,
    lineMap: {
      sort: { java: 9, cpp: 9, python: 3, javascript: 3 },
      initDp: { java: 10, cpp: 10, python: 4, javascript: 4 },
      outerLoop: { java: 11, cpp: 11, python: 6, javascript: 6 },
      groupEnd: { java: 12, cpp: 12, python: 8, javascript: 8 },
      capLoop: { java: 13, cpp: 14, python: 10, javascript: 9 },
      itemLoop: { java: 14, cpp: 15, python: 11, javascript: 10 },
      ifFit: { java: 15, cpp: 16, python: 13, javascript: 12 },
      updateDp: { java: 16, cpp: 17, python: 14, javascript: 13 },
      advanceLoop: { java: 20, cpp: 21, python: 15, javascript: 17 },
      returnAns: { java: 22, cpp: 23, python: 16, javascript: 19 },
    },
    customMessages: {
      init: `🎒 初始化分组背包空间：总容量 m=${capacity}，物品按组号升序排列。`,
      done: `🎉 分组背包决策完毕！在总容量 ${capacity} 下，各组互斥选择的最大收益为答案！`,
    },
  }) as PartitionedKnapsackStep[];
}

const { template, Visualizer } = createDeclarativeVisualizer<PartitionedKnapsackStep>({
  id: 'partitioned-knapsack-standard',
  name: '分组背包模版 (通天之分组背包)',
  category: 'dynamic-programming',
  badge: {
    mode: '分组背包 · 组内互斥',
    complexity: 'O(N · M) · O(M)',
  },
  card1Title: '🗂️ 物品分组陈列与组内互斥选择沙盘',
  card2Title: '📊 滚动收益向量 dp[j] 监视器',
  card2Desc: '展示倒序容量枚举下，组内多选被严格禁止的互斥填表过程',
  legend: [
    { label: '未处理组', color: '#475569' },
    { label: '当前考察互斥组', color: '#f59e0b' },
    { label: '带来更优更新项', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-capacity',
      label: '背包总容量 m',
      type: 'number',
      defaultValue: 45,
      width: '60px',
    },
    {
      id: 'input-items-json',
      label: '物品数组 JSON [cost, val, group]',
      type: 'text',
      defaultValue: '[[10,10,1],[10,20,1],[20,20,2]]',
      width: '240px',
    },
  ],
  presets: [
    {
      label: '洛谷经典案例 (m=45, 3物品2组, Ans=40)',
      values: {
        'input-capacity': 45,
        'input-items-json': '[[10,10,1],[10,20,1],[20,20,2]]',
      },
    },
    {
      label: '多组充分用例 (m=50, 5物品3组, Ans=65)',
      values: {
        'input-capacity': 50,
        'input-items-json':
          '[[15,25,1],[10,15,1],[20,30,2],[15,20,2],[10,20,3]]',
      },
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
  buildSteps: (inputs) => {
    const m = parseInt(inputs['input-capacity'] || '45', 10);
    let rawArr: [number, number, number][] = [];
    try {
      rawArr = JSON.parse(
        inputs['input-items-json'] || '[[10,10,1],[10,20,1],[20,20,2]]'
      );
    } catch {
      rawArr = [
        [10, 10, 1],
        [10, 20, 1],
        [20, 20, 2],
      ];
    }
    const items: PartitionedItem[] = rawArr.map(([cost, val, group]) => ({
      cost,
      val,
      group,
    }));
    return buildPartitionedKnapsackSteps(m, items);
  },
  renderCanvas: (container, step) => {
    renderKnapsackSandbox(container, step, {
      title: '🗂️ 分组货架陈列 (每组互斥至多选1件)',
      isPartitioned: true,
    });
  },
  renderCustomMetrics: (container, step) => {
    renderKnapsackDpMatrix(container, step, '滚动状态向量 dp[0..M]');
  },
});

export const PartitionedKnapsackVisualizer = Visualizer;

registerAlgorithm({
  id: 'partitioned-knapsack-standard',
  name: '分组背包模版 (通天之分组背包)',
  viewId: 'algo-partitioned-knapsack-standard-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code01：洛谷 P1757 通天之分组背包，组内物品至多选 1 件，容量倒序外层枚举防止组内多选',
  icon: '🗂️',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 84,
  learningGoal: '掌握分组背包组内互斥决策建模、外层容量倒序内层枚举组内物品的核心循环顺序',
});
