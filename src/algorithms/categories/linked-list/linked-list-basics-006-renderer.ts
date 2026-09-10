/**
 * Class 006: 单双链表基本操作与队列栈实现 (Linked List Basics)
 * 左程云算法通关课入门篇 Class 006
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface NodeView {
  id: number;
  val: number;
  prev?: number;
  next?: number;
  isHead?: boolean;
  isTail?: boolean;
  isCur?: boolean;
  isDeleted?: boolean;
}

export interface LinkedList006Step extends StepBase {
  nodes: NodeView[];
  mode: 'reverse' | 'deleteVal' | 'doubleQueue';
  headId: number;
  targetVal?: number;
  preId?: number;
  curId?: number;
  nextId?: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const LINKED_LIST_006_CODES = {
  java: `public class LinkedListBasics {
    // 1. 单链表反转
    public static ListNode reverseList(ListNode head) {
        ListNode pre = null;
        ListNode cur = head;
        while (cur != null) {
            ListNode next = cur.next;
            cur.next = pre;
            pre = cur;
            cur = next;
        }
        return pre;
    }
    // 2. 删除指定值的节点
    public static ListNode removeValue(ListNode head, int num) {
        while (head != null && head.val == num) {
            head = head.next;
        }
        ListNode cur = head;
        while (cur != null && cur.next != null) {
            if (cur.next.val == num) {
                cur.next = cur.next.next;
            } else {
                cur = cur.next;
            }
        }
        return head;
    }
    // 3. 双向链表实现队列
    static class DoubleNode { int val; DoubleNode prev, next; DoubleNode(int v){val=v;} }
    static class DoubleQueue {
        DoubleNode head, tail;
        void push(int v) {
            DoubleNode node = new DoubleNode(v);
            if (head == null) { head = tail = node; }
            else { tail.next = node; node.prev = tail; tail = node; }
        }
        int pop() {
            int ans = head.val;
            head = head.next;
            if (head != null) head.prev = null; else tail = null;
            return ans;
        }
    }
}`,
  cpp: `struct ListNode { int val; ListNode* next; };
ListNode* reverseList(ListNode* head) {
    ListNode *pre = nullptr, *cur = head;
    while (cur) {
        ListNode *nxt = cur->next;
        cur->next = pre;
        pre = cur;
        cur = nxt;
    }
    return pre;
}
ListNode* removeValue(ListNode* head, int num) {
    while (head && head->val == num) head = head->next;
    ListNode *cur = head;
    while (cur && cur->next) {
        if (cur->next->val == num) cur->next = cur->next->next;
        else cur = cur->next;
    }
    return head;
}`,
  python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    pre, cur = None, head
    while cur:
        nxt = cur.next
        cur.next = pre
        pre = cur
        cur = nxt
    return pre

def remove_value(head, num):
    while head and head.val == num:
        head = head.next
    cur = head
    while cur and cur.next:
        if cur.next.val == num:
            cur.next = cur.next.next
        else:
            cur = cur.next
    return head`,
  typescript: `class ListNode {
  val: number;
  next: ListNode | null = null;
  constructor(val: number) { this.val = val; }
}

export function reverseList(head: ListNode | null): ListNode | null {
  let pre: ListNode | null = null;
  let cur: ListNode | null = head;
  while (cur !== null) {
    const next: ListNode | null = cur.next;
    cur.next = pre;
    pre = cur;
    cur = next;
  }
  return pre;
}

export function removeValue(head: ListNode | null, num: number): ListNode | null {
  while (head !== null && head.val === num) {
    head = head.next;
  }
  let cur: ListNode | null = head;
  while (cur !== null && cur.next !== null) {
    if (cur.next.val === num) {
      cur.next = cur.next.next;
    } else {
      cur = cur.next;
    }
  }
  return head;
}`
};

export function buildLinkedList006Steps(
  values: number[] = [1, 2, 3, 2, 4],
  mode: 'reverse' | 'deleteVal' = 'reverse',
  targetVal: number = 2
): LinkedList006Step[] {
  const steps: LinkedList006Step[] = [];

  if (mode === 'reverse') {
    // 1. 初始化
    const rawNodes = values.map((v, i) => ({
      id: i + 1,
      val: v,
      next: i < values.length - 1 ? i + 2 : -1,
      prev: -1,
    }));

    steps.push({
      nodes: rawNodes.map(n => ({ ...n, isHead: n.id === 1 })),
      mode: 'reverse',
      headId: 1,
      preId: -1,
      curId: 1,
      nextId: rawNodes[0]?.next ?? -1,
      decision: '初始化单链表，准备反转',
      message: `单链表初始序列为 [${values.join(' -> ')}]。pre 指针指向 null，cur 指向首节点 #1。`,
      log: 'Init reverseList: pre=null, cur=head',
      codeLine: 4,
      statusBadge: { text: '就绪', type: 'info' }
    });

    let pre = -1;
    let cur = 1;
    const currentList = rawNodes.map(n => ({ ...n }));

    while (cur !== -1) {
      const node = currentList.find(n => n.id === cur)!;
      const nxt = node.next;

      steps.push({
        nodes: currentList.map(n => ({
          ...n,
          isCur: n.id === cur,
        })),
        mode: 'reverse',
        headId: cur,
        preId: pre,
        curId: cur,
        nextId: nxt,
        decision: `暂存 next 指针 #${nxt >= 0 ? nxt : 'null'}，斩断原连接`,
        message: `在更改 cur.next 前，必须先缓存 next = cur.next (#${nxt >= 0 ? nxt : 'null'}) 防止后序链表丢失。`,
        log: `next = cur.next (#${nxt})`,
        codeLine: 8,
        statusBadge: { text: '保存 next', type: 'info' }
      });

      // 反转指针
      node.next = pre;

      steps.push({
        nodes: currentList.map(n => ({
          ...n,
          isCur: n.id === cur,
        })),
        mode: 'reverse',
        headId: cur,
        preId: pre,
        curId: cur,
        nextId: nxt,
        decision: `指向反转：节点 #${cur}(${node.val}) 的 next 指向 pre(#${pre >= 0 ? pre : 'null'})`,
        message: `将 cur.next 指向 pre，实现局部逆向连接。`,
        log: `cur.next = pre (#${pre})`,
        codeLine: 9,
        statusBadge: { text: '指针调头', type: 'warning' }
      });

      pre = cur;
      cur = nxt;

      steps.push({
        nodes: currentList.map(n => ({
          ...n,
          isHead: n.id === pre,
        })),
        mode: 'reverse',
        headId: pre,
        preId: pre,
        curId: cur,
        nextId: -1,
        decision: `双指针整体右移：pre 移至 #${pre}，cur 移至 #${cur >= 0 ? cur : 'null'}`,
        message: `准备进行下一个节点的翻转。`,
        log: `pre=cur, cur=next`,
        codeLine: 11,
        statusBadge: { text: '指针推进', type: 'info' }
      });
    }

    steps.push({
      nodes: currentList.map(n => ({ ...n, isHead: n.id === pre })),
      mode: 'reverse',
      headId: pre,
      preId: pre,
      curId: -1,
      decision: `单链表反转彻底完成！全新头节点为 #${pre}`,
      message: `遍历完毕，当前 pre 即为全新头指针，反转成功！`,
      log: `Finished reverseList. newHead = #${pre}`,
      codeLine: 13,
      statusBadge: { text: '反转完成', type: 'success' }
    });
  } else {
    // 2. 删除指定元素
    const currentList = values.map((v, i) => ({
      id: i + 1,
      val: v,
      next: i < values.length - 1 ? i + 2 : -1,
      prev: -1,
      isDeleted: false,
    }));

    steps.push({
      nodes: currentList.map(n => ({ ...n })),
      mode: 'deleteVal',
      headId: 1,
      targetVal,
      curId: 1,
      decision: `准备删除链表中所有值为 ${targetVal} 的节点`,
      message: `初始链表 [${values.join(' -> ')}]，目标消除所有 val == ${targetVal}。`,
      log: `removeValue(target=${targetVal})`,
      codeLine: 16,
      statusBadge: { text: '开始删除', type: 'info' }
    });

    let head = 1;
    while (head !== -1) {
      const hNode = currentList.find(n => n.id === head);
      if (hNode && hNode.val === targetVal) {
        hNode.isDeleted = true;
        head = hNode.next;
        steps.push({
          nodes: currentList.map(n => ({ ...n, isHead: n.id === head })),
          mode: 'deleteVal',
          headId: head,
          targetVal,
          curId: head,
          decision: `头节点 #${hNode.id}(${hNode.val}) 命中目标值，头指针后移至 #${head}`,
          message: `若头部节点即为待删值，直接移动 head 指针实现 O(1) 剥离。`,
          log: `head = head.next (#${head})`,
          codeLine: 18,
          statusBadge: { text: '跳过头节点', type: 'danger' }
        });
      } else {
        break;
      }
    }

    let cur = head;
    while (cur !== -1) {
      const curNode = currentList.find(n => n.id === cur);
      if (!curNode || curNode.next === -1) break;

      const nxtNode = currentList.find(n => n.id === curNode.next);
      if (nxtNode && nxtNode.val === targetVal) {
        nxtNode.isDeleted = true;
        curNode.next = nxtNode.next;
        steps.push({
          nodes: currentList.map(n => ({ ...n, isHead: n.id === head, isCur: n.id === cur })),
          mode: 'deleteVal',
          headId: head,
          targetVal,
          curId: cur,
          nextId: nxtNode.id,
          decision: `发现下个节点 #${nxtNode.id}(${nxtNode.val}) 匹配目标，跨过该节点`,
          message: `修改 cur.next = cur.next.next，将节点 #${nxtNode.id} 移出链路。`,
          log: `cur.next = cur.next.next (skip #${nxtNode.id})`,
          codeLine: 23,
          statusBadge: { text: '删除中间节点', type: 'danger' }
        });
      } else {
        cur = curNode.next;
        steps.push({
          nodes: currentList.map(n => ({ ...n, isHead: n.id === head, isCur: n.id === cur })),
          mode: 'deleteVal',
          headId: head,
          targetVal,
          curId: cur,
          decision: `节点 #${curNode.id} 值不匹配，cur 指针前进至 #${cur}`,
          message: `保留当前节点，向后继续扫描。`,
          log: `cur = cur.next (#${cur})`,
          codeLine: 25,
          statusBadge: { text: '扫描前进', type: 'info' }
        });
      }
    }

    steps.push({
      nodes: currentList.map(n => ({ ...n, isHead: n.id === head })),
      mode: 'deleteVal',
      headId: head,
      targetVal,
      curId: -1,
      decision: `删除完毕！保留下来的节点构成新链表`,
      message: `全链表扫描完毕，所有 val == ${targetVal} 的节点均已成功剥离。`,
      log: 'Finished removeValue',
      codeLine: 28,
      statusBadge: { text: '删除完成', type: 'success' }
    });
  }

  return steps;
}

export function renderLinkedListSandbox(step: LinkedList006Step): string {
  const visibleNodes = step.nodes.filter(n => !n.isDeleted);
  const nodesHtml = visibleNodes.map(n => {
    const isCur = n.id === step.curId;
    const isHead = n.id === step.headId;
    const isPre = n.id === step.preId;

    let border = '1px solid #e2e8f0';
    let bg = '#ffffff';
    let badgeText = '';

    if (isHead) {
      border = '2px solid #22c55e';
      badgeText += '<span style="background:#dcfce7; color:#15803d; font-size:10px; padding:1px 4px; border-radius:3px; margin-right:3px;">HEAD</span>';
    }
    if (isCur) {
      border = '2px solid #3b82f6';
      badgeText += '<span style="background:#dbeafe; color:#1d4ed8; font-size:10px; padding:1px 4px; border-radius:3px;">CUR</span>';
    }
    if (isPre) {
      badgeText += '<span style="background:#fef3c7; color:#b45309; font-size:10px; padding:1px 4px; border-radius:3px;">PRE</span>';
    }

    return `
      <div style="display:inline-flex; align-items:center;">
        <div style="background:${bg}; border:${border}; border-radius:8px; padding:8px 12px; min-width:60px; text-align:center; box-shadow:0 1px 2px rgba(0,0,0,0.04);">
          <div style="font-size:11px; color:#64748b; margin-bottom:2px;">#${n.id}</div>
          <div style="font-size:16px; font-weight:800; color:#0f172a;">${n.val}</div>
          <div style="margin-top:4px;">${badgeText}</div>
        </div>
        ${n.next !== -1 ? '<span style="font-size:16px; color:#94a3b8; margin:0 8px; font-weight:700;">➔</span>' : '<span style="font-size:12px; color:#94a3b8; margin:0 8px;">➔ null</span>'}
      </div>
    `;
  }).join('');

  return `
    <div style="display:flex; flex-direction:column; gap:12px; font-family:inherit;">
      <!-- 链表物理拓扑看板 -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px;">
        <div style="font-size:12px; font-weight:700; color:#0f172a; margin-bottom:12px;">
          🔗 链表当前拓扑结构 (${step.mode === 'reverse' ? '单链表反转模式' : '删除指定值模式'})
        </div>
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:4px; padding:8px 0;">
          ${nodesHtml || '<div style="color:#94a3b8; font-style:italic;">链表已为空 (null)</div>'}
        </div>
      </div>

      <!-- 指针跟踪看板 -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">前驱 Pre</div>
          <div style="font-size:15px; font-weight:800; color:#d97706;">${step.preId && step.preId >= 0 ? `#${step.preId}` : 'null'}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">当前游标 Cur</div>
          <div style="font-size:16px; font-weight:800; color:#2563eb;">${step.curId && step.curId >= 0 ? `#${step.curId}` : 'null'}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">暂存 Next</div>
          <div style="font-size:15px; font-weight:800; color:#15803d;">${step.nextId && step.nextId >= 0 ? `#${step.nextId}` : 'null'}</div>
        </div>
      </div>

      ${renderFormulaCard(
        '链表指针操作铁律',
        '在修改 cur.next 前必须先抓取 next = cur.next，防止链表断开失联；反转时每步调头 cur.next = pre；双指针同步推进',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const linkedListBasicsVisualizer = registerDeclarativeAlgorithm<LinkedList006Step>({
  id: 'linked-list-basics-006',
  name: '单双链表基本功与栈队列实现 (Class 006)',
  category: 'linked-list',
  icon: '🔗',
  difficulty: 1,
  levelOrder: 6,
  learningGoal: '掌握单双链表就地反转、删除指定节点与双向链表构建 FIFO 队列与 LIFO 栈',
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
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderLinkedListSandbox(step)}
      </div>
    `;
  },
});
