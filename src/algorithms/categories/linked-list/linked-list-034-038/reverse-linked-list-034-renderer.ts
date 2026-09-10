/**
 * Class 034: 单双链表反转 (Reverse Linked List)
 * 双指针/三指针滑动反转指针指向 / LeetCode 206
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { LINKED_LIST_034_038_PROBLEMS } from './linked-list-034-038-problem-content';
import { REVERSE_LINKED_LIST_034_CODES, REVERSE_LINKED_LIST_034_LINES } from './linked-list-034-038-stage-codes';
import { LinkedList034Step, renderReverseListBoard } from './linked-list-034-038-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface ReverseLinkedList034Step extends LinkedList034Step {
  nodes: { val: number; next: number | null }[];
  pre: number | null;
  cur: number | null;
  nxt: number | null;
  stage: string;
}

export function buildReverseLinkedList034Steps(): ReverseLinkedList034Step[] {
  const steps: ReverseLinkedList034Step[] = [];
  const lines = REVERSE_LINKED_LIST_034_LINES;

  const initialNodes = [
    { val: 1, next: 2 },
    { val: 2, next: 3 },
    { val: 3, next: null },
  ];

  // Step 0: 入口帧
  steps.push({
    nodes: initialNodes,
    pre: null,
    cur: 1,
    nxt: null,
    stage: '函数入口初始化',
    decision: `主函数入口：开始反转单链表 1 -> 2 -> 3`,
    message: `初始化前驱指针 pre = null，当前指针 cur 指向链表头节点 1`,
    log: `enter reverseList: head = 1`,
    codeLine: lines.entry,
    metrics: { '原链表头': 1, '链表长度': 3 },
  });

  // Step 1: 反转节点 1
  steps.push({
    nodes: initialNodes,
    pre: null,
    cur: 1,
    nxt: 2,
    stage: '暂存后继 next=2',
    decision: `处理节点 1：暂存其后继指针 next = 1.next (节点 2)`,
    message: `暂存防止修改指向后链表丢失`,
    log: `saved next node: 2`,
    codeLine: lines.saveNext,
    statusBadge: { text: '后继锁定', type: 'info' },
    metrics: { '当前处理': 1, '后继': 2 },
  });

  steps.push({
    nodes: [
      { val: 1, next: null },
      { val: 2, next: 3 },
      { val: 3, next: null },
    ],
    pre: 1,
    cur: 2,
    nxt: 3,
    stage: '反转节点 1 指向并前移',
    decision: `1.next = pre (null)；反转完成，指针同步步进：pre=1, cur=2`,
    message: `节点 1 现在成为反转链表的末尾`,
    log: `node 1 reversed to null: pre=1, cur=2`,
    codeLine: lines.reverseEdge,
    statusBadge: { text: '节点 1 反转完成', type: 'success' },
    metrics: { '已反转': '1->null', '新前驱': 1 },
  });

  // Step 2: 反转节点 2
  steps.push({
    nodes: [
      { val: 2, next: 1 },
      { val: 1, next: null },
      { val: 3, next: null },
    ],
    pre: 2,
    cur: 3,
    nxt: null,
    stage: '反转节点 2 指向并前移',
    decision: `2.next = pre (1)；节点 2 反向指向 1，步进 pre=2, cur=3`,
    message: `链表已反转部分扩展为 2 -> 1 -> null`,
    log: `node 2 reversed to 1: pre=2, cur=3`,
    codeLine: lines.reverseEdge,
    statusBadge: { text: '节点 2 反转完成', type: 'success' },
    metrics: { '已反转': '2->1->null', '新前驱': 2 },
  });

  // Step 3: 反转节点 3
  steps.push({
    nodes: [
      { val: 3, next: 2 },
      { val: 2, next: 1 },
      { val: 1, next: null },
    ],
    pre: 3,
    cur: null,
    nxt: null,
    stage: '反转节点 3 指向并结束循环',
    decision: `3.next = pre (2)；head 推进至 null，遍历终结`,
    message: `整个链表反转完毕，新头节点为 pre=3`,
    log: `node 3 reversed to 2: head reached null`,
    codeLine: lines.returnHead,
    statusBadge: { text: '全部反转达成', type: 'success' },
    metrics: { '新链表头': 3, '最终链表': '3->2->1->null' },
  });

  return steps;
}

export const reverseLinkedList034Visualizer = registerDeclarativeAlgorithm<ReverseLinkedList034Step>({
  id: 'reverse-linked-list-034',
  name: '单双链表反转 (Class 034)',
  category: 'linked-list',
  difficulty: 'easy',
  problemContent: LINKED_LIST_034_038_PROBLEMS.reverseLinkedList034,
  sourceCodes: REVERSE_LINKED_LIST_034_CODES,
  generateSteps: buildReverseLinkedList034Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderReverseListBoard(
          step.nodes,
          step.pre,
          step.cur,
          step.nxt,
          step.stage
        )}
        ${renderFormulaCard(
          '单链表反转复杂度定理',
          'T(N) = O(N), \\quad S(N) = O(1)',
          '仅需常量个辅助指针 (pre, cur, next)，无需申请任何额外节点空间，线性扫描一次即可完成反转。'
        )}
      </div>
    `;
  },
});
