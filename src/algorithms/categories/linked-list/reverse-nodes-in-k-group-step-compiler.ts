/**
 * K 个一组翻转链表 (Reverse Nodes in k-Group) — 步进推演编译器
 * LeetCode 25 (Hard)
 */

import { StepBase } from '../../../core/step-visualizer';

export interface KGroupStep extends StepBase {
  stepIndex?: number;
  nodes: number[];
  k: number;
  groupRange: [number, number] | null; // 当前正在操作的组在 nodes 中的下标区间
  isReversed: boolean;
  decision: string;
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
  isAccepted?: boolean;
}

export const REVERSE_K_GROUP_CODES = {
  java: `public class ReverseKGroup {
    public ListNode reverseKGroup(ListNode head, int k) {
        if (head == null || k <= 1) return head;
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode pre = dummy;
        ListNode end = dummy;

        while (end.next != null) {
            // 1. 探查后续是否满足 k 个节点
            for (int i = 0; i < k && end != null; i++) end = end.next;
            if (end == null) break; // 不足 k 个保持原样

            ListNode start = pre.next;
            ListNode nextGroup = end.next;
            end.next = null; // 断开局部链

            // 2. 反转局部 k 个节点
            pre.next = reverse(start);

            // 3. 缝合后续链表
            start.next = nextGroup;
            pre = start;
            end = pre;
        }
        return dummy.next;
    }

    private ListNode reverse(ListNode head) {
        ListNode pre = null, cur = head;
        while (cur != null) {
            ListNode next = cur.next;
            cur.next = pre;
            pre = cur;
            cur = next;
        }
        return pre;
    }
}`,
  cpp: `class Solution {
    ListNode* reverse(ListNode* head) {
        ListNode *pre = nullptr, *cur = head;
        while (cur) {
            ListNode* nxt = cur->next;
            cur->next = pre;
            pre = cur;
            cur = nxt;
        }
        return pre;
    }
public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        ListNode dummy(0);
        dummy.next = head;
        ListNode *pre = &dummy, *end = &dummy;
        while (end->next) {
            for (int i = 0; i < k && end; i++) end = end->next;
            if (!end) break;
            ListNode *start = pre->next, *nxt = end->next;
            end->next = nullptr;
            pre->next = reverse(start);
            start->next = nxt;
            pre = start;
            end = pre;
        }
        return dummy.next;
    }
};`,
  python: `class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        pre = end = dummy

        while end.next:
            for _ in range(k):
                if end: end = end.next
            if not end: break

            start = pre.next
            nxt = end.next
            end.next = None

            # 翻转局部
            prev, curr = None, start
            while curr:
                t = curr.next
                curr.next = prev
                prev, curr = curr, t

            pre.next = prev
            start.next = nxt
            pre = end = start

        return dummy.next`,
  typescript: `function reverseKGroup(head: number[], k: number): number[] {
    const res = [...head];
    for (let i = 0; i + k <= res.length; i += k) {
        let l = i, r = i + k - 1;
        while (l < r) {
            const t = res[l]; res[l] = res[r]; res[r] = t;
            l++; r--;
        }
    }
    return res;
}`,
};

export const REVERSE_K_GROUP_LINES: Record<string, Record<string, number>> = {
  entry: { java: 2, cpp: 11, python: 2, typescript: 1, javascript: 1 },
  initDummy: { java: 4, cpp: 12, python: 3, typescript: 2, javascript: 2 },
  whileLoop: { java: 8, cpp: 15, python: 6, typescript: 3, javascript: 3 },
  probeK: { java: 10, cpp: 16, python: 7, typescript: 3, javascript: 3 },
  breakIncomplete: { java: 11, cpp: 17, python: 9, typescript: 3, javascript: 3 },
  reverseLocal: { java: 18, cpp: 21, python: 19, typescript: 6, javascript: 6 },
  stitchNext: { java: 21, cpp: 22, python: 20, typescript: 7, javascript: 7 },
  returnAns: { java: 25, cpp: 25, python: 23, typescript: 10, javascript: 10 },
};

