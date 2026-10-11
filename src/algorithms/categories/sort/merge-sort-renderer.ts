/**
 * 归并排序可视化器 — 声明式 4-Card 标准架构
 * 递归分治、双指针归并、临时缓冲区与写回
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  MERGE_SORT_PROBLEM_HTML,
  MERGE_SORT_ANALYSIS_HTML,
  MERGE_SORT_CODE_LANGUAGES,
} from './merge-sort-problem-content';
import {
  MSStep,
  mergeSortSteps,
  withMetrics,
} from './merge-sort-step-compiler';
import { renderMergeSortCanvas } from './merge-sort-canvas-adapter';

export type { MSStep };
export { mergeSortSteps, withMetrics, renderMergeSortCanvas };

registerDeclarativeAlgorithm<MSStep>({
  id: 'merge-sort',
  name: '归并排序',
  category: 'sort',
  description: '逐步演示归并排序：递归分治、双指针合并',
  icon: '🧩',
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '掌握分治思想和双指针有序归并的过程',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '38, 27, 43, 3, 9, 82, 10',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '38, 27, 43, 3, 9, 82, 10' } },
    { label: '近有序', values: { array: '1, 3, 2, 5, 4, 7, 6' } },
    { label: '逆序最坏情形', values: { array: '9, 8, 7, 6, 5, 4, 3' } },
    { label: '含重复元素', values: { array: '5, 2, 5, 1, 2, 5' } },
  ],
  metrics: [
    { id: 'range', label: '分治区间 [L, M, R]', color: '#2563eb' },
    { id: 'p1', label: '左段指针 p1', color: '#3b82f6' },
    { id: 'p2', label: '右段指针 p2', color: '#a855f7' },
    { id: 'comp-copy', label: '比较 / 回填', color: '#f59e0b' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '左段 p1', color: '#3b82f6' },
    { label: '右段 p2', color: '#a855f7' },
    { label: '归并缓冲区', color: '#22c55e' },
  ],
  codeLanguages: MERGE_SORT_CODE_LANGUAGES,
  problemHtml: MERGE_SORT_PROBLEM_HTML,
  analysisHtml: MERGE_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(mergeSortSteps(parseNumberList(String(inputs.array ?? '38, 27, 43, 3, 9, 82, 10'), []))),
  renderCanvas: (container, step) => renderMergeSortCanvas(container, step as MSStep),
});
