/**
 * 链表相交可视化器 — 声明式 4-Card 标准架构
 * 面试题 02.07 / LC 160：双指针浪漫换道相遇，巧妙消除长度差
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  INTERSECTION_LINKED_LIST_PROBLEM_HTML,
  INTERSECTION_LINKED_LIST_ANALYSIS_HTML,
  INTERSECTION_LINKED_LIST_CODE_LANGUAGES,
} from './intersection-linked-list-problem-content';
import {
  ILLStep,
  LIST_A_MEET,
  LIST_B_MEET,
  LIST_A_MISS,
  LIST_B_MISS,
  buildIntersectionSteps,
  withIntersectionLinkedListMetrics,
} from './intersection-linked-list-step-compiler';
import { renderIntersectionLinkedListCanvas } from './intersection-linked-list-canvas-adapter';

export type { ILLStep };
export {
  LIST_A_MEET,
  LIST_B_MEET,
  LIST_A_MISS,
  LIST_B_MISS,
  buildIntersectionSteps,
  withIntersectionLinkedListMetrics,
  renderIntersectionLinkedListCanvas,
};

export const intersectionLinkedListVisualizer = registerDeclarativeAlgorithm({
  id: 'intersection-linked-list',
  aliases: ['class036-code01', 'class008-code01', 'intersection-linked-list-036', 'intersection-of-two-linked-lists', 'leetcode-160', '160'],
  name: '链表相交',
  category: 'linked-list',
  description: '面试题 02.07 / LC 160 · 双指针浪漫换道相遇，巧妙消除长度差确定两链表交点',
  icon: '🤝',
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '透彻理解双指针换道算法数学原理 (a + c + b == b + c + a) 与链表相交判定技巧',
  hasDeductionTree: true,
  inputs: [
    {
      id: 'case',
      label: '测试用例',
      type: 'select',
      defaultValue: 'meet',
      options: [
        { label: '示例 1 (相交于 8)', value: 'meet' },
        { label: '示例 2 (不相交)', value: 'miss' },
      ],
    },
  ],
  presets: [
    { label: '示例 1 (相交于 8)', values: { case: 'meet' } },
    { label: '示例 2 (不相交)', values: { case: 'miss' } },
  ],
  metrics: [
    { id: 'pa', label: 'pA 指针', color: '#2563eb' },
    { id: 'pb', label: 'pB 指针', color: '#059669' },
    { id: 'meet', label: '相遇判定', color: '#ec4899' },
    { id: 'intersection', label: '相交交点', color: '#ec4899' },
    { id: 'action', label: '当前指令', color: '#9333ea' },
  ],
  legend: [
    { label: '📍 pA 指针 (A → B)', color: '#2563eb' },
    { label: '📍 pB 指针 (B → A)', color: '#059669' },
    { label: '💖 公共相交节点', color: '#ec4899' },
  ],
  codeLanguages: INTERSECTION_LINKED_LIST_CODE_LANGUAGES,
  problemHtml: INTERSECTION_LINKED_LIST_PROBLEM_HTML,
  analysisHtml: INTERSECTION_LINKED_LIST_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withIntersectionLinkedListMetrics(buildIntersectionSteps(String(inputs.case ?? 'meet') === 'meet')),
  renderCanvas: (container, step) => renderIntersectionLinkedListCanvas(container, step as ILLStep),
});
