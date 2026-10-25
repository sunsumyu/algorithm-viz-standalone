/**
 * 接雨水可视化器（单调栈）— 声明式 4-Card 标准架构
 * LeetCode 42：单调递减栈，按行横向切片累加凹槽雨水 (h * w)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  TRAPPING_RAIN_WATER_PROBLEM_HTML,
  TRAPPING_RAIN_WATER_ANALYSIS_HTML,
  TRAPPING_RAIN_WATER_CODE_LANGUAGES,
} from './trapping-rain-water-problem-content';
import {
  buildTrappingRainWaterSteps,
  withMetrics,
  type TRWStep,
  type WaterLayer,
} from './trapping-rain-water-step-compiler';
import { renderTrappingRainWaterCanvas } from './trapping-rain-water-canvas-adapter';

export {
  buildTrappingRainWaterSteps,
  withMetrics,
  renderTrappingRainWaterCanvas,
  type TRWStep,
  type WaterLayer,
};

registerDeclarativeAlgorithm({
  id: 'trapping-rain-water',
  name: '接雨水',
  category: 'monotonic-stack',
  description: '单调递减栈按行横向切片累加凹槽雨水，槽底出栈以左壁和当前右壁计算蓄水量',
  icon: '💧',
  difficulty: 3,
  levelOrder: 4,
  aliases: ['42', 'leetcode-42', 'trap-rain-water', 'trapping-rain-water-42', 'class052-water'],
  hasDeductionTree: true,
  learningGoal: '掌握单调栈在二维几何与物理蓄水中的横向分层计算思想，理解凹槽底出栈时与左右壁构建积水矩形的本质',
  inputs: [
    {
      id: 'height',
      label: '柱子高度数组',
      type: 'text',
      defaultValue: '0,1,0,2,1,0,1,3,2,1,2,1',
      placeholder: '0,1,0,2,1,0,1,3,2,1,2,1',
    },
  ],
  presets: [
    { label: '示例 1 (6滴水)', values: { height: '0,1,0,2,1,0,1,3,2,1,2,1' } },
    { label: '示例 2 (9滴水)', values: { height: '4,2,0,3,2,5' } },
    { label: '单边陡降', values: { height: '5,4,1,2' } },
    { label: '单调递增 (0滴水)', values: { height: '1,2,3,4,5' } },
  ],
  metrics: [
    { id: 'groove-3', label: '左壁 & 凹槽底 & 右壁', color: '#0284c7' },
    { id: 'layer-water', label: '凹槽本层蓄水量', color: '#059669' },
    { id: 'total-water', label: '当前累计蓄水量', color: '#0284c7' },
    { id: 'action', label: '计算状态', color: '#2563eb' },
  ],
  legend: [
    { label: '🌊 蓝色蓄水池', color: '#0284c7' },
    { label: '🧱 黑色实体柱', color: '#475569' },
    { label: '🥞 凹槽支撑栈', color: '#fbbf24' },
  ],
  codeLanguages: TRAPPING_RAIN_WATER_CODE_LANGUAGES,
  problemHtml: TRAPPING_RAIN_WATER_PROBLEM_HTML,
  analysisHtml: TRAPPING_RAIN_WATER_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const rawHeights = parseNumberList(inputs.height, '0,1,0,2,1,0,1,3,2,1,2,1');
    return withMetrics(
      buildTrappingRainWaterSteps(
        rawHeights.length ? rawHeights : [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
      )
    );
  },
  renderCanvas: (container, step) =>
    renderTrappingRainWaterCanvas(container, step as TRWStep),
});
