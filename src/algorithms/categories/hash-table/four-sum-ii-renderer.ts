/**
 * 四数相加 II 可视化器 — 声明式 4-Card 标准架构
 * LeetCode 454：分组哈希 (2+2 拆分)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  FOUR_SUM_II_PROBLEM_HTML,
  FOUR_SUM_II_ANALYSIS_HTML,
  FOUR_SUM_II_CODE_LANGUAGES,
} from './four-sum-ii-problem-content';
import {
  FourSumIIStep,
  buildFourSumIISteps,
  withFourSumIIMetrics,
} from './four-sum-ii-step-compiler';
import { renderFourSumIICanvas } from './four-sum-ii-canvas-adapter';

export type { FourSumIIStep };
export { buildFourSumIISteps, withFourSumIIMetrics, renderFourSumIICanvas };

registerDeclarativeAlgorithm({
  id: 'four-sum-ii',
  aliases: ['454', 'leetcode-454', 'four-sum-ii-hash'],
  hasDeductionTree: true,
  name: '四数相加II（分组哈希）',
  category: 'hash-table',
  description: '将四数组分为两组，用哈希表统计和为0的元组数',
  icon: '🧮',
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '掌握分组降维 + 哈希表计数优化四重循环',
  inputs: [
    { id: 'nums1', label: 'nums1', type: 'text', defaultValue: '1, 2', placeholder: '逗号分隔', width: '70px' },
    { id: 'nums2', label: 'nums2', type: 'text', defaultValue: '-2, -1', placeholder: '逗号分隔', width: '70px' },
    { id: 'nums3', label: 'nums3', type: 'text', defaultValue: '-1, 2', placeholder: '逗号分隔', width: '70px' },
    { id: 'nums4', label: 'nums4', type: 'text', defaultValue: '0, 2', placeholder: '逗号分隔', width: '70px' },
  ],
  presets: [
    {
      label: '示例 1: (2 组有效解)',
      values: { nums1: '1, 2', nums2: '-2, -1', nums3: '-1, 2', nums4: '0, 2' },
    },
    {
      label: '全零 4 数组: (16 组解)',
      values: { nums1: '0, 0', nums2: '0, 0', nums3: '0, 0', nums4: '0, 0' },
    },
    {
      label: '单解案例: (1 组解)',
      values: { nums1: '1, 1', nums2: '-1, 2', nums3: '0, 1', nums4: '0, -2' },
    },
  ],
  metrics: [
    { id: 'phase', label: '当前阶段', color: '#2563eb' },
    { id: 'target', label: '待查 Target', color: '#9333ea' },
    { id: 'inc', label: '单次匹配增量', color: '#f59e0b' },
    { id: 'count', label: '累计有效元组', color: '#10b981' },
  ],
  legend: [
    { label: 'Group 1: A+B 频次', color: '#2563eb' },
    { label: 'Group 2: -(C+D) 匹配', color: '#10b981' },
  ],
  codeLanguages: FOUR_SUM_II_CODE_LANGUAGES,
  problemHtml: FOUR_SUM_II_PROBLEM_HTML,
  analysisHtml: FOUR_SUM_II_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const parse = (v: any, fallback: number[]) => {
      const arr = String(v ?? '')
        .split(/[,，\s]+/)
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n));
      return arr.length > 0 ? arr : fallback;
    };
    return withFourSumIIMetrics(
      buildFourSumIISteps(
        parse(inputs.nums1, [1, 2]),
        parse(inputs.nums2, [-2, -1]),
        parse(inputs.nums3, [-1, 2]),
        parse(inputs.nums4, [0, 2])
      )
    );
  },
  renderCanvas: (container, step) => renderFourSumIICanvas(container, step as FourSumIIStep),
});
