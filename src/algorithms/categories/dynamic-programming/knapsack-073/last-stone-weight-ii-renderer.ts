/**
 * 最后一块石头的重量 II (LeetCode 1049) - 声明式 4-Card 沙盘渲染器
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  LAST_STONE_WEIGHT_II_PROBLEM_HTML,
  LAST_STONE_WEIGHT_II_ANALYSIS_HTML,
  LAST_STONE_WEIGHT_II_CODE_LANGUAGES,
} from './knapsack-073-problem-content';
import {
  buildLastStoneWeightIISteps,
  parseLastStoneInputs,
  type LastStoneStep,
} from '../../../../core/renderers/adapters/last-stone-weight-ii-step-compiler';
import {
  renderLastStoneBoard,
  renderLastStoneStage4Metrics,
  createLastStoneStages,
} from '../../../../core/renderers/adapters/last-stone-weight-ii-canvas-adapter';

export { buildLastStoneWeightIISteps, parseLastStoneInputs };
export type { LastStoneStep };

const { Visualizer } = createDeclarativeVisualizer<any>({
  id: 'last-stone-weight-ii-standard',
  name: '最后一块石头的重量 II',
  category: 'dynamic-programming',
  badge: {
    mode: '01背包 · 差值极小化',
    complexity: 'O(N · Sum) · O(Sum)',
  },
  defaultStage: 'stage-4',
  stages: createLastStoneStages(),
  card1Title: '待粉碎石头与实时子集对称天平',
  card2Title: '最接近子集和 DP 向量 dp[0..sum/2]',
  card2Desc: '展示将石头两两粉碎问题通过对称差值极小化转化为最接近 sum/2 容量的 01 背包推演过程',
  legend: [
    { label: '选入子集 A', color: '#10b981' },
    { label: '留在子集 B', color: '#38bdf8' },
    { label: '当前考察容量 j', color: '#f59e0b' },
  ],
  inputs: [
    { id: 'input-stones', label: '石头重量序列 (逗号分隔)', type: 'text', defaultValue: '2, 7, 4, 1, 8, 1', width: '160px' },
  ],
  presets: [
    { label: 'LeetCode 样例 1 (stones=[2,7,4,1,8,1], Ans=1)', values: { 'input-stones': '2, 7, 4, 1, 8, 1' } },
    { label: 'LeetCode 样例 2 (stones=[31,26,33,21,40], Ans=5)', values: { 'input-stones': '31, 26, 33, 21, 40' } },
  ],
  metrics: [
    { id: 'metric-total-sum', label: '石头总重 sum', color: '#38bdf8' },
    { id: 'metric-half-cap', label: '半和上限 t', color: '#10b981' },
    { id: 'metric-nearest-subset', label: '最接近半和 near', color: '#f59e0b' },
    { id: 'metric-min-diff', label: '最小碰撞残余', color: '#a855f7' },
  ],
  codeLanguages: LAST_STONE_WEIGHT_II_CODE_LANGUAGES,
  problemHtml: LAST_STONE_WEIGHT_II_PROBLEM_HTML,
  analysisHtml: LAST_STONE_WEIGHT_II_ANALYSIS_HTML,
  buildSteps: (inputs: Record<string, any>) => {
    const { stones } = parseLastStoneInputs(inputs);
    return buildLastStoneWeightIISteps(stones);
  },
  renderCanvas: (container, step) => renderLastStoneBoard(container, step),
  renderCustomMetrics: renderLastStoneStage4Metrics,
});

export const LastStoneWeightIIVisualizer = Visualizer;
