/**
 * 环形链表 II 可视化器 — 声明式 4-Card 标准架构
 * LeetCode 142：快慢指针判环 + 数学推导 (x = z) 定位入环口
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  LINKED_LIST_CYCLE_II_PROBLEM_HTML,
  LINKED_LIST_CYCLE_II_ANALYSIS_HTML,
  LINKED_LIST_CYCLE_II_CODE_LANGUAGES,
} from './linked-list-cycle-ii-problem-content';
import {
  CycleStep,
  buildCycleSteps,
  withLinkedListCycleIIMetrics,
} from './linked-list-cycle-ii-step-compiler';
import { renderLinkedListCycleIICanvas } from './linked-list-cycle-ii-canvas-adapter';

export type { CycleStep };
export { buildCycleSteps, withLinkedListCycleIIMetrics, renderLinkedListCycleIICanvas };

export const linkedListCycleIIVisualizer = registerDeclarativeAlgorithm({
  id: 'linked-list-cycle-ii',
  aliases: ['linked-list-cycle-ii-041', 'class041-code01', 'leetcode-142', '142', 'detect-cycle'],
  name: '环形链表 II',
  category: 'linked-list',
  description: 'LeetCode 142 · 快慢指针判断环形与相遇点，严谨数学推导 (x = z) 寻找入环口',
  icon: '🔄',
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '掌握 Floyd 判圈算法数学推导原理与快慢双指针协作技巧',
  hasDeductionTree: true,
  inputs: [
    {
      id: 'case',
      label: '测试用例',
      type: 'select',
      defaultValue: 'ex1',
      options: [
        { label: '[3,2,0,-4] pos=1 (入环点: 2)', value: 'ex1' },
        { label: '[1,2] pos=0 (入环点: 1)', value: 'ex2' },
        { label: '[1] pos=-1 (无环)', value: 'ex3' },
      ],
    },
  ],
  presets: [
    { label: '示例 1 (pos=1 入环点 2)', values: { case: 'ex1' } },
    { label: '示例 2 (pos=0 头部成环)', values: { case: 'ex2' } },
    { label: '示例 3 (无环)', values: { case: 'ex3' } },
  ],
  metrics: [
    { id: 'idx1', label: 'index1 / slow', color: '#059669' },
    { id: 'idx2', label: 'index2 / fast', color: '#2563eb' },
    { id: 'meet', label: '相遇判定', color: '#8b5cf6' },
    { id: 'entrance', label: '入环起始节点', color: '#ec4899' },
    { id: 'status', label: '判定状态', color: '#2563eb' },
    { id: 'phase', label: '当前算法阶段', color: '#2563eb' },
  ],
  legend: [
    { label: 'fast (2步)', color: '#2563eb' },
    { label: 'slow (1步)', color: '#059669' },
    { label: '环入口 (Entrance)', color: '#ec4899' },
  ],
  codeLanguages: LINKED_LIST_CYCLE_II_CODE_LANGUAGES,
  problemHtml: LINKED_LIST_CYCLE_II_PROBLEM_HTML,
  analysisHtml: LINKED_LIST_CYCLE_II_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const val = String(inputs.case ?? 'ex1');
    if (val === 'ex2') return withLinkedListCycleIIMetrics(buildCycleSteps([1, 2], 0));
    if (val === 'ex3') return withLinkedListCycleIIMetrics(buildCycleSteps([1], -1));
    return withLinkedListCycleIIMetrics(buildCycleSteps([3, 2, 0, -4], 1));
  },
  renderCanvas: (container, step) => renderLinkedListCycleIICanvas(container, step as CycleStep),
});
