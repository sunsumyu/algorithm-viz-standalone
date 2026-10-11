/**
 * 复杂链表的复制 (Copy List with Random Pointer) — 步进推演编译器
 * Class 042 / LeetCode 138
 */

import { StepBase } from '../../../core/step-visualizer';

export interface ComplexNode {
  id: string;
  val: number;
  isClone: boolean;
  nextId: string | null;
  randomId: string | null;
}

export interface CopyListStep extends StepBase {
  phase: 'init' | 'clone_nodes' | 'set_random' | 'split_lists' | 'finish';
  nodes: ComplexNode[];
  currentNodeId: string | null;
  message: string;
  log: string;
  codeLine: number | Record<string, number>;
}

export const COPY_LIST_CODES = {
  java: `public class Solution {
    public Node copyRandomList(Node head) {
        if (head == null) return null;
        Node cur = head;
        // 1. 复制节点并插入原节点之后: 1 -> 1' -> 2 -> 2'
        while (cur != null) {
            Node next = cur.next;
            Node clone = new Node(cur.val);
            cur.next = clone;
            clone.next = next;
            cur = next;
        }
        // 2. 利用相对位置设置克隆节点的 random
        cur = head;
        while (cur != null) {
            if (cur.random != null) {
                cur.next.random = cur.random.next;
            }
            cur = cur.next.next;
        }
        // 3. 拆分原链表与克隆链表
        cur = head;
        Node res = head.next;
        while (cur != null) {
            Node clone = cur.next;
            Node next = clone.next;
            cur.next = next;
            clone.next = next != null ? next.next : null;
            cur = next;
        }
        return res;
    }
}`,
  cpp: `class Solution {
public:
    Node* copyRandomList(Node* head) {
        if (!head) return nullptr;
        Node* cur = head;
        while (cur) {
            Node* next = cur->next;
            cur->next = new Node(cur->val);
            cur->next->next = next;
            cur = next;
        }
        cur = head;
        while (cur) {
            if (cur->random) cur->next->random = cur->random->next;
            cur = cur->next->next;
        }
        cur = head;
        Node* res = head->next;
        while (cur) {
            Node* clone = cur->next;
            Node* next = clone->next;
            cur->next = next;
            clone->next = next ? next->next : nullptr;
            cur = next;
        }
        return res;
    }
};`,
  python: `class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        if not head:
            return None
        cur = head
        while cur:
            nxt = cur.next
            cur.next = Node(cur.val, nxt, None)
            cur = nxt
        cur = head
        while cur:
            if cur.random:
                cur.next.random = cur.random.next
            cur = cur.next.next
        cur = head
        res = head.next
        while cur:
            clone = cur.next
            nxt = clone.next
            cur.next = nxt
            clone.next = nxt.next if nxt else None
            cur = nxt
        return res`,
};

export const COPY_LINES: Record<string, Record<string, number>> = {
  init: { java: 4, cpp: 4, python: 4 },
  cloneNodes: { java: 7, cpp: 6, python: 5 },
  setRandom: { java: 16, cpp: 13, python: 11 },
  splitLists: { java: 24, cpp: 20, python: 17 },
  finish: { java: 32, cpp: 27, python: 23 },
};

