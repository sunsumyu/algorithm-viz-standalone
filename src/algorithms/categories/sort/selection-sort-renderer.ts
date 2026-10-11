/**
 * 选择排序可视化器 — 声明式 4-Card 标准架构
 * 极值扫描、最小值锁定、原地单次交换、前缀有序扩展
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  SELECTION_SORT_PROBLEM_HTML,
  SELECTION_SORT_ANALYSIS_HTML,
  SELECTION_SORT_CODE_LANGUAGES,
} from './selection-sort-problem-content';
import {
  SSStep,
  selectionSortSteps,
  withMetrics,
} from './selection-sort-step-compiler';
import { renderSelectionSortCanvas } from './selection-sort-canvas-adapter';

export type { SSStep };
export { selectionSortSteps, withMetrics, renderSelectionSortCanvas };

registerDeclarativeAlgorithm<SSStep>({
  id: 'selection-sort',
  name: '选择排序',
  category: 'sort',
  description: '逐步演示选择排序：未排序区间选出最小值并交换',
  icon: '🎯',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握选择排序的最小值选取和交换机制',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '29, 10, 14, 37, 13',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '29, 10, 14, 37, 13' } },
    { label: '近有序', values: { array: '2, 4, 6, 8, 1, 3' } },
    { label: '逆序最坏情形', values: { array: '9, 8, 7, 6, 5, 4, 3' } },
    { label: '含重复元素', values: { array: '5, 3, 5, 1, 3, 5' } },
  ],
  metrics: [
    { id: 'i', label: '归位目标索引 i', color: '#2563eb' },
    { id: 'min-idx', label: '当前最小值 minIdx', color: '#eab308' },
    { id: 'j', label: '扫描指针 j', color: '#38bdf8' },
    { id: 'comp-swap', label: '比较 / 交换', color: '#f59e0b' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '目标位 i', color: '#2563eb' },
    { label: '最小值 min', color: '#eab308' },
    { label: '扫描中 j', color: '#38bdf8' },
    { label: '前缀已就位', color: '#22c55e' },
  ],
  codeLanguages: SELECTION_SORT_CODE_LANGUAGES,
  problemHtml: SELECTION_SORT_PROBLEM_HTML,
  analysisHtml: SELECTION_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(selectionSortSteps(parseNumberList(String(inputs.array ?? '29, 10, 14, 37, 13'), []))),
  renderCanvas: (container, step) => renderSelectionSortCanvas(container, step as SSStep),
});
