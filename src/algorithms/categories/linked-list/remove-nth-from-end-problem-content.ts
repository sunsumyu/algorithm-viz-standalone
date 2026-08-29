/**
 * LeetCode 19: 删除链表的倒数第 N 个结点 (Remove Nth Node From End of List)
 * 领域知识与题解精讲配置声明
 */

export const REMOVE_NTH_FROM_END_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 19</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">删除链表的倒数第 N 个结点 (Remove Nth Node From End)</h2>
    </div>
    <p style="margin: 0;">给你一个链表，删除链表的倒数第 <code style="color: #fde047; font-family: monospace;">n</code> 个结点，并且返回链表的头结点。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: head = [1,2,3,4,5], n = 2</div>
      <div>输出: [1,2,3,5]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: head = [1], n = 1</div>
      <div>输出: []</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 链表中结点的数目为 <code style="color: #fde047; font-family: monospace;">sz</code>，1 &le; sz &le; 30</div>
      <div>• 0 &le; Node.val &le; 100</div>
      <div>• 1 &le; n &le; sz</div>
      <div>• 进阶：你能尝试使用一趟扫描实现吗？</div>
    </div>
  </div>
`;

export const REMOVE_NTH_FROM_END_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 虚拟头节点 (dummyHead) + 双指针定距滑窗算法
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 为什么必须使用 dummyHead 虚拟头节点？</div>
        <p style="margin: 0; color: #94a3b8;">
        当被删除的节点恰好是原链表的<strong>头节点 (head)</strong> 时（如链表长度为 n，删除倒数第 n 个），如果没有虚拟头节点，需要写特殊的 if-else 分支；而引入 <code style="color: #fbbf24; font-family: monospace;">dummyHead.next = head</code> 后，所有节点的删除逻辑完全统一！
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 快慢双指针一趟扫描原理</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <code style="color: #7dd3fc; font-family: monospace;">fast</code> 先从 dummyHead 前进 <code style="color: #fbbf24; font-family: monospace;">n + 1</code> 步；<br/>
        2. 随后 <code style="color: #34d399; font-family: monospace;">fast</code> 和 <code style="color: #fbbf24; font-family: monospace;">slow</code> 同时每次走 1 步，保持距离差为 <code style="color: #fbbf24; font-family: monospace;">n + 1</code>；<br/>
        3. 当 <code style="color: #7dd3fc; font-family: monospace;">fast == null</code> 时，<code style="color: #fbbf24; font-family: monospace;">slow</code> 恰好停在<strong>待删除节点的前驱节点</strong>上；<br/>
        4. 执行 <code style="color: #34d399; font-family: monospace;">slow.next = slow.next.next</code> 即可在 O(1) 内跨过并删除目标节点！
        </p>
      </div>
    </div>
  </div>
`;

export const REMOVE_NTH_FROM_END_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public ListNode removeNthFromEnd(ListNode head, int n) {',
    '    ListNode dummyHead = new ListNode(0);',
    '    dummyHead.next = head;',
    '    ListNode fast = dummyHead;',
    '    ListNode slow = dummyHead;',
    '',
    '    // 1. fast 先走 n + 1 步',
    '    for (int i = 0; i <= n; i++) {',
    '        fast = fast.next;',
    '    }',
    '',
    '    // 2. fast 和 slow 同时移动，直到 fast 到达末尾 null',
    '    while (fast != null) {',
    '        fast = fast.next;',
    '        slow = slow.next;',
    '    }',
    '',
    '    // 3. 删除 slow 的下一个节点',
    '    slow.next = slow.next.next;',
    '    return dummyHead.next;',
    '}',
  ],
  cpp: [
    'class Solution {',
    'public:',
    '    ListNode* removeNthFromEnd(ListNode* head, int n) {',
    '        ListNode* dummyHead = new ListNode(0);',
    '        dummyHead->next = head;',
    '        ListNode* fast = dummyHead;',
    '        ListNode* slow = dummyHead;',
    '',
    '        for (int i = 0; i <= n; i++) {',
    '            fast = fast->next;',
    '        }',
    '        while (fast != nullptr) {',
    '            fast = fast->next;',
    '            slow = slow->next;',
    '        }',
    '        ListNode* toDelete = slow->next;',
    '        slow->next = slow->next->next;',
    '        delete toDelete;',
    '        return dummyHead->next;',
    '    }',
    '};',
  ],
  python: [
    'class Solution:',
    '    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:',
    '        dummy_head = ListNode(0, head)',
    '        fast = dummy_head',
    '        slow = dummy_head',
    '',
    '        for _ in range(n + 1):',
    '            fast = fast.next',
    '',
    '        while fast:',
    '            fast = fast.next',
    '            slow = slow.next',
    '',
    '        slow.next = slow.next.next',
    '        return dummy_head.next',
  ],
  javascript: [
    'var removeNthFromEnd = function(head, n) {',
    '    const dummyHead = new ListNode(0, head);',
    '    let fast = dummyHead;',
    '    let slow = dummyHead;',
    '',
    '    for (let i = 0; i <= n; i++) {',
    '        fast = fast.next;',
    '    }',
    '    while (fast !== null) {',
    '        fast = fast.next;',
    '        slow = slow.next;',
    '    }',
    '    slow.next = slow.next.next;',
    '    return dummyHead.next;',
    '};',
  ],
};