export function buildCopyListSteps(): CopyListStep[] {
  const steps: CopyListStep[] = [];

  // 原链表: 7 -> 13 -> 11 -> 10 -> 1
  // random: 7->null, 13->7, 11->1, 10->13, 1->7
  const initialNodes: ComplexNode[] = [
    { id: '1', val: 7, isClone: false, nextId: '2', randomId: null },
    { id: '2', val: 13, isClone: false, nextId: '3', randomId: '1' },
    { id: '3', val: 11, isClone: false, nextId: '4', randomId: '5' },
    { id: '4', val: 10, isClone: false, nextId: '5', randomId: '2' },
    { id: '5', val: 1, isClone: false, nextId: null, randomId: '1' },
  ];

  // Step 0: Init
  steps.push({
    phase: 'init',
    nodes: JSON.parse(JSON.stringify(initialNodes)),
    currentNodeId: '1',
    message: `算法启动：原链表共 5 个节点，每个节点包含 val、next 以及随机指针 random。准备执行三步原地复制法。`,
    log: `初始化复杂链表: 长度=5`,
    codeLine: COPY_LINES.init,
  });

  // Phase 1: Clone and insert
  const interleavedNodes: ComplexNode[] = [
    { id: '1', val: 7, isClone: false, nextId: "1'", randomId: null },
    { id: "1'", val: 7, isClone: true, nextId: '2', randomId: null },
    { id: '2', val: 13, isClone: false, nextId: "2'", randomId: '1' },
    { id: "2'", val: 13, isClone: true, nextId: '3', randomId: null },
    { id: '3', val: 11, isClone: false, nextId: "3'", randomId: '5' },
    { id: "3'", val: 11, isClone: true, nextId: '4', randomId: null },
    { id: '4', val: 10, isClone: false, nextId: "4'", randomId: '2' },
    { id: "4'", val: 10, isClone: true, nextId: '5', randomId: null },
    { id: '5', val: 1, isClone: false, nextId: "5'", randomId: '1' },
    { id: "5'", val: 1, isClone: true, nextId: null, randomId: null },
  ];

  steps.push({
    phase: 'clone_nodes',
    nodes: JSON.parse(JSON.stringify(interleavedNodes)),
    currentNodeId: "1'",
    message: `阶段一完成：克隆节点紧随其后就地插入！结构变为 1 ➔ 1' ➔ 2 ➔ 2' ➔ 3 ➔ 3' ... 原节点与新节点形成严格交织。`,
    log: `完成克隆节点原地串接`,
    codeLine: COPY_LINES.cloneNodes,
  });

  // Phase 2: Set random
  const withRandomNodes: ComplexNode[] = JSON.parse(JSON.stringify(interleavedNodes));
  withRandomNodes.find((n) => n.id === "2'")!.randomId = "1'";
  withRandomNodes.find((n) => n.id === "3'")!.randomId = "5'";
  withRandomNodes.find((n) => n.id === "4'")!.randomId = "2'";
  withRandomNodes.find((n) => n.id === "5'")!.randomId = "1'";

  steps.push({
    phase: 'set_random',
    nodes: JSON.parse(JSON.stringify(withRandomNodes)),
    currentNodeId: "2'",
    message: `阶段二完成：利用交织性质配置 random！对于任意原节点 cur，其克隆节点必为 cur.next；因此 cur.next.random 恰好等于 cur.random.next！全程零哈希表开销。`,
    log: `克隆节点 random 指针全部精准对齐绑定`,
    codeLine: COPY_LINES.setRandom,
  });

  // Phase 3: Split
  const clonedOnlyNodes: ComplexNode[] = [
    { id: "1'", val: 7, isClone: true, nextId: "2'", randomId: null },
    { id: "2'", val: 13, isClone: true, nextId: "3'", randomId: "1'" },
    { id: "3'", val: 11, isClone: true, nextId: "4'", randomId: "5'" },
    { id: "4'", val: 10, isClone: true, nextId: "5'", randomId: "2'" },
    { id: "5'", val: 1, isClone: true, nextId: null, randomId: "1'" },
  ];

  steps.push({
    phase: 'split_lists',
    nodes: clonedOnlyNodes,
    currentNodeId: "1'",
    message: `阶段三完成：解开交织结构！原链表各节点重新连回自己的原后继，克隆新链表独立解耦抽出，各指针完全深拷贝完毕。`,
    log: `拆分还原原链表，抽出克隆链表`,
    codeLine: COPY_LINES.splitLists,
  });

  // Finish
  steps.push({
    phase: 'finish',
    nodes: clonedOnlyNodes,
    currentNodeId: null,
    message: `🎉 深拷贝完成！新链表具备完全独立的内存与精确对应的 next 与 random 拓扑，返回克隆头节点。`,
    log: `复杂链表深拷贝完毕，空间复杂度 O(1)`,
    codeLine: COPY_LINES.finish,
  });

  return steps;
}
