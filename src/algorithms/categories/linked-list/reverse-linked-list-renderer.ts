/**
 * 反转链表可视化器 — 声明式 4-Card 标准架构
 * LeetCode 206：双指针迭代，暂存 next 后继，原地反转指针指向
 */

import { parseNumberList } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  REVERSE_LINKED_LIST_PROBLEM_HTML,
  REVERSE_LINKED_LIST_ANALYSIS_HTML,
  REVERSE_LINKED_LIST_CODE_LANGUAGES,
} from './reverse-linked-list-problem-content';
import {
  RLStep,
  buildReverseSteps,
  withReverseLinkedListMetrics,
} from './reverse-linked-list-step-compiler';
import { renderReverseLinkedListCanvas } from './reverse-linked-list-canvas-adapter';

export type { RLStep };
export {
  buildReverseSteps,
  withReverseLinkedListMetrics,
  renderReverseLinkedListCanvas,
};

export const reverseLinkedListVisualizer = registerDeclarativeAlgorithm({
  id: 'reverse-linked-list',
  aliases: ['class034-code01', 'reverse-linked-list-034', 'leetcode-206'],
  name: '反转链表',
  category: 'linked-list',
  description: 'LeetCode 206 · 双指针迭代原地修改指针指向，暂存 next 节点防止链表断裂',
  icon: '🔗',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '透彻掌握单链表双指针迭代与原地指针反转技巧，理解暂存 next 防止断链的本质',
  inputs: [
    {
      id: 'list',
      label: 'head',
      type: 'text',
      defaultValue: '1,2,3,4,5',
      placeholder: '1,2,3,4,5',
    },
  ],
  presets: [
    { label: '示例 1 (1..5)', values: { list: '1,2,3,4,5' } },
    { label: '示例 2 (两节点)', values: { list: '1,2' } },
    { label: '三节点', values: { list: '10,20,30' } },
  ],
  metrics: [
    { id: 'pre', label: 'pre 指针 (前驱)', color: '#fbbf24' },
    { id: 'cur', label: 'cur 指针 (当前)', color: '#2563eb' },
    { id: 'next', label: 'next 暂存 (后继)', color: '#9333ea' },
    { id: 'reversed', label: '已反转节点', color: '#10b981' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: 'pre 前驱', color: '#fbbf24' },
    { label: 'cur 当前', color: '#2563eb' },
    { label: 'next 暂存', color: '#9333ea' },
    { label: '反转边', color: '#10b981' },
  ],
  codeLanguages: REVERSE_LINKED_LIST_CODE_LANGUAGES,
  problemHtml: REVERSE_LINKED_LIST_PROBLEM_HTML,
  analysisHtml: REVERSE_LINKED_LIST_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withReverseLinkedListMetrics(buildReverseSteps(parseNumberList(String(inputs.list ?? '1,2,3,4,5'), [1, 2, 3, 4, 5]))),
  renderCanvas: (container, step) => renderReverseLinkedListCanvas(container, step as RLStep),
});
