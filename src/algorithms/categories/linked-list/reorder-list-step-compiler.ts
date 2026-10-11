/**
 * 重排链表 (Reorder List) — 步进推演编译器
 * LeetCode 143
 */

import { StepBase } from '../../../core/step-visualizer';

export interface ReorderNode {
  val: number;
  originalIndex: number;
}

export interface ReorderListStep extends StepBase {
  phase: 'find_mid' | 'reverse' | 'merge' | 'done';
  list1: ReorderNode[];
  list2: ReorderNode[];
  slowIndex?: number;
  fastIndex?: number;
  l1Index?: number;
  l2Index?: number;
  mergedList: ReorderNode[];
  decision: string;
  metrics?: Record<string, string>;
  message: string;
  log: string;
  codeLine: Record<string, number>;
}

export const REORDER_LIST_CODES = {
  java: `public class Solution {
    public void reorderList(ListNode head) {
        if (head == null || head.next == null) return;
        ListNode slow = head, fast = head;
        while (fast.next != null && fast.next.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        ListNode mid = slow.next;
        slow.next = null;
        ListNode l2 = reverseList(mid);
        ListNode l1 = head;
        while (l1 != null && l2 != null) {
            ListNode l1Next = l1.next;
            ListNode l2Next = l2.next;
            l1.next = l2;
            l2.next = l1Next;
            l1 = l1Next;
            l2 = l2Next;
        }
    }
}`,
  cpp: `class Solution {
public:
    void reorderList(ListNode* head) {
        if (!head || !head->next) return;
        ListNode *slow = head, *fast = head;
        while (fast->next && fast->next->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        ListNode* mid = slow->next;
        slow->next = nullptr;
        ListNode* l2 = reverse(mid);
        ListNode* l1 = head;
        while (l1 && l2) {
            ListNode* l1Next = l1->next;
            ListNode* l2Next = l2->next;
            l1->next = l2;
            l2->next = l1Next;
            l1 = l1Next;
            l2 = l2Next;
        }
    }
};`,
  python: `class Solution:
    def reorderList(self, head: Optional[ListNode]) -> None:
        if not head or not head.next:
            return
        slow, fast = head, head
        while fast.next and fast.next.next:
            slow = slow.next
            fast = fast.next.next
        mid = slow.next
        slow.next = None
        l2 = self.reverse(mid)
        l1 = head
        while l1 and l2:
            l1_next, l2_next = l1.next, l2.next
            l1.next = l2
            l2.next = l1_next
            l1, l2 = l1_next, l2_next`,
  javascript: `function reorderList(head) {
    if (!head || !head.next) return;
    let slow = head, fast = head;
    while (fast.next && fast.next.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    let mid = slow.next;
    slow.next = null;
    let l2 = reverse(mid);
    let l1 = head;
    while (l1 && l2) {
        let l1Next = l1.next;
        let l2Next = l2.next;
        l1.next = l2;
        l2.next = l1Next;
        l1 = l1Next;
        l2 = l2Next;
    }
}`,
};

export const REORDER_CODE_LINES = {
  entry: { java: 2, cpp: 4, python: 2, javascript: 1 },
  findMid: { java: 5, cpp: 7, python: 6, javascript: 4 },
  splitMid: { java: 9, cpp: 11, python: 9, javascript: 8 },
  reverse: { java: 11, cpp: 13, python: 11, javascript: 10 },
  mergeEntry: { java: 12, cpp: 14, python: 12, javascript: 11 },
  mergeStep: { java: 15, cpp: 17, python: 14, javascript: 14 },
  done: { java: 21, cpp: 23, python: 17, javascript: 19 },
};

