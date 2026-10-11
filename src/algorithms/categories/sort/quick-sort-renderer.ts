/**
 * 快速排序可视化器 — 声明式 4-Card 标准架构
 * 递归分治、双指针 Partition、基准值精准归位
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  QUICK_SORT_PROBLEM_HTML,
  QUICK_SORT_ANALYSIS_HTML,
  QUICK_SORT_CODE_LANGUAGES,
} from './quick-sort-problem-content';
import {
  QSStep,
  quickSortSteps,
  withMetrics,
} from './quick-sort-step-compiler';
import { renderQuickSortCanvas } from './quick-sort-canvas-adapter';

export type { QSStep };
export { quickSortSteps, withMetrics, renderQuickSortCanvas };

registerDeclarativeAlgorithm<QSStep>({
  id: 'quick-sort',
  name: '快速排序',
  category: 'sort',
  description: '逐步演示快速排序：基准值选择、双向扫描划分、递归分治',
  icon: '⚡',
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '理解快速排序的基准划分、双指针碰撞和递归过程',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '6, 1, 2, 7, 9, 3, 4, 5, 10, 8',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '6, 1, 2, 7, 9, 3, 4, 5, 10, 8' } },
    { label: '近有序', values: { array: '1, 2, 3, 5, 4, 6, 7' } },
    { label: '逆序最坏情形', values: { array: '9, 8, 7, 6, 5, 4, 3, 2, 1' } },
    { label: '含重复元素', values: { array: '3, 1, 3, 2, 1, 3' } },
  ],
  metrics: [
    { id: 'range', label: '划分区间', color: '#2563eb' },
    { id: 'pivot', label: '基准 pivot', color: '#eab308' },
    { id: 'ij', label: '双指针 [i, j]', color: '#3b82f6' },
    { id: 'comp-swap', label: '比较 / 交换', color: '#f59e0b' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '基准 pivot', color: '#eab308' },
    { label: '左指针 i', color: '#3b82f6' },
    { label: '右指针 j', color: '#a855f7' },
    { label: '已就位', color: '#22c55e' },
  ],
  codeLanguages: QUICK_SORT_CODE_LANGUAGES,
  problemHtml: QUICK_SORT_PROBLEM_HTML,
  analysisHtml: QUICK_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(quickSortSteps(parseNumberList(String(inputs.array ?? '6, 1, 2, 7, 9, 3, 4, 5, 10, 8'), []))),
  renderCanvas: (container, step) => renderQuickSortCanvas(container, step as QSStep),
});
