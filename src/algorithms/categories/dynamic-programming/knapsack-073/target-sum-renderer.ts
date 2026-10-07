/**
 * 目标和 (LeetCode 494) - 声明式 4-Card 沙盘渲染器
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  TARGET_SUM_PROBLEM_HTML,
  TARGET_SUM_ANALYSIS_HTML,
  TARGET_SUM_CODE_LANGUAGES,
} from './knapsack-073-problem-content';
import {
  buildTargetSumSteps,
  parseTargetSumInputs,
  type TargetSumStep,
} from '../../../../core/renderers/adapters/target-sum-step-compiler';
import {
  renderTargetSumBoard,
  renderTargetSumStage4Metrics,
  createTargetSumStages,
} from '../../../../core/renderers/adapters/target-sum-canvas-adapter';

export { buildTargetSumSteps, parseTargetSumInputs };
export type { TargetSumStep };

const { Visualizer } = createDeclarativeVisualizer<any>({
  id: 'target-sum-standard',
  name: '目标和 (01背包方案计数)',
  category: 'dynamic-programming',
  badge: {
    mode: '01背包 · 方案数累加',
    complexity: 'O(N · T) · O(T)',
  },
  defaultStage: 'stage-4',
  stages: createTargetSumStages(),
  card1Title: '待分配符号数字与正集容量达成舱',
  card2Title: '凑出累加和方案数向量 dp[0..(target+sum)/2]',
  card2Desc: '展示利用正负集代数转化将添加符号问题变为 01 背包方案数累加的推演过程',
  legend: [
    { label: '方案数为 0', color: '#475569' },
    { label: '已有可行方案', color: '#10b981' },
    { label: '当前考察容量 j', color: '#38bdf8' },
  ],
  inputs: [
    { id: 'input-target', label: '目标和 target', type: 'number', defaultValue: 3, width: '60px' },
    { id: 'input-nums', label: '数字数组 nums (逗号分隔)', type: 'text', defaultValue: '1, 1, 1, 1, 1', width: '140px' },
  ],
  presets: [
    { label: 'LeetCode 经典案例 (nums=[1,1,1,1,1], target=3, Ans=5)', values: { 'input-target': 3, 'input-nums': '1, 1, 1, 1, 1' } },
    { label: '多样化数组用例 (nums=[1,2,3,4,5], target=3, Ans=3)', values: { 'input-target': 3, 'input-nums': '1, 2, 3, 4, 5' } },
  ],
  metrics: [
    { id: 'metric-array-sum', label: '数组总和 sum', color: '#38bdf8' },
    { id: 'metric-target-val', label: '目标和 target', color: '#f59e0b' },
    { id: 'metric-required-t', label: '等价正集容量 t', color: '#10b981' },
    { id: 'metric-total-ways', label: '当前方案数', color: '#a855f7' },
  ],
  codeLanguages: TARGET_SUM_CODE_LANGUAGES,
  problemHtml: TARGET_SUM_PROBLEM_HTML,
  analysisHtml: TARGET_SUM_ANALYSIS_HTML,
  buildSteps: (inputs: Record<string, any>) => {
    const { target, nums } = parseTargetSumInputs(inputs);
    return buildTargetSumSteps(nums, target);
  },
  renderCanvas: (container, step) => renderTargetSumBoard(container, step),
  renderCustomMetrics: renderTargetSumStage4Metrics,
});

export const TargetSumVisualizer = Visualizer;
