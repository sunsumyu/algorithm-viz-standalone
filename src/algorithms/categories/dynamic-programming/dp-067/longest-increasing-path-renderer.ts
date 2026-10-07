/**
 * 矩阵中的最长递增路径 (LeetCode 329) - 声明式 4-Card 沙盘渲染器
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { DP_067_PROBLEMS } from './dp-067-problem-content';
import {
  type LipRecStep,
  type LipMemoStep,
  type Lip2DStep,
  type LipStage4Step,
  buildLipStage1Steps,
  buildLipStage2Steps,
  buildLipStage3Steps,
  buildLipStage4Steps,
} from '../../../../core/renderers/adapters/longest-increasing-path-step-compiler';
import {
  renderMatrixTerrain,
  renderLipStage4Canvas,
  renderLipStage4Metrics,
  createLipStages,
} from '../../../../core/renderers/adapters/longest-increasing-path-canvas-adapter';

// 向后兼容导出
export {
  type LipRecStep,
  type LipMemoStep,
  type Lip2DStep,
  type LipStage4Step,
  buildLipStage1Steps,
  buildLipStage2Steps,
  buildLipStage3Steps,
  buildLipStage4Steps,
  renderMatrixTerrain,
};

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'longest-increasing-path',
  name: '矩阵中的最长递增路径 (LeetCode 329)',
  category: 'dynamic-programming',
  badge: {
    mode: 'DAG 记忆化搜索 · 偏序无环',
    complexity: 'O(M×N) · O(M×N)',
  },
  card1Title: '⛰️ 矩阵地势高度图与最优递增链',
  card2Title: '📈 动态规划记忆化状态表与 DAG 拓扑',
  card2Desc: '展示天然有向无环图、无 visited 数组证明与按值拓扑序递推',
  legend: [
    { label: '最优路径链', color: '#10b981' },
    { label: '当前访问格', color: '#38bdf8' },
    { label: '待探索格子', color: '#475569' },
  ],
  inputs: [
    {
      id: 'input-matrix',
      label: '矩阵:',
      type: 'text',
      defaultValue: '[[9,9,4],[6,6,8],[2,1,1]]',
      width: '240px',
    },
  ],
  presets: [
    {
      label: 'LeetCode 样例 1 (3x3 Ans=4: [1,2,6,9])',
      values: { 'input-matrix': '[[9,9,4],[6,6,8],[2,1,1]]' },
    },
    {
      label: 'LeetCode 样例 2 (3x3 Ans=4: [3,4,5,6])',
      values: { 'input-matrix': '[[3,4,5],[3,2,6],[2,2,1]]' },
    },
  ],
  metrics: [
    { id: 'metric-pos', label: '当前网格坐标', color: '#38bdf8' },
    { id: 'metric-val', label: '格子数值', color: '#10b981' },
    { id: 'metric-max', label: '最长递增长度', color: '#f59e0b' },
  ],
  codeLanguages: DP_067_PROBLEMS['longest-increasing-path'].codeLanguages,
  problemHtml: DP_067_PROBLEMS['longest-increasing-path'].problemHtml,
  analysisHtml: DP_067_PROBLEMS['longest-increasing-path'].analysisHtml,
  defaultStage: 'stage-1',
  buildSteps: buildLipStage1Steps,
  stages: createLipStages(),
  renderCanvas: (container, step) => {
    renderLipStage4Canvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    renderLipStage4Metrics(container, step);
  },
});

export const LongestIncreasingPathVisualizer = Visualizer;

registerAlgorithm({
  id: 'longest-increasing-path',
  name: '矩阵中的最长递增路径 (LeetCode 329)',
  viewId: 'algo-longest-increasing-path-view',
  category: 'dynamic-programming',
  description: '左程云算法讲解067 Code06：LeetCode 329 矩阵最长递增路径，严格偏序天然有向无环图 (DAG) 与记忆化搜索',
  icon: '⛰️',
  aliases: ['class067-code06', 'longest-increasing-path-067', 'longest-increasing-path-in-a-matrix', 'leetcode-329'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 106,
  learningGoal: '理解偏序关系带来的天然无环性、为什么无需 visited 标记以及按值拓扑序递推填表本质',
});
