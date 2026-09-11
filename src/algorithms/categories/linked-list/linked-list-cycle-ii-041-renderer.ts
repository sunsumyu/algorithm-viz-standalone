/**
 * 左程云算法通关课 Class 041: 寻找单链表中的入环节点 (Linked List Cycle II)
 * LeetCode 142 (Medium / 高频面试题)
 * 核心机制:
 *  1. 快慢指针 Floyd 判圈：slow 走 1 步，fast 走 2 步
 *  2. 若 fast 走到 null，则链表无环
 *  3. 若相遇，则证明有环。将 fast 重置到 head，步长改为 1，slow 保持在相遇点
 *  4. 两个指针同速推进，再次相遇的节点即为【第一个入环节点】(Cycle Entry)
 *  数学原理：2(a + b) = a + b + k*L => a = k*L - b
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
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
  codeLine: number;
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
    codeLine: 4,
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
        codeLine: 9,
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
        codeLine: 7,
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
      codeLine: 18,
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
    codeLine: 11,
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
        codeLine: 16,
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
        codeLine: 14,
      });
    }
  }

  return steps;
}

export function renderLinkedListCycleCanvas(container: HTMLElement, step: LinkedListCycleStep) {
  const nodesHtml = step.nodes
    .map((n) => {
      const isSlow = step.slowId === n.id;
      const isFast = step.fastId === n.id;
      const isEntry = step.entryNodeId === n.id;
      const isMeeting = step.meetingNodeId === n.id && step.phase === 'met';

      let border = 'border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.7);';
      let badges: string[] = [];

      if (isEntry) {
        border = 'border: 2px solid #34d399; background: rgba(6, 78, 59, 0.6); box-shadow: 0 0 12px rgba(52, 211, 153, 0.4);';
        badges.push('<span style="color: #34d399; font-weight: bold;">🎯 入环节点</span>');
      }
      if (isMeeting) {
        border = 'border: 2px solid #fbbf24; background: rgba(120, 53, 15, 0.6); box-shadow: 0 0 12px rgba(251, 191, 36, 0.4);';
        badges.push('<span style="color: #fde047; font-weight: bold;">⚡ 首次相遇点</span>');
      }
      if (isSlow) {
        badges.push('<span style="color: #38bdf8; font-weight: bold;">🐢 slow</span>');
      }
      if (isFast) {
        badges.push('<span style="color: #f43f5e; font-weight: bold;">🐇 fast</span>');
      }

      return `
      <div style="
        position: relative;
        padding: 12px;
        border-radius: 8px;
        ${border}
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 100px;
        transition: all 0.2s;
      ">
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">Node #${n.id} ${n.isInCycle ? '🔄(环内)' : ''}</div>
        <div style="font-size: 20px; font-weight: bold; color: #f8fafc; margin: 4px 0;">${n.val}</div>
        <div style="font-size: 11px; color: #64748b; font-family: monospace;">next ➔ ${n.nextId ? '#' + n.nextId : 'NULL'}</div>
        <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 2px; font-size: 10px; align-items: center;">
          ${badges.join('')}
        </div>
      </div>
    `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 16px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px; font-weight: bold; color: #e2e8f0;">单链表拓扑与双指针物理运动沙盘</span>
          <span style="padding: 2px 6px; font-size: 11px; border-radius: 4px; background: #1e293b; color: #94a3b8; font-family: monospace;">Floyd's Tortoise and Hare</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; font-size: 12px;">
          <span style="color: #38bdf8;">🐢 slow: #${step.slowId ?? 'NULL'}</span>
          <span style="color: #f43f5e;">🐇 fast: #${step.fastId ?? 'NULL'}</span>
        </div>
      </div>

      <!-- 链表节点序列网格 -->
      <div style="display: flex; gap: 12px; align-items: center; overflow-x: auto; padding: 16px; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
        ${nodesHtml}
      </div>

      <!-- 数学推导与状态卡片 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: auto;">
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(14, 165, 233, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #38bdf8;">阶段一：Floyd 判圈</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">slow 步长 1，fast 步长 2。若 fast 与 slow 相遇，必在环内某点重合。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #fde047;">数学恒等式推导</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">设起点到入口 a，相遇点离入口 b，环长 L。2(a+b) = a+b+kL ➔ a = kL - b。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(52, 211, 153, 0.3); background: rgba(16, 185, 129, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #34d399;">阶段二：同速直击入口</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">fast 重置到 head 且步长变 1，两指针同速走 a 步，恰好在入口相遇！</div>
        </div>
      </div>
    </div>
  `;
}

export const linkedListCycleII041Visualizer = registerDeclarativeAlgorithm<LinkedListCycleStep>({
  id: 'linked-list-cycle-ii-041',
  name: '环形链表入环点判定 (Class 041)',
  category: 'linked-list',
  icon: '🔄',
  difficulty: 2,
  levelOrder: 41,
  learningGoal: '掌握 Floyd 快慢指针判圈算法，深刻理解 a = k*L - b 距离公式推导，学会 O(1) 空间精准定位入环节点',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 041 / LeetCode 142)</h3>
      <p>给定一个链表的头节点 <code>head</code>，判断链表中是否有环。如果有环，返回链表开始入环的第一个节点；如果无环，则返回 <code>null</code>：</p>
      <ul>
        <li><strong>不能修改链表结构</strong>，且只能使用 $O(1)$ 的内存空间。</li>
        <li><strong>阶段一</strong>：慢指针一次走 1 步，快指针一次走 2 步。如果快指针指向空，说明无环；如果相遇，则必定有环。</li>
        <li><strong>阶段二</strong>：快指针回到头节点 <code>head</code>，步长改为 1，慢指针停在相遇点。两个指针同时出发，每次走 1 步，<strong>再次相遇的节点必定是入环节点</strong>！</li>
      </ul>
    </div>
  `,
  codeLanguages: CYCLE_II_CODES,
  inputs: [
    {
      id: 'scenario',
      label: '链表拓扑模式',
      type: 'select',
      defaultValue: 'has_cycle',
      options: [
        { label: '有环经典用例 [3, 2, 0, -4] (pos = 1)', value: 'has_cycle' },
        { label: '无环直线链表 [3, 2, 0, -4] (pos = -1)', value: 'no_cycle' },
      ],
    },
  ],
  generateSteps: (input) => {
    const hasCycle = (input?.scenario || 'has_cycle') === 'has_cycle';
    return buildLinkedListCycleSteps(hasCycle);
  },
  renderCanvas: (container, step) => {
    renderLinkedListCycleCanvas(container, step);
  },
});
