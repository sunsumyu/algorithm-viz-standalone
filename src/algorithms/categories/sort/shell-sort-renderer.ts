/**
 * 希尔排序可视化器 — 声明式 4-Card 标准架构
 * 增量折半、跨步分组插入、逐步粗排到精排
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  SHELL_SORT_PROBLEM_HTML,
  SHELL_SORT_ANALYSIS_HTML,
  SHELL_SORT_CODE_LANGUAGES,
} from './shell-sort-problem-content';
import {
  ShellStep,
  shellSortSteps,
  withMetrics,
} from './shell-sort-step-compiler';
import { renderShellSortCanvas } from './shell-sort-canvas-adapter';

export type { ShellStep };
export { shellSortSteps, withMetrics, renderShellSortCanvas };

registerDeclarativeAlgorithm<ShellStep>({
  id: 'shell-sort',
  name: '希尔排序',
  category: 'sort',
  description: '逐步演示希尔排序：缩小增量 gap，跨步插入排序',
  icon: '🐚',
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '理解希尔排序的跨步插入和缩小增量过程',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '9, 8, 3, 7, 5, 6, 4, 1',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '9, 8, 3, 7, 5, 6, 4, 1' } },
    { label: '近有序', values: { array: '1, 3, 2, 5, 4, 7, 6' } },
    { label: '逆序最坏情形', values: { array: '10, 9, 8, 7, 6, 5, 4' } },
    { label: '含重复元素', values: { array: '5, 2, 5, 1, 2' } },
  ],
  metrics: [
    { id: 'gap', label: '当前增量 gap', color: '#2563eb' },
    { id: 'i', label: '当前索引 i', color: '#0f172a' },
    { id: 'key', label: '待插 key', color: '#eab308' },
    { id: 'comp-shift', label: '比较 / 后移', color: '#f59e0b' },
    { id: 'action', label: '增量策略', color: '#2563eb' },
  ],
  legend: [
    { label: '待插 key', color: '#eab308' },
    { label: 'gap跨度比对', color: '#3b82f6' },
    { label: 'gap后移搬移', color: '#ef4444' },
    { label: '最终就位', color: '#22c55e' },
  ],
  codeLanguages: SHELL_SORT_CODE_LANGUAGES,
  problemHtml: SHELL_SORT_PROBLEM_HTML,
  analysisHtml: SHELL_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(shellSortSteps(parseNumberList(String(inputs.array ?? '9, 8, 3, 7, 5, 6, 4, 1'), []))),
  renderCanvas: (container, step) => renderShellSortCanvas(container, step as ShellStep),
});
