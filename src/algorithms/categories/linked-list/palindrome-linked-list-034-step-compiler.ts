/**
 * 判断链表是否为回文结构 (Palindrome Linked List) — 步进推演编译器
 * 左程云算法通关课【必备篇】Class 034 / LeetCode 234
 */

import { StepBase, HighlightTarget } from '../../../core/step-visualizer';

export interface PalindromeNode {
  val: number;
  idx: number;
  nextIdx: number | null;
}

export interface PalindromeStep extends StepBase {
  nodes: PalindromeNode[];
  phase: 'find_mid' | 'reverse_half' | 'compare' | 'restore' | 'finish';
  slowIdx?: number;
  fastIdx?: number;
  leftHeadIdx?: number;
  rightHeadIdx?: number;
  isPalSoFar?: boolean;
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const PALINDROME_CODES = {
  java: `public class PalindromeLinkedList {
    public static boolean isPalindrome(ListNode head) {
        if (head == null || head.next == null) return true;
        ListNode slow = head, fast = head;
        // 1. 快慢指针寻找中点
        while (fast.next != null && fast.next.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        // 2. 原地反转后半部分
        ListNode rightHead = reverse(slow.next);
        slow.next = null; // 断开前半部分

        // 3. 双指针从两端向中间比对
        ListNode p1 = head, p2 = rightHead;
        boolean ans = true;
        while (p1 != null && p2 != null) {
            if (p1.val != p2.val) { ans = false; break; }
            p1 = p1.next;
            p2 = p2.next;
        }

        // 4. 恢复链表后半段原始拓扑
        slow.next = reverse(rightHead);
        return ans;
    }

    private static ListNode reverse(ListNode head) {
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
    bool isPalindrome(ListNode* head) {
        if (!head || !head->next) return true;
        ListNode *slow = head, *fast = head;
        while (fast->next && fast->next->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        ListNode* rightHead = reverse(slow->next);
        slow->next = nullptr;
        ListNode *p1 = head, *p2 = rightHead;
        bool ans = true;
        while (p1 && p2) {
            if (p1->val != p2->val) { ans = false; break; }
            p1 = p1->next;
            p2 = p2->next;
        }
        slow->next = reverse(rightHead);
        return ans;
    }
};`,
  python: `class Solution:
    def isPalindrome(self, head: Optional[ListNode]) -> bool:
        if not head or not head.next:
            return True
        slow, fast = head, head
        # 1. 寻找中点
        while fast.next and fast.next.next:
            slow = slow.next
            fast = fast.next.next
        # 2. 反转后半段
        right = self.reverse(slow.next)
        slow.next = None
        # 3. 对比两端
        p1, p2 = head, right
        ans = True
        while p1 and p2:
            if p1.val != p2.val:
                ans = False
                break
            p1 = p1.next
            p2 = p2.next
        # 4. 恢复链表
        slow.next = self.reverse(right)
        return ans`,
  typescript: `function isPalindrome(head: ListNode | null): boolean {
    if (!head || !head.next) return true;
    let slow = head, fast = head;
    while (fast.next && fast.next.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    const rightHead = reverse(slow.next);
    slow.next = null;
    let p1: ListNode | null = head, p2: ListNode | null = rightHead;
    let ans = true;
    while (p1 && p2) {
        if (p1.val !== p2.val) { ans = false; break; }
        p1 = p1.next;
        p2 = p2.next;
    }
    slow.next = reverse(rightHead);
    return ans;
}`,
};

export const PALINDROME_CODE_LINES = {
  entry: { java: 3, cpp: 14, python: 3, typescript: 2 },
  findMid: { java: 6, cpp: 17, python: 7, typescript: 4 },
  reverseHalf: { java: 11, cpp: 21, python: 11, typescript: 9 },
  compareLoop: { java: 17, cpp: 25, python: 16, typescript: 13 },
  compareMismatch: { java: 18, cpp: 26, python: 17, typescript: 14 },
  restore: { java: 24, cpp: 31, python: 22, typescript: 18 },
  returnResult: { java: 25, cpp: 32, python: 23, typescript: 19 },
};

export function generatePalindromeSteps(values: number[] = [1, 2, 3, 2, 1]): PalindromeStep[] {
  const steps: PalindromeStep[] = [];
  const lines = PALINDROME_CODE_LINES;
  const n = values.length;

  const baseNodes: PalindromeNode[] = values.map((v, i) => ({
    val: v,
    idx: i,
    nextIdx: i < n - 1 ? i + 1 : null,
  }));

  // Step 0: 入口
  steps.push({
    nodes: JSON.parse(JSON.stringify(baseNodes)),
    phase: 'find_mid',
    slowIdx: 0,
    fastIdx: 0,
    decision: '开始执行回文链表 O(1) 空间判定流程',
    message: `准备判定链表 [${values.join(' ➔ ')}] 是否为回文。左程云标准解法：快慢指针寻中点 ➔ 局部反转 ➔ 两端向中对比 ➔ 还原结构，绝不申请额外数组或栈空间！`,
    log: `enter isPalindrome: length=${n}`,
    codeLine: lines.entry,
    metrics: { '链表长度': n, '空间复杂度': 'O(1) 严格原地' },
  });

  // 1. 快慢指针
  let slow = 0;
  let fast = 0;
  while (fast + 1 < n && fast + 2 < n) {
    slow += 1;
    fast += 2;
    steps.push({
      nodes: JSON.parse(JSON.stringify(baseNodes)),
      phase: 'find_mid',
      slowIdx: slow,
      fastIdx: fast,
      decision: `快慢指针推进：slow 到达节点 ${slow} (值为 ${values[slow]})，fast 到达节点 ${fast} (值为 ${values[fast]})`,
      message: `慢指针步长为 1，快指针步长为 2。当快指针抵达链表末尾时，慢指针精准落于链表中点！`,
      log: `slow=${slow}, fast=${fast}`,
      codeLine: lines.findMid,
      statusBadge: { text: `定位中点中 (${slow})`, type: 'info' },
    });
  }

  const mid = slow;
  const rightStart = mid + 1;

  // 2. 反转后半段
  const reversedNodes: PalindromeNode[] = JSON.parse(JSON.stringify(baseNodes));
  reversedNodes[mid].nextIdx = null; // 断开前半段

  for (let i = rightStart; i < n; i++) {
    reversedNodes[i].nextIdx = i === rightStart ? null : i - 1;
  }

  steps.push({
    nodes: JSON.parse(JSON.stringify(reversedNodes)),
    phase: 'reverse_half',
    slowIdx: mid,
    rightHeadIdx: n - 1,
    decision: `中点定位完成 (idx=${mid})，将中点右侧后半段 [${values.slice(rightStart).join(', ')}] 原地反转！`,
    message: `后半段反转后，新右半段头节点为原始链表尾部 (idx=${n - 1}，值为 ${values[n - 1]})，指针反向指向中点！`,
    log: `reversed second half, rightHead=${n - 1}`,
    codeLine: lines.reverseHalf,
    statusBadge: { text: '后半段反转完毕', type: 'warning' },
    metrics: { '中点位置': mid, '右端起点': n - 1 },
  });

  // 3. 双指针比对
  let p1: number | null = 0;
  let p2: number | null = n - 1;
  let isPal = true;

  while (p1 !== null && p2 !== null && p2 >= rightStart) {
    const val1 = values[p1];
    const val2 = values[p2];
    const match = val1 === val2;

    steps.push({
      nodes: JSON.parse(JSON.stringify(reversedNodes)),
      phase: 'compare',
      leftHeadIdx: p1,
      rightHeadIdx: p2,
      isPalSoFar: match,
      decision: `比对左指针 p1(${p1}, val=${val1}) 与 右指针 p2(${p2}, val=${val2})：${match ? '✅ 字符匹配' : '❌ 不匹配'}`,
      message: match
        ? `左右两端数值完全一致 (${val1} === ${val2})，继续向中心聚拢比对！`
        : `发现不匹配！左侧 ${val1} ≠ 右侧 ${val2}，确定非回文！`,
      log: `compare: p1(${p1})=${val1} vs p2(${p2})=${val2} -> ${match}`,
      codeLine: match ? lines.compareLoop : lines.compareMismatch,
      statusBadge: match ? { text: '匹配一致', type: 'success' } : { text: '比对失败', type: 'danger' },
    });

    if (!match) {
      isPal = false;
      break;
    }

    p1 = p1 < mid ? p1 + 1 : null;
    p2 = p2 > rightStart ? p2 - 1 : null;
  }

  // 4. 恢复链表
  steps.push({
    nodes: JSON.parse(JSON.stringify(baseNodes)),
    phase: 'restore',
    decision: '比对结束，将后半段再次反转，无损复原整个链表',
    message: '工程化底线：虽然判定已经完成，但在退出函数前必须恢复链表原来的拓扑形态，绝不给调用方留下副作用！',
    log: `restored original linked list structure`,
    codeLine: lines.restore,
    statusBadge: { text: '链表拓扑已复原', type: 'info' },
  });

  // 5. 最终结论
  steps.push({
    nodes: JSON.parse(JSON.stringify(baseNodes)),
    phase: 'finish',
    decision: `流程完毕！该链表【${isPal ? '是' : '不是'}】回文链表！`,
    message: isPal
      ? `🎉 链表正读反读完全一致，判定为回文链表！返回 true。`
      : `⚠️ 链表存在不对称节点，判定为非回文链表！返回 false。`,
    log: `isPalindrome finished, result=${isPal}`,
    codeLine: lines.returnResult,
    statusBadge: isPal ? { text: '是回文 (true)', type: 'success' } : { text: '非回文 (false)', type: 'danger' },
    metrics: { '最终结果': isPal ? 'true (回文)' : 'false (非回文)', '原地空间': 'O(1)' },
  });

  return steps;
}
