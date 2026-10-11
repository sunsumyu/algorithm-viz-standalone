/**
 * 左程云算法通关课 Class 041: 寻找单链表中的入环节点 (Linked List Cycle II) — 步进推演编译器
 * LeetCode 142 (Medium / 高频面试题)
 */

import { StepBase } from '../../../core/step-visualizer';

export interface ListNodeData {
  id: number;
  val: number;
  nextId: number | null;
  isInCycle: boolean;
}

export interface LinkedListCycleStep extends StepBase {
  nodes: ListNodeData[];
  slowId: number | null;
  fastId: number | null;
  phase: 'init' | 'fast_slow_moving' | 'met' | 'reset_fast' | 'chase_entry' | 'found_entry' | 'no_cycle';
  meetingNodeId: number | null;
  entryNodeId: number | null;
  message: string;
  log: string;
  codeLine: number | Record<string, number>;
}

export const CYCLE_II_CODES = {
  java: `public class Solution {
    public ListNode detectCycle(ListNode head) {
        if (head == null || head.next == null) return null;
        ListNode slow = head, fast = head;
        // 阶段一：快慢指针判定是否有环
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                // 阶段二：相遇后，fast回到head，同速单步推进找入环点
                fast = head;
                while (slow != fast) {
                    slow = slow.next;
                    fast = fast.next;
                }
                return slow; // 入环节点
            }
        }
        return null;
    }
}`,
  cpp: `class Solution {
public:
    ListNode *detectCycle(ListNode *head) {
        if (!head || !head->next) return nullptr;
        ListNode *slow = head, *fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) {
                fast = head;
                while (slow != fast) {
                    slow = slow->next;
                    fast = fast->next;
                }
                return slow;
            }
        }
        return nullptr;
    }
};`,
  python: `class Solution:
    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if not head or not head.next:
            return None
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                fast = head
                while slow != fast:
                    slow = slow.next
                    fast = fast.next
                return slow
        return None`,
};

export const CYCLE_LINES: Record<string, Record<string, number>> = {
  init: { java: 4, cpp: 5, python: 5 },
  moving: { java: 7, cpp: 8, python: 8 },
  met: { java: 9, cpp: 9, python: 9 },
  resetFast: { java: 11, cpp: 10, python: 10 },
  chase: { java: 14, cpp: 13, python: 13 },
  foundEntry: { java: 16, cpp: 15, python: 14 },
  noCycle: { java: 19, cpp: 19, python: 15 },
};

