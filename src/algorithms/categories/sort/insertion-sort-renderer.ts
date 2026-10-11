/**
 * 插入排序可视化器 — 声明式 4-Card 标准架构
 * 提取 key、向前逆序扫描、元素后移腾位、精准就位插入
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  INSERTION_SORT_PROBLEM_HTML,
  INSERTION_SORT_ANALYSIS_HTML,
  INSERTION_SORT_CODE_LANGUAGES,
} from './insertion-sort-problem-content';
import {
  ISStep,
  insertionSortSteps,
  withMetrics,
} from './insertion-sort-step-compiler';
import { renderInsertionSortCanvas } from './insertion-sort-canvas-adapter';

export type { ISStep };
export { insertionSortSteps, withMetrics, renderInsertionSortCanvas };

registerDeclarativeAlgorithm<ISStep>({
  id: 'insertion-sort',
  name: '插入排序',
  category: 'sort',
  description: '逐步演示插入排序：元素后移、插入到有序区合适位置',
  icon: '🃏',
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '理解插入排序的摸牌原理和后移腾位过程',
  inputs: [
    {
      id: 'array',
      label: '输入数组',
      type: 'text',
      defaultValue: '12, 11, 13, 5, 6',
      placeholder: '逗号分隔数字',
    },
  ],
  presets: [
    { label: '基础示例', values: { array: '12, 11, 13, 5, 6' } },
    { label: '近有序', values: { array: '2, 3, 5, 7, 4, 6' } },
    { label: '逆序最坏情形', values: { array: '9, 8, 7, 6, 5' } },
    { label: '含重复元素', values: { array: '3, 1, 3, 2, 1' } },
  ],
  metrics: [
    { id: 'i', label: '当前索引 i', color: '#2563eb' },
    { id: 'key', label: '待插 key', color: '#eab308' },
    { id: 'j', label: '扫描比较 j', color: '#3b82f6' },
    { id: 'shifts', label: '后移次数', color: '#f59e0b' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '待插 key', color: '#eab308' },
    { label: '扫描比较 j', color: '#3b82f6' },
    { label: '后移搬移', color: '#ef4444' },
    { label: '前缀有序', color: '#22c55e' },
  ],
  codeLanguages: INSERTION_SORT_CODE_LANGUAGES,
  problemHtml: INSERTION_SORT_PROBLEM_HTML,
  analysisHtml: INSERTION_SORT_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(insertionSortSteps(parseNumberList(String(inputs.array ?? '12, 11, 13, 5, 6'), []))),
  renderCanvas: (container, step) => renderInsertionSortCanvas(container, step as ISStep),
});