export function generateReverseKGroupSteps(inputList: number[] = [1, 2, 3, 4, 5], k: number = 2): KGroupStep[] {
  const steps: KGroupStep[] = [];
  const nodes = [...inputList];
  const n = nodes.length;
  const lines = REVERSE_K_GROUP_LINES;

  // Step 0: 入口
  steps.push({
    nodes: [...nodes],
    k,
    groupRange: null,
    isReversed: false,
    decision: `启动 K 个一组翻转链表：k = ${k}，链表长度 N = ${n}`,
    message: '核心原则：每 k 个节点一组就地反转；若末尾剩余节点不足 k 个则保持不变',
    log: `Init reverseKGroup with list=[${nodes.join(', ')}], k=${k}`,
    codeLine: lines.entry,
    statusBadge: { text: '算法就绪', type: 'info' },
    metrics: {
      k: `k = ${k}`,
      groupRange: '准备就绪',
      nodeCount: `${n} 个节点`,
      status: '就绪',
    },
  });

  let groupIdx = 0;
  for (let start = 0; start < n; start += k) {
    groupIdx++;
    const end = start + k - 1;

    if (end >= n) {
      // 不足 k 个
      steps.push({
        nodes: [...nodes],
        k,
        groupRange: [start, n - 1],
        isReversed: false,
        decision: `探查第 ${groupIdx} 组：剩余节点 [${nodes.slice(start).join(', ')}] 共 ${n - start} 个 < k(${k})`,
        message: '不足 k 个节点，根据题目规则保持原有顺序不翻转，直接跳出',
        log: `Group ${groupIdx} incomplete (< ${k}), skip reversal`,
        codeLine: lines.breakIncomplete,
        statusBadge: { text: '不足跳过', type: 'warning' },
        metrics: {
          k: `k = ${k}`,
          groupRange: `[ ${start} ... ${n - 1} ]`,
          nodeCount: `${n} 个节点`,
          status: '不足跳过',
        },
      });
      break;
    }

    steps.push({
      nodes: [...nodes],
      k,
      groupRange: [start, end],
      isReversed: false,
      decision: `探查第 ${groupIdx} 组：成功锁定 k 个节点 [${nodes.slice(start, end + 1).join(', ')}]`,
      message: '节点充足，断开与后继链表连接，准备局部反转',
      log: `Group ${groupIdx} locked: [${nodes.slice(start, end + 1).join(', ')}]`,
      codeLine: lines.probeK,
      statusBadge: { text: `锁定组 ${groupIdx}`, type: 'info' },
      metrics: {
        k: `k = ${k}`,
        groupRange: `[ ${start} ... ${end} ]`,
        nodeCount: `${n} 个节点`,
        status: `锁定第 ${groupIdx} 组`,
      },
    });

    // 局部翻转
    let l = start;
    let r = end;
    while (l < r) {
      const temp = nodes[l];
      nodes[l] = nodes[r];
      nodes[r] = temp;
      l++;
      r--;
    }

    steps.push({
      nodes: [...nodes],
      k,
      groupRange: [start, end],
      isReversed: true,
      decision: `第 ${groupIdx} 组就地反转成功 ➔ 变为 [${nodes.slice(start, end + 1).join(', ')}]，并与后继缝合`,
      message: `头尾指针调转，pre 指针推进至新尾部，链表状态更新为 [${nodes.join(' ➔ ')}]`,
      log: `Group ${groupIdx} reversed: [${nodes.slice(start, end + 1).join(', ')}]`,
      codeLine: lines.reverseLocal,
      statusBadge: { text: `反转组 ${groupIdx}`, type: 'success' },
      metrics: {
        k: `k = ${k}`,
        groupRange: `[ ${start} ... ${end} ]`,
        nodeCount: `${n} 个节点`,
        status: `反转组 ${groupIdx} 成功`,
      },
    });
  }

  // 终结
  steps.push({
    nodes: [...nodes],
    k,
    groupRange: null,
    isReversed: false,
    decision: `🎉 全部组翻转完毕！最终链表序列: [${nodes.join(' ➔ ')}]`,
    message: '仅进行了一次完整单向遍历，时间复杂度严格 O(N)，额外空间严格 O(1)',
    log: `Done reverseKGroup. Result=[${nodes.join(', ')}]`,
    codeLine: lines.returnAns,
    statusBadge: { text: '翻转成功', type: 'success' },
    metrics: {
      k: `k = ${k}`,
      groupRange: '全部完成',
      nodeCount: `${n} 个节点`,
      status: '完成',
      ans: `[${nodes.join(' ➔ ')}]`,
    },
    ans: `[${nodes.join(' ➔ ')}]`,
    isAccepted: true,
  });

  return steps;
}
