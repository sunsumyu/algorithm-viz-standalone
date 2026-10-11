/**
 * 基数排序可视化器 — 声明式 4-Card 标准架构
 * LSD 低位优先、按位计数统计与稳定回填
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  RADIX_SORT_PROBLEM_HTML,
  RADIX_SORT_ANALYSIS_HTML,
  RADIX_SORT_CODE_LANGUAGES,
} from './radix-sort-problem-content';
import {
  RadixStep,
  radixSortSteps,
  withMetrics,
} from './radix-sort-step-compiler';
import { renderRadixSortCanvas } from './radix-sort-canvas-adapter';

export type { RadixStep };
export { radixSortSteps, withMetrics, renderRadixSortCanvas };

registerDeclarativeAlgorithm<RadixStep>({
  id: 'radix-sort',
  name: '基数排序',
  category: 'sort',
  description: '逐步演示基数排序：LSD低位优先、按位计数排序与稳定收集',
  icon: '🎯',
  difficulty: 2,
  levelOrder: 10,
  learningGoal: '掌握基数排序的按位切分、桶分配与稳定收集过程',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '170, 45, 75, 90, 802, 24, 2, 66',
      placeholder: '逗号分隔非负整数',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '170, 45, 75, 90, 802, 24, 2, 66' } },
    { label: '单位数', values: { array: '5, 3, 9, 1, 7' } },
    { label: '宽位数差异', values: { array: '1, 22, 333, 4, 5555, 66' } },
    { label: '含重复数字', values: { array: '12, 21, 12, 21, 11' } },
  ],
  metrics: [
    { id: 'exp', label: '当前权位 exp', color: '#2563eb' },
    { id: 'max-val', label: '最大值 max', color: '#0f172a' },
    { id: 'cur-elem', label: '当前元素 (数位)', color: '#a855f7' },
    { id: 'out-idx', label: '输出下标', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '当前元素', color: '#3b82f6' },
    { label: '数位桶统计', color: '#a855f7' },
    { label: '输出回填', color: '#22c55e' },
  ],
  codeLanguages: RADIX_SORT_CODE_LANGUAGES,
  problemHtml: RADIX_SORT_PROBLEM_HTML,
  analysisHtml: RADIX_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(radixSortSteps(parseNumberList(String(inputs.array ?? '170, 45, 75, 90, 802, 24, 2, 66'), []))),
  renderCanvas: (container, step) => renderRadixSortCanvas(container, step as RadixStep),
});