export function buildLinkedListCycleSteps(hasCycle: boolean = true): LinkedListCycleStep[] {
  const steps: LinkedListCycleStep[] = [];

  // [3, 2, 0, -4] with cycle to node 2 (index 1)
  const nodes: ListNodeData[] = hasCycle
    ? [
        { id: 1, val: 3, nextId: 2, isInCycle: false },
        { id: 2, val: 2, nextId: 3, isInCycle: true }, // Entry
        { id: 3, val: 0, nextId: 4, isInCycle: true },
        { id: 4, val: -4, nextId: 2, isInCycle: true }, // back to 2
      ]
    : [
        { id: 1, val: 3, nextId: 2, isInCycle: false },
        { id: 2, val: 2, nextId: 3, isInCycle: false },
        { id: 3, val: 0, nextId: 4, isInCycle: false },
        { id: 4, val: -4, nextId: null, isInCycle: false },
      ];

  const nodeMap = new Map<number, ListNodeData>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  // Step 0: Init
  steps.push({
    nodes,
    slowId: 1,
    fastId: 1,
    phase: 'init',
    meetingNodeId: null,
    entryNodeId: null,
    message: `算法启动：初始状态 slow 与 fast 均指向链表头节点 [ID:1, Val:3]。准备进行第一阶段判圈。`,
    log: `初始化双指针: slow = fast = Node 1`,
    codeLine: CYCLE_LINES.init,
  });

  let slow: number | null = 1;
  let fast: number | null = 1;
  let meetingNode: number | null = null;
  let stepCount = 0;

  // Phase 1: Fast/Slow chase
  while (fast && nodeMap.get(fast)?.nextId) {
    const nextSlow: number | null = slow !== null ? (nodeMap.get(slow)?.nextId ?? null) : null;
    const fastNext: number | null = fast !== null ? (nodeMap.get(fast)?.nextId ?? null) : null;
    const nextFast: number | null = fastNext !== null ? (nodeMap.get(fastNext)?.nextId ?? null) : null;

    slow = nextSlow;
    fast = nextFast;

    if (slow === fast) {
      meetingNode = slow;
      steps.push({
        nodes,
        slowId: slow,
        fastId: fast,
        phase: 'met',
        meetingNodeId: meetingNode,
        entryNodeId: null,
        message: `⚡ 快慢指针在节点 [ID:${slow}, Val:${nodeMap.get(slow!)?.val}] 首次相遇！证明链表必定存在环！准备启动阶段二定位入环点。`,
        log: `第 ${stepCount} 步: slow 与 fast 在 Node ${slow} 相遇`,
        codeLine: CYCLE_LINES.met,
      });
      break;
    } else {
      steps.push({
        nodes,
        slowId: slow,
        fastId: fast,
        phase: 'fast_slow_moving',
        meetingNodeId: null,
        entryNodeId: null,
        message: `双指针步进：slow 推进 1 步到 [ID:${slow}]，fast 推进 2 步到 [ID:${fast ?? 'NULL'}]。`,
        log: `第 ${stepCount} 步: slow -> ${slow}, fast -> ${fast}`,
        codeLine: CYCLE_LINES.moving,
      });
    }

    if (!fast || !nodeMap.get(fast)?.nextId) {
      break;
    }
  }

  if (!meetingNode) {
    steps.push({
      nodes,
      slowId: slow,
      fastId: fast,
      phase: 'no_cycle',
      meetingNodeId: null,
      entryNodeId: null,
      message: `快指针抵达链表尾部 null，链表无环，返回 null。`,
      log: `判定完毕: 链表无环`,
      codeLine: CYCLE_LINES.noCycle,
    });
    return steps;
  }

  // Phase 2: Reset fast to head
  fast = 1;
  steps.push({
    nodes,
    slowId: slow,
    fastId: fast,
    phase: 'reset_fast',
    meetingNodeId: meetingNode,
    entryNodeId: null,
    message: `阶段二重置：将 fast 指针重新指向链表头 [ID:1]，步长降为 1。slow 保持在相遇点 [ID:${slow}]。准备同速推进。`,
    log: `重置 fast = head (Node 1), slow 保持在 Node ${slow}`,
    codeLine: CYCLE_LINES.resetFast,
  });

  // Phase 2: Step both by 1
  let phase2Count = 0;
  while (slow !== fast) {
    phase2Count++;
    slow = nodeMap.get(slow!)?.nextId ?? null;
    fast = nodeMap.get(fast!)?.nextId ?? null;

    if (slow === fast) {
      steps.push({
        nodes,
        slowId: slow,
        fastId: fast,
        phase: 'found_entry',
        meetingNodeId: meetingNode,
        entryNodeId: slow,
        message: `🎯 再次相遇！slow 与 fast 在节点 [ID:${slow}, Val:${nodeMap.get(slow!)?.val}] 碰头！根据数学距离公式证明，该节点必定为【第一个入环节点】！`,
        log: `阶段二相遇于 Node ${slow} (入环点)`,
        codeLine: CYCLE_LINES.foundEntry,
      });
      break;
    } else {
      steps.push({
        nodes,
        slowId: slow,
        fastId: fast,
        phase: 'chase_entry',
        meetingNodeId: meetingNode,
        entryNodeId: null,
        message: `阶段二同步推进：fast 移动到 [ID:${fast}]，slow 移动到 [ID:${slow}]。`,
        log: `阶段二第 ${phase2Count} 步: fast -> ${fast}, slow -> ${slow}`,
        codeLine: CYCLE_LINES.chase,
      });
    }
  }

  return steps;
}
