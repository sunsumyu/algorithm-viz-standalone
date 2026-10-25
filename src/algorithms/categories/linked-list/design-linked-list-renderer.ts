/**
 * 设计链表可视化器（MyLinkedList）— 声明式 4-Card 标准架构
 * LeetCode 707：虚拟头节点单链表增删查改
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  DESIGN_LINKED_LIST_PROBLEM_HTML,
  DESIGN_LINKED_LIST_ANALYSIS_HTML,
  DESIGN_LINKED_LIST_CODE_LANGUAGES,
} from './design-linked-list-problem-content';
import {
  DLLStep,
  LinkedListModel,
  buildPresetSteps,
  withDesignLinkedListMetrics,
} from './design-linked-list-step-compiler';
import { renderDesignLinkedListCanvas } from './design-linked-list-canvas-adapter';

export type { DLLStep };
export { LinkedListModel, buildPresetSteps, withDesignLinkedListMetrics, renderDesignLinkedListCanvas };

registerDeclarativeAlgorithm({
  id: 'design-linked-list',
  aliases: ['707', 'leetcode-707', 'my-linked-list'],
  name: '设计链表',
  category: 'linked-list',
  description: 'LeetCode 707 · 使用虚拟头节点 (dummyHead) 实现单链表增删查改 (CRUD)',
  icon: '🛠️',
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '深入掌握虚拟头节点 (dummyHead) 统一链表头与中间操作的标准编程范式',
  hasDeductionTree: true,
  inputs: [],
  metrics: [
    { id: 'size', label: '链表长度 (size)', color: '#2563eb' },
    { id: 'head', label: '头节点值 (head)', color: '#059669' },
    { id: 'tail', label: '尾节点值 (tail)', color: '#059669' },
    { id: 'call', label: '当前调用方法', color: '#0f172a' },
    { id: 'index', label: '影响节点索引', color: '#2563eb' },
    { id: 'ret', label: '操作返回值', color: '#2563eb' },
  ],
  legend: [
    { label: 'dummyHead', color: '#f59e0b' },
    { label: '新增节点', color: '#059669' },
    { label: '删除目标', color: '#ef4444' },
    { label: '查询高亮', color: '#2563eb' },
  ],
  codeLanguages: DESIGN_LINKED_LIST_CODE_LANGUAGES,
  problemHtml: DESIGN_LINKED_LIST_PROBLEM_HTML,
  analysisHtml: DESIGN_LINKED_LIST_ANALYSIS_HTML,
  generateSteps: () => withDesignLinkedListMetrics(buildPresetSteps()),
  renderCanvas: (container, step) => renderDesignLinkedListCanvas(container, step as DLLStep),
});