export function buildReorderListSteps(values: number[]): ReorderListStep[] {
  const steps: ReorderListStep[] = [];
  const nodes: ReorderNode[] = values.map((val, idx) => ({ val, originalIndex: idx }));
  const n = nodes.length;

  // Step 0: 入口
  steps.push({
    phase: 'find_mid',
    list1: [...nodes],
    list2: [],
    mergedList: [],
    decision: `主函数入口：初始链表 [${values.join(' ➔ ')}]`,
    message: '重排目标：将链表重构为 L0 ➔ Ln ➔ L1 ➔ Ln-1 ➔ L2 ➔ ...',
    log: `enter reorderList([${values.join(',')}])`,
    codeLine: REORDER_CODE_LINES.entry,
    metrics: { '阶段': '寻找中点', '链表长度': `${n}` },
  });

  if (n <= 2) {
    steps.push({
      phase: 'done',
      list1: [...nodes],
      list2: [],
      mergedList: [...nodes],
      decision: '链表节点数 <= 2，无需重排',
      message: '原序即为重排结果',
      log: 'length <= 2, done',
      codeLine: REORDER_CODE_LINES.done,
      metrics: { '最终结果': `[${values.join(' ➔ ')}]` },
    });
    return steps;
  }

  // 阶段一：快慢指针找中点
  const midIndex = Math.floor((n - 1) / 2);
  steps.push({
    phase: 'find_mid',
    list1: [...nodes],
    list2: [],
    slowIndex: midIndex,
    fastIndex: n - 1,
    mergedList: [],
    decision: `快慢指针抵达中点：slow 停在节点 [${nodes[midIndex].val}] (下标 ${midIndex})`,
    message: `slow 走 1 步，fast 走 2 步，最终 slow 准确锚定链表前半段末尾`,
    log: `found mid at index ${midIndex}, node val=${nodes[midIndex].val}`,
    codeLine: REORDER_CODE_LINES.findMid,
    metrics: { '阶段': '锁定中点', '中点 slow': `${nodes[midIndex].val}` },
  });

  // 阶段二：断开链表为两段
  const l1Nodes = nodes.slice(0, midIndex + 1);
  const l2Original = nodes.slice(midIndex + 1);

  steps.push({
    phase: 'find_mid',
    list1: [...l1Nodes],
    list2: [...l2Original],
    mergedList: [],
    decision: `从中点后侧断开：前半段 [${l1Nodes.map((x) => x.val).join(' ➔ ')}]，后半段 [${l2Original.map((x) => x.val).join(' ➔ ')}]`,
    message: 'slow.next = null，成功将原始长链解耦为两个独立子链表',
    log: `split list: l1 len=${l1Nodes.length}, l2 len=${l2Original.length}`,
    codeLine: REORDER_CODE_LINES.splitMid,
    metrics: { '前半段 L1 长度': `${l1Nodes.length}`, '后半段 L2 长度': `${l2Original.length}` },
  });

  // 阶段三：反转后半段
  const l2Reversed = [...l2Original].reverse();
  steps.push({
    phase: 'reverse',
    list1: [...l1Nodes],
    list2: [...l2Reversed],
    mergedList: [],
    decision: `反转后半段链表：原 [${l2Original.map((x) => x.val).join(' ➔ ')}] ➔ 反转为 [${l2Reversed.map((x) => x.val).join(' ➔ ')}]`,
    message: '后半段完成反向翻转后，头部即为原始链表的末尾元素 Ln',
    log: `reversed l2: [${l2Reversed.map((x) => x.val).join(',')}]`,
    codeLine: REORDER_CODE_LINES.reverse,
    metrics: { '阶段': '后半段反转', 'L2 新头部': `${l2Reversed[0]?.val}` },
  });

  // 阶段四：双指针交叉穿针引线合并
  steps.push({
    phase: 'merge',
    list1: [...l1Nodes],
    list2: [...l2Reversed],
    l1Index: 0,
    l2Index: 0,
    mergedList: [],
    decision: '准备交叉合并：l1 指向前半段头部，l2 指向反转后的后半段头部',
    message: '每次从 l1 串一个节点，再从 l2 串一个节点',
    log: 'start alternating merge',
    codeLine: REORDER_CODE_LINES.mergeEntry,
    metrics: { '阶段': '穿针引线交叉合并', '当前状态': '准备就绪' },
  });

  const merged: ReorderNode[] = [];
  let p1 = 0,
    p2 = 0;

  while (p1 < l1Nodes.length || p2 < l2Reversed.length) {
    if (p1 < l1Nodes.length) {
      merged.push(l1Nodes[p1]);
      p1++;
    }
    if (p2 < l2Reversed.length) {
      merged.push(l2Reversed[p2]);
      p2++;
    }

    steps.push({
      phase: 'merge',
      list1: [...l1Nodes],
      list2: [...l2Reversed],
      l1Index: Math.min(p1, l1Nodes.length - 1),
      l2Index: Math.min(p2, l2Reversed.length - 1),
      mergedList: [...merged],
      decision: `交替连接完成第 ${merged.length / 2} 组节点对 ➔ 当前已合并: [${merged.map((x) => x.val).join(' ➔ ')}]`,
      message: 'l1.next = l2; l2.next = l1Next 交替缝合链表',
      log: `merged progress: ${merged.map((x) => x.val).join('->')}`,
      codeLine: REORDER_CODE_LINES.mergeStep,
      metrics: { '已穿接节点数': `${merged.length}`, '总节点数': `${n}` },
    });
  }

  // 终态
  steps.push({
    phase: 'done',
    list1: [],
    list2: [],
    mergedList: [...merged],
    decision: `🎉 重排完成！最终重排链表: [${merged.map((x) => x.val).join(' ➔ ')}]`,
    message: '算法以 O(N) 时间、O(1) 原地空间复杂度高效完成链表重排',
    log: `reorderList complete, final: ${merged.map((x) => x.val).join('->')}`,
    codeLine: REORDER_CODE_LINES.done,
    metrics: { '最终结果': `[${merged.map((x) => x.val).join(' ➔ ')}]`, '耗时': 'O(N)', '额外空间': 'O(1)' },
  });

  return steps;
}
