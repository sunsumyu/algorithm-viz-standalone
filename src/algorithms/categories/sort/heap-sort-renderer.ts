/**
 * 堆排序可视化器 — 声明式 4-Card 标准架构
 * 大顶堆构建、堆顶元素提取、Sift-Down 下沉调整
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  HEAP_SORT_PROBLEM_HTML,
  HEAP_SORT_ANALYSIS_HTML,
  HEAP_SORT_CODE_LANGUAGES,
} from './heap-sort-problem-content';
import {
  HSStep,
  heapSortSteps,
  withMetrics,
} from './heap-sort-step-compiler';
import { renderHeapSortCanvas } from './heap-sort-canvas-adapter';

export type { HSStep };
export { heapSortSteps, withMetrics, renderHeapSortCanvas };

registerDeclarativeAlgorithm<HSStep>({
  id: 'heap-sort',
  name: '堆排序',
  category: 'sort',
  description: '逐步演示堆排序：构建大顶堆、交换堆顶并下沉调整',
  icon: '🌲',
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握大顶堆的构建过程与堆顶元素的下沉调整',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '4, 10, 3, 5, 1',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '4, 10, 3, 5, 1' } },
    { label: '近有序', values: { array: '1, 2, 4, 3, 5' } },
    { label: '逆序最坏情形', values: { array: '9, 8, 7, 6, 5' } },
    { label: '含重复元素', values: { array: '3, 1, 3, 1, 2' } },
  ],
  metrics: [
    { id: 'heap-size', label: '堆容量', color: '#2563eb' },
    { id: 'root', label: '根节点 root', color: '#eab308' },
    { id: 'largest', label: '最大候选 largest', color: '#3b82f6' },
    { id: 'comp-swap', label: '比较 / 交换', color: '#f59e0b' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '根节点 root', color: '#eab308' },
    { label: '较大子节点', color: '#3b82f6' },
    { label: '下沉交换', color: '#ef4444' },
    { label: '末尾已就位', color: '#22c55e' },
  ],
  codeLanguages: HEAP_SORT_CODE_LANGUAGES,
  problemHtml: HEAP_SORT_PROBLEM_HTML,
  analysisHtml: HEAP_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(heapSortSteps(parseNumberList(String(inputs.array ?? '4, 10, 3, 5, 1'), []))),
  renderCanvas: (container, step) => renderHeapSortCanvas(container, step as HSStep),
});
