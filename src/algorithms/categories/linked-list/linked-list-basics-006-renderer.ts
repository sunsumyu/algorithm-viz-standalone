/**
 * Class 006: 单双链表基本操作与队列栈实现 (Linked List Basics)
 * 左程云算法通关课入门篇 Class 006
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  NodeView,
  LinkedList006Step,
  LINKED_LIST_006_CODES,
  REVERSE_LINES,
  DELETE_LINES,
  buildLinkedList006Steps,
} from './linked-list-basics-006-step-compiler';
import {
  renderLinkedListSandbox,
  renderLinkedListBasicsCanvas,
} from './linked-list-basics-006-canvas-adapter';

export type { NodeView, LinkedList006Step };
export {
  LINKED_LIST_006_CODES,
  REVERSE_LINES,
  DELETE_LINES,
  buildLinkedList006Steps,
  renderLinkedListSandbox,
  renderLinkedListBasicsCanvas,
};

export const linkedListBasicsVisualizer = registerDeclarativeAlgorithm<LinkedList006Step>({
  id: 'linked-list-basics-006',
  name: '单双链表基本功与栈队列实现 (Class 006)',
  category: 'linked-list',
  icon: '🔗',
  difficulty: 1,
  levelOrder: 6,
  aliases: ['class006-code01', 'class006-code02', 'linked-list-basics-006', 'linked-list-basics'],
  learningGoal: '掌握单双链表就地反转、删除指定节点与双向链表构建 FIFO 队列与 LIFO 栈',
  hasDeductionTree: true,
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程内容 (Class 006)</h3>
      <p>链表是数据结构的最核心地基之一。本节涵盖三大经典基本功：</p>
      <ol>
        <li><strong>单链表与双向链表反转</strong>：不使用额外空间，通过三指针法就地反转连接方向。</li>
        <li><strong>删除指定值节点</strong>：处理头部连续待删节点与中间节点剥离。</li>
        <li><strong>双向链表实现队列和栈</strong>：维护 head 与 tail 双指针，实现 O(1) 常数时间进出。</li>
      </ol>
    </div>
  `,
  codeLanguages: LINKED_LIST_006_CODES,
  inputs: [
    {
      id: 'mode',
      label: '演示操作模式',
      type: 'select',
      defaultValue: 'reverse',
      options: [
        { label: '单链表就地反转 (Reverse)', value: 'reverse' },
        { label: '删除指定节点值 (Delete Val)', value: 'deleteVal' },
      ],
    },
  ],
  generateSteps: (input) => {
    const mode = input.mode === 'deleteVal' ? 'deleteVal' : 'reverse';
    return buildLinkedList006Steps([1, 2, 3, 2, 4], mode, 2);
  },
  renderCanvas: (container, step) => {
    renderLinkedListBasicsCanvas(container, step);
  },
});
