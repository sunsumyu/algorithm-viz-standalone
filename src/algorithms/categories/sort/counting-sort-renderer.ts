/**
 * 计数排序可视化器 — 声明式 4-Card 标准架构
 * 统计频次、前缀和累加、倒序稳定回填
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  COUNTING_SORT_PROBLEM_HTML,
  COUNTING_SORT_ANALYSIS_HTML,
  COUNTING_SORT_CODE_LANGUAGES,
} from './counting-sort-problem-content';
import {
  CSStep,
  countingSortSteps,
  withMetrics,
} from './counting-sort-step-compiler';
import { renderCountingSortCanvas } from './counting-sort-canvas-adapter';

export type { CSStep };
export { countingSortSteps, withMetrics, renderCountingSortCanvas };

registerDeclarativeAlgorithm<CSStep>({
  id: 'counting-sort',
  name: '计数排序',
  category: 'sort',
  description: '逐步演示计数排序：统计频次、前缀和累加、倒序稳定输出',
  icon: '🔢',
  difficulty: 1,
  levelOrder: 8,
  learningGoal: '理解非比较排序思想、计数数组与前缀和定位原理',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '4, 2, 2, 8, 3, 3, 1',
      placeholder: '逗号分隔非负整数',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '4, 2, 2, 8, 3, 3, 1' } },
    { label: '窄值域密集重复', values: { array: '1, 1, 2, 2, 1, 2, 1' } },
    { label: '含较大值域跳跃', values: { array: '1, 5, 9, 3, 5, 9, 1' } },
    { label: '已有序', values: { array: '1, 2, 3, 4, 5, 6' } },
  ],
  metrics: [
    { id: 'range', label: '值域范围', color: '#2563eb' },
    { id: 'k', label: '值域跨度 k', color: '#0f172a' },
    { id: 'cur-elem', label: '当前元素', color: '#3b82f6' },
    { id: 'out-idx', label: '输出下标', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '当前原项', color: '#3b82f6' },
    { label: '计数统计', color: '#eab308' },
    { label: '输出就位', color: '#22c55e' },
  ],
  codeLanguages: COUNTING_SORT_CODE_LANGUAGES,
  problemHtml: COUNTING_SORT_PROBLEM_HTML,
  analysisHtml: COUNTING_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(countingSortSteps(parseNumberList(String(inputs.array ?? '4, 2, 2, 8, 3, 3, 1'), []))),
  renderCanvas: (container, step) => renderCountingSortCanvas(container, step as CSStep),
});
