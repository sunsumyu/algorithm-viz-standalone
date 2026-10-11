/**
 * 单双链表基本功与栈队列实现 — 步进推演编译器
 * 左程云算法通关课入门篇 Class 006
 */

import { StepBase } from '../../../core/step-visualizer';

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
  codeLine?: number | Record<string, number>;
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
}`,
};

export const REVERSE_LINES: Record<string, Record<string, number>> = {
  init: { java: 4, cpp: 3, python: 8, typescript: 9, javascript: 9 },
  cacheNext: { java: 8, cpp: 5, python: 10, typescript: 11, javascript: 11 },
  reverseLink: { java: 9, cpp: 6, python: 11, typescript: 12, javascript: 12 },
  advance: { java: 11, cpp: 8, python: 13, typescript: 14, javascript: 14 },
  done: { java: 13, cpp: 10, python: 14, typescript: 16, javascript: 16 },
};

export const DELETE_LINES: Record<string, Record<string, number>> = {
  init: { java: 16, cpp: 12, python: 16, typescript: 19, javascript: 19 },
  skipHead: { java: 18, cpp: 13, python: 18, typescript: 21, javascript: 21 },
  skipNode: { java: 23, cpp: 16, python: 22, typescript: 26, javascript: 26 },
  advance: { java: 25, cpp: 17, python: 24, typescript: 28, javascript: 28 },
  done: { java: 28, cpp: 19, python: 24, typescript: 31, javascript: 31 },
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
      nodes: rawNodes.map((n) => ({ ...n, isHead: n.id === 1 })),
      mode: 'reverse',
      headId: 1,
      preId: -1,
      curId: 1,
      nextId: rawNodes[0]?.next ?? -1,
      decision: '初始化单链表，准备反转',
      message: `单链表初始序列为 [${values.join(' -> ')}]。pre 指针指向 null，cur 指向首节点 #1。`,
      log: 'Init reverseList: pre=null, cur=head',
      codeLine: REVERSE_LINES.init,
      statusBadge: { text: '就绪', type: 'info' },
    });

    let pre = -1;
    let cur = 1;
    const currentList = rawNodes.map((n) => ({ ...n }));

    while (cur !== -1) {
      const node = currentList.find((n) => n.id === cur)!;
      const nxt = node.next;

      steps.push({
        nodes: currentList.map((n) => ({
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
        codeLine: REVERSE_LINES.cacheNext,
        statusBadge: { text: '保存 next', type: 'info' },
      });

      // 反转指针
      node.next = pre;

      steps.push({
        nodes: currentList.map((n) => ({
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
        codeLine: REVERSE_LINES.reverseLink,
        statusBadge: { text: '指针调头', type: 'warning' },
      });

      pre = cur;
      cur = nxt;

      steps.push({
        nodes: currentList.map((n) => ({
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
        codeLine: REVERSE_LINES.advance,
        statusBadge: { text: '指针推进', type: 'info' },
      });
    }

    steps.push({
      nodes: currentList.map((n) => ({ ...n, isHead: n.id === pre })),
      mode: 'reverse',
      headId: pre,
      preId: pre,
      curId: -1,
      decision: `单链表反转彻底完成！全新头节点为 #${pre}`,
      message: `遍历完毕，当前 pre 即为全新头指针，反转成功！`,
      log: `Finished reverseList. newHead = #${pre}`,
      codeLine: REVERSE_LINES.done,
      statusBadge: { text: '反转完成', type: 'success' },
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
      nodes: currentList.map((n) => ({ ...n })),
      mode: 'deleteVal',
      headId: 1,
      targetVal,
      curId: 1,
      decision: `准备删除链表中所有值为 ${targetVal} 的节点`,
      message: `初始链表 [${values.join(' -> ')}]，目标消除所有 val == ${targetVal}。`,
      log: `removeValue(target=${targetVal})`,
      codeLine: DELETE_LINES.init,
      statusBadge: { text: '开始删除', type: 'info' },
    });

    let head = 1;
    while (head !== -1) {
      const hNode = currentList.find((n) => n.id === head);
      if (hNode && hNode.val === targetVal) {
        hNode.isDeleted = true;
        head = hNode.next;
        steps.push({
          nodes: currentList.map((n) => ({ ...n, isHead: n.id === head })),
          mode: 'deleteVal',
          headId: head,
          targetVal,
          curId: head,
          decision: `头节点 #${hNode.id}(${hNode.val}) 命中目标值，头指针后移至 #${head}`,
          message: `若头部节点即为待删值，直接移动 head 指针实现 O(1) 剥离。`,
          log: `head = head.next (#${head})`,
          codeLine: DELETE_LINES.skipHead,
          statusBadge: { text: '跳过头节点', type: 'danger' },
        });
      } else {
        break;
      }
    }

    let cur = head;
    while (cur !== -1) {
      const curNode = currentList.find((n) => n.id === cur);
      if (!curNode || curNode.next === -1) break;

      const nxtNode = currentList.find((n) => n.id === curNode.next);
      if (nxtNode && nxtNode.val === targetVal) {
        nxtNode.isDeleted = true;
        curNode.next = nxtNode.next;
        steps.push({
          nodes: currentList.map((n) => ({ ...n, isHead: n.id === head, isCur: n.id === cur })),
          mode: 'deleteVal',
          headId: head,
          targetVal,
          curId: cur,
          nextId: nxtNode.id,
          decision: `发现下个节点 #${nxtNode.id}(${nxtNode.val}) 匹配目标，跨过该节点`,
          message: `修改 cur.next = cur.next.next，将节点 #${nxtNode.id} 移出链路。`,
          log: `cur.next = cur.next.next (skip #${nxtNode.id})`,
          codeLine: DELETE_LINES.skipNode,
          statusBadge: { text: '删除中间节点', type: 'danger' },
        });
      } else {
        cur = curNode.next;
        steps.push({
          nodes: currentList.map((n) => ({ ...n, isHead: n.id === head, isCur: n.id === cur })),
          mode: 'deleteVal',
          headId: head,
          targetVal,
          curId: cur,
          decision: `节点 #${curNode.id} 值不匹配，cur 指针前进至 #${cur}`,
          message: `保留当前节点，向后继续扫描。`,
          log: `cur = cur.next (#${cur})`,
          codeLine: DELETE_LINES.advance,
          statusBadge: { text: '扫描前进', type: 'info' },
        });
      }
    }

    steps.push({
      nodes: currentList.map((n) => ({ ...n, isHead: n.id === head })),
      mode: 'deleteVal',
      headId: head,
      targetVal,
      curId: -1,
      decision: `删除完毕！保留下来的节点构成新链表`,
      message: `全链表扫描完毕，所有 val == ${targetVal} 的节点均已成功剥离。`,
      log: 'Finished removeValue',
      codeLine: DELETE_LINES.done,
      statusBadge: { text: '删除完成', type: 'success' },
    });
  }

  return steps;
}
